#!/bin/bash
echo "Installing Node.js and npm..."

# Add the NodeSource repository for Node.js 20.x
curl -sL https://rpm.nodesource.com/setup_20.x | sudo bash -



# Install Node.js, allowing yum to resolve any conflicts automatically
sudo yum install -y nodejs --allowerasing

echo "Node.js and npm installation complete."