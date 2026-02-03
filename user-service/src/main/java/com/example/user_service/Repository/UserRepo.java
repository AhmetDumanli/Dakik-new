package com.example.user_service.Repository;
import com.example.user_service.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepo extends JpaRepository<User,Long>{
    Optional<User> findByEmail(String email);

    Optional<User> findByPassword(String password);
}
