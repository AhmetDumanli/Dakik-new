package com.example.user_service.Service;

import com.example.user_service.Dto.UserCreate;
import com.example.user_service.Dto.UserResponse;
import com.example.user_service.Entity.User;
import com.example.user_service.Exception.EmailAlreadyExistsException;
import com.example.user_service.Exception.PasswordAlreadyExistsException;
import com.example.user_service.Exception.UserNotFoundException;
import com.example.user_service.Repository.UserRepo;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepo userRepository;

    public UserService(UserRepo userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse create(UserCreate request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> { throw new EmailAlreadyExistsException(request.getEmail()); });
        userRepository.findByPassword(request.getPassword())
                .ifPresent(u -> { throw new PasswordAlreadyExistsException();});
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // şimdilik plain

        User saved = userRepository.save(user);
        return mapToResponse(saved);
    }

    public UserResponse getById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse dto = new UserResponse();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        return dto;
    }

}
