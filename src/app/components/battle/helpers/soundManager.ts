import { JsfxrResource, SoundConfig } from "@excaliburjs/plugin-jsfxr";

// Sound configurations for different game actions
const soundsConfig: Record<string, SoundConfig> = {
  unitSpawn: {
    oldParams: true,
    wave_type: 0,
    p_env_attack: 0,
    p_env_sustain: 0.1,
    p_env_punch: 0.3,
    p_env_decay: 0.3,
    p_base_freq: 0.4,
    p_freq_limit: 0,
    p_freq_ramp: 0.2,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.3,
    sample_rate: 44100,
    sample_size: 16,
  },
  unitAttack: {
    oldParams: true,
    wave_type: 1,
    p_env_attack: 0,
    p_env_sustain: 0.1,
    p_env_punch: 0.3,
    p_env_decay: 0.2,
    p_base_freq: 0.6,
    p_freq_limit: 0,
    p_freq_ramp: -0.3,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.25,
    sample_rate: 44100,
    sample_size: 16,
  },
  unitDestroyed: {
    oldParams: true,
    wave_type: 3, // Noise for explosion effect
    p_env_attack: 0,
    p_env_sustain: 0.05,
    p_env_punch: 0.8, // Big punch for explosion impact
    p_env_decay: 0.4, // Quick decay for sharp explosion
    p_base_freq: 0.4, // Higher frequency for better explosion sound
    p_freq_limit: 0,
    p_freq_ramp: -0.4, // Less aggressive frequency drop
    p_freq_dramp: 0,
    p_vib_strength: 0.2, // Add some vibration for explosion texture
    p_vib_speed: 0.1,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 0.8, // Filter out harsh high frequencies
    p_lpf_ramp: -0.3, // Gradually filter more for realistic explosion
    p_lpf_resonance: 0.2,
    p_hpf_freq: 0.1, // Remove muddy low frequencies
    p_hpf_ramp: 0,
    sound_vol: 0.5, // Slightly louder for impact
    sample_rate: 44100,
    sample_size: 16,
  },
  baseHit: {
    oldParams: true,
    wave_type: 1,
    p_env_attack: 0,
    p_env_sustain: 0.3,
    p_env_punch: 0,
    p_env_decay: 0.8,
    p_base_freq: 0.15,
    p_freq_limit: 0,
    p_freq_ramp: 0,
    p_freq_dramp: 0,
    p_vib_strength: 0,
    p_vib_speed: 0,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.5,
    sample_rate: 44100,
    sample_size: 16,
  },
  spellCast: {
    oldParams: true,
    wave_type: 2,
    p_env_attack: 0,
    p_env_sustain: 0.2,
    p_env_punch: 0.4,
    p_env_decay: 0.6,
    p_base_freq: 0.3,
    p_freq_limit: 0,
    p_freq_ramp: 0.2,
    p_freq_dramp: 0,
    p_vib_strength: 0.5,
    p_vib_speed: 0.4,
    p_arp_mod: 0.3,
    p_arp_speed: 0.5,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0.2,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0.3,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.4,
    sample_rate: 44100,
    sample_size: 16,
  },
  victory: {
    oldParams: true,
    wave_type: 0,
    p_env_attack: 0,
    p_env_sustain: 0.3,
    p_env_punch: 0.3,
    p_env_decay: 0.4,
    p_base_freq: 0.6,
    p_freq_limit: 0,
    p_freq_ramp: 0.3,
    p_freq_dramp: 0,
    p_vib_strength: 0.1,
    p_vib_speed: 5,
    p_arp_mod: 0.4,
    p_arp_speed: 0.6,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0,
    p_hpf_freq: 0,
    p_hpf_ramp: 0,
    sound_vol: 0.4,
    sample_rate: 44100,
    sample_size: 16,
  },
  enemySpawn: {
    oldParams: true,
    wave_type: 1, // Square wave for more mechanical/threatening sound
    p_env_attack: 0.1, // Slightly slower attack for ominous feel
    p_env_sustain: 0.15,
    p_env_punch: 0.4, // More punch for threatening presence
    p_env_decay: 0.4,
    p_base_freq: 0.25, // Lower frequency than player spawn for darker tone
    p_freq_limit: 0,
    p_freq_ramp: -0.1, // Slight downward sweep for menacing effect
    p_freq_dramp: 0,
    p_vib_strength: 0.1, // Add slight vibration for unsettling feel
    p_vib_speed: 0.05,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0.3, // Modify duty cycle for harsher sound
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 0.8, // Slightly filter to make it darker
    p_lpf_ramp: 0,
    p_lpf_resonance: 0.1,
    p_hpf_freq: 0.05, // Keep some low-end for menacing rumble
    p_hpf_ramp: 0,
    sound_vol: 0.35, // Slightly louder than player spawn for intimidation
    sample_rate: 44100,
    sample_size: 16,
  },
};

class SoundManager {
  private plugin: JsfxrResource | null = null;
  private isInitialized: boolean = false;
  private backgroundMusic: HTMLAudioElement | null = null;
  private isMusicPlaying: boolean = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    try {
      this.plugin = new JsfxrResource();
      await this.plugin.init();
      for (const name in soundsConfig) {
        this.plugin.loadSoundConfig(name, soundsConfig[name]);
      }
      this.isInitialized = true;
    } catch (error) {
      console.warn("Failed to initialize sound manager:", error);
    }
  }

  playSound(soundName: string): void {
    if (!this.plugin || !this.isInitialized) return;
    try {
      this.plugin.playSound(soundName);
    } catch (error) {
      console.warn(`Failed to play sound "${soundName}":`, error);
    }
  }

  playUnitSpawn() {
    this.playSound("unitSpawn");
  }
  playEnemySpawn() {
    this.playSound("enemySpawn"); // Dedicated threatening sound for enemy spawns
  }
  playUnitAttack() {
    this.playSound("unitAttack");
  }
  playUnitDestroyed() {
    this.playSound("unitDestroyed");
  }
  playBaseHit() {
    this.playSound("baseHit");
  }
  playVictory() {
    this.playSound("victory");
  }
  playSpellCast() {
    this.playSound("spellCast");
  }

  // Background Music Methods
  loadBackgroundMusic(musicPath: string, autoplay: boolean = true): void {
    try {
      this.backgroundMusic = new Audio(musicPath);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.volume = 0.3; // 30% volume so it doesn't overpower sound effects
      this.backgroundMusic.preload = "auto"; // Preload the music

      // Handle loading errors
      this.backgroundMusic.onerror = () => {
        console.warn(`Failed to load background music: ${musicPath}`);
      };

      // Try to start music immediately when loaded
      if (autoplay) {
        this.backgroundMusic.oncanplaythrough = () => {
          console.log("Background music loaded and ready:", musicPath);
          this.playBackgroundMusic();
        };
      }

      console.log("Background music loading:", musicPath);
    } catch (error) {
      console.warn("Failed to load background music:", error);
    }
  }

  playBackgroundMusic(): void {
    if (!this.backgroundMusic) {
      console.warn("No background music loaded");
      return;
    }

    const playPromise = this.backgroundMusic.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isMusicPlaying = true;
          console.log("🎵 Background music started successfully!");
        })
        .catch((error) => {
          console.warn(
            "🚫 Autoplay blocked by browser. Music will start on first user interaction:",
            error.message
          );
          // Set up one-time click listener to start music
          this.setupAutoplayFallback();
        });
    }
  }

  private setupAutoplayFallback(): void {
    const startMusicOnInteraction = () => {
      if (this.backgroundMusic && !this.isMusicPlaying) {
        this.backgroundMusic
          .play()
          .then(() => {
            this.isMusicPlaying = true;
            console.log("🎵 Background music started after user interaction!");
          })
          .catch((error) => {
            console.warn("Still failed to play music:", error);
          });
      }
      // Remove listeners after first successful play
      document.removeEventListener("click", startMusicOnInteraction);
      document.removeEventListener("keydown", startMusicOnInteraction);
      document.removeEventListener("touchstart", startMusicOnInteraction);
    };

    // Listen for any user interaction
    document.addEventListener("click", startMusicOnInteraction);
    document.addEventListener("keydown", startMusicOnInteraction);
    document.addEventListener("touchstart", startMusicOnInteraction);
  }

  pauseBackgroundMusic(): void {
    if (this.backgroundMusic && this.isMusicPlaying) {
      this.backgroundMusic.pause();
      this.isMusicPlaying = false;
      console.log("Background music paused");
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.isMusicPlaying = false;
      console.log("Background music stopped");
    }
  }

  setMusicVolume(volume: number): void {
    if (this.backgroundMusic) {
      // Clamp volume between 0 and 1
      this.backgroundMusic.volume = Math.max(0, Math.min(1, volume));
    }
  }

  isMusicCurrentlyPlaying(): boolean {
    return !!(
      this.isMusicPlaying &&
      this.backgroundMusic &&
      !this.backgroundMusic.paused
    );
  }
}

export const soundManager = new SoundManager();
