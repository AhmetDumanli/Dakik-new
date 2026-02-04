package com.example.user_service.Dto;

public class UserResponse {
    private Long Id;
    private String name;
    private String email;
    private String bio;
    private String profilePhotoUrl;
    private boolean isPublic;

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

    public String getBio() {
        return bio;
    }

    public String getProfilePhotoUrl() {
        return profilePhotoUrl;
    }

    public boolean isPublic() {
        return isPublic;
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

    public void setBio(String bio) {
        this.bio = bio;
    }

    public void setProfilePhotoUrl(String profilePhotoUrl) {
        this.profilePhotoUrl = profilePhotoUrl;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
}
