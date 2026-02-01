package com.example.user_service.Controller;

import com.example.user_service.Dto.UserCreate;
import com.example.user_service.Dto.UserResponse;
import com.example.user_service.Service.UserService;
import jakarta.validation.Valid;
import org.hibernate.cfg.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse create(@Valid @RequestBody UserCreate request) {
        return userService.create(request);
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id){
        return userService.getById(id);
    }
}
