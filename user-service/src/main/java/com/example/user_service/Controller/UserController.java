package com.example.user_service.Controller;

import com.example.user_service.Dto.ProfileUpdateRequest;
import com.example.user_service.Dto.UserResponse;
import com.example.user_service.Service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAll() {
        return userService.getAll();
    }

    @GetMapping("/{id}")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @GetMapping("/name/{name}")
    public UserResponse getByName(@PathVariable String name) {return userService.getByName(name);}

    @PutMapping("/me")
    public UserResponse updateMyProfile(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ProfileUpdateRequest request) {
        return userService.updateProfile(userId, request);
    }

    @GetMapping("/{id}/can-view")
    public boolean canView(@PathVariable Long id, @RequestParam Long viewerId) {
        return userService.canViewUser(id, viewerId);
    }
}
