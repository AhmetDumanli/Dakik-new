package com.example.user_service.Service;

import com.example.user_service.Dto.FriendshipResponse;
import com.example.user_service.Entity.Friendship;
import com.example.user_service.Entity.FriendshipStatus;
import com.example.user_service.Exception.FriendshipAlreadyExistsException;
import com.example.user_service.Exception.FriendshipException;
import com.example.user_service.Exception.FriendshipNotFoundException;
import com.example.user_service.Exception.UserNotFoundException;
import com.example.user_service.Repository.FriendshipRepo;
import com.example.user_service.Repository.UserRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FriendshipService {

    private final FriendshipRepo friendshipRepository;
    private final UserRepo userRepository;
    private final UserService userService;

    public FriendshipService(FriendshipRepo friendshipRepository, UserRepo userRepository, UserService userService) {
        this.friendshipRepository = friendshipRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public FriendshipResponse sendRequest(Long requesterId, Long addresseeId) {
        if (requesterId.equals(addresseeId)) {
            throw new FriendshipException("Cannot send friend request to yourself");
        }

        userRepository.findById(addresseeId)
                .orElseThrow(() -> new UserNotFoundException(addresseeId));

        Optional<Friendship> existing = friendshipRepository.findExistingRequest(requesterId, addresseeId);
        if (existing.isPresent()) {
            throw new FriendshipAlreadyExistsException();
        }

        Friendship friendship = new Friendship();
        friendship.setRequesterId(requesterId);
        friendship.setAddresseeId(addresseeId);
        friendship.setStatus(FriendshipStatus.PENDING);

        Friendship saved = friendshipRepository.save(friendship);
        return mapToResponse(saved);
    }

    public FriendshipResponse acceptRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipNotFoundException(friendshipId));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new FriendshipException("Only the addressee can accept this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new FriendshipException("Request is not pending");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        Friendship updated = friendshipRepository.save(friendship);
        return mapToResponse(updated);
    }

    public FriendshipResponse rejectRequest(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipNotFoundException(friendshipId));

        if (!friendship.getAddresseeId().equals(userId)) {
            throw new FriendshipException("Only the addressee can reject this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new FriendshipException("Request is not pending");
        }

        friendship.setStatus(FriendshipStatus.REJECTED);
        Friendship updated = friendshipRepository.save(friendship);
        return mapToResponse(updated);
    }

    public List<FriendshipResponse> getMyFriends(Long userId) {
        return friendshipRepository.findAcceptedFriendships(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<FriendshipResponse> getPendingRequests(Long userId) {
        return friendshipRepository.findByAddresseeIdAndStatus(userId, FriendshipStatus.PENDING)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public void removeFriendship(Long friendshipId, Long userId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new FriendshipNotFoundException(friendshipId));

        if (!friendship.getRequesterId().equals(userId) &&
            !friendship.getAddresseeId().equals(userId)) {
            throw new FriendshipException("You are not part of this friendship");
        }

        friendshipRepository.delete(friendship);
    }

    private FriendshipResponse mapToResponse(Friendship friendship) {
        FriendshipResponse response = new FriendshipResponse();
        response.setId(friendship.getId());
        response.setRequester(userService.getById(friendship.getRequesterId()));
        response.setAddressee(userService.getById(friendship.getAddresseeId()));
        response.setStatus(friendship.getStatus());
        response.setCreatedAt(friendship.getCreatedAt());
        return response;
    }
}
