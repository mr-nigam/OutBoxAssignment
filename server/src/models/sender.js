import pool from '../config/postgre.js';
import createUpdatedAtTrigger from '../utils/dbTriggers.js';


const createSendersTable = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS citext;
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS senders(
                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                name VARCHAR(100) NOT NULL,

                email CITEXT NOT NULL
                    CHECK (
                        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
                    ),

                ethereal_user VARCHAR(255),
                ethereal_password VARCHAR(255),

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_senders_user_id
            ON senders(user_id);

            CREATE INDEX IF NOT EXISTS idx_senders_email
            ON senders(email);
        `);

        await createUpdatedAtTrigger(pool, 'senders');

        console.log("✅ Senders table and indexes created successfully");

    } catch (err) {
        console.error("❌ Senders table creation failed", err);
        throw err;
    }
};


export default createSendersTable;
