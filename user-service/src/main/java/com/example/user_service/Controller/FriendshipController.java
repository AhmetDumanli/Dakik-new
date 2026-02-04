package com.example.user_service.Controller;

import com.example.user_service.Dto.FriendshipResponse;
import com.example.user_service.Service.FriendshipService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friendships")
public class FriendshipController {

    private final FriendshipService friendshipService;

    public FriendshipController(FriendshipService friendshipService) {
        this.friendshipService = friendshipService;
    }

    @PostMapping("/request/{addresseeId}")
    @ResponseStatus(HttpStatus.CREATED)
    public FriendshipResponse sendRequest(
            @RequestHeader("X-User-Id") Long requesterId,
            @PathVariable Long addresseeId) {
        return friendshipService.sendRequest(requesterId, addresseeId);
    }

    @PutMapping("/{id}/accept")
    public FriendshipResponse accept(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return friendshipService.acceptRequest(id, userId);
    }

    @PutMapping("/{id}/reject")
    public FriendshipResponse reject(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        return friendshipService.rejectRequest(id, userId);
    }

    @GetMapping
    public List<FriendshipResponse> getMyFriends(
            @RequestHeader("X-User-Id") Long userId) {
        return friendshipService.getMyFriends(userId);
    }

    @GetMapping("/pending")
    public List<FriendshipResponse> getPendingRequests(
            @RequestHeader("X-User-Id") Long userId) {
        return friendshipService.getPendingRequests(userId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFriendship(
            @PathVariable Long id,
            @RequestHeader("X-User-Id") Long userId) {
        friendshipService.removeFriendship(id, userId);
    }
}
