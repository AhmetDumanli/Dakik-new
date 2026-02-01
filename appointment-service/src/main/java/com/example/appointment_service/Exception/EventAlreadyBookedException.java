package com.example.appointment_service.Exception;

public class EventAlreadyBookedException extends RuntimeException{

    public EventAlreadyBookedException(Long eventId) {
        super("Event with id " + eventId + " is already booked");
    }
}
