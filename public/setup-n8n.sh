#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install n8n globally
sudo npm install n8n -g

# Create systemd service file
sudo tee /etc/systemd/system/n8n.service << EOF
[Unit]
Description=n8n workflow automation
After=network.target

[Service]
Type=simple
User=ubuntu
Environment=N8N_PORT=5678
Environment=N8N_PROTOCOL=http
Environment=N8N_HOST=0.0.0.0
Environment=N8N_SECURE_COOKIE=false
ExecStart=/usr/bin/n8n start
Restart=on-failure

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start n8n
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n

# Print status
echo "n8n installation complete!"
echo "Check status with: sudo systemctl status n8n"
echo "Access n8n at: http://YOUR_EC2_PUBLIC_IP:5678" 