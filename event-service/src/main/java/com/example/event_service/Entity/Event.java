package com.example.event_service.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "events")
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // User Service'e referans
    private Long userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private boolean available = true;
    private boolean locked = false;

    @Column(nullable = false)
    private boolean isPublic = true;

    //getters
    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public boolean isAvailable() {
        return available;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public boolean isLocked() {
        return locked;
    }

    public boolean isPublic() {
        return isPublic;
    }

    //setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
