package com.example.appointment_service.Client;

import com.example.appointment_service.Dto.EventResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;

@FeignClient(name = "event-service")
public interface EventClient {

    @GetMapping("/events/{id}")
    EventResponse getById(@PathVariable Long id);

    @PutMapping("/events/{id}/lock")
    EventResponse lock(@PathVariable Long id);

    @PutMapping("/events/{id}/book")
    EventResponse book(@PathVariable Long id);

    @PutMapping("/events/{id}/unlock")
    void unlock(@PathVariable Long id);
}

