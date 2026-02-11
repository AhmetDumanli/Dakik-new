package com.example.event_service.Service;

import com.example.event_service.Dto.EventCreate;
import com.example.event_service.Dto.EventResponse;
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

    public EventResponse createEvent(Long userId, EventCreate request) {
        try {
            userClient.getById(userId);
        } catch (FeignException.NotFound e) {
            throw new UserNotFoundException(userId);
        }

        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new EventException("End time cannot be before start time");
        }

        boolean exists = eventRepository
                .existsByUserIdAndStartTimeLessThanAndEndTimeGreaterThan(
                        userId,
                        request.getEndTime(),
                        request.getStartTime()
                );

        if (exists) {
            throw new EventException("Event time overlaps with another event");
        }

        Event event = new Event();
        event.setUserId(userId);
        event.setStartTime(request.getStartTime());
        event.setEndTime(request.getEndTime());
        event.setAvailable(true);
        event.setPublic(request.getIsPublic() != null ? request.getIsPublic() : true);
        event.setDescription(request.getDescription());

        Event saved = eventRepository.save(event);

        return mapToResponse(saved);
    }

    public List<EventResponse> getPublicEvents() {
        return eventRepository.findByIsPublicTrueAndAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByUser(Long userId, Long viewerId) {
        if (userId.equals(viewerId)) {
            return eventRepository.findByUserId(userId)
                    .stream()
                    .map(this::mapToResponse)
                    .collect(Collectors.toList());
        }

        try {
            boolean canView = userClient.canView(userId, viewerId);
            if (!canView) {
                throw new EventException("Cannot view this user's events. Send a friend request first.");
            }
        } catch (FeignException e) {
            throw new EventException("Error checking user visibility");
        }

        return eventRepository.findByUserIdAndIsPublicTrueAndAvailableTrue(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByUser(Long userId) {
        return eventRepository.findByUserId(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));
        return mapToResponse(event);
    }

    @Transactional
    public EventResponse lockEvent(Long id) {
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
    public EventResponse bookEvent(Long id) {
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
    public EventResponse unlockEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new EventNotFoundException(id));

        event.setLocked(false);
        event.setAvailable(true);
        eventRepository.save(event);
        return mapToResponse(event);
    }

    private EventResponse mapToResponse(Event event) {
        EventResponse response = new EventResponse();
        response.setId(event.getId());
        response.setUserId(event.getUserId());
        response.setStartTime(event.getStartTime());
        response.setEndTime(event.getEndTime());
        response.setAvailable(event.isAvailable());
        response.setPublic(event.isPublic());
        response.setDescription(event.getDescription());
        return response;
    }
}
