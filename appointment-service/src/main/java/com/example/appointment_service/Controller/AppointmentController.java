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
    public AppointmentResponse create(@RequestBody @Valid AppointmentCreate request) {
        return service.create(request);
    }

    @GetMapping("/user/{bookedBy}")
    public List<AppointmentResponse> get(@PathVariable Long bookedBy) {
        return service.getAppointments(bookedBy);
    }

    @DeleteMapping("/{id}/user/{bookedBy}")
    public AppointmentResponse cancel(@PathVariable Long id, @PathVariable Long bookedBy) {
        return service.cancel(id, bookedBy);
    }
}

