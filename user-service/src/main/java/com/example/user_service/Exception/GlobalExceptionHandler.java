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
    public String handle(EmailAlreadyExistsException ex) {return ex.getMessage();}

    @ExceptionHandler(PasswordAlreadyExistsException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public String handle(PasswordAlreadyExistsException ex) {
        return ex.getMessage();
    }
}
