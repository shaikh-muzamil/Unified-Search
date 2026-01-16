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
                name TEXT
            );
        `);

        // Session table for connect-pg-simple
        await pool.query(`
            CREATE TABLE IF NOT EXISTS session (
                sid varchar NOT NULL COLLATE "default",
                sess json NOT NULL,
                expire timestamp(6) NOT NULL
            )
            WITH (OIDS=FALSE);
            
            ALTER TABLE session ADD CONSTRAINT session_pkey PRIMARY KEY (sid) NOT DEFERRABLE INITIALLY IMMEDIATE;
            
            CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
        `).catch(err => {
            // Ignore error if table/index already exists (pg-simple might create it or specific error codes)
            // Ideally we check existence first, but this is a rough migration script
            if (!err.message.includes('already exists')) {
                console.warn('Session table creation warning:', err.message);
            }
        });

        console.log('--- Database Connected & Tables Initialized ---');
    } catch (error) {
        console.error('Database Initialization Error:', error);
        throw error;
    }
};

export const getDB = () => pool;
