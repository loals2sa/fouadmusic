#!/bin/bash

# Script to generate icon.png from logo.svg

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SVG_FILE="$SCRIPT_DIR/assets/logo.svg"
PNG_FILE="$SCRIPT_DIR/assets/icon.png"

# Check if ImageMagick is installed
if ! command -v convert &> /dev/null; then
    echo "❌ ImageMagick is not installed."
    echo "📥 Installing ImageMagick..."
    
    # Detect package manager and install
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y imagemagick
    elif command -v yum &> /dev/null; then
        sudo yum install -y ImageMagick
    elif command -v pacman &> /dev/null; then
        sudo pacman -S imagemagick
    else
        echo "⚠️  Please install ImageMagick manually:"
        echo "   - Debian/Ubuntu: sudo apt-get install imagemagick"
        echo "   - Fedora: sudo yum install ImageMagick"
        echo "   - Arch: sudo pacman -S imagemagick"
        exit 1
    fi
fi

# Generate PNG from SVG
echo "🎨 Generating icon.png from logo.svg..."
convert -background none -size 512x512 "$SVG_FILE" "$PNG_FILE"

if [ -f "$PNG_FILE" ]; then
    echo "✅ Icon generated successfully!"
    echo "📍 Location: $PNG_FILE"
else
    echo "❌ Failed to generate icon."
    exit 1
fi
