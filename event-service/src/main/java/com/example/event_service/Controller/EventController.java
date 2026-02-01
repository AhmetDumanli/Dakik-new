package com.example.event_service.Controller;

import com.example.event_service.Dto.EventCreate;
import com.example.event_service.Dto.EventResponse;
import com.example.event_service.Entity.Event;
import com.example.event_service.Repository.EventRepo;
import com.example.event_service.Service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // 1️⃣ Event oluştur
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(@Valid @RequestBody EventCreate request) {
        return eventService.createEvent(request);
    }

    // 2️⃣ Kullanıcıya ait event'leri getir
    @GetMapping("/user/{userId}")
    public List<EventResponse> getEventsByUser(@PathVariable Long userId) {
        return eventService.getEventsByUser(userId);}

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable Long id){
        return eventService.getEventById(id);
    }

    @PutMapping("/{id}/lock")
    public EventResponse lock(@PathVariable Long id) {
        return eventService.lockEvent(id);
    }

    @PutMapping("/{id}/book")
    public EventResponse book(@PathVariable Long id) {
        return eventService.bookEvent(id);
    }

    @PutMapping("/{id}/unlock")
    public void unlock(@PathVariable Long id) {
        eventService.unlockEvent(id);
    }
}