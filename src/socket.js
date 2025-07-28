const socket = new WebSocket("ws://localhost:8080/ws/game");

socket.onopen = () => {
  console.log("WebSocket connected");
};
socket.onmessage = (msg) => {
  const data = JSON.parse(msg.data);
  console.log("Received message", data);

  if (data.type === "id") {
    console.log("Assigned ID from server:", data.id);
    socket.id = data.id; // store it for future use
  }
};
export default socket;
