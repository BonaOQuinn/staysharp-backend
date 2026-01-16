--initial data for demo
INSERT INTO locations (name, address1, city, state, zip, phone, is_active)
VALUES
       ('StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', 91942, NULL, true), 
       ('StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', 91977, NULL, true); 


INSERT INTO services (name, duration_minutes, price_cents, is_active)
VALUES ('Haircut', 30, 3000, true), 
       ('beard trim', 15, 1500, true);

INSERT INTO barbers (name, location_id, is_active)
VALUES ('barber 1', 1, true), 
       ('barber 2', 2, true);





