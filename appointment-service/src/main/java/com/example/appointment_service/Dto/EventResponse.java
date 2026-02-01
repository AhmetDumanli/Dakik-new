package com.example.appointment_service.Dto;

import java.time.LocalDateTime;

public class EventResponse {

    private Long id;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private boolean available;

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public boolean isAvailable() {
        return available;
    }



}
