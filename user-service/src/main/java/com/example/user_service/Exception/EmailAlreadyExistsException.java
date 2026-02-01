package com.example.user_service.Exception;

public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException(String email) {
        super("This email is already registered: " + email);
    }
}
