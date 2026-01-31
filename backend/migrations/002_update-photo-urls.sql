-- Migration 002: Update barber photo URLs to full URLs
-- Date: 2026-01-31
-- Description: Updates all barber photo_url values from relative paths to absolute URLs
--              for proper serving from AWS App Runner

BEGIN;

-- Update all barber photo URLs to use full API domain
UPDATE barbers 
SET photo_url = 'https://4hsxwekzik.us-west-2.awsapprunner.com' || photo_url
WHERE photo_url NOT LIKE 'https://%' 
  AND photo_url IS NOT NULL;

-- Verify the update
DO $$
DECLARE
  updated_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO updated_count
  FROM barbers
  WHERE photo_url LIKE 'https://4hsxwekzik.us-west-2.awsapprunner.com%';
  
  RAISE NOTICE 'Migration complete: % barber photo URLs updated', updated_count;
END $$;

COMMIT;