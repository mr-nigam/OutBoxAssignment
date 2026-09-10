import pool from '../config/postgre.js';
import createUpdatedAtTrigger from '../utils/dbTriggers.js';


const createEmailJobsTable = async () => {
    try {
        await pool.query(`
            CREATE EXTENSION IF NOT EXISTS citext;
            CREATE EXTENSION IF NOT EXISTS pgcrypto;
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS email_jobs(
                id UUID PRIMARY KEY
                    DEFAULT gen_random_uuid(),

                campaign_id UUID
                    REFERENCES campaigns(id)
                    ON DELETE CASCADE,

                sender_id UUID
                    REFERENCES senders(id)
                    ON DELETE SET NULL,

                recipient CITEXT NOT NULL
                    CHECK (
                        recipient ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'
                    ),

                subject VARCHAR(500) NOT NULL,

                body TEXT NOT NULL,

                scheduled_at TIMESTAMPTZ NOT NULL,

                sent_at TIMESTAMPTZ,

                status VARCHAR(20) DEFAULT 'scheduled' NOT NULL
                    CHECK (
                        status IN (
                            'scheduled',
                            'processing',
                            'sent',
                            'failed'
                        )
                    ),

                attempts INTEGER DEFAULT 0 NOT NULL
                    CHECK (attempts >= 0),

                last_error TEXT,

                bull_job_id VARCHAR(255),

                idempotency_key VARCHAR(255) UNIQUE,

                created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
            );
        `);

        await pool.query(`
            CREATE INDEX IF NOT EXISTS idx_email_jobs_campaign_id
            ON email_jobs(campaign_id);

            CREATE INDEX IF NOT EXISTS idx_email_jobs_sender_id
            ON email_jobs(sender_id);

            CREATE INDEX IF NOT EXISTS idx_email_jobs_status
            ON email_jobs(status);

            CREATE INDEX IF NOT EXISTS idx_email_jobs_scheduled_at
            ON email_jobs(scheduled_at);

            CREATE INDEX IF NOT EXISTS idx_email_jobs_idempotency_key
            ON email_jobs(idempotency_key);
        `);

        await createUpdatedAtTrigger(pool, 'email_jobs');

        console.log("✅ Email jobs table and indexes created successfully");

    } catch (err) {
        console.error("❌ Email jobs table creation failed", err);
        throw err;
    }
};


export default createEmailJobsTable;
