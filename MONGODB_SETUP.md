# MongoDB Setup for Local Development

This document explains how to set up MongoDB for local development after the registration fix.

## Option 1: Using Docker (Recommended)

The easiest way to run MongoDB locally is using Docker:

```bash
# Start MongoDB container
docker run -d --name mongodb -p 27017:27017 mongo:7

# Check if container is running
docker ps | grep mongodb

# Stop MongoDB (when done)
docker stop mongodb

# Remove container (when no longer needed)
docker rm mongodb
```

## Option 2: Install MongoDB Locally

For Ubuntu/Debian systems:
```bash
# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod
```

## Environment Setup

Make sure you have a `.env` file in the `backend` directory with:

```
PORT=5001
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

## Verifying the Setup

1. Start MongoDB (using one of the methods above)
2. Start the backend server: `cd backend && npm run dev`
3. You should see both messages:
   - "Server running on port 5001"
   - "MongoDB connected successfully"

If you see "MongoDB connection error" but the server continues running, that means MongoDB is not accessible. Check that MongoDB is running and accessible on port 27017.