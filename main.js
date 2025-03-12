document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');
    const uploadLink = document.getElementById('upload-link');
    const uploadOverlay = document.getElementById('upload-overlay');
    const closeUpload = document.getElementById('close-upload');
    const uploadBox = document.getElementById('upload-box');
    const fileInput = document.getElementById('file-input');
    const songsContainer = document.getElementById('songs-container');
    const nowPlaying = document.getElementById('now-playing');
    const mainTitle = document.getElementById('main-title');
    const mainArtist = document.getElementById('main-artist');
    const mainAlbum = document.getElementById('main-album');
    const mainPlay = document.getElementById('main-play');
    const mainProgress = document.getElementById('main-progress');
    const mainCurrent = document.getElementById('main-current');
    const mainDuration = document.getElementById('main-duration');
    const volumeControl = document.getElementById('volume');

    let currentSongIndex = 0;
    let songs = [];
    let audio = new Audio();

    // Toggle sidebar on hamburger click
    hamburger.addEventListener('click', () => {
        sidebar.classList.toggle('active');
    });

    // Close sidebar on close button click
    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('active');
    });

    // Show upload overlay
    uploadLink.addEventListener('click', (e) => {
        e.preventDefault();
        uploadOverlay.style.display = 'flex';
    });

    // Close upload overlay
    closeUpload.addEventListener('click', () => {
        uploadOverlay.style.display = 'none';
    });

    // Trigger file input on upload box click
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file upload
    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
            Array.from(files).forEach(file => {
                if (file.type.startsWith('audio/')) {
                    songs.push({
                        name: file.name,
                        url: URL.createObjectURL(file)
                    });
                }
            });
            renderSongs();
            uploadOverlay.style.display = 'none';
        }
    });

    // Render songs in the playlist
    function renderSongs() {
        songsContainer.innerHTML = '';
        songs.forEach((song, index) => {
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.innerHTML = `
                <img src="assets/defaultalbum.png" alt="Album Cover">
                <div>
                    <h3>${song.name}</h3>
                </div>
                <i class="far fa-heart"></i>
            `;
            songItem.addEventListener('click', () => playSong(index));
            songsContainer.appendChild(songItem);
        });
    }

    // Play a song
    function playSong(index) {
        currentSongIndex = index;
        const song = songs[index];
        
        // Stop current audio if playing
        if (!audio.paused) audio.pause();
        
        audio = new Audio(song.url);
        audio.play();
        
        // Update UI
        mainTitle.textContent = song.name;
        mainArtist.textContent = 'Unknown Artist';
        mainAlbum.src = 'assets/defaultalbum.png';
        nowPlaying.style.display = 'block';
        updatePlayButton();
        updateProgress();
        
        // Event listeners for audio
        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('ended', () => {
            mainPlay.classList.remove('playing');
            if (audio.loop) return;
            currentSongIndex = (currentSongIndex + 1) % songs.length;
            playSong(currentSongIndex);
        });
    }

    // Update progress bar fill
    function updateProgress() {
        const progress = (audio.currentTime / audio.duration) * 100;
        mainProgress.value = progress;
        mainProgress.style.setProperty('--progress', `${progress}%`); // Update CSS variable
        mainCurrent.textContent = formatTime(audio.currentTime);
        mainDuration.textContent = formatTime(audio.duration);
        if (!audio.ended) {
            requestAnimationFrame(updateProgress);
        }
    }

    // Format time in minutes and seconds
    function formatTime(time) {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }

    // Toggle play/pause button
    function updatePlayButton() {
        if (audio.paused) {
            mainPlay.innerHTML = '<i class="fas fa-play"></i>';
        } else {
            mainPlay.innerHTML = '<i class="fas fa-pause"></i>';
        }
    }

    // Play/Pause button
    mainPlay.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
        } else {
            audio.pause();
        }
        updatePlayButton();
    });

    // Progress bar seek
    mainProgress.addEventListener('input', () => {
        const seekTime = (mainProgress.value / 100) * audio.duration;
        audio.currentTime = seekTime;
        mainProgress.style.setProperty('--progress', `${mainProgress.value}%`); // Update CSS variable
    });

    // Volume control
    volumeControl.addEventListener('input', () => {
        audio.volume = volumeControl.value;
        volumeControl.style.setProperty('--volume', `${volumeControl.value * 100}%`); // Update CSS variable
    });

    // Initialize volume fill
    volumeControl.style.setProperty('--volume', `${audio.volume * 100}%`);

    // Next song
    document.getElementById('main-next').addEventListener('click', () => {
        currentSongIndex = (currentSongIndex + 1) % songs.length;
        playSong(currentSongIndex);
    });

    // Previous song
    document.getElementById('main-prev').addEventListener('click', () => {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    });

    // Shuffle songs
    document.getElementById('main-shuffle').addEventListener('click', () => {
        songs = songs.sort(() => Math.random() - 0.5);
        renderSongs();
    });

    // Repeat song
    document.getElementById('main-repeat').addEventListener('click', () => {
        audio.loop = !audio.loop;
    });
});