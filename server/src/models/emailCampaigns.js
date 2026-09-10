import pool from '../config/postgre.js';
import createUpdatedAtTrigger from '../utils/dbTriggers.js';


const createCampaignsTable = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS campaigns(
                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),

                user_id UUID NOT NULL
                    REFERENCES users(id)
                    ON DELETE CASCADE,

                subject VARCHAR(500) NOT NULL,

                body TEXT NOT NULL,

                start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

                delay_seconds INTEGER DEFAULT 0
                    CHECK (delay_seconds >= 0),

                hourly_limit INTEGER DEFAULT 0
                    CHECK (hourly_limit >= 0),

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_campaigns_user_id
            ON campaigns(user_id);

            CREATE INDEX IF NOT EXISTS idx_campaigns_start_time
            ON campaigns(start_time);
        `);

        await createUpdatedAtTrigger(pool, 'campaigns');

        console.log("✅ Campaigns table and indexes created successfully");

    } catch (err) {
        console.error("❌ Campaigns table creation failed", err);
        throw err;
    }
};


export default createCampaignsTable;
