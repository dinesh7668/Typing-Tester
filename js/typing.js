/**
 * NeonType — Typing Engine
 * Core logic for tracking input, computing stats, and managing the test lifecycle
 */

const TypingEngine = (() => {
    'use strict';

    // ── State ──────────────────────────────────────────────
    let text = '';              // The target text
    let chars = [];             // Array of <span> elements
    let currentIndex = 0;       // Where the caret is
    let errors = 0;             // Total error keypresses
    let correctChars = 0;       // Chars typed correctly
    let totalTyped = 0;         // All keypresses (for accuracy)
    let startTime = null;       // Timestamp when test started
    let timerInterval = null;   // Countdown interval reference
    let timeLimit = 30;         // Seconds for the test
    let timeLeft = 30;          // Remaining time
    let isRunning = false;      // Test in progress?
    let isFinished = false;     // Test completed?

    // ── DOM References ────────────────────────────────────
    const display = document.getElementById('typing-display');
    const input = document.getElementById('typing-input');
    const wpmEl = document.getElementById('wpm-value');
    const accuracyEl = document.getElementById('accuracy-value');
    const timerEl = document.getElementById('timer-value');
    const errorsEl = document.getElementById('errors-value');
    const progressBar = document.getElementById('progress-bar');
    const progressGlow = document.getElementById('progress-glow');

    // ── Callbacks ─────────────────────────────────────────
    let onFinishCallback = null;

    /**
     * Load a new text into the display
     * @param {string} newText
     */
    function loadText(newText) {
        text = newText;
        currentIndex = 0;
        errors = 0;
        correctChars = 0;
        totalTyped = 0;
        startTime = null;
        isRunning = false;
        isFinished = false;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        timeLeft = timeLimit;

        // Build character spans
        display.innerHTML = '';
        chars = [];

        text.split('').forEach((ch, i) => {
            const span = document.createElement('span');
            span.className = 'char pending';
            span.textContent = ch;
            if (i === 0) span.classList.replace('pending', 'current');
            display.appendChild(span);
            chars.push(span);
        });

        // Reset stats
        updateStats();
        updateProgress();

        // Reset input
        input.value = '';
        input.focus();

        // Highlight first key
        if (chars.length > 0) {
            VirtualKeyboard.highlightNextKey(text[0]);
        }
    }

    /**
     * Set time limit
     */
    function setTimeLimit(seconds) {
        timeLimit = seconds;
        timeLeft = seconds;
        timerEl.textContent = seconds;
    }

    /**
     * Handle a character input
     * @param {string} typedChar
     */
    function handleInput(typedChar) {
        if (isFinished || currentIndex >= text.length) return;

        // Start timer on first keypress
        if (!isRunning) {
            isRunning = true;
            startTime = performance.now();
            startTimer();

            // Activate timer stat card
            document.getElementById('stat-timer').classList.add('active');
        }

        const expectedChar = text[currentIndex];
        totalTyped++;

        if (typedChar === expectedChar) {
            // Correct
            chars[currentIndex].classList.remove('current', 'pending');
            chars[currentIndex].classList.add('correct');
            correctChars++;
            SoundManager.play('click');
        } else {
            // Incorrect
            chars[currentIndex].classList.remove('current', 'pending');
            chars[currentIndex].classList.add('incorrect');
            errors++;
            SoundManager.play('error');
        }

        currentIndex++;

        // Move caret or finish
        if (currentIndex < text.length) {
            chars[currentIndex].classList.remove('pending');
            chars[currentIndex].classList.add('current');
            VirtualKeyboard.highlightNextKey(text[currentIndex]);
        } else {
            // Completed all text
            finishTest();
        }

        updateStats();
        updateProgress();

        // Auto-scroll display to keep current char visible
        scrollToCurrentChar();
    }

    /**
     * Handle backspace
     */
    function handleBackspace() {
        if (isFinished || currentIndex <= 0) return;

        // Remove current marker
        if (currentIndex < text.length) {
            chars[currentIndex].classList.remove('current');
            chars[currentIndex].classList.add('pending');
        }

        currentIndex--;

        // Reset the character
        const wasIncorrect = chars[currentIndex].classList.contains('incorrect');
        chars[currentIndex].classList.remove('correct', 'incorrect');
        chars[currentIndex].classList.add('current');

        if (wasIncorrect && errors > 0) {
            errors--;
        } else if (correctChars > 0) {
            correctChars--;
        }

        if (totalTyped > 0) totalTyped--;

        VirtualKeyboard.highlightNextKey(text[currentIndex]);
        SoundManager.play('click');
        updateStats();
        updateProgress();
        scrollToCurrentChar();
    }

    /**
     * Start the countdown timer
     */
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerEl.textContent = timeLeft;

            if (timeLeft <= 10) {
                document.getElementById('stat-timer').style.setProperty('--pulse', '1');
                timerEl.style.color = 'var(--clr-primary)';
                timerEl.style.textShadow = '0 0 15px var(--clr-primary-glow)';
            }

            if (timeLeft <= 0) {
                finishTest();
            }
        }, 1000);
    }

    /**
     * Finish the test
     */
    function finishTest() {
        isFinished = true;
        isRunning = false;

        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        VirtualKeyboard.clearHighlights();
        SoundManager.play('success');

        // Compute final stats
        const stats = getStats();

        if (onFinishCallback) {
            onFinishCallback(stats);
        }
    }

    /**
     * Calculate current stats
     */
    function getStats() {
        const elapsed = startTime ? (performance.now() - startTime) / 1000 : 0;
        const minutes = elapsed / 60 || 1 / 60;

        // Standard WPM: (correct chars / 5) / minutes
        const wpm = Math.round((correctChars / 5) / minutes);
        const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 100;

        return {
            wpm: isNaN(wpm) ? 0 : wpm,
            accuracy,
            errors,
            correctChars,
            totalTyped,
            elapsed: Math.round(elapsed),
            timeLeft,
        };
    }

    /**
     * Update the stats display
     */
    function updateStats() {
        const stats = getStats();

        wpmEl.textContent = stats.wpm;
        accuracyEl.innerHTML = `${stats.accuracy}<span class="stat-unit">%</span>`;
        errorsEl.textContent = stats.errors;

        // Activate stat cards with values
        document.getElementById('stat-wpm').classList.toggle('active', stats.wpm > 0);
        document.getElementById('stat-accuracy').classList.toggle('active', stats.totalTyped > 0);
        document.getElementById('stat-errors').classList.toggle('active', stats.errors > 0);
    }

    /**
     * Update progress bar
     */
    function updateProgress() {
        const pct = text.length > 0 ? (currentIndex / text.length) * 100 : 0;
        progressBar.style.width = `${pct}%`;
        progressGlow.style.left = `${pct}%`;
        progressGlow.style.opacity = pct > 0 ? '0.6' : '0';
    }

    /**
     * Scroll display to keep current character in view
     */
    function scrollToCurrentChar() {
        if (currentIndex < chars.length) {
            chars[currentIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    /**
     * Reset the engine (without changing text)
     */
    function reset() {
        loadText(text);
    }

    /**
     * Set callback for when test finishes
     */
    function onFinish(cb) {
        onFinishCallback = cb;
    }

    /**
     * Expose state getters
     */
    function getIsRunning() { return isRunning; }
    function getIsFinished() { return isFinished; }

    return {
        loadText,
        setTimeLimit,
        handleInput,
        handleBackspace,
        reset,
        getStats,
        onFinish,
        getIsRunning,
        getIsFinished,
    };
})();
