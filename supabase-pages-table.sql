-- Create pages table
CREATE TABLE IF NOT EXISTS public.pages (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id BIGINT REFERENCES public.projects(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  location TEXT NOT NULL,
  html_content TEXT NOT NULL,
  status TEXT DEFAULT 'completed',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only see their own pages
CREATE POLICY "Users can view their own pages"
  ON public.pages
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can insert their own pages
CREATE POLICY "Users can insert their own pages"
  ON public.pages
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can update their own pages
CREATE POLICY "Users can update their own pages"
  ON public.pages
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can delete their own pages
CREATE POLICY "Users can delete their own pages"
  ON public.pages
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX pages_project_id_idx ON public.pages(project_id);
CREATE INDEX pages_user_id_idx ON public.pages(user_id);
