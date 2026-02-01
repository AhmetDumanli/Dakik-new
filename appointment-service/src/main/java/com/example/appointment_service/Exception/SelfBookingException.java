package com.example.appointment_service.Exception;

public class SelfBookingException extends RuntimeException {

    public SelfBookingException() {
        super("You cannot book your own event");
    }
}
