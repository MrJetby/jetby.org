const CONFIG = {
  discordUserId: "864174476530548736",
  discordUsername: "mrjetby",
  projects: [
    {
      title: "Jetby Widgets",
      description: "A suite of premium widgets for personal dashboards and presence cards.",
    },
    {
      title: "Interactive Web Interfaces",
      description: "Modern, aesthetic components using glassmorphism and smooth animations.",
    },
  ],
  links: [
    { label: "GitHub", url: "https://github.com/mrjetby" },
    { label: "Discord Server", url: "https://dsc.gg/jmdev" },
    { label: "Wiki", url: "https://wiki.jetby.org" },
  ],
};

// DOM Elements
const nyTimeElement = document.getElementById("nyTime");
const nyDateElement = document.getElementById("nyDate");
const dayProgressBar = document.getElementById("dayProgressBar");
const dayProgressLabel = document.querySelector(".day-progress-label");

const discordNameElement = document.getElementById("discordName");
const discordStatusElement = document.getElementById("discordStatus");
const discordActivityElement = document.getElementById("discordActivity");
const discordAvatarElement = document.getElementById("discordAvatar");
const statusDotElement = document.getElementById("statusDot");

const enterButton = document.getElementById("enterButton");
const introScreen = document.getElementById("introScreen");
const mainContent = document.getElementById("mainContent");
const cursorGlow = document.getElementById("cursorGlow");

// Audio Controls
const musicPlayer = document.getElementById("musicPlayer");
const playerStatusElement = document.getElementById("playerStatus");
const audioVisualizer = document.getElementById("audioVisualizer");

// Dual Volume Sync Elements
const audioControls = document.getElementById("audioControls");
const volumeButton = document.getElementById("volumeButton");
const volumeControl = document.getElementById("volumeControl");

const playPauseButton = document.getElementById("playPauseButton");
const panelVolumeControl = document.getElementById("panelVolumeControl");
const bgVideo = document.getElementById("bgVideo");

const playIcon = playPauseButton?.querySelector(".play-icon") ?? null;
const pauseIcon = playPauseButton?.querySelector(".pause-icon") ?? null;

// SVG icon strings for volume button (innerHTML-safe)
const SVG_VOLUME_ON = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 480 512"><path d="M215.03 71.05L126.06 160H24c-13.26 0-24 10.74-24 24v144c0 13.25 10.74 24 24 24h102.06l88.97 88.95c15.03 15.03 40.97 4.47 40.97-16.97V88.02c0-21.46-25.96-31.98-40.97-16.97zM480 256c0-63.53-32.06-121.94-85.77-156.24-11.19-7.14-26.03-3.82-33.12 7.46s-3.78 26.21 7.41 33.36C408.27 165.97 432 209.11 432 256s-23.73 90.03-63.48 115.42c-11.19 7.14-14.5 22.07-7.41 33.36 6.51 10.36 21.12 15.14 33.12 7.46C447.94 377.94 480 319.53 480 256zm-141.77-76.87c-11.58-6.33-26.19-2.16-32.61 9.45-6.39 11.61-2.16 26.2 9.45 32.61C327.98 228.28 336 241.63 336 256c0 14.38-8.02 27.72-20.92 34.81-11.61 6.41-15.84 21-9.45 32.61 6.43 11.66 21.05 15.8 32.61 9.45 28.23-15.55 45.77-45 45.77-76.88s-17.54-61.32-45.78-76.86z" fill="currentColor"></path></svg>`;
const SVG_VOLUME_OFF = `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M4 17h2.697L14 21.868V2.132L6.697 7H4c-1.103 0-2 .897-2 2v6c0 1.103.897 2 2 2"></path></svg>`;

// 1. Time & Day Progress
function updateTime() {
  const now = new Date();

  // Format Time (NY)
  const timeFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  // Format Date (NY)
  const dateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  nyTimeElement.textContent = timeFormatter.format(now);
  nyDateElement.textContent = dateFormatter.format(now);

  // Day Progress Calculation
  // Get time components in NY timezone
  const nyTimeStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).format(now);

  const [hours, minutes, seconds] = nyTimeStr.split(":").map(Number);
  const totalSecondsInDay = 86400;
  const elapsedSeconds = hours * 3600 + minutes * 60 + seconds;
  const progressPercent = ((elapsedSeconds / totalSecondsInDay) * 100).toFixed(2);

  if (dayProgressBar) {
    dayProgressBar.style.width = `${progressPercent}%`;
  }
  if (dayProgressLabel) {
    dayProgressLabel.textContent = `Day Progress: ${progressPercent}%`;
  }
}

// 2. Render Projects & Links
function renderProjects() {
  const projectsList = document.getElementById("projectsList");
  if (!projectsList) return;

  projectsList.innerHTML = CONFIG.projects
    .map(
      (project) => `
        <article class="project-card">
          <div class="project-title">${project.title}</div>
          <div class="project-description">${project.description}</div>
        </article>
      `,
    )
    .join("");
}

function renderLinks() {
  const linksList = document.getElementById("linksList");
  if (!linksList) return;

  linksList.innerHTML = CONFIG.links
    .map(
      (link) => `
        <div class="link-item">
          <a href="${link.url}" target="_blank" rel="noreferrer">${link.label}</a>
        </div>
      `,
    )
    .join("");
}

// 3. Discord Status / Presence via Lanyard API
function setPresenceStatus(status) {
  const statusColors = {
    online: "var(--discord-online, #10b981)",
    idle: "var(--discord-idle, #f59e0b)",
    dnd: "var(--discord-dnd, #ef4444)",
    offline: "var(--discord-offline, #64748b)",
  };

  const statusLabels = {
    online: "Online",
    idle: "Idle / Away",
    dnd: "Do Not Disturb",
    offline: "Offline",
  };

  const color = statusColors[status] || statusColors.offline;
  const label = statusLabels[status] || statusLabels.offline;

  if (statusDotElement) {
    statusDotElement.style.backgroundColor = color;
    statusDotElement.style.boxShadow = `0 0 12px ${color}`;
  }
  if (discordStatusElement) {
    discordStatusElement.textContent = label;
  }
}

async function loadDiscordPresence() {
  if (!CONFIG.discordUserId || CONFIG.discordUserId.includes("YOUR")) {
    discordNameElement.textContent = CONFIG.discordUsername;
    discordStatusElement.textContent = "ID missing in script.js";
    discordActivityElement.textContent = "Status unavailable";
    discordAvatarElement.src = "https://cdn.discordapp.com/embed/avatars/0.png";
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(
      `https://api.lanyard.rest/v1/users/${CONFIG.discordUserId}`,
      { signal: controller.signal }
    );
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();

    if (!payload.success || !payload.data) {
      throw new Error("No presence data in response");
    }

    const data = payload.data;
    const user = data.discord_user;
    const avatarHash = user.avatar;

    // Set username
    discordNameElement.textContent = user.global_name || user.username || CONFIG.discordUsername;

    // Set online status
    setPresenceStatus(data.discord_status || "offline");

    // Set avatar
    discordAvatarElement.src = avatarHash
      ? `https://cdn.discordapp.com/avatars/${user.id}/${avatarHash}.png?size=256`
      : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`;

    // Parse activity
    let activityText = "No active activity";

    // Spotify takes precedence
    if (data.listening_to_spotify && data.spotify) {
      activityText = `🎵 ${data.spotify.song} — ${data.spotify.artist}`;
    } else if (data.activities && data.activities.length > 0) {
      const customStatus = data.activities.find((act) => act.type === 4);
      const gameStatus = data.activities.find((act) => act.type === 0);

      if (customStatus && customStatus.state) {
        activityText = `${customStatus.emoji ? customStatus.emoji.name + " " : ""}${customStatus.state}`;
      } else if (gameStatus) {
        activityText = `🎮 ${gameStatus.name}`;
      } else {
        activityText = data.activities[0].name;
      }
    } else if (data.discord_status === "offline") {
      activityText = "Currently offline";
    }

    discordActivityElement.textContent = activityText;
  } catch (error) {
    console.error("[Lanyard] Presence fetch failed:", error?.message || error);

    // Always show the username
    discordNameElement.textContent = CONFIG.discordUsername;
    setPresenceStatus("offline");
    discordAvatarElement.src = "https://cdn.discordapp.com/embed/avatars/0.png";

    // Specific, helpful messages instead of a generic "failed"
    if (!navigator.onLine) {
      discordActivityElement.textContent = "No internet connection";
    } else if (error?.name === "AbortError") {
      discordActivityElement.textContent = "Status request timed out";
    } else if (error instanceof TypeError) {
      // Network/CORS — common when opening as file://
      discordActivityElement.textContent = "Serve via HTTP for live status";
    } else if (error?.message?.includes("404")) {
      discordActivityElement.textContent = "Add Lanyard bot to see status";
    } else {
      discordActivityElement.textContent = "Status temporarily unavailable";
    }
  }
}

// 4. Interactive Cursor Glow
function setupCursorGlow() {
  if (window.matchMedia("(pointer: coarse)").matches) {
    // Disable on touch screens
    cursorGlow.style.display = "none";
    return;
  }

  cursorGlow.style.display = "block";

  document.addEventListener("mousemove", (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });
}

// 5. 3D Card Tilt Effect (Vanilla JS)
function setupTiltCards() {
  const cards = document.querySelectorAll(".js-tilt");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within element
      const y = e.clientY - rect.top;  // y position within element

      // Normalize coordinates (-0.5 to 0.5)
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;

      // Max rotation angles (degrees)
      const maxRotate = 8;
      const rx = -py * maxRotate;
      const ry = px * maxRotate;

      // Apply transform with smooth tilt
      card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.01, 1.01, 1.01)`;
    });

    card.addEventListener("mouseleave", () => {
      // Reset tilt smoothly
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    });
  });
}

// 6. Audio Player Setup & Dual Sync
function setupAudioPlayer() {
  // If there's no audio player in the DOM, bail silently
  if (!musicPlayer) return;

  let playbackAttempted = false;

  const startPlayback = async () => {
    try {
      if (volumeControl) musicPlayer.volume = Number(volumeControl.value);
      musicPlayer.muted = false;
      await musicPlayer.play();

      playbackAttempted = true;
      if (playerStatusElement) playerStatusElement.textContent = "Playing background music";
      playIcon?.classList.add("hidden");
      pauseIcon?.classList.remove("hidden");
      audioVisualizer?.classList.add("playing");
    } catch (error) {
      if (!playbackAttempted) {
        setTimeout(() => startPlayback(), 350);
      } else {
        if (playerStatusElement) playerStatusElement.textContent = "Playback blocked. Click anywhere to play.";
        audioVisualizer?.classList.remove("playing");
      }
    }
  };

  const togglePlayPause = () => {
    if (musicPlayer.paused) {
      musicPlayer.play()
        .then(() => {
          playIcon?.classList.add("hidden");
          pauseIcon?.classList.remove("hidden");
          audioVisualizer?.classList.add("playing");
          if (playerStatusElement) playerStatusElement.textContent = "Playing background music";
        })
        .catch(() => {
          if (playerStatusElement) playerStatusElement.textContent = "Playback error";
        });
    } else {
      musicPlayer.pause();
      playIcon?.classList.remove("hidden");
      pauseIcon?.classList.add("hidden");
      audioVisualizer?.classList.remove("playing");
      if (playerStatusElement) playerStatusElement.textContent = "Paused";
    }
  };

  const unlockAudio = async () => {
    // Hide intro screen
    introScreen?.classList.add("fade-out");
    setTimeout(() => {
      if (introScreen) introScreen.style.display = "none";
      if (enterButton) enterButton.style.display = "none";
    }, 800);

    // Unlock dashboard shell
    if (audioControls) {
      audioControls.classList.remove("hidden");
      audioControls.classList.add("visible");
    }
    mainContent?.classList.remove("locked");
    mainContent?.classList.add("unlocked");

    // Start video & audio
    bgVideo?.play().catch(() => { });
    await startPlayback();
  };

  // Click listeners for portal entrance
  enterButton?.addEventListener("click", unlockAudio);
  document.addEventListener(
    "click",
    async () => {
      if (enterButton && enterButton.style.display !== "none") {
        await unlockAudio();
      }
    },
    { once: true },
  );

  // Play/Pause panel button listener
  playPauseButton?.addEventListener("click", (e) => {
    e.stopPropagation();
    togglePlayPause();
  });

  // Corner Mute Button toggle
  if (volumeButton) {
    volumeButton.addEventListener("click", (e) => {
      e.stopPropagation();
      if (musicPlayer.muted) {
        musicPlayer.muted = false;
        if (volumeControl) volumeControl.value = musicPlayer.volume || 0.55;
        if (panelVolumeControl) panelVolumeControl.value = musicPlayer.volume || 0.55;
        volumeButton.innerHTML = SVG_VOLUME_ON;
        audioVisualizer?.classList.add("playing");
      } else {
        musicPlayer.muted = true;
        volumeButton.innerHTML = SVG_VOLUME_OFF;
        audioVisualizer?.classList.remove("playing");
      }
    });
  }

  // Input listeners for volume sliders (Sync both sliders)
  volumeControl?.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    musicPlayer.volume = val;
    if (panelVolumeControl) panelVolumeControl.value = val;
    musicPlayer.muted = val === 0;
    if (volumeButton) volumeButton.innerHTML = val === 0 ? SVG_VOLUME_OFF : SVG_VOLUME_ON;
  });

  panelVolumeControl?.addEventListener("input", (e) => {
    const val = Number(e.target.value);
    musicPlayer.volume = val;
    if (volumeControl) volumeControl.value = val;
    musicPlayer.muted = val === 0;
    if (volumeButton) volumeButton.innerHTML = val === 0 ? SVG_VOLUME_OFF : SVG_VOLUME_ON;
  });

  // Audio lifecycle state listeners
  musicPlayer.addEventListener("error", () => {
    if (playerStatusElement) playerStatusElement.textContent = "Audio missing. Drop background-music.mp3 into assets/";
  });

  musicPlayer.addEventListener("canplaythrough", () => {
    if (playbackAttempted && playerStatusElement) playerStatusElement.textContent = "Ready to play";
  });

  musicPlayer.addEventListener("playing", () => {
    if (playerStatusElement) playerStatusElement.textContent = "Playing background music";
    audioVisualizer?.classList.add("playing");
    playIcon?.classList.add("hidden");
    pauseIcon?.classList.remove("hidden");
  });

  musicPlayer.addEventListener("pause", () => {
    if (playerStatusElement) playerStatusElement.textContent = "Paused";
    audioVisualizer?.classList.remove("playing");
    playIcon?.classList.remove("hidden");
    pauseIcon?.classList.add("hidden");
  });

  // Pre-load state check
  if (musicPlayer.readyState >= 2 && playerStatusElement) {
    playerStatusElement.textContent = "Ready to play";
  }

  // Set initial volume
  if (panelVolumeControl) musicPlayer.volume = Number(panelVolumeControl.value);
}

// 7. Background Video Autoplay fallback
function setupBackgroundVideo() {
  if (!bgVideo) return;
  bgVideo.addEventListener("error", () => {
    bgVideo.style.display = "none";
  });
}

// Initialization
function init() {
  updateTime();
  setInterval(updateTime, 1000);

  renderProjects();
  renderLinks();

  setupCursorGlow();
  setupTiltCards();
  setupAudioPlayer();
  setupBackgroundVideo();

  loadDiscordPresence();
  // Poll Discord presence every 10 seconds to keep it live
  setInterval(loadDiscordPresence, 10000);
}

document.addEventListener("DOMContentLoaded", init);
