package com.example.appointment_service.Exception;

public class AppointmentNotFoundException extends RuntimeException{
    public AppointmentNotFoundException(Long id){
        super("Appointment not found with id " + id);
    }
}
