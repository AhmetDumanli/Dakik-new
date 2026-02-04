package com.example.user_service.Repository;

import com.example.user_service.Entity.Friendship;
import com.example.user_service.Entity.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendshipRepo extends JpaRepository<Friendship, Long> {

    @Query("SELECT CASE WHEN COUNT(f) > 0 THEN true ELSE false END FROM Friendship f " +
           "WHERE f.status = 'ACCEPTED' AND " +
           "((f.requesterId = :userId1 AND f.addresseeId = :userId2) OR " +
           " (f.requesterId = :userId2 AND f.addresseeId = :userId1))")
    boolean areFriends(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("SELECT f FROM Friendship f WHERE f.status = 'ACCEPTED' AND " +
           "(f.requesterId = :userId OR f.addresseeId = :userId)")
    List<Friendship> findAcceptedFriendships(@Param("userId") Long userId);

    List<Friendship> findByAddresseeIdAndStatus(Long addresseeId, FriendshipStatus status);

    List<Friendship> findByRequesterIdAndStatus(Long requesterId, FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE " +
           "((f.requesterId = :userId1 AND f.addresseeId = :userId2) OR " +
           " (f.requesterId = :userId2 AND f.addresseeId = :userId1))")
    Optional<Friendship> findExistingRequest(@Param("userId1") Long userId1, @Param("userId2") Long userId2);
}
