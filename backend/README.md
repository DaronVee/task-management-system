# Backend Setup Instructions

## Supabase Database Setup

1. **Create a new Supabase project**:
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for the database to be provisioned

2. **Run the database schema**:
   - Open the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `schema.sql`
   - Run the SQL script

3. **Enable Realtime**:
   - Go to Database > Replication in your Supabase dashboard
   - Turn on realtime for the `daily_tasks` table

4. **Get your credentials**:
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and anon public key
   - Create a `.env` file in this directory with:
     ```
     SUPABASE_URL=your_project_url
     SUPABASE_KEY=your_anon_key
     ```

## Python Dependencies

Install required packages:
```bash
pip install supabase python-dotenv pydantic
```

## Verification

After setup, you should be able to:
1. See the `daily_tasks` table in your Supabase dashboard
2. View the sample data inserted by the schema
3. Run `python sync.py pull` to test the connection (after creating sync.py)