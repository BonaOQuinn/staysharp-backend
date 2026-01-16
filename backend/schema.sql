-- Services customers can book
CREATE TABLE IF NOT EXISTS services (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  price_cents INT NOT NULL CHECK (price_cents > 0),
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS locations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address1 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- barbers (staff)
CREATE TABLE IF NOT EXISTS barbers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location_id INT NOT NULL REFERENCES locations(id),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- weekly working hours per barber
-- dow: 0=Sun...6=Sat
CREATE TABLE IF NOT EXISTS working_hours (
  id SERIAL PRIMARY KEY,
  barber_id INT NOT NULL REFERENCES barbers(id) ON DELETE CASCADE,
  dow INT NOT NULL CHECK (dow BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  CHECK (start_time < end_time),
  UNIQUE (barber_id, dow)
);

-- Appointments
CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY,
  barber_id INT NOT NULL REFERENCES barbers(id),
  service_id INT NOT NULL REFERENCES services(id),
  start_ts TIMESTAMPTZ NOT NULL,
  end_ts TIMESTAMPTZ NOT NULL,
  location_id INT NOT NULL REFERENCES locations(id) ON DELETE RESTRICT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (start_ts < end_ts)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,

  -- login
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,

  -- permission
  role TEXT NOT NULL DEFAULT 'barber' CHECK (role IN ('barber', 'owner')),

  -- isolation: barber belongs to a location; owner can be null
  location_id INT REFERENCES locations(id) ON DELETE SET NULL,

  -- link login to a barber record
  barber_id INT REFERENCES barbers(id) ON DELETE SET NULL,

  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- prevent double-booking via overlap check w/ index helper
CREATE INDEX IF NOT EXISTS appointments_barber_start_end_idx
  ON appointments (barber_id, start_ts, end_ts);


