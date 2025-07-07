#!/bin/bash

echo "🚀 Deploying Markdown Generator to GitHub..."

# Navigate to the project directory
cd /Users/michaelmorgenthau/plugins-server-forked

echo "📁 Current directory: $(pwd)"

# Check if we have the code
if [ ! -f "src/routes/markdownGenerator/markdownGeneratorRouter.ts" ]; then
    echo "❌ Error: Markdown generator code not found!"
    exit 1
fi

echo "✅ Markdown generator code found"

# Initialize repository if needed
if [ ! -d ".git" ]; then
    echo "📝 Initializing Git repository..."
    git init
    git add .
    git commit -m "feat: add markdown generator to TypingMind plugins-server"
fi

echo "📊 Repository status:"
git status --short

echo ""
echo "🔧 Manual steps needed:"
echo "1. Go to GitHub.com and create a new repository called 'typingmind-plugins-server'"
echo "2. Make it public, don't add README"
echo "3. Copy the repository URL"
echo "4. Run these commands:"
echo ""
echo "   git remote add origin https://github.com/YOUR_USERNAME/typingmind-plugins-server.git"
echo "   git branch -M main"  
echo "   git push -u origin main"
echo ""
echo "Replace YOUR_USERNAME with your GitHub username"
echo ""
echo "📋 Your code is ready to push!"
echo "📁 Location: /Users/michaelmorgenthau/plugins-server-forked"
