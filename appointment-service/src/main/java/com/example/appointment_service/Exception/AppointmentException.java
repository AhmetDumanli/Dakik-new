package com.example.appointment_service.Exception;

import com.example.appointment_service.Entity.Appointment;

public class AppointmentException extends RuntimeException {
    public AppointmentException(String message) {
        super(message);
    }
}
