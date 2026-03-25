/**
 * NeonType — Virtual Keyboard Module
 * Generates and controls the on-screen QWERTY keyboard
 */

const VirtualKeyboard = (() => {
    'use strict';

    const container = document.getElementById('virtual-keyboard');

    // Full QWERTY layout – each row is an array of [label, keyCode, widthClass?]
    const layout = [
        // Row 1: Number row
        [
            ['`', 'Backquote'], ['1', 'Digit1'], ['2', 'Digit2'], ['3', 'Digit3'],
            ['4', 'Digit4'], ['5', 'Digit5'], ['6', 'Digit6'], ['7', 'Digit7'],
            ['8', 'Digit8'], ['9', 'Digit9'], ['0', 'Digit0'], ['-', 'Minus'],
            ['=', 'Equal'], ['⌫', 'Backspace'],
        ],
        // Row 2: QWERTY
        [
            ['Tab', 'Tab'], ['Q', 'KeyQ'], ['W', 'KeyW'], ['E', 'KeyE'],
            ['R', 'KeyR'], ['T', 'KeyT'], ['Y', 'KeyY'], ['U', 'KeyU'],
            ['I', 'KeyI'], ['O', 'KeyO'], ['P', 'KeyP'], ['[', 'BracketLeft'],
            [']', 'BracketRight'], ['\\', 'Backslash'],
        ],
        // Row 3: Home row
        [
            ['Caps', 'CapsLock'], ['A', 'KeyA'], ['S', 'KeyS'], ['D', 'KeyD'],
            ['F', 'KeyF'], ['G', 'KeyG'], ['H', 'KeyH'], ['J', 'KeyJ'],
            ['K', 'KeyK'], ['L', 'KeyL'], [';', 'Semicolon'], ["'", 'Quote'],
            ['Enter', 'Enter'],
        ],
        // Row 4: Shift row
        [
            ['Shift', 'ShiftLeft'], ['Z', 'KeyZ'], ['X', 'KeyX'], ['C', 'KeyC'],
            ['V', 'KeyV'], ['B', 'KeyB'], ['N', 'KeyN'], ['M', 'KeyM'],
            [',', 'Comma'], ['.', 'Period'], ['/', 'Slash'], ['Shift', 'ShiftRight'],
        ],
        // Row 5: Space row
        [
            ['Ctrl', 'ControlLeft'], ['Alt', 'AltLeft'], ['Space', 'Space'],
            ['Alt', 'AltRight'], ['Ctrl', 'ControlRight'],
        ],
    ];

    // Map from character to key code for highlighting the next expected key
    const charToKeyCode = {};

    /**
     * Build the keyboard DOM
     */
    function init() {
        container.innerHTML = '';

        layout.forEach(row => {
            const rowEl = document.createElement('div');
            rowEl.className = 'keyboard-row';

            row.forEach(([label, code]) => {
                const key = document.createElement('button');
                key.className = 'key';
                key.dataset.key = code;
                key.textContent = label;
                key.setAttribute('tabindex', '-1');
                key.setAttribute('aria-label', label);
                rowEl.appendChild(key);

                // Build char → code map
                if (code.startsWith('Key')) {
                    const ch = code.replace('Key', '').toLowerCase();
                    charToKeyCode[ch] = code;
                    charToKeyCode[ch.toUpperCase()] = code;
                } else if (code.startsWith('Digit')) {
                    charToKeyCode[code.replace('Digit', '')] = code;
                } else if (label.length === 1) {
                    charToKeyCode[label] = code;
                }
            });

            container.appendChild(rowEl);
        });

        // Map special characters
        charToKeyCode[' '] = 'Space';
        charToKeyCode['\n'] = 'Enter';
        charToKeyCode['\t'] = 'Tab';

        // Shifted characters
        const shiftedMap = {
            '!': 'Digit1', '@': 'Digit2', '#': 'Digit3', '$': 'Digit4',
            '%': 'Digit5', '^': 'Digit6', '&': 'Digit7', '*': 'Digit8',
            '(': 'Digit9', ')': 'Digit0', '_': 'Minus', '+': 'Equal',
            '{': 'BracketLeft', '}': 'BracketRight', '|': 'Backslash',
            ':': 'Semicolon', '"': 'Quote', '<': 'Comma', '>': 'Period',
            '?': 'Slash', '~': 'Backquote',
        };
        Object.assign(charToKeyCode, shiftedMap);
    }

    /**
     * Animate a key press
     * @param {string} code - The key code (e.g. 'KeyA', 'Space')
     */
    function pressKey(code) {
        const keyEl = container.querySelector(`[data-key="${code}"]`);
        if (!keyEl) return;

        keyEl.classList.add('pressed');

        // Add ripple
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = keyEl.getBoundingClientRect();
        ripple.style.width = ripple.style.height = `${Math.max(rect.width, rect.height)}px`;
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = `-${Math.max(rect.width, rect.height) / 2}px`;
        ripple.style.marginTop = `-${Math.max(rect.width, rect.height) / 2}px`;
        keyEl.appendChild(ripple);

        setTimeout(() => {
            keyEl.classList.remove('pressed');
            ripple.remove();
        }, 200);
    }

    /**
     * Highlight the key corresponding to the next expected character
     * @param {string} char - The character to highlight
     */
    function highlightNextKey(char) {
        // Remove previous highlights
        container.querySelectorAll('.next-key').forEach(el => el.classList.remove('next-key'));

        const code = charToKeyCode[char];
        if (code) {
            const keyEl = container.querySelector(`[data-key="${code}"]`);
            if (keyEl) keyEl.classList.add('next-key');
        }
    }

    /**
     * Clear all highlights
     */
    function clearHighlights() {
        container.querySelectorAll('.next-key').forEach(el => el.classList.remove('next-key'));
        container.querySelectorAll('.pressed').forEach(el => el.classList.remove('pressed'));
    }

    /**
     * Get the key code for a character
     */
    function getKeyCode(char) {
        return charToKeyCode[char] || null;
    }

    return { init, pressKey, highlightNextKey, clearHighlights, getKeyCode };
})();
