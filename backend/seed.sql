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

-- Insert locations
INSERT INTO locations (name, address1, city, state, zip, phone, is_active)
VALUES
  ('StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', '91942', NULL, true), 
  ('StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', '91977', NULL, true);

-- Insert services
INSERT INTO services (name, duration_minutes, price_cents, is_active)
VALUES 
  ('Haircut', 30, 3000, true), 
  ('Beard Trim', 15, 1500, true);

-- Insert barbers with enhanced data
-- FIXED: added commas between VALUES, corrected column name to years_experience
INSERT INTO barbers (name, location_id, is_active, bio, years_experience, specialties, photo_url, display_order)
VALUES
  ('Nolen', 1, true, 'barber for members of the SDSU mens basketball team', 5, ARRAY['Fade/Taper WITH Scissor-work', 'Hair Design + Shaver and Razor enhancements'], '/images/barbers/nolen.jpg', 1),
  ('AdrianBlendz', 1, true, '4.9/5 rating', 5, ARRAY['Beard Work', 'Fades', 'lineups', 'enhancements'], '/images/barbers/adrian-blends.jpg', 2),
  ('fadesbyluis', 1, true, '3rd place winner of Arizona Barber Expo 2022, 4.8/5 rating', 5, ARRAY['Fades', 'Enhancements', 'sheer work'], '/images/barbers/fadesbyluis.jpg', 3),
  ('HowToBarber', 1, true, '4.1/5 rating, Special Appointment services', 4, ARRAY['Haircuts', 'Beard Trims', 'Razor Work'], '/images/barbers/howto.jpg', 4),
  ('Diego Lopez', 2, true, '100% all natural cuts, 5/5 rating', 4, ARRAY['Razor work', 'Facial Masks', 'Hot Towel Shave', 'Beard Work'], '/images/barbers/diego-holder.jpg', 1),
  ('Jp.Kuttz', 2, true, 'Award winning barber, 4.9/5 rating, $20 tuesdays', 6, ARRAY['Fades/Tapers', 'Beard Work', 'Lineups', 'Razor Work', 'Scissor-Work', 'Skin-Fades'], '/images/barbers/jpkuttz.jpg', 2);

-- Insert working hours for all barbers
INSERT INTO working_hours (barber_id, dow, start_time, end_time)
VALUES
  -- Nolen (barber_id 1)
  -- Sunday & Monday: 2pm-6pm, Tuesday: 10am-6pm, No Wednesday
  -- Thursday: 10:30am-6pm, Friday: 10am-4pm, Saturday: 10am-6pm
  (1, 0, '14:00', '18:00'),  -- Sunday
  (1, 1, '14:00', '18:00'),  -- Monday
  (1, 2, '10:00', '18:00'),  -- Tuesday
  (1, 4, '10:30', '18:00'),  -- Thursday
  (1, 5, '10:00', '16:00'),  -- Friday
  (1, 6, '10:00', '18:00'),  -- Saturday
  
  -- AdrianBlendz (barber_id 2)
  -- Monday: 12pm-8pm, Tuesday: 12pm-7pm, Wednesday: 12pm-7pm
  -- Thursday: 10:30am-7:30pm, Friday: 9am-7:30pm, Saturday: 9am-8:30pm
  (2, 1, '12:00', '20:00'),  -- Monday
  (2, 2, '12:00', '19:00'),  -- Tuesday
  (2, 3, '12:00', '19:00'),  -- Wednesday
  (2, 4, '10:30', '19:30'),  -- Thursday
  (2, 5, '09:00', '19:30'),  -- Friday
  (2, 6, '09:00', '20:30'),  -- Saturday
  
  -- fadesbyluis (barber_id 3)
  -- Sunday: 9am-4pm, Monday-Saturday: 9am-8pm
  (3, 0, '09:00', '16:00'),  -- Sunday
  (3, 1, '09:00', '20:00'),  -- Monday
  (3, 2, '09:00', '20:00'),  -- Tuesday
  (3, 3, '09:00', '20:00'),  -- Wednesday
  (3, 4, '09:00', '20:00'),  -- Thursday
  (3, 5, '09:00', '20:00'),  -- Friday
  (3, 6, '09:00', '20:00'),  -- Saturday
  
  -- HowToBarber (barber_id 4)
  -- Sunday-Tuesday: 9am-9pm, Wednesday-Thursday: 8am-5pm, Friday-Saturday: 9am-7pm
  (4, 0, '09:00', '21:00'),  -- Sunday
  (4, 1, '09:00', '21:00'),  -- Monday
  (4, 2, '09:00', '21:00'),  -- Tuesday
  (4, 3, '08:00', '17:00'),  -- Wednesday
  (4, 4, '08:00', '17:00'),  -- Thursday
  (4, 5, '09:00', '19:00'),  -- Friday
  (4, 6, '09:00', '19:00'),  -- Saturday
  
  -- Diego Lopez (barber_id 5)
  -- Sunday: 9am-6pm, Monday-Thursday: 9am-8pm, Saturday: 9am-6pm (No Friday)
  (5, 0, '09:00', '18:00'),  -- Sunday
  (5, 1, '09:00', '20:00'),  -- Monday
  (5, 2, '09:00', '20:00'),  -- Tuesday
  (5, 3, '09:00', '20:00'),  -- Wednesday
  (5, 4, '09:00', '20:00'),  -- Thursday
  (5, 6, '09:00', '18:00'),  -- Saturday
  
  -- Jp.Kuttz (barber_id 6)
  -- Sunday: 10am-8pm, Monday-Wednesday: 3:30pm-8pm, Friday: 2:30pm-8pm, Saturday: 10am-8pm (No Thursday)
  (6, 0, '10:00', '20:00'),  -- Sunday
  (6, 1, '15:30', '20:00'),  -- Monday
  (6, 2, '15:30', '20:00'),  -- Tuesday
  (6, 3, '15:30', '20:00'),  -- Wednesday
  (6, 5, '14:30', '20:00'),  -- Friday
  (6, 6, '10:00', '20:00')   -- Saturday
ON CONFLICT (barber_id, dow) DO UPDATE 
SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time;