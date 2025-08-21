import { JsfxrResource, SoundConfig } from '@excaliburjs/plugin-jsfxr';

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
    sample_size: 16
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
    sample_size: 16
  },
  unitDestroyed: {
    oldParams: true,
    wave_type: 3,
    p_env_attack: 0,
    p_env_sustain: 0.1,
    p_env_punch: 0,
    p_env_decay: 1.2,
    p_base_freq: 0.2,
    p_freq_limit: 0,
    p_freq_ramp: -0.8,
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
    sound_vol: 0.4,
    sample_rate: 44100,
    sample_size: 16
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
    p_vib_strength: 0.2,
    p_vib_speed: 6.5,
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
    sample_size: 16
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
    sound_vol: 0.6,
    sample_rate: 44100,
    sample_size: 16
  }
};

class SoundManager {
  private plugin: JsfxrResource | null = null;
  private isInitialized: boolean = false;

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
      console.warn('Failed to initialize sound manager:', error);
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

  playUnitSpawn() { this.playSound('unitSpawn'); }
  playUnitAttack() { this.playSound('unitAttack'); }
  playUnitDestroyed() { this.playSound('unitDestroyed'); }
  playBaseHit() { this.playSound('baseHit'); }
  playVictory() { this.playSound('victory'); }
}

export const soundManager = new SoundManager();