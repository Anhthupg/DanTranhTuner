/**
 * Đàn Tranh Tuner - Main Application
 * Supports 1-30 strings with customizable tunings including microtones
 */

// Tuning presets based on traditional Đàn Tranh configurations
const TUNING_PRESETS = {
    standard16: {
        name: "Standard 16-String (Bắc)",
        strings: [
            "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4",
            "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6"
        ]
    },
    standard17: {
        name: "Standard 17-String",
        strings: [
            "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4", "G4",
            "A4", "C5", "D5", "E5", "G5", "A5", "C6", "D6"
        ]
    },
    standard21: {
        name: "Standard 21-String",
        strings: [
            "C3", "D3", "E3", "F3", "G3", "A3", "B3",
            "C4", "D4", "E4", "F4", "G4", "A4", "B4",
            "C5", "D5", "E5", "F5", "G5", "A5", "B5"
        ]
    },
    pentatonic: {
        name: "Pentatonic (C-D-E-G-A)",
        strings: [
            "C3", "D3", "E3", "G3", "A3", "C4", "D4", "E4",
            "G4", "A4", "C5", "D5", "E5", "G5", "A5", "C6"
        ]
    }
};

// Note frequency mapping (A4 = 440Hz standard)
class NoteFrequencyMap {
    constructor(a4Frequency = 440) {
        this.a4Frequency = a4Frequency;
        this.cache = {};
        this.buildNoteMap();
    }

    buildNoteMap() {
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const a4Midi = 69; // MIDI note number for A4

        // Generate notes from C0 to B8
        for (let octave = 0; octave <= 8; octave++) {
            for (let i = 0; i < noteNames.length; i++) {
                const noteName = noteNames[i] + octave;
                const midiNote = (octave + 1) * 12 + i;
                const semitoneOffset = midiNote - a4Midi;
                const frequency = this.a4Frequency * Math.pow(2, semitoneOffset / 12);

                this.cache[noteName] = {
                    midi: midiNote,
                    frequency: frequency,
                    note: noteNames[i],
                    octave: octave
                };

                // Add flat notation (Db = C#, etc.)
                if (noteNames[i].includes('#')) {
                    const flatNote = this.sharpToFlat(noteNames[i]) + octave;
                    this.cache[flatNote] = this.cache[noteName];
                }
            }
        }
    }

    sharpToFlat(sharpNote) {
        const map = {
            'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
        };
        return map[sharpNote] || sharpNote;
    }

    getFrequency(note, centsOffset = 0) {
        const baseFreq = this.cache[note]?.frequency;
        if (!baseFreq) return null;

        // Apply microtonal adjustment if specified
        if (centsOffset !== 0) {
            return baseFreq * Math.pow(2, centsOffset / 1200);
        }

        return baseFreq;
    }

    getNoteFromFrequency(frequency) {
        // Find closest note
        let closestNote = null;
        let minDiff = Infinity;

        for (const [noteName, noteData] of Object.entries(this.cache)) {
            // Skip flat notes (duplicates)
            if (noteName.includes('b')) continue;

            const diff = Math.abs(noteData.frequency - frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closestNote = { name: noteName, ...noteData };
            }
        }

        return closestNote;
    }

    getCentsOffset(frequency, targetFrequency) {
        return 1200 * Math.log2(frequency / targetFrequency);
    }
}

// Main Tuner Application
class DanTranhTuner {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.yinDetector = null;
        this.isListening = false;
        this.animationFrame = null;

        this.noteMap = new NoteFrequencyMap(440);
        this.strings = [];
        this.currentDetectedFreq = null;

        // Frequency smoothing buffer
        this.frequencyHistory = [];
        this.historySize = 10; // Average over last 10 readings
        this.minConfidenceReadings = 3; // Need 3 stable readings before showing

        // Spectrogram data for each string
        this.spectrogramData = {}; // { stringIndex: [freq1, freq2, ...] }
        this.spectrogramMaxLength = 100; // Keep last 100 readings

        // Attack detection for color changes
        this.lastAmplitude = 0;
        this.attackThreshold = 0.02; // Adjustable sensitivity - default lower
        this.currentColor = 0;
        this.colors = [
            '#1a5490', // Deep Blue
            '#8B0000', // Deep Red
            '#4B0082', // Deep Purple/Indigo
            '#B8860B', // Deep Gold
            '#006400', // Deep Green
            '#8B4513', // Deep Brown
            '#2F4F4F', // Deep Slate
            '#800080', // Deep Purple
            '#A0522D', // Deep Sienna
            '#483D8B', // Deep Slate Blue
            '#8B008B', // Deep Magenta
            '#556B2F'  // Deep Olive
        ];

        // Track attack segments for labeling
        this.currentAttackStart = {}; // { stringIndex: dataIndex }
        this.currentAttackColor = {}; // { stringIndex: colorIndex }
        this.attackLabels = {}; // { stringIndex: [label elements] }
        this.wasDetecting = {}; // { stringIndex: boolean } - track if we were detecting signal

        this.initializeElements();
        this.attachEventListeners();
        this.generateStrings();
    }

    initializeElements() {
        this.elements = {
            numStrings: document.getElementById('numStrings'),
            tuningPreset: document.getElementById('tuningPreset'),
            baseFreq: document.getElementById('baseFreq'),
            generateBtn: document.getElementById('generateStrings'),
            startBtn: document.getElementById('startBtn'),
            customSection: document.getElementById('customTuningSection'),
            stringConfigs: document.getElementById('stringConfigs'),
            svg: document.getElementById('tunerSvg'),
            stringsGroup: document.getElementById('stringsGroup'),
            detectedPitch: document.getElementById('detectedPitch'),
            detectedFreq: document.getElementById('detectedFreq'),
            tuningBar: document.getElementById('tuningBar'),
            sensitivity: document.getElementById('sensitivity'),
            sensitivityValue: document.getElementById('sensitivityValue')
        };
    }

    attachEventListeners() {
        this.elements.generateBtn.addEventListener('click', () => this.generateStrings());
        this.elements.startBtn.addEventListener('click', () => this.toggleListening());
        this.elements.tuningPreset.addEventListener('change', () => this.handlePresetChange());
        this.elements.baseFreq.addEventListener('change', () => this.updateBaseFrequency());
        this.elements.sensitivity.addEventListener('input', (e) => {
            this.attackThreshold = parseFloat(e.target.value);
            this.elements.sensitivityValue.textContent = e.target.value;
        });
    }

    handlePresetChange() {
        const preset = this.elements.tuningPreset.value;

        if (preset === 'custom') {
            this.elements.customSection.style.display = 'block';
            this.generateCustomTuningInputs();
        } else {
            this.elements.customSection.style.display = 'none';
            const presetData = TUNING_PRESETS[preset];
            if (presetData) {
                this.elements.numStrings.value = presetData.strings.length;
            }
        }
    }

    generateCustomTuningInputs() {
        const numStrings = parseInt(this.elements.numStrings.value);
        this.elements.stringConfigs.innerHTML = '';

        for (let i = 1; i <= numStrings; i++) {
            const item = document.createElement('div');
            item.className = 'string-config-item';
            item.innerHTML = `
                <label>S${i}:</label>
                <input type="text" id="string${i}" placeholder="C4+0" value="C${3 + Math.floor(i / 5)}">
            `;
            this.elements.stringConfigs.appendChild(item);
        }
    }

    updateBaseFrequency() {
        const newFreq = parseFloat(this.elements.baseFreq.value);
        this.noteMap = new NoteFrequencyMap(newFreq);
        this.generateStrings();
    }

    generateStrings() {
        const numStrings = parseInt(this.elements.numStrings.value);
        const preset = this.elements.tuningPreset.value;

        this.strings = [];

        if (preset === 'custom') {
            // First generate custom tuning inputs if needed
            this.generateCustomTuningInputs();

            // Read custom tuning from inputs
            for (let i = 1; i <= numStrings; i++) {
                const input = document.getElementById(`string${i}`);
                const tuning = input ? input.value : `C${3 + Math.floor(i / 5)}`;
                this.strings.push(this.parseNoteWithCents(tuning));
            }
        } else {
            // Use preset - but respect numStrings for adjustable presets
            const presetData = TUNING_PRESETS[preset];
            if (presetData) {
                // If user changed number of strings, adjust the preset
                const baseStrings = presetData.strings.map(note => this.parseNoteWithCents(note));

                if (numStrings <= baseStrings.length) {
                    this.strings = baseStrings.slice(0, numStrings);
                } else {
                    // Extend the pattern if user wants more strings
                    this.strings = [...baseStrings];
                    const lastNote = baseStrings[baseStrings.length - 1];
                    const lastMidi = this.noteMap.cache[lastNote.note]?.midi || 60;

                    for (let i = baseStrings.length; i < numStrings; i++) {
                        const nextMidi = lastMidi + (i - baseStrings.length + 1) * 2; // Whole step increments
                        const nextNote = this.midiToNote(nextMidi);
                        this.strings.push(this.parseNoteWithCents(nextNote));
                    }
                }
            }
        }

        this.renderStrings();
    }

    parseNoteWithCents(noteString) {
        // Parse formats like "C4", "C4+15", "C4-10"
        const match = noteString.match(/^([A-G][#b]?\d)([+-]\d+)?$/);

        if (!match) {
            return { note: 'C4', cents: 0, frequency: 261.63 };
        }

        const note = match[1];
        const cents = match[2] ? parseInt(match[2]) : 0;
        const frequency = this.noteMap.getFrequency(note, cents);

        return { note, cents, frequency };
    }

    renderStrings() {
        const svgNS = 'http://www.w3.org/2000/svg';
        this.elements.stringsGroup.innerHTML = '';

        const width = 1200;
        const margin = 100;

        // Calculate Y positions based on MIDI semitone spacing
        const stringPositions = this.calculateStringPositions();
        const totalHeight = Math.max(600, stringPositions[stringPositions.length - 1] + margin);

        // Update SVG viewBox
        this.elements.svg.setAttribute('viewBox', `0 0 1200 ${totalHeight}`);

        this.strings.forEach((stringData, index) => {
            const y = stringPositions[index];

            // String line
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', margin);
            line.setAttribute('x2', width - margin);
            line.setAttribute('y1', y);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'string-line');
            line.setAttribute('data-string-index', index);

            // String label (left side)
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', margin - 10);
            label.setAttribute('y', y + 5);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'string-label');
            const labelText = stringData.cents !== 0
                ? `${index + 1}: ${stringData.note}${stringData.cents > 0 ? '+' : ''}${stringData.cents}`
                : `${index + 1}: ${stringData.note}`;
            label.textContent = labelText;

            // Frequency display (right side)
            const freqDisplay = document.createElementNS(svgNS, 'text');
            freqDisplay.setAttribute('x', width - margin + 10);
            freqDisplay.setAttribute('y', y + 5);
            freqDisplay.setAttribute('text-anchor', 'start');
            freqDisplay.setAttribute('class', 'frequency-display');
            freqDisplay.setAttribute('id', `freq-${index}`);
            freqDisplay.textContent = `${stringData.frequency.toFixed(2)} Hz`;

            // Add full-width spectrogram
            const spectrogramWidth = width - 2 * margin;
            const spectrogramHeight = 30;
            const spectrogramX = margin;
            const spectrogramY = y - spectrogramHeight / 2;

            // Background for spectrogram
            const spectrogramBg = document.createElementNS(svgNS, 'rect');
            spectrogramBg.setAttribute('x', spectrogramX);
            spectrogramBg.setAttribute('y', spectrogramY);
            spectrogramBg.setAttribute('width', spectrogramWidth);
            spectrogramBg.setAttribute('height', spectrogramHeight);
            spectrogramBg.setAttribute('fill', '#f8f8f8');
            spectrogramBg.setAttribute('stroke', 'none');
            spectrogramBg.setAttribute('opacity', 0.5);

            // Target frequency line (center) - this is the string itself
            // No need for separate line since the string line serves this purpose

            // Polyline for frequency history
            const spectrogramLine = document.createElementNS(svgNS, 'polyline');
            spectrogramLine.setAttribute('id', `spectrogram-${index}`);
            spectrogramLine.setAttribute('fill', 'none');
            spectrogramLine.setAttribute('stroke', this.colors[0]);
            spectrogramLine.setAttribute('stroke-width', 3);
            spectrogramLine.setAttribute('points', '');

            this.elements.stringsGroup.appendChild(spectrogramBg);
            this.elements.stringsGroup.appendChild(spectrogramLine);
            this.elements.stringsGroup.appendChild(line);
            this.elements.stringsGroup.appendChild(label);
            this.elements.stringsGroup.appendChild(freqDisplay);

            // Initialize spectrogram data
            this.spectrogramData[index] = [];
        });
    }

    calculateStringPositions() {
        // Calculate Y positions based on semitone spacing
        // Each semitone gets equal visual spacing for proportional representation

        const margin = 100;
        const pixelsPerSemitone = 15; // Adjust this for tighter/looser spacing

        // Get MIDI numbers for all strings
        const midiNumbers = this.strings.map(stringData => {
            const noteInfo = this.noteMap.cache[stringData.note];
            return noteInfo ? noteInfo.midi : 60;
        });

        // Find the lowest MIDI note (will be at top)
        const lowestMidi = Math.min(...midiNumbers);

        // Calculate positions - lower pitch = higher on screen (lower Y value)
        const positions = midiNumbers.map(midi => {
            const semitoneOffset = midi - lowestMidi;
            return margin + semitoneOffset * pixelsPerSemitone;
        });

        return positions;
    }

    midiToNote(midiNumber) {
        // Convert MIDI number back to note name
        const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const octave = Math.floor(midiNumber / 12) - 1;
        const noteIndex = midiNumber % 12;
        return noteNames[noteIndex] + octave;
    }

    async toggleListening() {
        if (this.isListening) {
            this.stopListening();
        } else {
            await this.startListening();
        }
    }

    async startListening() {
        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.microphone = this.audioContext.createMediaStreamSource(stream);

            // Create analyser
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 4096; // Larger for better low-frequency resolution
            this.microphone.connect(this.analyser);

            // Initialize YIN detector
            this.yinDetector = new YINDetector(this.audioContext.sampleRate, 2048);

            this.isListening = true;
            this.elements.startBtn.textContent = 'Stop Listening';
            this.elements.startBtn.classList.add('listening');

            // Start detection loop
            this.detectPitch();
        } catch (error) {
            console.error('Error accessing microphone:', error);
            alert('Could not access microphone. Please grant permission and try again.');
        }
    }

    stopListening() {
        this.isListening = false;

        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }

        if (this.microphone) {
            this.microphone.disconnect();
        }

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.elements.startBtn.textContent = 'Start Listening';
        this.elements.startBtn.classList.remove('listening');

        // Reset displays
        this.resetDisplays();
    }

    detectPitch() {
        if (!this.isListening) return;

        // Get time domain data
        const bufferLength = this.analyser.fftSize;
        const buffer = new Float32Array(bufferLength);
        this.analyser.getFloatTimeDomainData(buffer);

        // Calculate current amplitude (RMS)
        const rms = this.calculateRMS(buffer);

        // Track a baseline amplitude that smoothly follows RMS
        if (!this.baselineAmplitude) this.baselineAmplitude = 0;

        // Slowly move baseline towards RMS (exponential moving average)
        this.baselineAmplitude = this.baselineAmplitude * 0.9 + rms * 0.1;

        // DEBUG: Log RMS periodically
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 60 === 0) { // Every ~1 second
            const ratio = this.baselineAmplitude > 0.001 ? (rms/this.baselineAmplitude).toFixed(2) : '0.00';
            console.log(`🔊 RMS: ${rms.toFixed(4)}, Baseline: ${this.baselineAmplitude.toFixed(4)}, Ratio: ${ratio}`);
        }

        // Detect attack (new pluck) - only trigger on significant sound
        // Attack must have:
        // 1. Minimum RMS threshold (actual sound, not noise)
        // 2. RMS significantly higher than baseline (sudden spike)
        // 3. Cooldown period to avoid rapid re-triggering

        const minSoundThreshold = 0.003; // Minimum to be considered sound (lowered further)
        const attackRatio = this.baselineAmplitude > 0.001 ? rms / this.baselineAmplitude : 0;
        const isAttack = attackRatio > 1.8; // RMS is 1.8x higher than baseline = attack
        const hasEnoughSound = rms > minSoundThreshold;

        // Cooldown mechanism - don't detect attacks too quickly
        if (!this.lastAttackTime) this.lastAttackTime = 0;
        const now = Date.now();
        const timeSinceLastAttack = now - this.lastAttackTime;
        const cooldownPeriod = 300; // ms - minimum time between attacks

        // Track whether we are currently in a sound segment
        if (!this.isPlaying) this.isPlaying = false;

        if (hasEnoughSound && isAttack && timeSinceLastAttack > cooldownPeriod) {
            // Attack detected! Change color and mark new segment start
            this.currentColor = (this.currentColor + 1) % this.colors.length;
            this.isNewAttack = true;
            this.isPlaying = true;
            this.lastAttackTime = now;
            console.log(`🎵 ATTACK DETECTED! Color: ${this.currentColor}, RMS: ${rms.toFixed(4)}, Ratio: ${attackRatio.toFixed(2)}`);
        }

        // Detect frequency using YIN algorithm
        const frequency = this.yinDetector.detect(buffer);

        // Track if we're currently detecting frequency (drawing)
        const isDetecting = frequency > 0;

        if (frequency > 0) {
            // Add to history
            this.frequencyHistory.push(frequency);
            if (this.frequencyHistory.length > this.historySize) {
                this.frequencyHistory.shift();
            }

            // Only update display if we have enough stable readings
            if (this.frequencyHistory.length >= this.minConfidenceReadings) {
                // Calculate median frequency (more robust than mean)
                const sortedFreqs = [...this.frequencyHistory].sort((a, b) => a - b);
                const medianFreq = sortedFreqs[Math.floor(sortedFreqs.length / 2)];

                this.currentDetectedFreq = medianFreq;
                this.updateDisplay(medianFreq);
            }
        } else {
            // Clear history when no signal
            this.frequencyHistory = [];
            this.resetDisplays();
        }

        // Detect when drawing STOPS (frequency detection stops)
        if (!this.wasDetecting) this.wasDetecting = false;

        if (this.wasDetecting && !isDetecting) {
            // Drawing just stopped - add label now
            console.log(`🛑 DRAWING STOPPED!`);

            if (this.lastActiveString !== undefined) {
                const stringIndex = this.lastActiveString;
                const currentDataLength = this.spectrogramData[stringIndex]?.length || 0;
                const segmentStart = this.currentAttackStart[stringIndex];
                const segmentColor = this.currentAttackColor[stringIndex];

                console.log(`📍 Adding label to string ${stringIndex}, data length: ${currentDataLength}, segment start: ${segmentStart}`);

                // Add label at the END of the drawing
                if (segmentStart !== undefined && this.spectrogramData[stringIndex] && currentDataLength > 0) {
                    const data = this.spectrogramData[stringIndex];
                    const endIndex = data.length - 1;

                    if (endIndex >= segmentStart && data[endIndex]) {
                        const segmentFreq = data[endIndex];
                        console.log(`📍 Adding label at index: ${endIndex}, color: ${segmentColor}`);
                        this.addPitchLabel(stringIndex, endIndex, segmentFreq, segmentColor !== undefined ? segmentColor : this.currentColor);
                    } else {
                        console.log(`⏩ Skipping label: no valid segment data`);
                    }
                } else {
                    console.log(`⏭️ No segment to label`);
                }
            }
        }

        // Update detection state for next frame
        this.wasDetecting = isDetecting;

        // Continue detection loop
        this.animationFrame = requestAnimationFrame(() => this.detectPitch());
    }

    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    updateDisplay(frequency) {
        // Update detected frequency
        this.elements.detectedFreq.textContent = `${frequency.toFixed(2)} Hz`;

        // Find closest note
        const closestNote = this.noteMap.getNoteFromFrequency(frequency);

        if (closestNote) {
            // Calculate cents offset from the closest note
            const centsOffset = this.noteMap.getCentsOffset(frequency, closestNote.frequency);

            // Format pitch display: "C4+7" or "C4-12" or "C4" if within ±1 cent
            let pitchDisplay = closestNote.name;
            if (Math.abs(centsOffset) >= 1) {
                const centsRounded = Math.round(centsOffset);
                pitchDisplay += (centsRounded >= 0 ? '+' : '') + centsRounded;
            }

            this.elements.detectedPitch.textContent = pitchDisplay;

            // Find closest string for spectrogram update
            let closestString = null;
            let minCentsDiff = Infinity;

            this.strings.forEach((stringData, index) => {
                const centsDiff = this.noteMap.getCentsOffset(frequency, stringData.frequency);
                if (Math.abs(centsDiff) < Math.abs(minCentsDiff)) {
                    minCentsDiff = centsDiff;
                    closestString = { index, ...stringData };
                }
            });

            if (closestString) {
                // Update tuning bar (centered at 50%, ±50 cents range)
                const barPosition = 50 + (minCentsDiff / 50) * 50;
                this.elements.tuningBar.style.width = `${Math.max(0, Math.min(100, barPosition))}%`;

                // Track the last active string
                this.lastActiveString = closestString.index;

                // Update spectrogram for this string
                this.updateSpectrogram(closestString.index, frequency);
            }
        }
    }

    updateSpectrogram(stringIndex, frequency) {
        const stringData = this.strings[stringIndex];
        if (!stringData) return;

        // Initialize attack tracking for this string
        if (!this.attackLabels[stringIndex]) {
            this.attackLabels[stringIndex] = [];
        }

        // Track new attack start
        if (this.isNewAttack) {
            // Mark new segment start
            this.currentAttackStart[stringIndex] = this.spectrogramData[stringIndex]?.length || 0;
            this.currentAttackColor[stringIndex] = this.currentColor; // Store the color for this attack
            this.isNewAttack = false;
            console.log(`⚡ New attack! String ${stringIndex}, start index: ${this.currentAttackStart[stringIndex]}, color: ${this.currentColor}`);
        }

        // Add frequency to history
        if (!this.spectrogramData[stringIndex]) {
            this.spectrogramData[stringIndex] = [];
        }
        this.spectrogramData[stringIndex].push(frequency);

        // Keep only recent data
        if (this.spectrogramData[stringIndex].length > this.spectrogramMaxLength) {
            this.spectrogramData[stringIndex].shift();

            // Adjust attack start index
            if (this.currentAttackStart[stringIndex] !== undefined) {
                this.currentAttackStart[stringIndex] = Math.max(0, this.currentAttackStart[stringIndex] - 1);
            }

            // Remove old labels that have scrolled off
            const oldLabel = this.attackLabels[stringIndex].shift();
            if (oldLabel) {
                if (oldLabel.bg) oldLabel.bg.remove();
                if (oldLabel.text) oldLabel.text.remove();
            }
        }

        // Update the polyline
        const spectrogramLine = document.getElementById(`spectrogram-${stringIndex}`);
        if (!spectrogramLine) return;

        const data = this.spectrogramData[stringIndex];
        const width = 1200;
        const margin = 100;
        const spectrogramWidth = width - 2 * margin;
        const spectrogramHeight = 30;
        const spectrogramX = margin;

        // Get string position
        const stringPositions = this.calculateStringPositions();
        const stringY = stringPositions[stringIndex];

        // Calculate cent range for Y-axis (±50 cents)
        const targetFreq = stringData.frequency;
        const points = data.map((freq, i) => {
            const x = spectrogramX + (i / this.spectrogramMaxLength) * spectrogramWidth;
            const cents = this.noteMap.getCentsOffset(freq, targetFreq);
            // Map ±50 cents to ±spectrogramHeight/2
            const yOffset = (cents / 50) * (spectrogramHeight / 2);
            const y = stringY + yOffset;
            return `${x},${y}`;
        }).join(' ');

        spectrogramLine.setAttribute('points', points);

        // Use current color from attack detection
        const currentStrokeColor = this.colors[this.currentColor];
        spectrogramLine.setAttribute('stroke', currentStrokeColor);
        spectrogramLine.setAttribute('stroke-width', '4');

        // Also update the frequency display color to match
        const freqDisplay = document.getElementById(`freq-${stringIndex}`);
        if (freqDisplay) {
            freqDisplay.setAttribute('fill', currentStrokeColor);
        }
    }

    addPitchLabel(stringIndex, dataIndex, freq, colorIndex) {
        const svgNS = 'http://www.w3.org/2000/svg';

        if (!freq || freq <= 0) return;

        const closestNote = this.noteMap.getNoteFromFrequency(freq);

        if (!closestNote) return;

        // Calculate cents offset
        const centsOffset = this.noteMap.getCentsOffset(freq, closestNote.frequency);

        // Format pitch display
        let pitchDisplay = closestNote.name;
        if (Math.abs(centsOffset) >= 1) {
            const centsRounded = Math.round(centsOffset);
            pitchDisplay += (centsRounded >= 0 ? '+' : '') + centsRounded;
        }

        // Calculate position - use CURRENT data length for scrolling effect
        const width = 1200;
        const margin = 100;
        const spectrogramWidth = width - 2 * margin;
        const spectrogramX = margin;
        const data = this.spectrogramData[stringIndex];

        // Calculate x based on CURRENT position in the scrolling buffer
        // The line end is always at the rightmost position of the current data
        const currentDataLength = data.length;
        const relativePosition = currentDataLength > this.spectrogramMaxLength
            ? this.spectrogramMaxLength - 1  // If scrolling, always at the right edge
            : dataIndex;  // If not scrolling yet, use actual index

        const x = spectrogramX + (relativePosition / this.spectrogramMaxLength) * spectrogramWidth;

        const stringPositions = this.calculateStringPositions();
        const stringY = stringPositions[stringIndex];
        const stringData = this.strings[stringIndex];
        const targetFreq = stringData.frequency;
        const cents = this.noteMap.getCentsOffset(freq, targetFreq);
        const yOffset = (cents / 50) * 15; // spectrogramHeight/2 = 15
        const y = stringY + yOffset;

        // Use the same color as the line segment
        const labelColor = this.colors[colorIndex];

        // Create text label with background for visibility
        const labelBg = document.createElementNS(svgNS, 'rect');
        labelBg.setAttribute('x', x - 30);
        labelBg.setAttribute('y', y - 24);
        labelBg.setAttribute('width', 60);
        labelBg.setAttribute('height', 20);
        labelBg.setAttribute('fill', 'white');
        labelBg.setAttribute('opacity', '0.9');
        labelBg.setAttribute('rx', '4');
        labelBg.setAttribute('stroke', labelColor);
        labelBg.setAttribute('stroke-width', '2');

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', y - 10); // Position above the line
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('font-size', '14');
        label.setAttribute('font-weight', 'bold');
        label.setAttribute('fill', labelColor);
        label.textContent = pitchDisplay;

        this.elements.stringsGroup.appendChild(labelBg);
        this.elements.stringsGroup.appendChild(label);

        // Store both elements for cleanup
        this.attackLabels[stringIndex].push({ bg: labelBg, text: label });

        console.log(`Label added: ${pitchDisplay} at position ${x.toFixed(0)}, color: ${labelColor}`);
    }

    updateStringIndicators(activeIndex, centsDiff) {
        // No longer using dot indicators - spectrogram shows all info
    }

    resetDisplays() {
        this.elements.detectedPitch.textContent = '--';
        this.elements.detectedFreq.textContent = '-- Hz';
        this.elements.tuningBar.style.width = '50%';
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tuner = new DanTranhTuner();
});
