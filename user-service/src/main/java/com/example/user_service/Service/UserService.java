package com.example.user_service.Service;

import com.example.user_service.Dto.ProfileUpdateRequest;
import com.example.user_service.Dto.UserResponse;
import com.example.user_service.Entity.User;
import com.example.user_service.Exception.UserNotFoundException;
import com.example.user_service.Repository.FriendshipRepo;
import com.example.user_service.Repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepo userRepository;
    private final FriendshipRepo friendshipRepository;

    public UserService(UserRepo userRepository, FriendshipRepo friendshipRepository) {
        this.userRepository = userRepository;
        this.friendshipRepository = friendshipRepository;
    }

    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return mapToResponse(user);
    }

    public UserResponse getByName(String name) {
        User user = userRepository.findByName(name);
        if (user == null) {
            throw new UserNotFoundException(name);
        }
        return mapToResponse(user);
    }

    public UserResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getBio() != null) user.setBio(request.getBio());
        if (request.getProfilePhotoUrl() != null) user.setProfilePhotoUrl(request.getProfilePhotoUrl());
        if (request.getIsPublic() != null) user.setPublic(request.getIsPublic());

        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    public List<UserResponse> searchByName(String name) {
        return userRepository.findByNameContainingIgnoreCase(name).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public boolean canViewUser(Long userId, Long viewerId) {
        if (userId.equals(viewerId)) return true;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        if (user.isPublic()) return true;

        return friendshipRepository.areFriends(userId, viewerId);
    }

    UserResponse mapToResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setProfilePhotoUrl(user.getProfilePhotoUrl());
        dto.setPublic(user.isPublic());
        return dto;
    }
}
