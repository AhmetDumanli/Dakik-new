package com.example.appointment_service.Dto;

import jakarta.validation.constraints.NotNull;

public class AppointmentCreate {

    @NotNull
    private Long eventId;

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }
}
