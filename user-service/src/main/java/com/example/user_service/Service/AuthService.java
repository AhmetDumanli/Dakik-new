package com.example.user_service.Service;

import com.example.user_service.Dto.AuthResponse;
import com.example.user_service.Dto.LoginRequest;
import com.example.user_service.Dto.UserCreate;
import com.example.user_service.Dto.UserResponse;
import com.example.user_service.Entity.User;
import com.example.user_service.Exception.EmailAlreadyExistsException;
import com.example.user_service.Exception.InvalidCredentialsException;
import com.example.user_service.Repository.UserRepo;
import com.example.user_service.Security.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepo userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepo userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(UserCreate request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> { throw new EmailAlreadyExistsException(request.getEmail()); });

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        User saved = userRepository.save(user);
        String token = jwtUtil.generateToken(saved.getId(), saved.getEmail(), saved.getName());

        return new AuthResponse(token, mapToResponse(saved));
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(InvalidCredentialsException::new);

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }

        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getName());
        return new AuthResponse(token, mapToResponse(user));
    }

    private UserResponse mapToResponse(User user) {
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
