import pool from '../config/postgre.js';


const findUserById = async (id) => {
    const query = `
        SELECT id, google_id, name, email, avatar_url, created_at, updated_at
        FROM users
        WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
};

const findUserByGoogleId = async (googleId) => {
    const query = `
        SELECT id, google_id, name, email, avatar_url, created_at, updated_at
        FROM users
        WHERE google_id = $1;
    `;
    const result = await pool.query(query, [googleId]);
    return result.rows[0] || null;
};

const findUserByEmail = async (email) => {
    const query = `
        SELECT id, google_id, name, email, avatar_url, created_at, updated_at
        FROM users
        WHERE email = $1;
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
};

const createUser = async ({ 
    google_id,
    name,
    email,
    avatar_url 
}) => {
    const query = `
        INSERT INTO users (google_id, name, email, avatar_url)
        VALUES ($1, $2, $3, $4)
        RETURNING id, google_id, name, email, avatar_url, created_at, updated_at;
    `;

    const result = await pool.query(
        query, 
        [google_id || null, name, email, avatar_url || null]
    );
    return result.rows[0];
};

const upsertGoogleUser = async ({
    google_id,
    name,
    email,
    avatar_url 
}) => {
    const query = `
        INSERT INTO users (google_id, name, email, avatar_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (email)
        DO UPDATE SET
            google_id = COALESCE(EXCLUDED.google_id, users.google_id),
            name = COALESCE(EXCLUDED.name, users.name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
            updated_at = CURRENT_TIMESTAMP
        RETURNING id, google_id, name, email, avatar_url, created_at, updated_at;
    `;
    const result = await pool.query(
        query,
        [google_id, name, email, avatar_url]
    );
    return result.rows[0];
};


export {
    findUserById,
    findUserByGoogleId,
    findUserByEmail,
    createUser,
    upsertGoogleUser
};