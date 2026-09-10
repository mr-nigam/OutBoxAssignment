export const EMAIL_JOB_STATUS = Object.freeze({
    SCHEDULED: 'scheduled',
    PROCESSING: 'processing',
    SENT: 'sent',
    FAILED: 'failed'
});

export const STATUS_LIST = Object.values(EMAIL_JOB_STATUS);

export default EMAIL_JOB_STATUS;
