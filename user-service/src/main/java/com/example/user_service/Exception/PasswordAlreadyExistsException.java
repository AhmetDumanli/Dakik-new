package com.example.user_service.Exception;

public class PasswordAlreadyExistsException extends RuntimeException{
    public PasswordAlreadyExistsException(){
        super("This password is already in use!");
    }
}
