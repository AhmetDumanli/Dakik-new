package com.example.user_service.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(UserNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handle(UserNotFoundException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handle(EmailAlreadyExistsException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public String handle(InvalidCredentialsException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(FriendshipNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handle(FriendshipNotFoundException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(FriendshipException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String handle(FriendshipException ex) {
        return ex.getMessage();
    }

    @ExceptionHandler(FriendshipAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handle(FriendshipAlreadyExistsException ex) {
        return ex.getMessage();
    }
}
