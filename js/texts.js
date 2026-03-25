/**
 * NeonType — Text / Phrase Bank
 * Contains phrases categorised by difficulty with a random picker
 */

const TextBank = (() => {
    'use strict';

    const phrases = {
        easy: [
            "The quick brown fox jumps over the lazy dog near the river bank.",
            "She sells sea shells by the sea shore during the warm summer days.",
            "A journey of a thousand miles begins with a single step forward.",
            "The sun sets in the west and rises in the east every single day.",
            "Practice makes perfect when you put in the time and effort daily.",
            "Good things come to those who wait and work hard for their goals.",
            "The early bird catches the worm before the sun rises in the sky.",
            "Every cloud has a silver lining if you look at it from the right angle.",
            "Time flies when you are having fun with friends and family around.",
            "Actions speak louder than words when it comes to showing your love.",
            "Keep your eyes on the stars and your feet on the ground always.",
            "Life is what happens when you are busy making other plans ahead.",
            "The best way to predict the future is to create it yourself today.",
            "You miss every shot you do not take so keep trying your very best.",
            "In the middle of every difficulty lies a great opportunity to grow.",
        ],
        medium: [
            "Technology is rapidly transforming the way we live, work, and communicate with each other across the entire globe.",
            "Artificial intelligence continues to evolve at an unprecedented pace, reshaping industries and creating new possibilities.",
            "The universe is under no obligation to make sense to you, but exploring it is one of humanity's greatest adventures.",
            "Programming is the art of telling another human being what one wants the computer to do in a precise manner.",
            "Innovation distinguishes between a leader and a follower, and it requires both creativity and relentless determination.",
            "The greatest glory in living lies not in never falling, but in rising every time we fall and learning from mistakes.",
            "Success is not final and failure is not fatal; it is the courage to continue that counts in the long run.",
            "The only way to do great work is to love what you do and to pursue excellence with unwavering passion.",
            "Cybersecurity threats are becoming increasingly sophisticated, requiring constant vigilance and adaptive defense strategies.",
            "Quantum computing promises to revolutionize fields from cryptography to drug discovery, unlocking new computational power.",
            "The intersection of design and technology creates experiences that are both beautiful and functional for users worldwide.",
            "Machine learning algorithms can identify patterns in vast datasets that would be impossible for humans to detect manually.",
        ],
        hard: [
            "Quantum entanglement demonstrates non-local correlations between particles that challenge our classical understanding of physics and information theory fundamentally.",
            "The implementation of microservices architecture requires careful consideration of service boundaries, data consistency, fault tolerance, and inter-service communication patterns.",
            "Neuroplasticity research has revealed that the human brain continuously reorganizes itself by forming new neural connections throughout life, adapting to experiences.",
            "Cryptographic hash functions provide a mathematical guarantee of data integrity through deterministic, fixed-length output that is computationally infeasible to reverse-engineer.",
            "The philosophical implications of artificial general intelligence raise fundamental questions about consciousness, free will, moral responsibility, and the nature of human identity.",
            "Distributed systems face the CAP theorem constraint: it is impossible to simultaneously guarantee consistency, availability, and partition tolerance in a networked shared-data system.",
            "Epigenetic modifications demonstrate that environmental factors can influence gene expression without altering the underlying DNA sequence, challenging traditional genetic determinism.",
            "The observer effect in quantum mechanics suggests that the mere act of measurement fundamentally changes the state of the system being observed, creating uncertainty.",
            "Blockchain technology utilizes cryptographic primitives, consensus mechanisms, and distributed ledger architectures to create tamper-resistant, decentralized systems for trustless transactions.",
            "The halting problem, proven undecidable by Alan Turing, demonstrates fundamental limitations in computability theory and has profound implications for software verification.",
        ],
    };

    /**
     * Get a random phrase for the given difficulty
     * @param {string} difficulty - 'easy', 'medium', or 'hard'
     * @returns {string}
     */
    function getRandomPhrase(difficulty = 'easy') {
        const pool = phrases[difficulty] || phrases.easy;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    /**
     * Get all difficulties
     * @returns {string[]}
     */
    function getDifficulties() {
        return Object.keys(phrases);
    }

    return { getRandomPhrase, getDifficulties };
})();
