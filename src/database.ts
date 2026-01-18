import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
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
                notion_bot_id TEXT
            );
        `);

        // Migration for existing tables (safe to run multiple times)
        try {
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_access_token TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS slack_user_id TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_access_token TEXT; `);
            await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_bot_id TEXT; `);
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
