\c dakik_event;

CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    available BOOLEAN DEFAULT true,
    locked BOOLEAN DEFAULT false
);

INSERT INTO events (user_id, start_time, end_time, available, locked) VALUES
    (1, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 1 hour', true, false),
    (1, NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 1 hour', true, false),
    (2, NOW() + INTERVAL '1 day', NOW() + INTERVAL '1 day 30 minutes', true, false),
    (2, NOW() + INTERVAL '3 days', NOW() + INTERVAL '3 days 2 hours', false, false);
