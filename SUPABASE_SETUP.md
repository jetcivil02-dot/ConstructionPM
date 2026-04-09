# Supabase Setup Guide for ConstructionPM

This guide will walk you through setting up your Supabase project and database schema for the ConstructionPM application.

## 1. Create a Supabase Project

1.  Go to [Supabase](https://supabase.com/) and sign in or create an account.
2.  Click "New project" to create a new project.
3.  Fill in the project details (Name, Database Password, Region) and click "Create new project".

## 2. Configure Environment Variables

After creating your Supabase project, you will need to get your project's URL and `anon` key.

1.  In your Supabase project dashboard, navigate to `Project Settings` > `API`.
2.  Copy the `URL` and `anon` (public) key.
3.  In your local `ConstructionPM` project directory, create a new file named `.env`.
4.  Add the following lines to your `.env` file, replacing the placeholder values with your actual Supabase URL and Anon Key:

    ```
    VITE_SUPABASE_URL="YOUR_SUPABASE_URL"
    VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
    ```

## 3. Apply Database Schema

Now, you need to apply the database schema to your Supabase project. This schema includes all necessary tables, Row Level Security (RLS) policies, and indexes.

1.  In your Supabase project dashboard, navigate to `SQL Editor`.
2.  Click "New query" or open an existing query editor.
3.  Copy the entire content of the `supabase/migrations/20260409071835_001_initial_schema.sql` file and paste it into the SQL editor.
4.  Click "Run" to execute the SQL script. This will create all tables, enable RLS, and set up policies.

## 4. Run the Application

After setting up Supabase and configuring your `.env` file, you can run the application locally:

1.  Open your terminal in the `ConstructionPM` project directory.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Start the development server:
    ```bash
    pnpm dev
    ```

Your application should now be running and connected to your Supabase project. You can access it in your browser, typically at `http://localhost:5173`.

## Important Notes on Roles

The application uses the `user_roles` table to manage user permissions. After a user signs up through the app, you will need to manually (or through a trigger) assign them a role in the `user_roles` table in the Supabase dashboard to grant them access to specific features:

- `Sub-con`: Can add and edit their own tasks.
- `Foreman`: Can manage attendance and view all tasks.
- `Engineer`: Can view tasks and attendance.
- `PM`: Can view everything.
- `Dev`: Full access to all features, including admin settings.
