-- Clear existing data (in correct order due to foreign keys)
DELETE FROM appointments;
DELETE FROM working_hours;
DELETE FROM barbers;
DELETE FROM services;
DELETE FROM locations;

-- Reset sequences
ALTER SEQUENCE locations_id_seq RESTART WITH 1;
ALTER SEQUENCE services_id_seq RESTART WITH 1;
ALTER SEQUENCE barbers_id_seq RESTART WITH 1;
ALTER SEQUENCE working_hours_id_seq RESTART WITH 1;

-- Initial data for demo
INSERT INTO locations (id, name, address1, city, state, zip, phone, is_active)
VALUES
       (1, 'StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', '91942', NULL, true), 
       (2, 'StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', '91977', NULL, true); 


INSERT INTO services (id, name, duration_minutes, price_cents, is_active)
VALUES (1, 'Haircut', 30, 3000, true), 
       (2, 'Beard Trim', 15, 1500, true);

INSERT INTO barbers (id, name, location_id, is_active)
VALUES (1, 'Barber 1', 1, true), 
       (2, 'Barber 2', 1, true);


INSERT INTO working_hours (id, barber_id, dow, start_time, end_time)
VALUES
(1, 1, 1, '09:00', '17:00'),
(2, 1, 2, '09:00', '17:00'), 
(3, 1, 3, '09:00', '17:00'), 
(4, 1, 4, '09:00', '17:00'), 
(5, 1, 5, '09:00', '17:00')
ON CONFLICT (barber_id, dow) DO UPDATE 
SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time;





