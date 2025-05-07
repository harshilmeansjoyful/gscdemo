import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";
import "./index.css";
import { setupWebsocketConnection } from "./lib/websocket";

// Setup websocket connection for real-time updates
setupWebsocketConnection();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
