-- Migration: Add enhanced fields to barbers table (CORRECTED)
-- Date: 2026-01-30
-- Description: Adds bio, photo_url, experience, and specialties to barbers

BEGIN;

-- Add columns (allowing NULL since existing data won't have values)
ALTER TABLE barbers 
ADD COLUMN IF NOT EXISTS bio TEXT, 
ADD COLUMN IF NOT EXISTS photo_url TEXT, 
ADD COLUMN IF NOT EXISTS years_experience INT,  -- FIXED: was years_experiance
ADD COLUMN IF NOT EXISTS specialties TEXT[], 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Add index for faster location-based queries (FIXED: proper syntax)
CREATE INDEX IF NOT EXISTS idx_barbers_location_active 
ON barbers(location_id) WHERE is_active = true;

-- Add index for display ordering
CREATE INDEX IF NOT EXISTS idx_barbers_display_order 
ON barbers(location_id, display_order, is_active);

-- Add function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- Create trigger for barbers table
DROP TRIGGER IF EXISTS update_barbers_updated_at ON barbers;
CREATE TRIGGER update_barbers_updated_at
    BEFORE UPDATE ON barbers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;