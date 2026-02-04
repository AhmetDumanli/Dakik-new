package com.example.user_service.Exception;

public class FriendshipNotFoundException extends RuntimeException {
    public FriendshipNotFoundException(Long id) {
        super("Friendship not found with id: " + id);
    }
}
