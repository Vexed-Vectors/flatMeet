import { configureStore, createSlice } from "@reduxjs/toolkit";

// Create a slice for players
const playersSlice = createSlice({
  name: "players",
  initialState: {},
  reducers: {
    updatePlayer(state, action) {
      const { id, x, y } = action.payload;
      state[id] = { x, y };
    },
  },
});

// Export the action
export const { updatePlayer } = playersSlice.actions;

// Create and export the store
const store = configureStore({
  reducer: {
    players: playersSlice.reducer,
  },
});

export default store;
