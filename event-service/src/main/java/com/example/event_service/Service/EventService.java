package com.example.event_service.Service;

import com.example.event_service.Dto.EventCreate;
import com.example.event_service.Dto.EventResponse;
import com.example.event_service.Dto.UserDto;
import com.example.event_service.Entity.Event;
import com.example.event_service.Exception.*;
import com.example.event_service.Repository.EventRepo;
import com.example.event_service.client.UserClient;
import feign.FeignException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventService {

    private final EventRepo eventRepository;
    private final UserClient userClient;

    public EventService(EventRepo eventRepository, UserClient userClient) {
        this.eventRepository = eventRepository;
        this.userClient = userClient;
    }

    // 1️⃣ Create Event
    public EventResponse createEvent(EventCreate request) {
        try{
            userClient.getById(request.getUserId());
        }

        catch(FeignException.NotFound e){
            throw new UserNotFoundException(request.getUserId());
        }
        // ❶ Mantıksal zaman kontrolü
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new EventException("End time cannot be before start time");
        }

        // ❷ Zaman çakışması kontrolü
        boolean exists = eventRepository
                .existsByUserIdAndStartTimeLessThanAndEndTimeGreaterThan(
                        request.getUserId(),
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (exists) {
            throw new EventException("Event time overlaps with another event");
        }

        // ❸ Entity oluştur
        Event event = new Event();
        event.setUserId(request.getUserId());
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAvailable(true);

        Event saved = eventRepository.save(event);

        return mapToResponse(saved);
    }

    // 2️⃣ List Events by User
    public List<EventResponse> getEventsByUser(Long userId) {
        return eventRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id){
        Event event = eventRepository.findById(id).orElseThrow(() -> new EventNotFoundException(id));
        EventResponse response = mapToResponse(event);
        return response;
    }

    @Transactional
    public EventResponse lockEvent(Long id){
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        if (!event.isAvailable()) {
            throw new EventAlreadyBookedException(id);
        }
        if (event.isLocked()) {
            throw new EventAlreadyLockedException(id);
        }

        event.setLocked(true);
        eventRepository.save(event);
        return mapToResponse(event);

    }
    @Transactional
    public EventResponse bookEvent(Long id){
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        if (!event.isAvailable()) {
            throw new EventAlreadyBookedException(id);
        }

        event.setAvailable(false);
        eventRepository.save(event);
        return mapToResponse(event);
    }
    @Transactional
    public EventResponse unlockEvent(Long id){
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        event.setLocked(false);
        event.setAvailable(true);
        eventRepository.save(event);
        return mapToResponse(event);
    }

    // 3️⃣ Mapper
    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setUserId(event.getUserId());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setAvailable(event.isAvailable());
        return response;
    }
}
