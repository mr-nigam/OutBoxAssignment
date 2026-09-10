import pool, { conectDB } from '../config/postgre.js';
import createUsersTable from '../models/user.js';
import createSendersTable from '../models/sender.js';
import createCampaignsTable from '../models/emailCampaigns.js';
import createEmailJobsTable from '../models/emailJobs.js';

const bootstrapDB = async () => {
    try {
        await conectDB();
        console.log("✅ PostgreSQL Connected");

        // Initialize tables in dependency order
        await createUsersTable();
        await createSendersTable();
        await createCampaignsTable();
        await createEmailJobsTable();

        console.log("✅ All database tables and indexes initialized successfully");
    } catch (error) {
        console.error('❌ PostgreSQL Initialization/Connection Failed:', error);
        process.exit(1);
    }
};

pool.on('error', (error) => {
    console.error('❌ PostgreSQL Pool Error:', error);
});

process.on('SIGINT', async () => {
    await pool.end();
    console.log('🛑 PostgreSQL Pool Closed');
    process.exit(0);
});

export default bootstrapDB;