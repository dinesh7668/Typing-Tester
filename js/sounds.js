/**
 * NeonType — Sound System
 * Generates lightweight synthesised click sounds using Web Audio API
 * No external audio files needed
 */

const SoundManager = (() => {
    'use strict';

    let audioCtx = null;
    let enabled = true;
    let volume = 0.08;

    /**
     * Initialize AudioContext on first user interaction
     */
    function init() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    /**
     * Play a futuristic key click sound
     * @param {string} type - 'click', 'error', 'success', 'reset'
     */
    function play(type = 'click') {
        if (!enabled || !audioCtx) return;

        const now = audioCtx.currentTime;

        switch (type) {
            case 'click':
                playClick(now);
                break;
            case 'error':
                playError(now);
                break;
            case 'success':
                playSuccess(now);
                break;
            case 'reset':
                playReset(now);
                break;
        }
    }

    /* Soft futuristic click */
    function playClick(now) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.06);

        gain.gain.setValueAtTime(volume, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.08);
    }

    /* Error beep */
    function playError(now) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1);

        gain.gain.setValueAtTime(volume * 0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.12);
    }

    /* Success chime */
    function playSuccess(now) {
        [600, 800, 1000].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const start = now + i * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(volume * 0.5, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(start);
            osc.stop(start + 0.15);
        });
    }

    /* Reset whoosh */
    function playReset(now) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.2);

        gain.gain.setValueAtTime(volume * 0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.25);
    }

    /**
     * Toggle sound on/off
     */
    function toggle() {
        enabled = !enabled;
        return enabled;
    }

    /**
     * Check if sound is enabled
     */
    function isEnabled() {
        return enabled;
    }

    return { init, play, toggle, isEnabled };
})();
