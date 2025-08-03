package com.example.pokeMeetService.websocket;

import com.example.pokeMeetService.models.User;
import com.example.pokeMeetService.repositories.UserRepository;
import com.example.pokeMeetService.services.UserService;
import lombok.NoArgsConstructor;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Component

public class WebSocketHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    private final UserService userService;
    private final UserRepository userRepository;
    @Autowired
    public WebSocketHandler(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String id = UUID.randomUUID().toString();

        session.getAttributes().put("id", id); // store in session
        sessions.put(session.getId(),session);
        JSONObject msg = new JSONObject();
        msg.put("type", "id");
        msg.put("id", session.getId());

        broadcastToSession(session, msg);
        System.out.println("MESSAGE BROADCASTED TO SERVER: " + msg.toString());


//        session.sendMessage(new TextMessage(new JSONObject()
//                .put("type", "id")
//                .put("id", id)
//                .toString()));
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        broadcast(message.getPayload());
//        System.out.println(message.getPayload() + "\n" + "SOCKET ID IS: "+session.getId());
        JSONObject data = new JSONObject(message.getPayload());
        String type = data.getString("type");
        if (type.equals("join")) {
            double x = data.getDouble("x");
            double y = data.getDouble("y");

            userService.createUser(session.getId(), x, y);
            List<User> allUsers = userRepository.findAll();
            for (User user : allUsers){
                JSONObject msg = new JSONObject();
                msg.put("type", "move");
                msg.put("id", user.getSessionId());
                msg.put("x", user.getX());
                msg.put("y", user.getY());
                broadcastToSession(session,msg);
            }



        } else if (type.equals("move")) {
            double x = data.getDouble("x");
            double y = data.getDouble("y");
            userService.updatePosition(session.getId(), x, y);

            // Broadcast move to others
            for (WebSocketSession s : sessions.values()) {
                if (!s.getId().equals(session.getId()) && s.isOpen()) {
                    s.sendMessage(new TextMessage(data.toString()));
                }
            }
        }


    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        userService.deleteUser(session.getId());
        broadcast("{\"type\": \"leave\", \"id\": \"" + session.getId() + "\"}");
    }

    private void broadcast(String message) {
        for (WebSocketSession s : sessions.values()) {
            try {
                s.sendMessage(new TextMessage(message));
            } catch (Exception ignored) {}
        }
    }
    private void broadcastToSession(WebSocketSession session, JSONObject jsonObject) throws Exception {
        if (session.isOpen()) {
            session.sendMessage(new TextMessage(jsonObject.toString()));
        }
    }
    public void fetchUsersCoordinates(){

    }
}
