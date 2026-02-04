package com.example.user_service.Dto;

import com.example.user_service.Entity.FriendshipStatus;
import java.time.LocalDateTime;

public class FriendshipResponse {
    private Long id;
    private UserResponse requester;
    private UserResponse addressee;
    private FriendshipStatus status;
    private LocalDateTime createdAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserResponse getRequester() {
        return requester;
    }

    public void setRequester(UserResponse requester) {
        this.requester = requester;
    }

    public UserResponse getAddressee() {
        return addressee;
    }

    public void setAddressee(UserResponse addressee) {
        this.addressee = addressee;
    }

    public FriendshipStatus getStatus() {
        return status;
    }

    public void setStatus(FriendshipStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
