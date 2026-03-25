/**
 * NeonType — Application Controller
 * Wires together all modules, handles events, and manages application state
 */

(function () {
    'use strict';

    // ── State ──────────────────────────────────────────
    let currentDifficulty = 'easy';
    let currentTimeLimit = 30;

    // ── DOM References ─────────────────────────────────
    const input = document.getElementById('typing-input');
    const typingCard = document.querySelector('.typing-card');
    const soundToggle = document.getElementById('sound-toggle');
    const restartBtn = document.getElementById('restart-btn');
    const newTextBtn = document.getElementById('new-text-btn');
    const modalRestartBtn = document.getElementById('modal-restart-btn');
    const resultsModal = document.getElementById('results-modal');
    const diffBtns = document.querySelectorAll('.diff-btn');
    const timeBtns = document.querySelectorAll('.time-btn');

    // Result elements
    const resultWpm = document.getElementById('result-wpm');
    const resultAccuracy = document.getElementById('result-accuracy');
    const resultChars = document.getElementById('result-chars');
    const resultErrors = document.getElementById('result-errors');
    const resultRating = document.getElementById('result-rating');

    // ── Initialise ─────────────────────────────────────
    function init() {
        // Init keyboard
        VirtualKeyboard.init();

        // Set initial time
        TypingEngine.setTimeLimit(currentTimeLimit);

        // Load first phrase
        loadNewPhrase();

        // Set up callbacks
        TypingEngine.onFinish(showResults);

        // Bind events
        bindEvents();

        // Focus input
        setTimeout(() => input.focus(), 100);
    }

    // ── Load a new phrase ──────────────────────────────
    function loadNewPhrase() {
        const phrase = TextBank.getRandomPhrase(currentDifficulty);
        TypingEngine.setTimeLimit(currentTimeLimit);
        TypingEngine.loadText(phrase);
        hideResults();
        resetTimerStyling();
    }

    // ── Reset timer styling ────────────────────────────
    function resetTimerStyling() {
        const timerEl = document.getElementById('timer-value');
        timerEl.style.color = '';
        timerEl.style.textShadow = '';
        document.getElementById('stat-timer').classList.remove('active');
    }

    // ── Show results modal ─────────────────────────────
    function showResults(stats) {
        resultWpm.textContent = stats.wpm;
        resultAccuracy.textContent = `${stats.accuracy}%`;
        resultChars.textContent = stats.correctChars;
        resultErrors.textContent = stats.errors;

        // Rating
        let rating = '';
        if (stats.wpm >= 100) rating = '🔥 LEGENDARY — You are a typing god!';
        else if (stats.wpm >= 80) rating = '⚡ BLAZING FAST — Incredible speed!';
        else if (stats.wpm >= 60) rating = '🚀 GREAT — Above average typist!';
        else if (stats.wpm >= 40) rating = '👍 GOOD — Keep practicing!';
        else if (stats.wpm >= 20) rating = '📝 AVERAGE — Room to improve!';
        else rating = '🌱 BEGINNER — Practice makes perfect!';

        resultRating.textContent = rating;
        resultsModal.classList.add('active');
    }

    function hideResults() {
        resultsModal.classList.remove('active');
    }

    // ── Event Binding ──────────────────────────────────
    function bindEvents() {

        // ── Typing input ───────────────────────────────
        input.addEventListener('input', (e) => {
            // Handle each inserted character
            const data = e.data;
            if (data && !TypingEngine.getIsFinished()) {
                for (const ch of data) {
                    TypingEngine.handleInput(ch);
                }
            }
            // Clear input so it never accumulates
            input.value = '';
        });

        input.addEventListener('keydown', (e) => {
            // Init sound on first interaction
            SoundManager.init();

            // Handle backspace
            if (e.key === 'Backspace') {
                e.preventDefault();
                TypingEngine.handleBackspace();
                VirtualKeyboard.pressKey('Backspace');
                return;
            }

            // Prevent Tab from moving focus
            if (e.key === 'Tab') {
                e.preventDefault();
            }

            // Animate the virtual keyboard key
            const code = e.code;
            if (code) {
                VirtualKeyboard.pressKey(code);
            }
        });

        // Click on typing card focuses hidden input
        typingCard.addEventListener('click', () => {
            input.focus();
        });

        // ── Sound toggle ───────────────────────────────
        soundToggle.addEventListener('click', () => {
            SoundManager.init();
            const enabled = SoundManager.toggle();
            soundToggle.classList.toggle('active', enabled);
            soundToggle.classList.toggle('muted', !enabled);
        });

        // ── Restart ────────────────────────────────────
        restartBtn.addEventListener('click', () => {
            SoundManager.play('reset');
            TypingEngine.reset();
            hideResults();
            resetTimerStyling();
            input.focus();
        });

        // ── New text ───────────────────────────────────
        newTextBtn.addEventListener('click', () => {
            SoundManager.play('reset');
            loadNewPhrase();
            input.focus();
        });

        // ── Modal restart ──────────────────────────────
        modalRestartBtn.addEventListener('click', () => {
            SoundManager.play('reset');
            loadNewPhrase();
            input.focus();
        });

        // ── Difficulty buttons ─────────────────────────
        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                diffBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentDifficulty = btn.dataset.difficulty;
                SoundManager.play('click');
                loadNewPhrase();
                input.focus();
            });
        });

        // ── Time buttons ───────────────────────────────
        timeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                timeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentTimeLimit = parseInt(btn.dataset.time, 10);
                SoundManager.play('click');
                loadNewPhrase();
                input.focus();
            });
        });

        // ── Global keyboard shortcut: Escape to restart ──
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                SoundManager.play('reset');
                loadNewPhrase();
                input.focus();
            }
        });

        // ── Close modal on overlay click ───────────────
        resultsModal.addEventListener('click', (e) => {
            if (e.target === resultsModal) {
                hideResults();
                input.focus();
            }
        });

        // ── Keep input focused ─────────────────────────
        document.addEventListener('click', (e) => {
            // Don't steal focus from buttons
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                input.focus();
            }
        });
    }

    // ── Boot ───────────────────────────────────────────
    document.addEventListener('DOMContentLoaded', init);
})();
