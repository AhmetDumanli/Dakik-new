package com.example.user_service.Dto;

public class UserResponse {
    private Long Id;
    private String name;
    private String email;

    //getters
    public Long getId() {
        return Id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }


    //setters
    public void setId(Long id) {
        Id = id;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
