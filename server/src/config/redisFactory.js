import Redis from "ioredis";


const createRedisConnection = ({
    host,
    port,
    password = undefined,
    db = 0,
    name = "Redis",
    maxRetriesPerRequest = 3,
}) => {

    const redis = new Redis({
        host,
        port: Number(port),
        password: password || undefined,
        db: Number(db),

        maxRetriesPerRequest,

        // Let ioredis wait until Redis is ready
        enableReadyCheck: true,

        // Retry connection with exponential-ish backoff
        retryStrategy: (times) => {
            return Math.min(times * 100, 3000);
        },

        // Reconnect when Redis reports a READONLY error
        reconnectOnError: (err) => {

            console.error(
                `❌ ${name} Reconnect Error:`,
                err.message
            );

            if (err.message.includes("READONLY")) {
                return 2;
            }

            return false;
        },
    });


    redis.on("connect", () => {
        console.log(`🔌 ${name} Connecting...`);
    });


    redis.on("ready", () => {
        console.log(`🚀 ${name} Ready`);
    });


    redis.on("error", (err) => {
        console.error(
            `❌ ${name} Error:`,
            err.message
        );
    });


    redis.on("close", () => {
        console.warn(
            `⚠️ ${name} Connection Closed`
        );
    });


    redis.on("reconnecting", (delay) => {
        console.warn(
            `🔄 ${name} Reconnecting in ${delay}ms...`
        );
    });


    return redis;
};


export default createRedisConnection;
