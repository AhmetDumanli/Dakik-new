\c dakik_appointment;

CREATE TABLE IF NOT EXISTS appointment (
    id BIGSERIAL PRIMARY KEY,
    event_id BIGINT,
    booked_by BIGINT,
    created_at TIMESTAMP,
    status VARCHAR(20)
);

INSERT INTO appointment (event_id, booked_by, created_at, status) VALUES
    (4, 3, NOW(), 'BOOKED');
