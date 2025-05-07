#!/bin/bash

echo "Stopping existing Node server..."

# Find the process running on port 5000 and kill it
PID=$(lsof -t -i:5000)

if [ -n "$PID" ]; then
  if kill -9 $PID; then
    echo "Stopped server running on port 5000."
  else
    echo "Failed to stop the server with PID $PID."
    exit 1
  fi
else
  echo "No server running on port 5000."
fi