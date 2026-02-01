package com.example.appointment_service.Exception;

import java.time.LocalDateTime;

public class ErrorResponse {

    private String message;
    private LocalDateTime timeStamp;

    public ErrorResponse(String message){
        this.message = message;
        this.timeStamp = LocalDateTime.now();

    }

    public String getMessage() {
        return message;
    }

    public LocalDateTime getTimeStamp() {
        return timeStamp;
    }
}

