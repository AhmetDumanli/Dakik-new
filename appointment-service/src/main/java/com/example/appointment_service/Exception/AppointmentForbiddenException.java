package com.example.appointment_service.Exception;

public class AppointmentForbiddenException extends RuntimeException{
    public AppointmentForbiddenException(String message) {
        super(message);
    }
}
