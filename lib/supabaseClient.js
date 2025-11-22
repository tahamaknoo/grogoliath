import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ilbivscafgeqdbcamkdd.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsYml2c2NhZmdlcWRiY2Fta2RkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NzUwNTQsImV4cCI6MjA3OTE1MTA1NH0._BYABE01GCqAqvg6nZsTswtyKFLj93_RAKrfHvdggyg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)