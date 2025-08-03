package com.example.pokeMeetService.models;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String sessionId;
    private double x;
    private double y;

    public User(String sessionId, double x, double y) {
        this.sessionId = sessionId;
        this.x = x;
        this.y = y;
    }
}
