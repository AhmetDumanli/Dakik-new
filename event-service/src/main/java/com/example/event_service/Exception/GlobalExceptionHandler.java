package com.example.event_service.Exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // Business hataları
    @ExceptionHandler(EventException.class)
    public ResponseEntity<ErrorResponse> handleEventException(EventException ex) {
        return new ResponseEntity<>(
                new ErrorResponse(ex.getMessage()),
                HttpStatus.BAD_REQUEST
        );
    }
    @ExceptionHandler(UserNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleUserException(UserNotFoundException ex){
        return new ResponseEntity<>(new ErrorResponse(ex.getMessage()),HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(EventNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(EventAlreadyLockedException.class)
    public ResponseEntity<ErrorResponse> handleLocked(EventAlreadyLockedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage()));
    }

    @ExceptionHandler(EventAlreadyBookedException.class)
    public ResponseEntity<ErrorResponse> handleBooked(EventAlreadyBookedException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new ErrorResponse(ex.getMessage()));
    }

    // Beklenmeyen hatalar (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneralException(Exception ex) {
        return new ResponseEntity<>(
                new ErrorResponse("Unexpected error occurred"),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
    //
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex) {

        String message = ex.getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        return new ResponseEntity<>(
                new ErrorResponse(message),
                HttpStatus.BAD_REQUEST
        );
    }
}
