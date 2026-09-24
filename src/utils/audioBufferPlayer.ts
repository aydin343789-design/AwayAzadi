/**
 * Robust Web Audio API player for playing AudioBuffers and raw audio Blobs (MP3, WAV).
 * Avoids HTMLMediaElement / new Audio() iframe sandbox and autoplay restrictions.
 */

export class AudioBufferPlayer {
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentBuffer: AudioBuffer | null = null;
  private startTime = 0;
  private pauseOffset = 0;
  private _isPlaying = false;
  private _isPaused = false;
  private onEndListener: (() => void) | null = null;

  public getContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch((e) => console.warn('AudioContext resume warning:', e));
    }
    return this.ctx;
  }

  public isPlaying(): boolean {
    return this._isPlaying;
  }

  public isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * Decodes an ArrayBuffer or Blob into an AudioBuffer using AudioContext
   */
  public async decodeAudio(data: Blob | ArrayBuffer): Promise<AudioBuffer> {
    const ctx = this.getContext();
    const arrayBuffer = data instanceof Blob ? await data.arrayBuffer() : data;
    // Make a copy since decodeAudioData detaches the buffer in some browsers
    const bufferCopy = arrayBuffer.slice(0);
    return await ctx.decodeAudioData(bufferCopy);
  }

  /**
   * Plays an AudioBuffer from the beginning or a specified offset
   */
  public playBuffer(buffer: AudioBuffer, onEnded?: () => void, startOffset = 0): void {
    this.stop();
    const ctx = this.getContext();

    this.currentBuffer = buffer;
    this.onEndListener = onEnded || null;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    source.onended = () => {
      // Check if finished naturally
      if (this._isPlaying && !this._isPaused) {
        this._isPlaying = false;
        this._isPaused = false;
        this.currentSource = null;
        if (this.onEndListener) {
          this.onEndListener();
        }
      }
    };

    this.currentSource = source;
    this.startTime = ctx.currentTime - startOffset;
    this.pauseOffset = startOffset;
    this._isPlaying = true;
    this._isPaused = false;

    source.start(0, startOffset);
  }

  /**
   * Decodes and plays a Blob (e.g. from ElevenLabs MP3 or local synthesis)
   */
  public async playBlob(blob: Blob, onEnded?: () => void): Promise<void> {
    const buffer = await this.decodeAudio(blob);
    this.playBuffer(buffer, onEnded, 0);
  }

  /**
   * Pauses the current playback
   */
  public pause(): void {
    if (!this._isPlaying || this._isPaused || !this.ctx || !this.currentSource) return;

    const elapsed = this.ctx.currentTime - this.startTime;
    this.pauseOffset = Math.max(0, elapsed);
    this._isPaused = true;
    this._isPlaying = false;

    try {
      this.currentSource.stop();
    } catch {
      // Ignore if already stopped
    }
    this.currentSource = null;
  }

  /**
   * Resumes playback from the paused position
   */
  public resume(): void {
    if (!this._isPaused || !this.currentBuffer) return;
    this.playBuffer(this.currentBuffer, this.onEndListener || undefined, this.pauseOffset);
  }

  /**
   * Completely stops playback and resets state
   */
  public stop(): void {
    if (this.currentSource) {
      try {
        this.currentSource.onended = null;
        this.currentSource.stop();
      } catch {
        // Ignore if already stopped
      }
      this.currentSource = null;
    }
    this._isPlaying = false;
    this._isPaused = false;
    this.pauseOffset = 0;
    this.currentBuffer = null;
    this.onEndListener = null;
  }
}

export const globalAudioPlayer = new AudioBufferPlayer();
