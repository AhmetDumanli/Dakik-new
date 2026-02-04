package com.example.appointment_service.Controller;

import com.example.appointment_service.Dto.AppointmentCreate;
import com.example.appointment_service.Dto.AppointmentResponse;
import com.example.appointment_service.Service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AppointmentResponse create(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody @Valid AppointmentCreate request) {
        return service.create(userId, request);
    }

    @GetMapping("/my")
    public List<AppointmentResponse> getMyAppointments(@RequestHeader("X-User-Id") Long userId) {
        return service.getAppointments(userId);
    }

    @DeleteMapping("/{id}")
    public AppointmentResponse cancel(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable Long id) {
        return service.cancel(id, userId);
    }
}
