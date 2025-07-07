#!/bin/bash

echo "🚀 Quick Deploy Script for Markdown Generator"
echo "============================================="

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required!"
    exit 1
fi

cd /Users/michaelmorgenthau/plugins-server-forked

echo "📝 Setting up Git remote..."
git remote remove origin 2>/dev/null || true
git remote add origin https://github.com/$GITHUB_USERNAME/typingmind-plugins-server.git

echo "📦 Adding latest changes..."
git add .
git commit -m "feat: complete markdown generator with deployment scripts" || echo "No changes to commit"

echo "📤 Pushing to GitHub..."
echo "Note: You may need to enter your GitHub credentials"
git branch -M main
git push -u origin main

echo ""
echo "✅ If push was successful, your code is now on GitHub!"
echo "🔗 Repository: https://github.com/$GITHUB_USERNAME/typingmind-plugins-server"
echo ""
echo "🚀 Next: Update your Render service to use this repository"
echo "📋 Go to: https://dashboard.render.com"
echo "🔧 Find: plugins-server-7x3r"
echo "⚙️ Settings → Repository: https://github.com/$GITHUB_USERNAME/typingmind-plugins-server"
