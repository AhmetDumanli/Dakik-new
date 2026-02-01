package com.example.event_service.Exception;

public class EventAlreadyLockedException extends RuntimeException{

    public EventAlreadyLockedException(Long id) {
        super("Event already locked" + id);
    }


}
