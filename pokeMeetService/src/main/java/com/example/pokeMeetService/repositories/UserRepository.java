package com.example.pokeMeetService.repositories;

import com.example.pokeMeetService.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;


public interface UserRepository extends MongoRepository<User, String> {
    User findBySessionId(String sessionId);
    void deleteBySessionId(String sessionId);
}
