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
    }
};

// Comprehensive scale definitions from tuning-systems.json
const SCALE_PATTERNS = {
    // Vietnamese Scales
    'C-D-E-G-A': ['C', 'D', 'E', 'G', 'A'],
    'C-D-F-G-A': ['C', 'D', 'F', 'G', 'A'],
    'C-D-E-G-B': ['C', 'D', 'E', 'G', 'B'],
    'C-Eb-F-G-Bb': ['C', 'Eb', 'F', 'G', 'Bb'],
    'D-F-G-A-C': ['D', 'F', 'G', 'A', 'C'],
    'D-E-F#-A-B': ['D', 'E', 'F#', 'A', 'B'],
    'C-Eb-F-G-Ab': ['C', 'Eb', 'F', 'G', 'Ab'],

    // Common Pentatonic
    'A-C-D-E-G': ['A', 'C', 'D', 'E', 'G'],
    'C-D-F-G-Bb': ['C', 'D', 'F', 'G', 'Bb'],

    // Chinese Pentatonic
    'D-E-G-A-C': ['D', 'E', 'G', 'A', 'C'],
    'E-G-A-C-D': ['E', 'G', 'A', 'C', 'D'],
    'G-A-C-D-E': ['G', 'A', 'C', 'D', 'E'],

    // Japanese Pentatonic
    'C-D-Eb-G-Ab': ['C', 'D', 'Eb', 'G', 'Ab'],
    'C-Db-F-Gb-Bb': ['C', 'Db', 'F', 'Gb', 'Bb'],
    'C-Db-F-G-Bb': ['C', 'Db', 'F', 'G', 'Bb'],
    'C-D-Eb-G-A': ['C', 'D', 'Eb', 'G', 'A'],

    // Hexatonic
    'C-D-Eb-E-G-A': ['C', 'D', 'Eb', 'E', 'G', 'A'],
    'C-Eb-F-Gb-G-Bb': ['C', 'Eb', 'F', 'Gb', 'G', 'Bb'],
    'C-D-E-F#-G#-A#': ['C', 'D', 'E', 'F#', 'G#', 'A#'],
    'C-D#-E-G-Ab-B': ['C', 'D#', 'E', 'G', 'Ab', 'B'],

    // Heptatonic (7-note scales)
    'C-D-E-F-G-A-B': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'A-B-C-D-E-F-G': ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
    'D-E-F-G-A-B-C': ['D', 'E', 'F', 'G', 'A', 'B', 'C'],
    'E-F-G-A-B-C-D': ['E', 'F', 'G', 'A', 'B', 'C', 'D'],
    'F-G-A-B-C-D-E': ['F', 'G', 'A', 'B', 'C', 'D', 'E'],
    'G-A-B-C-D-E-F': ['G', 'A', 'B', 'C', 'D', 'E', 'F'],
    'A-B-C-D-E-F-G#': ['A', 'B', 'C', 'D', 'E', 'F', 'G#']
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
        // Version tracking for debugging
        this.version = '1.0.9';
        console.log(`%cĐàn Tranh Tuner v${this.version}`, 'color: #008ECC; font-weight: bold; font-size: 16px;');

        this.audioContext = null;
        this.analyser = null;
        this.microphone = null;
        this.yinDetector = null;
        this.isListening = false;
        this.animationFrame = null;

        // Tone generator for playing reference pitches
        this.toneContext = null;
        this.toneOscillator = null;
        this.toneGain = null;
        this.currentFilter = null;
        this.currentPlayingFreq = null;

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

        // Checkbox state tracking
        this.checkboxStates = {}; // { "pitchClass-type": { selected: boolean, color: string } }
        this.checkboxColorIndex = 0; // Current color index for new selections
        this.checkboxColors = [
            '#FF6B6B', // Red
            '#4ECDC4', // Turquoise
            '#45B7D1', // Sky Blue
            '#FFA07A', // Light Salmon
            '#98D8C8', // Mint
            '#F7DC6F', // Yellow
            '#BB8FCE', // Purple
            '#F8B500', // Orange
            '#7FDBFF', // Aqua
            '#FF69B4', // Hot Pink
            '#3CB371', // Medium Sea Green
            '#DDA0DD'  // Plum
        ];

        this.initializeElements();
        this.attachEventListeners();
        this.generateStrings();

        // Initialize tone generator on first user interaction
        const initOnInteraction = () => {
            this.initializeToneGenerator();
            document.removeEventListener('click', initOnInteraction);
            document.removeEventListener('touchstart', initOnInteraction);
        };
        document.addEventListener('click', initOnInteraction);
        document.addEventListener('touchstart', initOnInteraction);
    }

    initializeElements() {
        this.elements = {
            numStrings: document.getElementById('numStrings'),
            tuningPreset: document.getElementById('tuningPreset'),
            startingNote: document.getElementById('startingNote'),
            startingNoteGroup: document.getElementById('startingNoteGroup'),
            baseFreq: document.getElementById('baseFreq'),
            generateBtn: document.getElementById('generateStrings'),
            startBtn: document.getElementById('startBtn'),
            stopSoundBtn: document.getElementById('stopSoundBtn'),
            customSection: document.getElementById('customTuningSection'),
            stringConfigs: document.getElementById('stringConfigs'),
            svg: document.getElementById('tunerSvg'),
            stringsGroup: document.getElementById('stringsGroup'),
            detectedPitch: document.getElementById('detectedPitch'),
            detectedFreq: document.getElementById('detectedFreq')
        };
    }

    attachEventListeners() {
        this.elements.generateBtn.addEventListener('click', () => this.generateStrings());
        this.elements.startBtn.addEventListener('click', () => this.toggleListening());
        this.elements.stopSoundBtn.addEventListener('click', () => this.stopAllSounds());
        this.elements.tuningPreset.addEventListener('change', () => this.handlePresetChange());
        this.elements.startingNote.addEventListener('change', () => this.generateStrings());
        this.elements.baseFreq.addEventListener('change', () => this.updateBaseFrequency());

        // Add spacebar listener to stop sound
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.toneOscillator) {
                e.preventDefault(); // Prevent page scroll
                this.stopAllSounds();
            }
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

        this.generateStrings();
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
        } else if (SCALE_PATTERNS[preset]) {
            // Generate strings from scale pattern
            const startingNote = this.elements.startingNote?.value || 'C3';
            this.strings = this.generateFromScale(SCALE_PATTERNS[preset], numStrings, startingNote);
        } else {
            // Use preset - but respect numStrings and starting note for adjustable presets
            const presetData = TUNING_PRESETS[preset];
            if (presetData) {
                // Get starting note if available
                const startingNote = this.elements.startingNote?.value;

                // Transpose the preset based on starting note
                let baseStrings;
                if (startingNote && startingNote !== 'C3') {
                    baseStrings = this.transposePreset(presetData.strings, startingNote);
                } else {
                    baseStrings = presetData.strings.map(note => this.parseNoteWithCents(note));
                }

                if (numStrings <= baseStrings.length) {
                    this.strings = baseStrings.slice(0, numStrings);
                } else {
                    // Extend the pattern if user wants more strings - continue pentatonic cycle
                    if (startingNote && startingNote !== 'C3') {
                        // Re-generate with the full length needed
                        this.strings = this.transposePreset(
                            Array(numStrings).fill('C3'), // Create dummy array of correct length
                            startingNote
                        );
                    } else {
                        // Continue the default C-D-E-G-A pattern
                        const pentatonicNotes = ['C', 'D', 'E', 'G', 'A'];
                        this.strings = [...baseStrings];

                        for (let i = baseStrings.length; i < numStrings; i++) {
                            const noteIndex = i % pentatonicNotes.length;
                            const note = pentatonicNotes[noteIndex];
                            const octave = 3 + Math.floor(i / pentatonicNotes.length);
                            this.strings.push(this.parseNoteWithCents(`${note}${octave}`));
                        }
                    }
                }
            }
        }

        this.renderStrings();
    }

    generateFromScale(scalePattern, numStrings, startingNote) {
        // Parse starting note
        const startNoteMatch = startingNote.match(/([A-G][#b]?)(\d)/);
        if (!startNoteMatch) return [];

        const startNoteName = startNoteMatch[1];
        let currentOctave = parseInt(startNoteMatch[2]);

        // Find starting position in scale
        const startIndex = scalePattern.indexOf(startNoteName);
        const actualStartIndex = startIndex !== -1 ? startIndex : 0;

        const result = [];

        for (let i = 0; i < numStrings; i++) {
            // Calculate which position in scale we're at
            const position = (actualStartIndex + i) % scalePattern.length;
            const note = scalePattern[position];

            // Calculate octave: increment every scalePattern.length notes
            const cyclesCompleted = Math.floor(i / scalePattern.length);
            const octave = currentOctave + cyclesCompleted;

            result.push(this.parseNoteWithCents(`${note}${octave}`));
        }

        return result;
    }

    transposePreset(presetNotes, newStartNote) {
        // Pentatonic scale: C, D, E, G, A (repeating in each octave)
        const pentatonicNotes = ['C', 'D', 'E', 'G', 'A'];

        // Parse the starting note to get root note and octave
        const startNoteMatch = newStartNote.match(/([A-G][#b]?)(\d)/);
        if (!startNoteMatch) return presetNotes.map(n => this.parseNoteWithCents(n));

        const rootNote = startNoteMatch[1];
        let currentOctave = parseInt(startNoteMatch[2]);

        // Find where to start in the pentatonic cycle
        const startIndex = pentatonicNotes.indexOf(rootNote);
        if (startIndex === -1) return presetNotes.map(n => this.parseNoteWithCents(n));

        // Generate string notes by cycling through the pentatonic scale
        const result = [];
        for (let i = 0; i < presetNotes.length; i++) {
            const noteIndex = (startIndex + i) % pentatonicNotes.length;
            const currentNote = pentatonicNotes[noteIndex];

            // Increment octave when we cycle back to C
            if (i > 0 && noteIndex === 0) {
                currentOctave++;
            }

            const noteString = `${currentNote}${currentOctave}`;
            result.push(this.parseNoteWithCents(noteString));
        }

        return result;
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

    findClosestPitchClass(targetPitchClass) {
        // Get all unique pitch classes in current tuning
        const pitchClasses = [...new Set(this.strings.map(s => s.note.replace(/\d+$/, '')))];

        if (pitchClasses.includes(targetPitchClass)) {
            return targetPitchClass;
        }

        // Find closest pitch class by semitone distance
        const noteOrder = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const flatToSharp = { 'Db': 'C#', 'Eb': 'D#', 'Gb': 'F#', 'Ab': 'G#', 'Bb': 'A#' };

        // Convert flats to sharps for comparison
        const normalizeNote = (note) => flatToSharp[note] || note;
        const targetIndex = noteOrder.indexOf(normalizeNote(targetPitchClass));

        if (targetIndex === -1) return pitchClasses[0]; // Fallback

        let minDistance = 12;
        let closest = pitchClasses[0];

        pitchClasses.forEach(pc => {
            const pcIndex = noteOrder.indexOf(normalizeNote(pc));
            if (pcIndex !== -1) {
                // Calculate circular distance
                const distance = Math.min(
                    Math.abs(pcIndex - targetIndex),
                    12 - Math.abs(pcIndex - targetIndex)
                );
                if (distance < minDistance) {
                    minDistance = distance;
                    closest = pc;
                }
            }
        });

        return closest;
    }

    autoSelectDefaultCheckboxes() {
        // Get unique pitch classes
        const pitchClasses = [...new Set(this.strings.map(s => s.note.replace(/\d+$/, '')))];

        if (pitchClasses.length === 0) return;

        // Note: checkboxStates are already cleared in renderStrings()
        // This function only sets the default selections

        // Find G or closest for large checkbox
        const gLarge = this.findClosestPitchClass('G');
        const pitchKeyLarge = `${gLarge}-large`;
        this.checkboxStates[pitchKeyLarge] = {
            selected: true,
            color: this.checkboxColors[this.checkboxColorIndex % this.checkboxColors.length]
        };
        this.checkboxColorIndex++;

        // Find C and G or closest for small checkboxes
        const cSmall = this.findClosestPitchClass('C');
        const gSmall = this.findClosestPitchClass('G');

        // Add C for small
        const pitchKeyC = `${cSmall}-small`;
        this.checkboxStates[pitchKeyC] = {
            selected: true,
            color: this.checkboxColors[this.checkboxColorIndex % this.checkboxColors.length]
        };
        this.checkboxColorIndex++;

        // Add G for small (only if different from C)
        if (gSmall !== cSmall) {
            const pitchKeyG = `${gSmall}-small`;
            this.checkboxStates[pitchKeyG] = {
                selected: true,
                color: this.checkboxColors[this.checkboxColorIndex % this.checkboxColors.length]
            };
            this.checkboxColorIndex++;
        }

        console.log('Auto-selected checkboxes:', this.checkboxStates);
    }

    renderStrings() {
        const svgNS = 'http://www.w3.org/2000/svg';

        // Clear DOM
        this.elements.stringsGroup.innerHTML = '';

        // IMPORTANT: Clear and reset checkbox states to defaults
        // This ensures checkboxes reset every time strings are regenerated
        console.log('🔄 Resetting checkbox states to defaults...');
        this.checkboxStates = {};
        this.checkboxColorIndex = 0;

        const width = 1200;
        const leftMargin = 35; // Space for labels
        const rightMargin = 70; // Small margin on the right

        // Calculate Y positions based on MIDI semitone spacing
        const stringPositions = this.calculateStringPositions();
        const totalHeight = Math.max(600, stringPositions[stringPositions.length - 1] + 100);

        // Update SVG viewBox
        this.elements.svg.setAttribute('viewBox', `0 0 1200 ${totalHeight}`);

        // Calculate frequency range for string thickness
        const frequencies = this.strings.map(s => s.frequency);
        const minFreq = Math.min(...frequencies);
        const maxFreq = Math.max(...frequencies);
        const freqRange = maxFreq - minFreq;

        // Auto-select default checkboxes
        this.autoSelectDefaultCheckboxes();

        this.strings.forEach((stringData, index) => {
            const y = stringPositions[index];

            // Calculate left end position based on frequency (cents from lowest string)
            // String 0 (lowest) is longest, starting from leftMargin, higher strings get shorter from the left
            const lowestStringFreq = this.strings[0].frequency;
            const centsFromLowest = this.noteMap.getCentsOffset(stringData.frequency, lowestStringFreq);
            const shortenAmount = (centsFromLowest / 100) * 2; // 2px per 100 cents
            const leftX = leftMargin + shortenAmount;

            // Calculate string thickness based on frequency (lower = thicker)
            const minThickness = 1;
            const maxThickness = 3;
            let thickness;
            if (freqRange > 0) {
                // Lower frequency = thicker string
                const normalizedFreq = (stringData.frequency - minFreq) / freqRange;
                thickness = maxThickness - normalizedFreq * (maxThickness - minThickness);
            } else {
                // All strings have same frequency
                thickness = (minThickness + maxThickness) / 2;
            }

            // String line
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', leftX);
            line.setAttribute('x2', width - rightMargin);
            line.setAttribute('y1', y);
            line.setAttribute('y2', y);
            line.setAttribute('class', 'string-line');
            line.setAttribute('stroke-width', thickness);
            line.setAttribute('data-string-index', index);
            line.style.cursor = 'pointer';

            // Add click handler to play the string's tone
            line.addEventListener('click', () => {
                this.playTone(stringData.frequency);
            });

            // String label (left side) - positioned 5px before the string starts
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', leftX - 5);
            label.setAttribute('y', y + 5);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('class', 'string-label');
            label.setAttribute('stroke', 'white');
            label.setAttribute('stroke-width', '0.8');
            label.setAttribute('paint-order', 'stroke fill');
            const labelText = stringData.cents !== 0
                ? `${index + 1}: ${stringData.note}${stringData.cents > 0 ? '+' : ''}${stringData.cents}`
                : `${index + 1}: ${stringData.note}`;
            label.textContent = labelText;
            label.style.cursor = 'pointer';

            // Add click handler to label too
            label.addEventListener('click', () => {
                this.playTone(stringData.frequency);
            });

            // Frequency display (right side)
            const freqDisplay = document.createElementNS(svgNS, 'text');
            freqDisplay.setAttribute('x', width - rightMargin + 5);
            freqDisplay.setAttribute('y', y + 5);
            freqDisplay.setAttribute('text-anchor', 'start');
            freqDisplay.setAttribute('class', 'frequency-display');
            freqDisplay.setAttribute('id', `freq-${index}`);
            freqDisplay.setAttribute('stroke', 'white');
            freqDisplay.setAttribute('stroke-width', '0.8');
            freqDisplay.setAttribute('paint-order', 'stroke fill');
            freqDisplay.textContent = `${stringData.frequency.toFixed(2)} Hz`;

            // Add two sets of checkboxes (circles) next to frequency display
            const smallRadius = 5;
            const largeRadius = 8;

            // Get pitch class for this string
            const pitchClass = stringData.note.replace(/\d+$/, '');

            // Large checkbox (right) - positioned with right edge at right margin
            const checkbox1Cx = width - rightMargin - largeRadius / 2;
            const checkbox1Cy = y;

            const checkbox1 = document.createElementNS(svgNS, 'circle');
            checkbox1.setAttribute('cx', checkbox1Cx);
            checkbox1.setAttribute('cy', checkbox1Cy);
            checkbox1.setAttribute('r', largeRadius);

            // Apply initial color based on checkbox state
            const pitchKeyLarge = `${pitchClass}-large`;
            const largeFill = this.checkboxStates[pitchKeyLarge]?.selected
                ? this.checkboxStates[pitchKeyLarge].color
                : 'white';
            checkbox1.setAttribute('fill', largeFill);

            checkbox1.setAttribute('stroke', '#333');
            checkbox1.setAttribute('stroke-width', 1.5);
            checkbox1.setAttribute('class', 'checkbox-large');
            checkbox1.setAttribute('data-string-index', index);
            checkbox1.setAttribute('data-checkbox-type', 'large');
            checkbox1.style.cursor = 'pointer';

            // Large checkbox label
            const checkbox1Label = document.createElementNS(svgNS, 'text');
            checkbox1Label.setAttribute('x', checkbox1Cx);
            checkbox1Label.setAttribute('y', checkbox1Cy);
            checkbox1Label.setAttribute('text-anchor', 'middle');
            checkbox1Label.setAttribute('dominant-baseline', 'central');
            checkbox1Label.setAttribute('font-size', '10');
            checkbox1Label.setAttribute('font-weight', 'bold');
            checkbox1Label.setAttribute('fill', '#333');
            checkbox1Label.setAttribute('pointer-events', 'none'); // Don't block clicks
            checkbox1Label.textContent = pitchClass;

            // Small checkbox (left) - positioned 18px to the left of large checkbox
            const checkbox2Cx = width - rightMargin - 18 - smallRadius / 2;
            const checkbox2Cy = y;

            const checkbox2 = document.createElementNS(svgNS, 'circle');
            checkbox2.setAttribute('cx', checkbox2Cx);
            checkbox2.setAttribute('cy', checkbox2Cy);
            checkbox2.setAttribute('r', smallRadius);

            // Apply initial color based on checkbox state
            const pitchKeySmall = `${pitchClass}-small`;
            const smallFill = this.checkboxStates[pitchKeySmall]?.selected
                ? this.checkboxStates[pitchKeySmall].color
                : 'white';
            checkbox2.setAttribute('fill', smallFill);

            checkbox2.setAttribute('stroke', '#333');
            checkbox2.setAttribute('stroke-width', 1);
            checkbox2.setAttribute('class', 'checkbox-small');
            checkbox2.setAttribute('data-string-index', index);
            checkbox2.setAttribute('data-checkbox-type', 'small');
            checkbox2.style.cursor = 'pointer';

            // Small checkbox label
            const checkbox2Label = document.createElementNS(svgNS, 'text');
            checkbox2Label.setAttribute('x', checkbox2Cx);
            checkbox2Label.setAttribute('y', checkbox2Cy);
            checkbox2Label.setAttribute('text-anchor', 'middle');
            checkbox2Label.setAttribute('dominant-baseline', 'central');
            checkbox2Label.setAttribute('font-size', '7');
            checkbox2Label.setAttribute('font-weight', 'bold');
            checkbox2Label.setAttribute('fill', '#333');
            checkbox2Label.setAttribute('pointer-events', 'none'); // Don't block clicks
            checkbox2Label.textContent = pitchClass;

            // Add click handlers
            const toggleCheckbox = (clickedIndex, type) => {
                // Get the pitch class (note without octave) of the clicked string
                const clickedNote = this.strings[clickedIndex].note;
                const pitchClass = clickedNote.replace(/\d+$/, ''); // Remove octave number

                // Toggle state for this pitch class and type
                const pitchKey = `${pitchClass}-${type}`;

                if (!this.checkboxStates[pitchKey]) {
                    // New selection - assign a new color
                    this.checkboxStates[pitchKey] = {
                        selected: true,
                        color: this.checkboxColors[this.checkboxColorIndex % this.checkboxColors.length]
                    };
                    this.checkboxColorIndex++;
                } else {
                    // Toggle existing selection
                    this.checkboxStates[pitchKey].selected = !this.checkboxStates[pitchKey].selected;
                }

                const newFill = this.checkboxStates[pitchKey].selected
                    ? this.checkboxStates[pitchKey].color
                    : 'white';

                // Update all checkboxes with the same pitch class and type
                this.strings.forEach((str, idx) => {
                    const notePitchClass = str.note.replace(/\d+$/, '');
                    if (notePitchClass === pitchClass) {
                        const checkboxClass = type === 'large' ? 'checkbox-large' : 'checkbox-small';
                        const checkboxes = document.querySelectorAll(`.${checkboxClass}[data-string-index="${idx}"]`);
                        checkboxes.forEach(cb => cb.setAttribute('fill', newFill));
                    }
                });
            };

            checkbox1.addEventListener('click', () => toggleCheckbox(index, 'large'));
            checkbox2.addEventListener('click', () => toggleCheckbox(index, 'small'));

            // Add full-width spectrogram
            const spectrogramWidth = width - leftMargin - rightMargin;
            const spectrogramHeight = 30;
            const spectrogramX = leftMargin;
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
            this.elements.stringsGroup.appendChild(checkbox1);
            this.elements.stringsGroup.appendChild(checkbox2);
            this.elements.stringsGroup.appendChild(checkbox1Label);
            this.elements.stringsGroup.appendChild(checkbox2Label);

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
            console.log('Requesting microphone access...');

            // Check if getUserMedia is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia is not supported in this browser');
            }

            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log('Microphone access granted!');

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
            if (error.name === 'NotAllowedError') {
                alert('Microphone permission denied. Please:\n1. Click the lock/camera icon in the address bar\n2. Allow microphone access for this site\n3. Refresh the page and try again');
            } else if (error.name === 'NotFoundError') {
                alert('No microphone found. Please connect a microphone and try again.');
            } else {
                alert(`Could not access microphone: ${error.message}\n\nPlease check browser permissions and try again.`);
            }
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
            this.newAttackStringIndex = null; // Will be set when we detect which string
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

        // Track new attack start - clear old data and start fresh
        if (this.isNewAttack) {
            // Mark which string this attack belongs to (first time we see it)
            if (this.newAttackStringIndex === null) {
                this.newAttackStringIndex = stringIndex;

                // Clear data for this string and nearby strings (within ±2 semitones)
                const targetFreq = this.strings[stringIndex].frequency;
                this.strings.forEach((str, idx) => {
                    const centsDiff = Math.abs(this.noteMap.getCentsOffset(str.frequency, targetFreq));
                    // Clear if within ±200 cents (2 semitones)
                    if (centsDiff < 200) {
                        this.spectrogramData[idx] = [];

                        // Clear all labels for this string
                        if (this.attackLabels[idx]) {
                            this.attackLabels[idx].forEach(label => {
                                if (label.bg) label.bg.remove();
                                if (label.text) label.text.remove();
                            });
                            this.attackLabels[idx] = [];
                        }
                    }
                });

                console.log(`⚡ New attack! String ${stringIndex}, cleared nearby strings, color: ${this.currentColor}`);
            }

            // Mark new segment start (always at 0 now)
            this.currentAttackStart[stringIndex] = 0;
            this.currentAttackColor[stringIndex] = this.currentColor; // Store the color for this attack
            this.isNewAttack = false;
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
        const leftMargin = 35;
        const rightMargin = 70;
        const spectrogramWidth = width - leftMargin - rightMargin;
        const spectrogramHeight = 30;
        const spectrogramX = leftMargin;

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
        const leftMargin = 35;
        const rightMargin = 70;
        const spectrogramWidth = width - leftMargin - rightMargin;
        const spectrogramX = leftMargin;
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
    }

    initializeToneGenerator() {
        if (this.toneContext) return; // Already initialized

        try {
            this.toneContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('Tone generator initialized');
        } catch (error) {
            console.error('Failed to initialize tone generator:', error);
        }
    }

    playTone(frequency, duration = 300000) {
        this.initializeToneGenerator();

        if (!this.toneContext) {
            console.error('Tone context not available');
            return;
        }

        // Fade out any currently playing tone quickly (0.5s) when new string clicked
        if (this.toneOscillator) {
            this.stopTone(0.5);
        }

        try {
            // Create a NEW gain node for this tone (allows smooth crossfade)
            const toneGain = this.toneContext.createGain();
            toneGain.connect(this.toneContext.destination);
            toneGain.gain.value = 0; // Start silent

            // Create custom bright tone with harmonics (like a bell/string instrument)
            // Use triangle wave for clean brightness
            const oscillator = this.toneContext.createOscillator();
            oscillator.type = 'triangle'; // Bright but clean
            oscillator.frequency.value = frequency;

            // Create a filter for extra brightness
            const filter = this.toneContext.createBiquadFilter();
            filter.type = 'highpass';
            filter.frequency.value = frequency * 0.5; // Let through frequencies above half the fundamental
            filter.Q.value = 0.7; // Gentle slope

            // Connect: oscillator -> filter -> gain -> output
            oscillator.connect(filter);
            filter.connect(toneGain);

            // Smooth envelope to avoid clicks
            const now = this.toneContext.currentTime;
            const attackTime = 0.01; // Very quick attack for brightness

            // Attack: quick fade in for bright sound
            toneGain.gain.setValueAtTime(0, now);
            toneGain.gain.linearRampToValueAtTime(0.3, now + attackTime);

            // Sustain: hold at volume indefinitely (until manually stopped)
            toneGain.gain.setValueAtTime(0.3, now + attackTime);

            // Start the oscillator
            oscillator.start(now);

            // Schedule stop at a very long duration (5 minutes)
            oscillator.stop(now + duration / 1000);

            // Store references for stopping
            this.toneOscillator = oscillator;
            this.toneGain = toneGain;
            this.currentFilter = filter;
            this.currentPlayingFreq = frequency;

            // Show stop button
            this.elements.stopSoundBtn.style.display = 'block';

            // Clean up when done
            oscillator.onended = () => {
                filter.disconnect();
                toneGain.disconnect();

                // Only clear if this is still the current oscillator
                if (this.toneOscillator === oscillator) {
                    this.toneOscillator = null;
                    this.toneGain = null;
                    this.currentFilter = null;
                    this.currentPlayingFreq = null;
                    this.elements.stopSoundBtn.style.display = 'none';
                }
            };

            console.log(`Playing bright tone: ${frequency.toFixed(2)} Hz (press spacebar or click Stop Sound to stop)`);
        } catch (error) {
            console.error('Error playing tone:', error);
        }
    }

    stopTone(fadeTime = 0.5) {
        if (this.toneOscillator) {
            // Store references locally before clearing instance variables
            const oldOscillator = this.toneOscillator;
            const oldGain = this.toneGain;
            const oldFilter = this.currentFilter;

            // Clear instance variables immediately so new tone can start
            this.toneOscillator = null;
            this.toneGain = null;
            this.currentFilter = null;
            this.currentPlayingFreq = null;

            try {
                const now = this.toneContext.currentTime;

                // Cancel any scheduled changes and fade out smoothly
                oldGain.gain.cancelScheduledValues(now);
                oldGain.gain.setValueAtTime(oldGain.gain.value, now);
                oldGain.gain.linearRampToValueAtTime(0, now + fadeTime);

                // Schedule oscillator to stop after fade
                oldOscillator.stop(now + fadeTime);

                // Clean up after fade completes
                setTimeout(() => {
                    try {
                        oldFilter.disconnect();
                        oldGain.disconnect();
                    } catch (e) {
                        // Already disconnected
                    }
                }, fadeTime * 1000 + 100);
            } catch (error) {
                // Oscillator might already be stopped, clean up anyway
                try {
                    oldFilter.disconnect();
                    oldGain.disconnect();
                } catch (e) {
                    // Already disconnected
                }
            }
        }
    }

    stopAllSounds() {
        if (this.toneOscillator) {
            this.stopTone(0.3); // Quick fade out
            this.elements.stopSoundBtn.style.display = 'none';
            console.log('Sound stopped');
        }
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.tuner = new DanTranhTuner();
});
