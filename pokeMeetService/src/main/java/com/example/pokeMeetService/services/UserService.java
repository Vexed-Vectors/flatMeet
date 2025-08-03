package com.example.pokeMeetService.services;

import com.example.pokeMeetService.models.User;
import com.example.pokeMeetService.repositories.UserRepository;
import lombok.NoArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@NoArgsConstructor
@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public void createUser(String sessionId, double x, double y) {
        User user = new User(sessionId, x, y);
        userRepository.save(user);
        System.out.println("USER SAVED WITH SESSION ID: " + sessionId);
        // when we create a new user they must also be aware of the positions of all other users
    }

    public void updatePosition(String sessionId, double x, double y) {
        User user = userRepository.findBySessionId(sessionId);
        if (user != null) {
            user.setX(x);
            user.setY(y);
            userRepository.save(user);
        }
    }

    public void deleteUser(String sessionId) {
        userRepository.deleteBySessionId(sessionId);
    }

    public User getUser(String sessionId) {
        return userRepository.findBySessionId(sessionId);
    }
}
