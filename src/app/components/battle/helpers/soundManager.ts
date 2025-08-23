import { JsfxrResource, SoundConfig } from "@excaliburjs/plugin-jsfxr";

const soundsConfig: Record<string, SoundConfig> = {
  unitSpawn: {
    oldParams: true,
    wave_type: 0,
    p_env_attack: 0.05,
    p_env_sustain: 0.2,
    p_env_punch: 0.6,
    p_env_decay: 0.5,
    p_base_freq: 0.5,
    p_freq_limit: 0,
    p_freq_ramp: 0.3,
    p_freq_dramp: 0,
    p_vib_strength: 0.2,
    p_vib_speed: 0.3,
    p_arp_mod: 0.4,
    p_arp_speed: 0.7,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0.1,
    p_pha_ramp: 0,
    p_lpf_freq: 1,
    p_lpf_ramp: 0,
    p_lpf_resonance: 0.1,
    p_hpf_freq: 0.1,
    p_hpf_ramp: 0,
    sound_vol: 0.4,
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
    wave_type: 3,
    p_env_attack: 0,
    p_env_sustain: 0.05,
    p_env_punch: 0.8,
    p_env_decay: 0.4,
    p_base_freq: 0.4,
    p_freq_limit: 0,
    p_freq_ramp: -0.4,
    p_freq_dramp: 0,
    p_vib_strength: 0.2,
    p_vib_speed: 0.1,
    p_arp_mod: 0,
    p_arp_speed: 0,
    p_duty: 0,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0,
    p_pha_ramp: 0,
    p_lpf_freq: 0.8,
    p_lpf_ramp: -0.3,
    p_lpf_resonance: 0.2,
    p_hpf_freq: 0.1,
    p_hpf_ramp: 0,
    sound_vol: 0.5,
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
    wave_type: 3,
    p_env_attack: 0.2,
    p_env_sustain: 0.1,
    p_env_punch: 0.7,
    p_env_decay: 0.6,
    p_base_freq: 0.15,
    p_freq_limit: 0,
    p_freq_ramp: -0.3,
    p_freq_dramp: 0,
    p_vib_strength: 0.4,
    p_vib_speed: 0.08,
    p_arp_mod: 0.2,
    p_arp_speed: 0.3,
    p_duty: 0.5,
    p_duty_ramp: 0,
    p_repeat_speed: 0,
    p_pha_offset: 0.3,
    p_pha_ramp: 0.1,
    p_lpf_freq: 0.6,
    p_lpf_ramp: -0.2,
    p_lpf_resonance: 0.3,
    p_hpf_freq: 0.02,
    p_hpf_ramp: 0,
    sound_vol: 0.45,
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
    this.playSound("enemySpawn");
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
      this.backgroundMusic.volume = 0.3;
      this.backgroundMusic.preload = "auto";

      this.backgroundMusic.onerror = () => {
        console.warn(`Failed to load background music: ${musicPath}`);
      };

      if (autoplay) {
        this.backgroundMusic.oncanplaythrough = () => {
          this.playBackgroundMusic();
        };
      }
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
        })
        .catch((error) => {
          console.warn(
            "🚫 Autoplay blocked by browser. Music will start on first user interaction:",
            error.message
          );
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
          })
          .catch((error) => {
            console.warn("Still failed to play music:", error);
          });
      }
      document.removeEventListener("click", startMusicOnInteraction);
      document.removeEventListener("keydown", startMusicOnInteraction);
      document.removeEventListener("touchstart", startMusicOnInteraction);
    };

    document.addEventListener("click", startMusicOnInteraction);
    document.addEventListener("keydown", startMusicOnInteraction);
    document.addEventListener("touchstart", startMusicOnInteraction);
  }

  pauseBackgroundMusic(): void {
    if (this.backgroundMusic && this.isMusicPlaying) {
      this.backgroundMusic.pause();
      this.isMusicPlaying = false;
    }
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      this.isMusicPlaying = false;
    }
  }

  setMusicVolume(volume: number): void {
    if (this.backgroundMusic) {
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
