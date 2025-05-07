let socket: WebSocket | null = null;
let reconnectTimer: number | null = null;
const RECONNECT_INTERVAL = 5000; // 5 seconds

export function setupWebsocketConnection() {
  connectWebSocket();
}

function connectWebSocket() {
  // Clear any existing reconnect timers
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  // Determine the WebSocket protocol based on the current page protocol
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  
  try {
    socket = new WebSocket(wsUrl);
    
    socket.onopen = () => {
      console.log("WebSocket connection established");
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        console.error("Error parsing WebSocket message", error);
      }
    };
    
    socket.onclose = () => {
      console.log("WebSocket connection closed, attempting to reconnect...");
      scheduleReconnect();
    };
    
    socket.onerror = (error) => {
      console.error("WebSocket error", error);
      socket?.close();
    };
  } catch (error) {
    console.error("Failed to connect to WebSocket", error);
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (!reconnectTimer) {
    reconnectTimer = window.setTimeout(() => {
      reconnectTimer = null;
      connectWebSocket();
    }, RECONNECT_INTERVAL);
  }
}

function handleWebSocketMessage(data: any) {
  const { type, payload } = data;
  
  switch (type) {
    case 'VEHICLE_UPDATE':
      // Handle vehicle updates (e.g. new vehicle at gate, vehicle moved to bay)
      console.log("Vehicle update received", payload);
      // Update relevant UI components or invalidate queries
      break;
      
    case 'WEIGHBRIDGE_UPDATE':
      // Handle weighbridge updates
      console.log("Weighbridge update received", payload);
      // Update weight displays or invalidate queries
      break;
      
    case 'YARD_UPDATE':
      // Handle yard allocation updates
      console.log("Yard update received", payload);
      // Update yard map or invalidate queries
      break;
      
    case 'BAY_UPDATE':
      // Handle bay assignment updates
      console.log("Bay update received", payload);
      // Update bay displays or invalidate queries
      break;
      
    case 'SYSTEM_ALERT':
      // Handle system alerts or notifications
      console.log("System alert received", payload);
      // Show toast notifications or update alerts feed
      break;
      
    default:
      console.log("Unknown message type received", type, payload);
  }
}

export function sendMessage(type: string, payload: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    console.error("WebSocket is not connected, message not sent", { type, payload });
  }
}

// Close the connection when the window/tab is closed
window.addEventListener('beforeunload', () => {
  if (socket) {
    socket.close();
  }
});
