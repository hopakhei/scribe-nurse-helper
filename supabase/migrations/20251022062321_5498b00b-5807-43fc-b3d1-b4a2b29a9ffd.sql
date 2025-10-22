-- Make transcripts permanent by removing expiration
-- 1. Remove the default expiration time
ALTER TABLE public.audio_transcripts 
ALTER COLUMN expires_at DROP DEFAULT;

-- 2. Set all existing transcripts to never expire
UPDATE public.audio_transcripts 
SET expires_at = NULL;

-- 3. Drop the cleanup function as it's no longer needed
DROP FUNCTION IF EXISTS public.cleanup_expired_transcripts();