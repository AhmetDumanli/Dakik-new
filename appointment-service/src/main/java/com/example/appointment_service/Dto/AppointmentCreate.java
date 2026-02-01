package com.example.appointment_service.Dto;

import jakarta.validation.constraints.NotNull;

public class AppointmentCreate {

    @NotNull
    private Long eventId;

    @NotNull
    private Long bookedBy;

    public Long getEventId() {
        return eventId;
    }

    public Long getBookedBy() {
        return bookedBy;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public void setBookedBy(Long bookedBy) {
        this.bookedBy = bookedBy;
    }
}
