package com.example.event_service.Exception;

public class EventAlreadyBookedException extends RuntimeException {

    public EventAlreadyBookedException(Long id){
        super("Event already booked" + id );
    }

}
