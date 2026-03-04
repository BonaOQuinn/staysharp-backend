-- Database Export

-- locations
INSERT INTO locations (id, name, address1, city, state, zip, phone, is_active) VALUES (1, 'StaySharp - La Mesa', '5288 Baltimore Drive', 'La Mesa', 'CA', '91942', NULL, true);
INSERT INTO locations (id, name, address1, city, state, zip, phone, is_active) VALUES (2, 'StaySharp - Spring Valley', '9903 Campo Road', 'Spring Valley', 'CA', '91977', NULL, true);

-- services
INSERT INTO services (id, name, duration_minutes, price_cents, is_active) VALUES (1, 'Haircut', 30, 3000, true);
INSERT INTO services (id, name, duration_minutes, price_cents, is_active) VALUES (2, 'Beard Trim', 15, 1500, true);

-- barbers
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (1, 'Nolen', 1, true, 'barber for members of the SDSU mens basketball team', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/nolen.jpg', 5, ARRAY['Fade/Taper WITH Scissor-work','Hair Design + Shaver and Razor enhancements'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:07.922Z', 1, 'https://book.thecut.co/blenededbynolen');
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (2, 'AdrianBlendz', 1, true, '4.9/5 rating', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/adrian-blends.jpg', 5, ARRAY['Beard Work','Fades','lineups','enhancements'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:08.216Z', 2, 'https://book.thecut.co/adriancarmona');
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (3, 'fadesbyluis', 1, true, '3rd place winner of Arizona Barber Expo 2022, 4.8/5 rating', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/fadesbyluis.jpg', 5, ARRAY['Fades','Enhancements','sheer work'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:08.264Z', 3, 'https://book.thecut.co/Fadesbyluis');
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (4, 'HowToBarber', 1, true, '4.1/5 rating, Special Appointment services', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/howto.jpg', 4, ARRAY['Haircuts','Beard Trims','Razor Work'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:08.314Z', 4, 'https://book.thecut.co/howtobarber');
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (5, 'Diego Lopez', 2, true, '100% all natural cuts, 5/5 rating', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/diego-holder.jpg', 4, ARRAY['Razor work','Facial Masks','Hot Towel Shave','Beard Work'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:08.362Z', 1, 'https://book.thecut.co/Daygo-Fadez-dl5vlul');
INSERT INTO barbers (id, name, location_id, is_active, bio, photo_url, years_experience, specialties, created_at, updated_at, display_order, booking_url) VALUES (6, 'Jp.Kuttz', 2, true, 'Award winning barber, 4.9/5 rating, $20 tuesdays', 'https://4hsxwekzik.us-west-2.awsapprunner.com/images/barbers/jpkuttz.jpg', 6, ARRAY['Fades/Tapers','Beard Work','Lineups','Razor Work','Scissor-Work','Skin-Fades'], '2026-01-30T23:09:10.836Z', '2026-02-01T22:22:08.406Z', 2, 'https://book.thecut.co/JPKUTTZ_-jdj12en');

-- working_hours
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (1, 1, 0, '14:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (2, 1, 1, '14:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (3, 1, 2, '10:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (4, 1, 4, '10:30:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (5, 1, 5, '10:00:00', '16:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (6, 1, 6, '10:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (7, 2, 1, '12:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (8, 2, 2, '12:00:00', '19:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (9, 2, 3, '12:00:00', '19:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (10, 2, 4, '10:30:00', '19:30:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (11, 2, 5, '09:00:00', '19:30:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (12, 2, 6, '09:00:00', '20:30:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (13, 3, 0, '09:00:00', '16:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (14, 3, 1, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (15, 3, 2, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (16, 3, 3, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (17, 3, 4, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (18, 3, 5, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (19, 3, 6, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (20, 4, 0, '09:00:00', '21:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (21, 4, 1, '09:00:00', '21:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (22, 4, 2, '09:00:00', '21:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (23, 4, 3, '08:00:00', '17:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (24, 4, 4, '08:00:00', '17:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (25, 4, 5, '09:00:00', '19:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (26, 4, 6, '09:00:00', '19:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (27, 5, 0, '09:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (28, 5, 1, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (29, 5, 2, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (30, 5, 3, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (31, 5, 4, '09:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (32, 5, 6, '09:00:00', '18:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (33, 6, 0, '10:00:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (34, 6, 1, '15:30:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (35, 6, 2, '15:30:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (36, 6, 3, '15:30:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (37, 6, 5, '14:30:00', '20:00:00');
INSERT INTO working_hours (id, barber_id, dow, start_time, end_time) VALUES (38, 6, 6, '10:00:00', '20:00:00');

