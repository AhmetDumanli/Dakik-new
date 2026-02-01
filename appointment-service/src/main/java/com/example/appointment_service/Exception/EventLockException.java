package com.example.appointment_service.Exception;

public class EventLockException extends RuntimeException{

    public EventLockException(String message) {
        super(message);
    }
}
