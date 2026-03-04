import express from "express";
import pg from "pg";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors({ origin: '*' }));
app.use('/images', express.static(path.join(__dirname, 'public/images')));

const PORT = process.env.PORT || 3000;

// Simplified pool creation for Vercel (no Secrets Manager)
let cachedPool = null;

async function getPool() {
  if (cachedPool) return cachedPool;

  // All credentials come from environment variables
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT || "5432");
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !database || !user || !password) {
    throw new Error("Missing database credentials in environment variables");
  }

  cachedPool = new Pool({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30_000
  });

  return cachedPool;
}

// Helper functions
function toDow(dateStr) {
  const d = new Date(dateStr + "T00:00:00Z");
  return d.getUTCDay();
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && aEnd > bStart;
}

// Health checks
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

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

// API endpoints (same as before)
app.get("/api/services", async (request, response) => {
  const pool = await getPool();
  const req = await pool.query("SELECT id, name, duration_minutes, price_cents FROM services WHERE is_active=true ORDER BY id;");
  response.json(req.rows);
});

app.get("/api/barbers", async (request, response) => {
  const pool = await getPool();
  const locationId = request.query.locationId;

  if (!locationId) {
    return response.status(400).json({ error: "Missing location ID" });
  }

  try {
    const query = await pool.query(
  `SELECT 
    id, 
    name, 
    bio, 
    photo_url,
    booking_url,
    years_experience, 
    specialties, 
    is_active,
    created_at,
    updated_at
  FROM barbers 
  WHERE location_id = $1 AND is_active = true
  ORDER BY display_order ASC, name ASC`,
  [locationId]
);
    response.json(query.rows);
  } catch (error) {
    console.error("Error fetching barbers:", error);
    return response.status(500).json({ 
      error: "Internal Server Error",
      detail: error.message 
    });
  }
});

app.get('/api/locations', async (request, response) => {
  const pool = await getPool();
  const result = await pool.query('SELECT id, name, address1, city, is_active FROM locations WHERE is_active=true');
  response.json(result.rows);
});

app.get("/api/availability", async (req, res) => {
  try {
    const locationId = Number(req.query.locationId);
    const barberId = Number(req.query.barberId);
    const serviceId = Number(req.query.serviceId);
    const date = String(req.query.date || "");

    if (!locationId || !barberId || !serviceId || !date) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const pool = await getPool();

    const barberOk = await pool.query(
      "SELECT 1 FROM barbers WHERE id=$1 AND location_id=$2 AND is_active=true",
      [barberId, locationId]
    );
    if (barberOk.rowCount === 0) return res.status(404).json({ error: "Barber not found" });

    const svc = await pool.query(
      "SELECT duration_minutes FROM services WHERE id=$1 AND is_active=true",
      [serviceId]
    );
    if (svc.rowCount === 0) return res.status(404).json({ error: "Service not found" });
    const durationMin = svc.rows[0].duration_minutes;

    const dow = toDow(date);
    const wh = await pool.query(
      "SELECT start_time, end_time FROM working_hours WHERE barber_id=$1 AND dow=$2",
      [barberId, dow]
    );
    if (wh.rowCount === 0) return res.json({ slots: [] });

    const startTime = String(wh.rows[0].start_time).slice(0, 5);
    const endTime = String(wh.rows[0].end_time).slice(0, 5);

    const dayStart = new Date(date + "T00:00:00-08:00").toISOString();
    const dayEnd = new Date(date + "T23:59:59-08:00").toISOString();

    const appts = await pool.query(
      `SELECT start_ts, end_ts FROM appointments
       WHERE barber_id=$1 AND location_id=$2 AND status='booked'
         AND start_ts >= $3::timestamptz AND start_ts <= $4::timestamptz
       ORDER BY start_ts`,
      [barberId, locationId, dayStart, dayEnd]
    );

    const intervalMin = 15;
    const workStart = new Date(date + `T${startTime}:00-08:00`);
    const workEnd = new Date(date + `T${endTime}:00-08:00`);

    const slots = [];
    for (let t = new Date(workStart); t.getTime() + durationMin * 60000 <= workEnd.getTime(); t = new Date(t.getTime() + intervalMin * 60000)) {
      const slotStart = new Date(t);
      const slotEnd = new Date(t.getTime() + durationMin * 60000);
      const isTaken = appts.rows.some(a => overlaps(new Date(a.start_ts), new Date(a.end_ts), slotStart, slotEnd));
      if (!isTaken) slots.push(slotStart.toISOString());
    }

    res.json({ slots });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/appointments", async (req, res) => {
  const { locationId, barberId, serviceId, startTs, customerName } = req.body;

  if (!locationId || !barberId || !serviceId || !startTs || !customerName) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const barberOk = await client.query(
      "SELECT 1 FROM barbers WHERE id=$1 AND location_id=$2 AND is_active=true",
      [barberId, locationId]
    );
    if (barberOk.rowCount === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Barber not found" });
    }

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

    const overlap = await client.query(
      `SELECT 1 FROM appointments
       WHERE barber_id=$1 AND location_id=$2 AND status='booked'
         AND start_ts < $4::timestamptz AND end_ts > $3::timestamptz
       LIMIT 1`,
      [barberId, locationId, start.toISOString(), end.toISOString()]
    );

    if (overlap.rowCount > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Time slot already booked" });
    }

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
  if (!locationId || !date) return res.status(400).json({ error: "Missing parameters" });

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

app.get("/api/admin/all", async (request, response) => {
  const pool = await getPool();
  
  try {
    const result = await pool.query(
      `SELECT a.id, a.status, a.customer_name, a.customer_phone, a.customer_email,
              a.start_ts, a.end_ts, b.name AS barber_name, l.name As location_name
       FROM appointments AS a
       INNER JOIN barbers AS b ON a.barber_id = b.id
       INNER JOIN locations AS l ON b.location_id = l.id
       ORDER BY a.start_ts DESC`
    );
     
    return response.status(200).json(result.rows);
  } catch (error) {
    console.error("GET /api/admin/all failed:", error);
    return response.status(500).json({
      error: "Failed to fetch appointments",
      detail: error.message,
    });
  }
});

app.get("/version", (req, res) => {
  res.json({ version: "vercel-2026-02-01" });
});

app.get("/api/debug", async (req, res) => {
  try {
    const pool = await getPool();
    const services = await pool.query("SELECT * FROM services");
    const barbers = await pool.query("SELECT * FROM barbers");
    const locations = await pool.query("SELECT * FROM locations");
    const hours = await pool.query("SELECT * FROM working_hours");
    
    const barberColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'barbers'
      ORDER BY ordinal_position;
    `);
    
    res.json({
      services: services.rows,
      barbers: barbers.rows,
      locations: locations.rows,
      working_hours: hours.rows,
      barber_schema: barberColumns.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

// For Vercel, export the app
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}