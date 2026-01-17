import express from "express";
import pg from "pg";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const { Pool } = pg;

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
// Start server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Cache so we don't hit Secrets Manager and recreate Pool on every request
let cachedPool = null;

async function getDbCreds() {
  const region = process.env.AWS_REGION;
  const secretId = process.env.DB_SECRET_ID;

  if (!region) throw new Error("Missing AWS_REGION");
  if (!secretId) throw new Error("Missing DB_SECRET_ID");

  const sm = new SecretsManagerClient({ region });
  const resp = await sm.send(new GetSecretValueCommand({ SecretId: secretId }));

  if (!resp.SecretString) throw new Error("SecretString is empty");
  const secret = JSON.parse(resp.SecretString);

  if (!secret.username || !secret.password) {
    throw new Error("Secret missing username/password fields");
  }

  return { user: secret.username, password: secret.password };
}

async function getPool() {
  if (cachedPool) return cachedPool;

  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;

  if (!host) throw new Error("Missing DB_HOST");
  if (!database) throw new Error("Missing DB_NAME");

  const { user, password } = await getDbCreds();

  cachedPool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }, // OK for now; can tighten later
    max: 5, // small pool for small service
    idleTimeoutMillis: 30_000
  });

  return cachedPool;
}

//helpers
function toDow(dateStr) {
  // Use UTC to avoid timezone edge weirdness for YYYY-MM-DD
  const d = new Date(dateStr + "T00:00:00Z");
  return d.getUTCDay(); // 0=Sun..6=Sat
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Basic app health
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// DB health check
app.get("/db-health", async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.query("SELECT 1 AS ok;");
    res.json({ db: r.rows[0]?.ok === 1 ? "ok" : "fail" });
  } catch (err) {
    res.status(500).json({
      db: "fail",
      error: err?.message || String(err)
    });
  }
});


/* ********************API ENDPOINTS**************************** */
app.get("/api/services", async (request, response) => {
  const pool = await getPool(); 
  const req = await pool.query("SELECT id, name, duration_minutes, price_cents FROM services WHERE is_active=true ORDER BY id;")
  response.json(req.rows)
})

/* endpoint to get barber by location */
app.get("/api/barbers", async (request, response) => {
  const pool = await getPool();
  const locationId = request.query.locationId

  if (!locationId) return response.status(400).send("Missing location ID")
   
  try {
    //prepared statement
    const query = await pool.query('SELECT name, is_active FROM barbers WHERE location_id = $1',
      [locationId]
    );
    response.json(query.rows)
  } catch (error) {
    return response.status(500).send("Internal Server Error");
  }
}); 

app.get('/api/locations', async (request, response) => {
  const pool = await getPool(); 
  const result = await pool.query('SELECT name, address1, city, is_active FROM locations WHERE is_active=true')
  response.json(result.rows)
})


/* PSUEDO: 
- get location from location table
- get start-time / end-time for specified barber
- return an object that has an array of location and 
available time slots[30 min increments for now]
*/
app.get('/api/availability', async (request, response) => {
  try {
    const locationId = request.query.locationId;
    const barberId = request.query.barberId;
    const serviceId = request.query.serviceId;
    const availDate = request.query.date; // expected format: 'YYYY-MM-DD'
    
    if (!locationId || !barberId || !serviceId || !availDate) return response.status(400).json({ error: "Missing locationId, barberId, serviceId, or date" });


    const pool = await getPool();

    // 1) validate barber belongs to location 
    const barberok = await pool.query(
      "SELECT 1 FROM barbers WHERE id=$1 AND location_id=$2 AND is_active=true",
      [barberId, locationId]
    );
    if (barberok.rowCount === 0) return response.status(404).json({ error: "Barber not found for location" });

    // 2) service duration 
    const svc = await pool.query(
    "SELECT duration_minutes FROM services WHERE id=$1 AND is_active=true",
      [serviceId]
    ); 
    if (svc.rowCount === 0) return response.status(404).json({ error: "Service not found" });
    const durationMin = svc.rows[0].duration_minutes;

    // 3) working hours for that dow
    const dow = toDow(date); 
    const wh = await pool.query(
      "SELECT start_time, end_time FROM working_hours WHERE barber_id=$1 AND dow=$2",
      [barberId, dow]
    ); 
    if (wh.rowCount === 0) return res.json({ slots: [] }); 

    const startTime = String(wh.rows[0].start_time).slice(0, 5); 
    const endTime = String(wh.rows[0].endTime).slice(0, 5); 

    // 4) existing booked appts that day
    const dayStart = new Date(date + "T00:00:00Z").toISOString();
    const dayEnd = new Date(date + "T23:59:59Z").toISOString();

    const appts = await pool.query(
      `SELECT start_ts, end_ts
       FROM appointments
       WHERE barber_id=$1 AND location_id=$2 AND status='booked'
         AND start_ts >= $3::timestamptz AND start_ts <= $4::timestamptz
       ORDER BY start_ts`,
      [barberId, locationId, dayStart, dayEnd]
    );

    // 5) generate slots every 15 minutes
    const intervalMin = 15;
    const workStart = new Date(date + `T${startTime}:00Z`);
    const workEnd = new Date(date + `T${endTime}:00Z`);

    const slots = [];
    for (let t = new Date(workStart); t.getTime() + durationMin * 60000 <= workEnd.getTime(); t = new Date(t.getTime() + intervalMin * 60000)) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t.getTime() + durationMin * 60000);

      const isTaken = appts.rows.some(a => overlaps(new Date(a.start_ts), new Date(a.end_ts), slotStart, slotEnd));
      if (!isTaken) slots.push(slotStart.toISOString());
    }

    res.json({ slots });

  } catch (error) {
    console.error("Error in /api/availability:", error);
    return response.status(500).send({ error: error.message });
  }
}); 


app.post("/api/appointments", async (req, res) => {
  const { locationId, barberId, serviceId, startTs, customerName } = req.body;

  if (!locationId || !barberId || !serviceId || !startTs || !customerName) {
    return res.status(400).json({ error: "Missing locationId, barberId, serviceId, startTs, customerName" });
  }

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Validate barber belongs to location
    const barberOk = await client.query(
      "SELECT 1 FROM barbers WHERE id=$1 AND location_id=$2 AND is_active=true",
      [barberId, locationId]
    );
    if (barberOk.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Barber not found for location" });
    }

    // Service duration
    const svc = await client.query(
      "SELECT duration_minutes FROM services WHERE id=$1 AND is_active=true",
      [serviceId]
    );
    if (svc.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Service not found" });
    }
    const durationMin = svc.rows[0].duration_minutes;

    const start = new Date(startTs);
    const end = new Date(start.getTime() + durationMin * 60000);

    // Overlap check
    const overlap = await client.query(
      `SELECT 1
       FROM appointments
       WHERE barber_id=$1 AND location_id=$2 AND status='booked'
         AND start_ts < $4::timestamptz
         AND end_ts   > $3::timestamptz
       LIMIT 1`,
      [barberId, locationId, start.toISOString(), end.toISOString()]
    );

    if (overlap.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Time slot already booked" });
    }

    // Insert
    const created = await client.query(
      `INSERT INTO appointments (location_id, barber_id, service_id, start_ts, end_ts, customer_name, status)
       VALUES ($1,$2,$3,$4,$5,$6,'booked')
       RETURNING id, start_ts, end_ts, status`,
      [locationId, barberId, serviceId, start.toISOString(), end.toISOString(), customerName]
    );

    await client.query("COMMIT");
    res.status(201).json(created.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

app.get("/api/admin/appointments", async (req, res) => {
  const locationId = Number(req.query.locationId);
  const date = String(req.query.date || "");
  if (!locationId || !date) return res.status(400).json({ error: "Missing locationId or date" });

  const pool = await getPool();
  const dayStart = new Date(date + "T00:00:00Z").toISOString();
  const dayEnd = new Date(date + "T23:59:59Z").toISOString();

  const r = await pool.query(
    `SELECT id, barber_id, service_id, start_ts, end_ts, customer_name, status
     FROM appointments
     WHERE location_id=$1 AND start_ts >= $2::timestamptz AND start_ts <= $3::timestamptz
     ORDER BY start_ts`,
    [locationId, dayStart, dayEnd]
  );

  res.json(r.rows);
});







