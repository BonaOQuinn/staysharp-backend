--Migration: Add booking_url to barbers table
--Date: 2026-02-15
--Description: Adds booking_url field to barbers for online booking links

BEGIN;

-- Add booking_url column to barbers table
ALTER TABLE barbers
ADD COLUMN IF NOT EXISTS booking_url TEXT;
-- Optionally, you can set a default value or update existing records if needed
-- UPDATE barbers SET booking_url = 'http://default-booking-url.com' WHERE booking_url IS NULL;         
COMMIT;
