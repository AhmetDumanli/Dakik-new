package com.example.appointment_service.Dto;

import com.example.appointment_service.Entity.Appointment;

import java.time.LocalDateTime;

public class AppointmentResponse {
    private Long id;
    private Long bookedBy;
    private Long eventId;
    private Long eventOwnerId;
    private Appointment.AppointmentStatus status;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookedBy() {
        return bookedBy;
    }

    public void setBookedBy(Long bookedBy) {
        this.bookedBy = bookedBy;
    }

    public Long getEventId() {
        return eventId;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public Appointment.AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(Appointment.AppointmentStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getEventOwnerId() {
        return eventOwnerId;
    }

    public void setEventOwnerId(Long eventOwnerId) {
        this.eventOwnerId = eventOwnerId;
    }
}
