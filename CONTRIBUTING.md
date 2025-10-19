# Contributing to Fouad Music 🎵

First off, thank you for considering contributing to Fouad Music! It's people like you that make Fouad Music such a great tool.

## 🌟 How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots if possible**
* **Include your OS, Node.js version, and Electron version**

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and explain which behavior you expected to see instead**
* **Explain why this enhancement would be useful**

### Pull Requests 🔄

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## 🎯 Development Process

### Setting Up Development Environment

```bash
# Clone your fork
git clone https://github.com/yourusername/fouad-music.git
cd fouad-music

# Add upstream remote
git remote add upstream https://github.com/originaluser/fouad-music.git

# Install dependencies
npm install

# Run in development mode
npm start
```

### Coding Standards

* Use 2 spaces for indentation
* Use semicolons
* Use single quotes for strings
* Add comments for complex logic
* Follow existing code style
* Write descriptive commit messages

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line

Examples:
```
Add YouTube playlist support
Fix equalizer slider alignment
Update README with new features
```

### Testing

Before submitting a pull request, make sure:

* The app starts without errors
* All features work as expected
* No console errors
* Code is properly formatted

## 📝 Style Guide

### JavaScript

```javascript
// Good
function playTrack(index) {
  if (index < 0 || index >= playlist.length) return;
  
  const track = playlist[index];
  audioElement.src = track.path;
  audioElement.play();
}

// Bad
function playTrack(index){
  if(index<0||index>=playlist.length)return;
  var track=playlist[index];
  audioElement.src=track.path;
  audioElement.play()
}
```

### CSS

```css
/* Good */
.player-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

/* Bad */
.player-controls{display:flex;justify-content:center;align-items:center;gap:20px;}
```

## 🎨 Adding New Features

When adding new features:

1. **Discuss first**: Open an issue to discuss the feature before implementing
2. **Keep it focused**: One feature per pull request
3. **Update docs**: Update README.md and other relevant documentation
4. **Test thoroughly**: Test on multiple platforms if possible
5. **Follow the pattern**: Look at existing code for patterns to follow

## 🐞 Debugging Tips

### Electron DevTools

```javascript
// In main.js, add:
mainWindow.webContents.openDevTools();
```

### Logging

```javascript
// Use console.log for debugging
console.log('Current track:', currentTrackIndex);
console.log('Playlist:', playlist);
```

### Common Issues

* **Audio not playing**: Check Web Audio API context state
* **Download failing**: Check ytdl-core version and network
* **UI not updating**: Check event listeners and state management

## 📚 Resources

* [Electron Documentation](https://www.electronjs.org/docs)
* [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
* [Node.js Documentation](https://nodejs.org/docs)

## 🏆 Recognition

Contributors will be recognized in:
* README.md contributors section
* Release notes
* Project credits

## ❓ Questions?

Feel free to:
* Open an issue
* Join our Discord
* Email us at dev@fouadmusic.com

---

**Thank you for contributing! 🎉**
