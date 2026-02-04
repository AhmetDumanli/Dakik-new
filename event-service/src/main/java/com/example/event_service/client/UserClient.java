package com.example.event_service.client;

import com.example.event_service.Dto.UserDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service")
public interface UserClient {

    @GetMapping("/users/{id}")
    void getById(@PathVariable Long id);

    @GetMapping("/users/{id}/can-view")
    boolean canView(@PathVariable Long id, @RequestParam Long viewerId);
}

