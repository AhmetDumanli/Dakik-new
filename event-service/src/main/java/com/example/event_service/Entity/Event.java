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

    private boolean isPublic = true;

<<<<<<< Updated upstream
=======
    private String description;

    private int maxParticipants = 1;
    private int currentParticipants = 0;

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public int getMaxParticipants() {
        return maxParticipants;
    }

    public void setMaxParticipants(int maxParticipants) {
        this.maxParticipants = maxParticipants;
    }

    public int getCurrentParticipants() {
        return currentParticipants;
    }

    public void setCurrentParticipants(int currentParticipants) {
        this.currentParticipants = currentParticipants;
    }
>>>>>>> Stashed changes
}
