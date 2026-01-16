--initial data for demo
INSERT INTO services (name, duration_minutes, price_cents)
VALUES ('Haircut', 30, 3000), 
       ('beard trim', 15, 1500)
ON CONFLICT DO NOTHING; 

INSERT INTO barbers (name)
VALUES ('barber 1', 1), 
       ('barber 2', 1)
ON CONFLICT DO NOTHING; 

INSERT INTO locations (name, address1, city, state, zip)
VALUES
       ('StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', 91942), 
       ('StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', 91977); 

