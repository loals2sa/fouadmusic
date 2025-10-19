# Creating the Icon

The app logo is already created as `assets/logo.svg`. To convert it to a PNG icon:

## Method 1: Using the included script (Recommended)
```bash
./generate-icon.sh
```

## Method 2: Manual conversion with ImageMagick
```bash
# Install ImageMagick
sudo apt-get install imagemagick

# Convert SVG to PNG
convert -background none -size 512x512 assets/logo.svg assets/icon.png
```

## Method 3: Online converter
1. Visit https://cloudconvert.com/svg-to-png
2. Upload `assets/logo.svg`
3. Set size to 512x512
4. Download as `icon.png`
5. Place in `assets/` folder

## Method 4: Use GIMP
1. Open `assets/logo.svg` in GIMP
2. Export as PNG
3. Set dimensions to 512x512
4. Save as `assets/icon.png`

## Temporary Workaround
If you can't generate the icon right now, the app will still work using the SVG logo. The PNG icon is only needed for:
- Desktop shortcuts
- Taskbar/dock icons
- Building distributable packages

The SVG logo will display fine in the app header.
