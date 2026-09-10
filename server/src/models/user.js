import pool from '../config/postgre.js';
import createUpdatedAtTrigger from '../utils/dbTriggers.js';


const createUsersTable = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS citext;
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS users(
                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),

                google_id VARCHAR(255) UNIQUE,

                name VARCHAR(100) NOT NULL,

                email CITEXT UNIQUE NOT NULL
                    CHECK (
                        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
                    ),

                avatar_url TEXT,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_users_email
            ON users(email);

            CREATE INDEX IF NOT EXISTS idx_users_google_id
            ON users(google_id);
        `);

        await createUpdatedAtTrigger(pool, 'users');

        console.log("✅ Users table and indexes created successfully");

    } catch (err) {
        console.error("❌ Users table creation failed", err);
        throw err;
    }
};


export default createUsersTable;
