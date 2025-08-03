import { useDispatch } from "react-redux";
import { updatePlayer } from "./store";
const socket = new WebSocket("ws://localhost:8080/ws/game");

export const initializeSocket = (dispatch) => {
  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    console.log("Received message", data);

    if (data.type === "move") {
      dispatch(updatePlayer({ id: data.id, x: data.x, y: data.y }));
    }
    if (data.type === "id") {
      console.log("Assigned ID from server:", data.id);
      socket.id = data.id; // store it for future use
      socket.send(
        JSON.stringify({
          type: "join",
          id: socket.id,
          x: 80,
          y: 80,
        })
      );
    }
  };

  return socket;

};
