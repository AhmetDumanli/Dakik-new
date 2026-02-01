package com.example.event_service.Exception;

public class EventNotFoundException extends RuntimeException{
    public EventNotFoundException(Long id){
        super("Could not find event with " + id);
    }

}
