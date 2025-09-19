-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table for storing field embeddings for RAG
CREATE TABLE public.field_embeddings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  field_id TEXT NOT NULL,
  section_id TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  synonyms TEXT[] NOT NULL DEFAULT '{}',
  options TEXT[] DEFAULT NULL,
  extraction_hints TEXT[] NOT NULL DEFAULT '{}',
  medical_context TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding dimension
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(field_id)
);

-- Create index for vector similarity search
CREATE INDEX ON field_embeddings USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable RLS
ALTER TABLE public.field_embeddings ENABLE ROW LEVEL SECURITY;

-- Allow read access to all authenticated users (medical staff need access to all fields)
CREATE POLICY "Medical staff can view field embeddings"
ON public.field_embeddings
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Only admins can insert/update embeddings (for setup/maintenance)
CREATE POLICY "Admins can manage field embeddings"
ON public.field_embeddings
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Create function to search similar fields using vector similarity
CREATE OR REPLACE FUNCTION public.search_similar_fields(
  query_embedding vector(1536),
  similarity_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10
)
RETURNS TABLE (
  field_id text,
  section_id text,
  field_label text,
  field_type text,
  synonyms text[],
  options text[],
  extraction_hints text[],
  medical_context text,
  similarity float
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fe.field_id,
    fe.section_id,
    fe.field_label,
    fe.field_type,
    fe.synonyms,
    fe.options,
    fe.extraction_hints,
    fe.medical_context,
    1 - (fe.embedding <=> query_embedding) AS similarity
  FROM field_embeddings fe
  WHERE 1 - (fe.embedding <=> query_embedding) > similarity_threshold
  ORDER BY fe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;