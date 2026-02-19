import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
    throw new Error('FATAL: Database connection string is missing. Please set DATABASE_URL or POSTGRES_URL in environment variables.');
}

console.log(`Connecting to database... (Source: ${process.env.DATABASE_URL ? 'DATABASE_URL' : 'POSTGRES_URL'})`);

export const pool = new Pool({
    connectionString: connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false
});

export const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT,
                slack_access_token TEXT,
                slack_user_id TEXT,
                notion_access_token TEXT,
                notion_bot_id TEXT,
                google_access_token TEXT,
                google_refresh_token TEXT
            );
        `);

        // Migration for existing tables (safe to run multiple times)
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_access_token TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_user_id TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_access_token TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_bot_id TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_access_token TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_refresh_token TEXT; `);
        } catch (e) {
            console.log('Migration note: Columns might already exist or error in migration', e);
        }

        // Session table for connect-pg-simple
        // Session table for connect-pg-simple
        // Using a simpler robust query that doesn't fail if table exists
        await pool.query(`
            CREATE TABLE IF NOT EXISTS session(
            sid varchar NOT NULL COLLATE "default",
            sess json NOT NULL,
            expire timestamp(6) NOT NULL,
            CONSTRAINT session_pkey PRIMARY KEY(sid)
        );
            CREATE INDEX IF NOT EXISTS IDX_session_expire ON session(expire);
        `);



        console.log('--- Database Connected & Tables Initialized ---');
    } catch (error) {
        console.error('Database Initialization Error:', error);
        throw error;
    }
};

export const getDB = () => pool;
