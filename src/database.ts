import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

let connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NeonDB;

// If the connection string is a psql command (like "psql 'postgresql://...'"), extract just the URL
if (connectionString && connectionString.startsWith("psql '")) {
    const match = connectionString.match(/'(postgresql:\/\/[^']+)'/);
    if (match && match[1]) {
        connectionString = match[1];
    }
}

if (!connectionString) {
    console.warn('WARNING: Database connection string is missing. Application will try to connect to localhost (which may fail on Vercel).');
} else {
    console.log(`Connection string detected (starts with: ${connectionString.substring(0, 10)}...)`);
}

// Neon/Vercel Postgres requires SSL
const requiresSsl = connectionString && (connectionString.includes('neon.tech') || connectionString.includes('vercel-storage'));
const sslConfig = (isProduction || requiresSsl) ? { rejectUnauthorized: false } : false;

export const pool = new Pool({
    connectionString: connectionString,
    ssl: sslConfig
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
            await pool.query(`ALTER TABLE users ALTER COLUMN password DROP NOT NULL; `);
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

        // Search metrics table for Weekly Digest logic
        await pool.query(`
            CREATE TABLE IF NOT EXISTS search_metrics (
                id SERIAL PRIMARY KEY,
                user_id INT,
                query TEXT,
                slack_results_count INT DEFAULT 0,
                notion_results_count INT DEFAULT 0,
                google_results_count INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Digests table for storing past weekly digests
        await pool.query(`
            CREATE TABLE IF NOT EXISTS digests (
                id SERIAL PRIMARY KEY,
                user_id INT,
                week_of TEXT,
                summary TEXT,
                stats JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);        console.log('--- Database Connected & Tables Initialized ---');
    } catch (error) {
        console.error('Database Initialization Error:', error);
        throw error;
    }
};

export const getDB = () => pool;
