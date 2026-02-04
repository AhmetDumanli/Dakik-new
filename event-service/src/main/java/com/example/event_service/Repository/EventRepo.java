package com.example.event_service.Repository;
import com.example.event_service.Entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
public interface EventRepo extends JpaRepository<Event, Long> {

    List<Event> findByUserId(Long userId);


    boolean existsByUserIdAndStartTimeLessThanAndEndTimeGreaterThan(
            Long userId,
            LocalDateTime end,
            LocalDateTime start
    );

    List<Event> findByIsPublicTrueAndAvailableTrue();

    List<Event> findByUserIdAndIsPublicTrueAndAvailableTrue(Long userId);
}
