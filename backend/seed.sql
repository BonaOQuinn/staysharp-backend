-- Clear existing data (in correct order due to foreign keys)
DELETE FROM appointments;
DELETE FROM working_hours;
DELETE FROM barbers;
DELETE FROM services;
DELETE FROM locations;

-- Reset sequences to start fresh
SELECT setval('locations_id_seq', 1, false);
SELECT setval('services_id_seq', 1, false);
SELECT setval('barbers_id_seq', 1, false);
SELECT setval('working_hours_id_seq', 1, false);

-- Initial data for demo
INSERT INTO locations (name, address1, city, state, zip, phone, is_active)
VALUES
       ('StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', '91942', NULL, true), 
       ('StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', '91977', NULL, true); 


INSERT INTO services (name, duration_minutes, price_cents, is_active)
VALUES ('Haircut', 30, 3000, true), 
       ('Beard Trim', 15, 1500, true);

INSERT INTO barbers (name, location_id, is_active)
VALUES ('Barber 1', 1, true), 
       ('Barber 2', 1, true);


INSERT INTO working_hours (barber_id, dow, start_time, end_time)
VALUES
(1, 1, '09:00', '17:00'),
(1, 2, '09:00', '17:00'), 
(1, 3, '09:00', '17:00'), 
(1, 4, '09:00', '17:00'), 
(1, 5, '09:00', '17:00'),
(2, 1, '09:00', '17:00'),
(2, 2, '09:00', '17:00'), 
(2, 3, '09:00', '17:00'), 
(2, 4, '09:00', '17:00'), 
(2, 5, '09:00', '17:00')
ON CONFLICT (barber_id, dow) DO UPDATE 
SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time;





