package com.example.event_service.Controller;

import com.example.event_service.Dto.EventCreate;
import com.example.event_service.Dto.EventResponse;
import com.example.event_service.Service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public List<EventResponse> getPublicEvents() {
        return eventService.getPublicEvents();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody EventCreate request) {
        return eventService.createEvent(userId, request);
    }

    @GetMapping("/my")
    public List<EventResponse> getMyEvents(@RequestHeader("X-User-Id") Long userId) {
        return eventService.getEventsByUser(userId);
    }

    @GetMapping("/user/{userId}")
    public List<EventResponse> getEventsByUser(
            @PathVariable Long userId,
            @RequestHeader("X-User-Id") Long viewerId) {
        return eventService.getEventsByUser(userId, viewerId);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable Long id) {
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

    @PutMapping("/{id}/unbook")
    public EventResponse unbook(@PathVariable Long id) {
        return eventService.unbookEvent(id);
    }
}
