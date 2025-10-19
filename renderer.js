const { ipcRenderer } = require('electron');

// Audio Context and Nodes
let audioContext;
let audioSource;
let gainNode;
let bassNode;
let analyser;
let eqFilters = [];
let audioElement = document.getElementById('audioPlayer');

// Playlist and State
let playlist = [];
let currentTrackIndex = -1;
let isPlaying = false;
let isShuffle = false;
let repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one

// Initialize Audio Context
function initAudioContext() {
    if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        audioSource = audioContext.createMediaElementSource(audioElement);
        
        // Gain Node (Volume)
        gainNode = audioContext.createGain();
        
        // Bass Node
        bassNode = audioContext.createBiquadFilter();
        bassNode.type = 'lowshelf';
        bassNode.frequency.value = 100;
        bassNode.gain.value = 0;
        
        // Analyser for Visualizer
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        
        // 10-Band Equalizer
        const frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
        frequencies.forEach(freq => {
            const filter = audioContext.createBiquadFilter();
            filter.type = freq < 200 ? 'lowshelf' : freq > 8000 ? 'highshelf' : 'peaking';
            filter.frequency.value = freq;
            filter.Q.value = 1;
            filter.gain.value = 0;
            eqFilters.push(filter);
        });
        
        // Connect Audio Graph
        let lastNode = audioSource;
        lastNode = connectNode(lastNode, bassNode);
        eqFilters.forEach(filter => {
            lastNode = connectNode(lastNode, filter);
        });
        lastNode = connectNode(lastNode, gainNode);
        lastNode = connectNode(lastNode, analyser);
        lastNode.connect(audioContext.destination);
    }
}

function connectNode(source, destination) {
    source.connect(destination);
    return destination;
}

// Create Animated Particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 30; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 10 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
        particlesContainer.appendChild(particle);
    }
}

// DOM Elements
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const volumeIcon = document.getElementById('volumeIcon');
const bassSlider = document.getElementById('bassSlider');
const bassValue = document.getElementById('bassValue');
const playlistEl = document.getElementById('playlist');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const addMusicBtn = document.getElementById('addMusicBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearPlaylistBtn = document.getElementById('clearPlaylist');
const resetEqBtn = document.getElementById('resetEqBtn');

// Modal Elements
const downloadModal = document.getElementById('downloadModal');
const closeModal = document.getElementById('closeModal');
const urlInput = document.getElementById('urlInput');
const startDownload = document.getElementById('startDownload');
const cancelDownload = document.getElementById('cancelDownload');
const downloadStatus = document.getElementById('downloadStatus');
const downloadProgressContainer = document.getElementById('downloadProgressContainer');
const downloadProgressBar = document.getElementById('downloadProgressBar');

// Initialize
createParticles();
initVisualizer();
loadSettings();
loadPlaylist();

// Event Listeners
playBtn.addEventListener('click', togglePlay);
prevBtn.addEventListener('click', playPrevious);
nextBtn.addEventListener('click', playNext);
shuffleBtn.addEventListener('click', toggleShuffle);
repeatBtn.addEventListener('click', toggleRepeat);
progressBar.addEventListener('input', seekAudio);
volumeSlider.addEventListener('input', changeVolume);
bassSlider.addEventListener('input', changeBass);
addMusicBtn.addEventListener('click', () => ipcRenderer.send('add-music-file'));
downloadBtn.addEventListener('click', openDownloadModal);
closeModal.addEventListener('click', closeDownloadModal);
cancelDownload.addEventListener('click', closeDownloadModal);
startDownload.addEventListener('click', downloadMusic);
clearPlaylistBtn.addEventListener('click', clearPlaylist);
resetEqBtn.addEventListener('click', resetEqualizer);

// EQ Sliders
document.querySelectorAll('.eq-slider').forEach((slider, index) => {
    slider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        if (eqFilters[index]) {
            eqFilters[index].gain.value = value;
        }
        saveSettings();
    });
});

// Audio Element Events
audioElement.addEventListener('timeupdate', updateProgress);
audioElement.addEventListener('ended', handleTrackEnd);
audioElement.addEventListener('loadedmetadata', () => {
    durationEl.textContent = formatTime(audioElement.duration);
});

// Functions
function togglePlay() {
    if (playlist.length === 0) return;
    
    initAudioContext();
    
    if (currentTrackIndex === -1) {
        playTrack(0);
        return;
    }
    
    if (isPlaying) {
        audioElement.pause();
        playBtn.querySelector('i').className = 'fas fa-play';
        isPlaying = false;
    } else {
        audioElement.play();
        playBtn.querySelector('i').className = 'fas fa-pause';
        isPlaying = true;
    }
}

function playTrack(index) {
    if (index < 0 || index >= playlist.length) return;
    
    initAudioContext();
    currentTrackIndex = index;
    const track = playlist[index];
    
    audioElement.src = track.path;
    audioElement.play();
    isPlaying = true;
    
    playBtn.querySelector('i').className = 'fas fa-pause';
    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist || 'Unknown Artist';
    
    updatePlaylistUI();
    savePlaylist();
}

function playNext() {
    if (playlist.length === 0) return;
    
    let nextIndex;
    if (isShuffle) {
        nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
        nextIndex = (currentTrackIndex + 1) % playlist.length;
    }
    playTrack(nextIndex);
}

function playPrevious() {
    if (playlist.length === 0) return;
    
    if (audioElement.currentTime > 3) {
        audioElement.currentTime = 0;
    } else {
        let prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
        playTrack(prevIndex);
    }
}

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    const icon = repeatBtn.querySelector('i');
    
    switch(repeatMode) {
        case 0:
            repeatBtn.classList.remove('active');
            icon.className = 'fas fa-redo';
            break;
        case 1:
            repeatBtn.classList.add('active');
            icon.className = 'fas fa-redo';
            break;
        case 2:
            repeatBtn.classList.add('active');
            icon.className = 'fas fa-redo';
            icon.style.position = 'relative';
            break;
    }
}

function handleTrackEnd() {
    if (repeatMode === 2) {
        audioElement.currentTime = 0;
        audioElement.play();
    } else if (repeatMode === 1 || currentTrackIndex < playlist.length - 1) {
        playNext();
    } else {
        isPlaying = false;
        playBtn.querySelector('i').className = 'fas fa-play';
    }
}

function seekAudio() {
    const seekTime = (progressBar.value / 100) * audioElement.duration;
    audioElement.currentTime = seekTime;
}

function updateProgress() {
    if (audioElement.duration) {
        const progress = (audioElement.currentTime / audioElement.duration) * 100;
        progressBar.value = progress;
        currentTimeEl.textContent = formatTime(audioElement.currentTime);
    }
}

function changeVolume() {
    const volume = volumeSlider.value / 100;
    audioElement.volume = volume;
    
    if (gainNode) {
        gainNode.gain.value = volume;
    }
    
    volumeValue.textContent = volumeSlider.value + '%';
    
    // Update volume icon
    if (volume === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
    } else if (volume < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
    } else {
        volumeIcon.className = 'fas fa-volume-up';
    }
    
    saveSettings();
}

function changeBass() {
    const value = parseFloat(bassSlider.value);
    bassValue.textContent = value + ' dB';
    
    if (bassNode) {
        bassNode.gain.value = value;
    }
    
    saveSettings();
}

function resetEqualizer() {
    document.querySelectorAll('.eq-slider').forEach((slider, index) => {
        slider.value = 0;
        if (eqFilters[index]) {
            eqFilters[index].gain.value = 0;
        }
    });
    saveSettings();
}

function addTracks(filePaths) {
    filePaths.forEach(filePath => {
        const fileName = filePath.split('/').pop();
        const title = fileName.replace(/\.[^/.]+$/, '');
        
        playlist.push({
            title: title,
            artist: 'Local File',
            path: filePath
        });
    });
    
    updatePlaylistUI();
    savePlaylist();
}

function updatePlaylistUI() {
    if (playlist.length === 0) {
        playlistEl.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-compact-disc"></i>
                <p>No tracks yet</p>
                <p class="hint">Add music or download from URL</p>
            </div>
        `;
        return;
    }
    
    playlistEl.innerHTML = '';
    playlist.forEach((track, index) => {
        const trackItem = document.createElement('div');
        trackItem.className = 'track-item';
        if (index === currentTrackIndex) {
            trackItem.classList.add('active');
        }
        
        trackItem.innerHTML = `
            <h4>${track.title}</h4>
            <p>${track.artist}</p>
        `;
        
        trackItem.addEventListener('click', () => playTrack(index));
        playlistEl.appendChild(trackItem);
    });
}

function clearPlaylist() {
    if (confirm('Clear all tracks from playlist?')) {
        playlist = [];
        currentTrackIndex = -1;
        isPlaying = false;
        audioElement.pause();
        audioElement.src = '';
        playBtn.querySelector('i').className = 'fas fa-play';
        trackTitle.textContent = 'No Track Playing';
        trackArtist.textContent = 'Select a track to begin';
        updatePlaylistUI();
        savePlaylist();
    }
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Modal Functions
function openDownloadModal() {
    downloadModal.classList.add('active');
    urlInput.focus();
}

function closeDownloadModal() {
    downloadModal.classList.remove('active');
    urlInput.value = '';
    downloadStatus.className = 'download-status';
    downloadProgressContainer.style.display = 'none';
    downloadProgressBar.style.width = '0%';
}

function downloadMusic() {
    const url = urlInput.value.trim();
    
    if (!url) {
        showDownloadStatus('Please enter a valid URL', 'error');
        return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
        showDownloadStatus('Currently supports YouTube URLs only', 'error');
        return;
    }
    
    showDownloadStatus('Starting download...', 'info');
    downloadProgressContainer.style.display = 'block';
    ipcRenderer.send('download-music', url);
}

function showDownloadStatus(message, type) {
    downloadStatus.textContent = message;
    downloadStatus.className = `download-status ${type}`;
}

// Visualizer
function initVisualizer() {
    const canvas = document.getElementById('visualizer');
    const ctx = canvas.getContext('2d');
    
    function resizeCanvas() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    function draw() {
        requestAnimationFrame(draw);
        
        ctx.fillStyle = 'rgba(10, 10, 10, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!analyser || !isPlaying) {
            return;
        }
        
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);
        
        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;
        
        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height * 0.8;
            
            const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
            gradient.addColorStop(0, '#6366f1');
            gradient.addColorStop(0.5, '#8b5cf6');
            gradient.addColorStop(1, '#ec4899');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
            
            x += barWidth + 1;
        }
    }
    
    draw();
}

// Save/Load Functions
function saveSettings() {
    const settings = {
        volume: volumeSlider.value,
        bass: bassSlider.value,
        equalizer: Array.from(document.querySelectorAll('.eq-slider')).map(s => s.value)
    };
    ipcRenderer.send('save-settings', settings);
}

function loadSettings() {
    ipcRenderer.send('load-settings');
}

function savePlaylist() {
    ipcRenderer.send('save-playlist', playlist);
}

function loadPlaylist() {
    ipcRenderer.send('load-playlist');
}

// IPC Event Listeners
ipcRenderer.on('files-added', (event, filePaths) => {
    addTracks(filePaths);
});

ipcRenderer.on('open-download-dialog', () => {
    openDownloadModal();
});

ipcRenderer.on('download-status', (event, data) => {
    if (data.success) {
        if (data.filePath) {
            showDownloadStatus('Download complete!', 'success');
            addTracks([data.filePath]);
            setTimeout(closeDownloadModal, 2000);
        } else {
            showDownloadStatus(data.message, 'info');
        }
    } else {
        showDownloadStatus(data.message, 'error');
    }
    downloadProgressContainer.style.display = 'none';
});

ipcRenderer.on('download-progress', (event, progress) => {
    downloadProgressBar.style.width = progress + '%';
});

ipcRenderer.on('settings-loaded', (event, settings) => {
    volumeSlider.value = settings.volume || 70;
    changeVolume();
    
    bassSlider.value = settings.bass || 0;
    changeBass();
    
    if (settings.equalizer) {
        document.querySelectorAll('.eq-slider').forEach((slider, index) => {
            slider.value = settings.equalizer[index] || 0;
            if (eqFilters[index]) {
                eqFilters[index].gain.value = parseFloat(slider.value);
            }
        });
    }
});

ipcRenderer.on('playlist-loaded', (event, loadedPlaylist) => {
    if (loadedPlaylist && loadedPlaylist.length > 0) {
        playlist = loadedPlaylist;
        updatePlaylistUI();
    }
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
    } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        playNext();
    } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        playPrevious();
    }
});
