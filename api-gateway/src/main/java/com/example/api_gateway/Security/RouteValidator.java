package com.example.api_gateway.Security;

import org.springframework.http.HttpMethod;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class RouteValidator {

    private static final List<String> OPEN_ENDPOINTS = List.of(
            "/auth/register",
            "/auth/login"
    );

    public boolean isOpenEndpoint(ServerHttpRequest request) {
        if (request.getMethod() == HttpMethod.OPTIONS) {
            return true;
        }
        String path = request.getURI().getPath();
        return OPEN_ENDPOINTS.stream().anyMatch(path::startsWith);
    }
}
