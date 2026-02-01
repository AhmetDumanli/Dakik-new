package com.example.event_service.Exception;

public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(Long id){
        super("User not found with id:"+id);
    }
}
