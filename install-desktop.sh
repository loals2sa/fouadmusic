#!/bin/bash

# Installation script for Fouad Music Desktop Shortcut

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DESKTOP_FILE="$HOME/.local/share/applications/fouad-music.desktop"
ICON_FILE="$APP_DIR/assets/logo.svg"

# Create .local/share/applications directory if it doesn't exist
mkdir -p "$HOME/.local/share/applications"

# Create desktop entry file
cat > "$DESKTOP_FILE" << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Fouad Music
Comment=Advanced Music Player with Download & Mixer Controls
Exec=electron $APP_DIR/main.js
Icon=$ICON_FILE
Terminal=false
Categories=AudioVideo;Audio;Player;
Keywords=music;audio;player;media;
StartupNotify=true
EOF

# Make desktop file executable
chmod +x "$DESKTOP_FILE"

# Update desktop database
if command -v update-desktop-database &> /dev/null; then
    update-desktop-database "$HOME/.local/share/applications"
fi

echo "✅ Desktop shortcut installed successfully!"
echo "📍 Location: $DESKTOP_FILE"
echo ""
echo "You can now find 'Fouad Music' in your application menu."
echo ""
echo "To uninstall, run: rm $DESKTOP_FILE"
