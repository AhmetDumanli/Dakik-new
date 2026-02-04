package com.example.user_service.Exception;

public class FriendshipAlreadyExistsException extends RuntimeException {
    public FriendshipAlreadyExistsException() {
        super("Friendship request already exists");
    }
}
