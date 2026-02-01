package com.example.appointment_service.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
@Entity
public class Appointment {

    @Id
    @GeneratedValue
    private Long id;

    private Long eventId;
    private Long bookedBy;

    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    public enum AppointmentStatus {
        PENDING,
        BOOKED,
        CANCELLED,
        FAILED
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setEventId(Long eventId) {
        this.eventId = eventId;
    }

    public void setBookedBy(Long bookedBy) {
        this.bookedBy = bookedBy;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public Long getEventId() {
        return eventId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public Long getBookedBy() {
        return bookedBy;
    }

    public AppointmentStatus getStatus() {
        return status;
    }
}
