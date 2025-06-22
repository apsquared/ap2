# Deploying n8n to AWS EC2

This guide will help you deploy n8n to AWS EC2 in the simplest way possible.

## Prerequisites
- An AWS account with free tier credits
- Basic knowledge of AWS EC2

## Step 1: Launch an EC2 Instance
1. Go to AWS Console and navigate to EC2
2. Click "Launch Instance"
3. Choose "Ubuntu Server 22.04 LTS" as the AMI
4. Select "t2.micro" instance type (free tier eligible)
5. Configure Security Group:
   - Allow SSH (port 22) from your IP
   - Allow Custom TCP (port 5678) from anywhere (0.0.0.0/0)
6. Launch the instance and download your key pair (.pem file)

## Step 2: Connect to Your Instance
```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

Actual: 
`ssh -i "n8nkp.pem" ubuntu@ec2-3-80-122-90.compute-1.amazonaws.com`

## Step 3: Install n8n
1. Copy the setup script to your instance:
```bash
scp -i your-key.pem setup-n8n.sh ubuntu@your-ec2-public-ip:~/
```

2. Make the script executable and run it:
```bash
chmod +x setup-n8n.sh
./setup-n8n.sh
```

## Step 4: Access n8n
1. Open your browser and navigate to:
```
http://your-ec2-public-ip:5678
```

2. Complete the initial setup by creating your admin account

## Important Notes
- The t2.micro instance is suitable for testing and small workloads
- For production use, consider:
  - Using a larger instance type
  - Setting up a domain name
  - Configuring SSL/TLS
  - Setting up a database for persistent storage
  - Configuring regular backups

## Troubleshooting
- Check n8n status: `sudo systemctl status n8n`
- View logs: `sudo journalctl -u n8n`
- Restart n8n: `sudo systemctl restart n8n` 