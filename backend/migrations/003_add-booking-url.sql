--Migration: Add booking_url to barbers table
--Date: 2026-02-01
--Description: Adds booking_url field to barbers for The Cut booking links

BEGIN;

-- Add booking_url column to barbers table
ALTER TABLE barbers
ADD COLUMN IF NOT EXISTS booking_url TEXT;

-- Update existing barbers with their The Cut booking URLs
-- REPLACE THESE WITH YOUR ACTUAL THE CUT URLS
UPDATE barbers SET booking_url = 'https://book.thecut/nolen-staysharp' WHERE name = 'Nolen' AND booking_url IS NULL;
UPDATE barbers SET booking_url = 'https://book.thecut/adrianblendz' WHERE name = 'AdrianBlendz' AND booking_url IS NULL;
UPDATE barbers SET booking_url = 'https://book.thecut/fadesbyluis' WHERE name = 'fadesbyluis' AND booking_url IS NULL;
UPDATE barbers SET booking_url = 'https://book.thecut/howtobarber' WHERE name = 'HowToBarber' AND booking_url IS NULL;
UPDATE barbers SET booking_url = 'https://book.thecut/diego-lopez' WHERE name = 'Diego Lopez' AND booking_url IS NULL;
UPDATE barbers SET booking_url = 'https://book.thecut/jpkuttz' WHERE name = 'Jp.Kuttz' AND booking_url IS NULL;

COMMIT;