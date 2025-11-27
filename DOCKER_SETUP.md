# 🐳 Docker Setup Guide - Auto-Start on Boot

This guide will help you set up your Study Agent application to run automatically when your computer starts using Docker.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose installed (comes with Docker Desktop)
- Your `.env.local` file configured

## Step 1: Prepare Your Environment File

Create a `.env` file (NOT `.env.local`) in the project root for Docker:

```bash
cp .env.local .env
```

Make sure it contains:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

## Step 2: Build and Test Docker Container

```bash
# Build the Docker image
docker-compose build

# Start the container
docker-compose up -d

# Check if it's running
docker-compose ps

# View logs
docker-compose logs -f

# Test the application
open http://localhost:3000
```

## Step 3: Configure Auto-Start

Choose the method for your operating system:

---

## 🪟 Windows Setup

### Method 1: Docker Desktop Settings (Easiest)

1. Open Docker Desktop
2. Go to **Settings** → **General**
3. Check ✅ **Start Docker Desktop when you log in**
4. In your project, set restart policy to `always` (already set in docker-compose.yml)

### Method 2: Task Scheduler (More Control)

1. Create `start-study-agent.bat` in your project root:

```batch
@echo off
cd /d C:\path\to\your\study-agent
docker-compose up -d
```

2. Open Task Scheduler (Win + R, type `taskschd.msc`)
3. Click **Create Basic Task**
4. Name: "Study Agent Startup"
5. Trigger: **When the computer starts**
6. Action: **Start a program**
7. Program: `C:\path\to\your\study-agent\start-study-agent.bat`
8. Check ✅ **Run with highest privileges**

### Method 3: Windows Service (Advanced)

Using NSSM (Non-Sucking Service Manager):

```powershell
# Download NSSM from https://nssm.cc/download
# Install as administrator

nssm install StudyAgent "C:\Program Files\Docker\Docker\resources\bin\docker-compose.exe"
nssm set StudyAgent AppDirectory "C:\path\to\your\study-agent"
nssm set StudyAgent AppParameters "up -d"
nssm start StudyAgent
```

---

## 🍎 macOS Setup

### Method 1: Docker Desktop Settings (Easiest)

1. Open Docker Desktop
2. Go to **Preferences** → **General**
3. Check ✅ **Start Docker Desktop when you log in**
4. The restart policy in docker-compose.yml will handle the rest

### Method 2: LaunchAgent (More Control)

1. Create the LaunchAgent file:

```bash
nano ~/Library/LaunchAgents/com.studyagent.startup.plist
```

2. Paste this content (replace YOUR_USERNAME and path):

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.studyagent.startup</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/docker-compose</string>
        <string>-f</string>
        <string>/Users/YOUR_USERNAME/path/to/study-agent/docker-compose.yml</string>
        <string>up</string>
        <string>-d</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>WorkingDirectory</key>
    <string>/Users/YOUR_USERNAME/path/to/study-agent</string>
    <key>StandardOutPath</key>
    <string>/tmp/studyagent.out.log</string>
    <key>StandardErrorPath</key>
    <string>/tmp/studyagent.err.log</string>
</dict>
</plist>
```

3. Load the LaunchAgent:

```bash
launchctl load ~/Library/LaunchAgents/com.studyagent.startup.plist
```

4. Verify it's loaded:

```bash
launchctl list | grep studyagent
```

**To unload:**
```bash
launchctl unload ~/Library/LaunchAgents/com.studyagent.startup.plist
```

---

## 🐧 Linux Setup

### Method 1: Docker Settings + Systemd

1. Enable Docker to start on boot:

```bash
sudo systemctl enable docker
```

2. Create systemd service:

```bash
sudo nano /etc/systemd/system/study-agent.service
```

3. Paste this content:

```ini
[Unit]
Description=Study Agent Docker Container
Requires=docker.service
After=docker.service network-online.target
Wants=network-online.target

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/path/to/your/study-agent
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
TimeoutStartSec=0
User=YOUR_USERNAME
Group=YOUR_USERNAME

[Install]
WantedBy=multi-user.target
```

4. Enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable study-agent.service
sudo systemctl start study-agent.service
```

5. Check status:

```bash
sudo systemctl status study-agent.service
```

**Useful commands:**
```bash
# View logs
sudo journalctl -u study-agent.service -f

# Restart service
sudo systemctl restart study-agent.service

# Stop service
sudo systemctl stop study-agent.service

# Disable auto-start
sudo systemctl disable study-agent.service
```

---

## 🔧 Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# View logs
docker-compose logs -f study-agent

# Restart container
docker-compose restart

# Stop container
docker-compose stop

# Start container
docker-compose start

# Rebuild and restart
docker-compose up -d --build

# Stop and remove container
docker-compose down

# Remove container and volumes
docker-compose down -v

# Check container health
docker inspect study-agent-app | grep -A 10 Health
```

## 🧪 Testing Auto-Start

1. Start your container:
```bash
docker-compose up -d
```

2. Verify it's running:
```bash
docker ps
curl http://localhost:3000/api/health
```

3. Restart your computer

4. After boot, check if container is running:
```bash
docker ps
```

5. Access the application:
```
http://localhost:3000
```

## 🐛 Troubleshooting

### Container won't start after reboot

**Check Docker is running:**
```bash
docker ps
# If error, start Docker Desktop manually
```

**Check container logs:**
```bash
docker-compose logs study-agent
```

### Port 3000 already in use

**Find what's using the port:**
```bash
# Windows
netstat -ano | findstr :3000

# macOS/Linux
lsof -i :3000
```

**Change port in docker-compose.yml:**
```yaml
ports:
  - "3001:3000"  # Use port 3001 instead
```

### Environment variables not loading

**Verify .env file exists:**
```bash
ls -la .env
```

**Check Docker can read it:**
```bash
docker-compose config
```

### Permission issues (Linux)

**Add your user to docker group:**
```bash
sudo usermod -aG docker $USER
newgrp docker
```

## 🔒 Security Best Practices

1. **Never commit `.env` files to Git**
   - Already in `.gitignore`
   - Keep sensitive keys secure

2. **Use Docker secrets for production:**
```bash
echo "your_secret_key" | docker secret create openai_key -
```

3. **Regular updates:**
```bash
docker-compose pull
docker-compose up -d --build
```

4. **Monitor logs:**
```bash
docker-compose logs -f --tail=100
```

## 📊 Monitoring

Create a simple monitoring script `check-app.sh`:

```bash
#!/bin/bash
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Study Agent is running"
else
    echo "❌ Study Agent is down, restarting..."
    cd /path/to/study-agent && docker-compose restart
fi
```

Add to crontab to check every 5 minutes:
```bash
crontab -e
# Add: */5 * * * * /path/to/check-app.sh
```

---

## 🎉 Success!

Your Study Agent application should now:
- ✅ Start automatically when your computer boots
- ✅ Restart automatically if it crashes
- ✅ Be accessible at http://localhost:3000
- ✅ Run efficiently in a Docker container

For issues or questions, check the logs with `docker-compose logs -f`