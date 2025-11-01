/**
 * Comprehensive Tuning Systems Database
 * Based on MAML Tuner's L2-L3-L5 architecture
 * L2: Tuning Systems (how the octave is divided)
 * L3: Scale Patterns (which degrees from L2 to use)
 * L5: Target Scales/Presets (specific instrument configurations)
 */

// ==================== LAYER 2: TUNING SYSTEMS ====================
const TUNING_SYSTEMS = {
    // Equal Temperaments (EDO)
    '12-edo': {
        name: '12-EDO (Standard Western)',
        divisions: 12,
        kind: 'EDO',
        description: 'Standard 12-tone equal temperament used in Western music'
    },
    '5-edo': {
        name: '5-EDO (Pentatonic)',
        divisions: 5,
        kind: 'EDO',
        description: 'Five equal divisions of the octave'
    },
    '7-edo': {
        name: '7-EDO (Southeast Asian)',
        divisions: 7,
        kind: 'EDO',
        description: 'Seven equal divisions, used in some Southeast Asian music'
    },
    '10-edo': {
        name: '10-EDO (Decimal)',
        divisions: 10,
        kind: 'EDO',
        description: 'Ten equal divisions of the octave'
    },
    '17-edo': {
        name: '17-EDO (Arabic/Turkish)',
        divisions: 17,
        kind: 'EDO',
        description: 'Seventeen divisions, approximates Arabic maqam intervals'
    },
    '19-edo': {
        name: '19-EDO (Meantone)',
        divisions: 19,
        kind: 'EDO',
        description: 'Approximates 1/3-comma meantone temperament'
    },
    '22-edo': {
        name: '22-EDO (Superpyth)',
        divisions: 22,
        kind: 'EDO',
        description: 'Supports superpythagorean intervals'
    },
    '24-edo': {
        name: '24-EDO (Quarter-tone)',
        divisions: 24,
        kind: 'EDO',
        description: 'Quarter-tone system used in Arabic and Persian music'
    }
};

// ==================== LAYER 3: SCALE PATTERNS ====================
// Scale patterns define which degrees to use from each tuning system
// Each degree can optionally include a cent offset: { degree: 0, cents: -10 }
const SCALE_DATABASE = {
    // ===== PENTATONIC SCALES (5 notes) =====
    'major-pent': {
        name: 'Major Pentatonic',
        noteCount: 5,
        degrees: {
            5: [0, 1, 2, 3, 4],      // 5-EDO: all degrees
            7: [0, 2, 3, 5, 6],      // 7-EDO: approximate
            12: [0, 2, 4, 7, 9],     // 12-EDO: standard C-D-E-G-A
            17: [0, 3, 6, 10, 13],   // 17-EDO
            19: [0, 3, 6, 11, 15],   // 19-EDO
            22: [0, 4, 7, 13, 17],   // 22-EDO
            24: [0, 4, 8, 14, 18],   // 24-EDO
        },
        description: 'Bright, happy pentatonic scale (Do-Re-Mi-Sol-La)',
        allowMicrotone: true  // Can apply cent offsets
    },
    'minor-pent': {
        name: 'Minor Pentatonic',
        noteCount: 5,
        degrees: {
            5: [0, 1, 2, 3, 4],      // 5-EDO: all degrees
            7: [0, 2, 3, 5, 6],      // 7-EDO
            12: [0, 3, 5, 7, 10],    // 12-EDO: standard A-C-D-E-G
            17: [0, 4, 7, 10, 14],   // 17-EDO
            19: [0, 5, 8, 11, 16],   // 19-EDO
            22: [0, 5, 9, 13, 18],   // 22-EDO
            24: [0, 6, 10, 14, 20],  // 24-EDO
        },
        description: 'Melancholic pentatonic scale (La-Do-Re-Mi-Sol)'
    },
    'vietnamese-bac': {
        name: 'Vietnamese Bắc (Northern)',
        noteCount: 5,
        degrees: {
            12: [0, 2, 4, 7, 9],     // Same as major pentatonic in 12-EDO
            17: [0, 3, 6, 10, 13],
            19: [0, 3, 6, 11, 15],
        },
        description: 'Traditional Northern Vietnamese scale (C-D-E-G-A)'
    },
    'vietnamese-nam': {
        name: 'Vietnamese Nam (Southern)',
        noteCount: 5,
        degrees: {
            12: [0, 2, 5, 7, 9],     // C-D-F-G-A
            17: [0, 3, 7, 10, 13],
            19: [0, 3, 8, 11, 15],
        },
        description: 'Traditional Southern Vietnamese scale (C-D-F-G-A)',
        allowMicrotone: true
    },
    'vietnamese-bac-microtone': {
        name: 'Vietnamese Bắc (Microtone)',
        noteCount: 5,
        degrees: {
            12: [
                {degree: 0, cents: 0},     // C
                {degree: 2, cents: -14},   // D slightly flat
                {degree: 4, cents: 0},     // E
                {degree: 7, cents: +2},    // G slightly sharp
                {degree: 9, cents: 0}      // A
            ]
        },
        description: 'Northern Vietnamese with traditional microtonal inflections',
        allowMicrotone: true
    },
    'chinese-gong': {
        name: 'Chinese Gong (宫)',
        noteCount: 5,
        degrees: {
            12: [0, 2, 4, 7, 9],     // C-D-E-G-A
            17: [0, 3, 6, 10, 13],
        },
        description: 'Chinese pentatonic scale starting on Gong (palace tone)'
    },
    'japanese-hirajoshi': {
        name: 'Japanese Hirajoshi',
        noteCount: 5,
        degrees: {
            12: [0, 2, 3, 7, 8],     // C-D-Eb-G-Ab
            17: [0, 3, 4, 10, 11],
            19: [0, 3, 5, 11, 13],
        },
        description: 'Traditional Japanese scale with characteristic minor intervals'
    },

    // ===== HEPTATONIC SCALES (7 notes) =====
    'major': {
        name: 'Major (Ionian)',
        noteCount: 7,
        degrees: {
            7: [0, 1, 2, 3, 4, 5, 6],     // 7-EDO: all degrees
            12: [0, 2, 4, 5, 7, 9, 11],   // 12-EDO: standard Do-Re-Mi-Fa-Sol-La-Ti
            17: [0, 3, 6, 7, 10, 13, 16],
            19: [0, 3, 6, 8, 11, 15, 17],
            22: [0, 4, 7, 9, 13, 17, 20],
            24: [0, 4, 8, 10, 14, 18, 22],
        },
        description: 'Bright, happy diatonic scale (Do-Re-Mi-Fa-Sol-La-Ti)'
    },
    'minor-natural': {
        name: 'Minor (Natural/Aeolian)',
        noteCount: 7,
        degrees: {
            7: [0, 1, 2, 3, 4, 5, 6],     // 7-EDO
            12: [0, 2, 3, 5, 7, 8, 10],   // 12-EDO: La-Ti-Do-Re-Mi-Fa-Sol
            17: [0, 3, 4, 7, 10, 11, 14],
            19: [0, 3, 5, 8, 11, 13, 16],
            22: [0, 4, 5, 9, 13, 15, 18],
            24: [0, 4, 6, 10, 14, 16, 20],
        },
        description: 'Sad, melancholic diatonic scale'
    },
    'dorian': {
        name: 'Dorian',
        noteCount: 7,
        degrees: {
            12: [0, 2, 3, 5, 7, 9, 10],   // 12-EDO
            19: [0, 3, 5, 8, 11, 15, 16],
            22: [0, 4, 5, 9, 13, 17, 18],
        },
        description: 'Minor scale with raised 6th degree, jazzy feel'
    },
    'phrygian': {
        name: 'Phrygian',
        noteCount: 7,
        degrees: {
            12: [0, 1, 3, 5, 7, 8, 10],   // 12-EDO
            19: [0, 2, 5, 8, 11, 13, 16],
            22: [0, 2, 5, 9, 13, 15, 18],
        },
        description: 'Spanish/flamenco character with flat 2nd'
    },
    'mixolydian': {
        name: 'Mixolydian',
        noteCount: 7,
        degrees: {
            12: [0, 2, 4, 5, 7, 9, 10],   // 12-EDO
            19: [0, 3, 6, 8, 11, 15, 16],
            22: [0, 4, 7, 9, 13, 17, 18],
        },
        description: 'Major scale with flat 7th, blues/rock feel'
    },

    // ===== HEXATONIC SCALES (6 notes) =====
    'blues': {
        name: 'Blues (Hexatonic)',
        noteCount: 6,
        degrees: {
            12: [0, 3, 5, 6, 7, 10],      // 12-EDO
            19: [0, 5, 8, 10, 11, 16],
            22: [0, 5, 9, 11, 13, 18],
            24: [0, 6, 10, 12, 14, 20],
        },
        description: 'Blues scale with blue notes'
    },
    'wholetone': {
        name: 'Whole Tone',
        noteCount: 6,
        degrees: {
            6: [0, 1, 2, 3, 4, 5],        // 6-EDO: all degrees
            12: [0, 2, 4, 6, 8, 10],      // 12-EDO: standard
            24: [0, 4, 8, 12, 16, 20],    // 24-EDO
        },
        description: 'Dreamy, ambiguous scale with all whole steps'
    },

    // ===== CHROMATIC =====
    'chromatic': {
        name: 'Chromatic (All Degrees)',
        noteCount: null, // Varies by tuning
        degrees: {
            5: [0, 1, 2, 3, 4],
            7: [0, 1, 2, 3, 4, 5, 6],
            12: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            17: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            19: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            24: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
        },
        description: 'All available pitches in the tuning system'
    }
};

// ==================== LAYER 5: TARGET SCALE PRESETS ====================
// Presets define specific instrument string configurations
const TARGET_SCALE_PRESETS = {
    // ===== DÀN TRANH PRESETS =====
    'dan-tranh-5-major': {
        name: 'Đàn Tranh 5-note (Major Pent)',
        l2: '12-edo',
        l3: 'major-pent',
        notesPerOctave: 5,
        defaultStart: 'E3',
        defaultStrings: 17,
        description: 'Traditional Vietnamese 5-note major pentatonic'
    },
    'dan-tranh-5-minor': {
        name: 'Đàn Tranh 5-note (Minor Pent)',
        l2: '12-edo',
        l3: 'minor-pent',
        notesPerOctave: 5,
        defaultStart: 'E3',
        defaultStrings: 17,
        description: 'Vietnamese 5-note minor pentatonic'
    },
    'dan-tranh-5-bac': {
        name: 'Đàn Tranh Bắc (Northern)',
        l2: '12-edo',
        l3: 'vietnamese-bac',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 17,
        description: 'Traditional Northern Vietnamese tuning'
    },
    'dan-tranh-5-nam': {
        name: 'Đàn Tranh Nam (Southern)',
        l2: '12-edo',
        l3: 'vietnamese-nam',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 17,
        description: 'Traditional Southern Vietnamese tuning'
    },
    'dan-tranh-7-major': {
        name: 'Đàn Tranh 7-note (Major)',
        l2: '12-edo',
        l3: 'major',
        notesPerOctave: 7,
        defaultStart: 'C3',
        defaultStrings: 21,
        description: 'Full diatonic major scale'
    },
    'dan-tranh-7-minor': {
        name: 'Đàn Tranh 7-note (Minor)',
        l2: '12-edo',
        l3: 'minor-natural',
        notesPerOctave: 7,
        defaultStart: 'A2',
        defaultStrings: 21,
        description: 'Full diatonic minor scale'
    },
    'dan-tranh-microtone': {
        name: 'Đàn Tranh Bắc (Microtone)',
        l2: '12-edo',
        l3: 'vietnamese-bac-microtone',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 17,
        description: 'Traditional Northern Vietnamese with microtonal inflections'
    },

    // ===== EXPERIMENTAL MICROTONAL =====
    '7edo-pentatonic': {
        name: '7-EDO Pentatonic (5 of 7)',
        l2: '7-edo',
        l3: 'major-pent',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 15,
        description: 'Experimental 5-note subset of 7-EDO'
    },
    '7edo-heptatonic': {
        name: '7-EDO Heptatonic (All 7)',
        l2: '7-edo',
        l3: 'major',
        notesPerOctave: 7,
        defaultStart: 'C3',
        defaultStrings: 21,
        description: 'All 7 tones of 7-EDO'
    },
    '17edo-pentatonic': {
        name: '17-EDO Pentatonic',
        l2: '17-edo',
        l3: 'major-pent',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 17,
        description: 'Pentatonic subset of 17-EDO (Arabic/Turkish)'
    },

    // ===== CUSTOM =====
    'custom': {
        name: 'Custom Configuration',
        l2: '12-edo',
        l3: 'major-pent',
        notesPerOctave: 5,
        defaultStart: 'C3',
        defaultStrings: 16,
        description: 'Manually configure all parameters'
    }
};

// ==================== HELPER FUNCTIONS ====================

/**
 * Get available scale patterns for a given tuning system
 */
function getAvailableScalesForTuning(tuningId) {
    const tuning = TUNING_SYSTEMS[tuningId];
    if (!tuning) return [];

    const divisions = tuning.divisions;
    const availableScales = [];

    for (const [scaleId, scaleData] of Object.entries(SCALE_DATABASE)) {
        if (scaleData.degrees[divisions]) {
            availableScales.push({
                id: scaleId,
                name: scaleData.name,
                noteCount: scaleData.noteCount,
                description: scaleData.description
            });
        }
    }

    return availableScales;
}

/**
 * Get available target presets for a given L2-L3 combination
 */
function getAvailablePresetsForScale(tuningId, scaleId) {
    const availablePresets = [];

    for (const [presetId, presetData] of Object.entries(TARGET_SCALE_PRESETS)) {
        if (presetData.l2 === tuningId && presetData.l3 === scaleId) {
            availablePresets.push({
                id: presetId,
                name: presetData.name,
                description: presetData.description
            });
        }
    }

    // Always include custom option
    availablePresets.push({
        id: 'custom',
        name: 'Custom Configuration',
        description: 'Manually configure parameters'
    });

    return availablePresets;
}

/**
 * Generate frequencies for a scale configuration
 * @param {string} tuningId - The tuning system ID
 * @param {string} scaleId - The scale pattern ID
 * @param {number} rootFreq - Root frequency in Hz
 * @param {number} numStrings - Number of strings to generate
 * @param {Array<number>} centOffsets - Optional array of cent offsets for each scale degree
 */
function generateScaleFrequencies(tuningId, scaleId, rootFreq, numStrings, centOffsets = null) {
    const tuning = TUNING_SYSTEMS[tuningId];
    const scale = SCALE_DATABASE[scaleId];

    if (!tuning || !scale) return [];

    const degrees = scale.degrees[tuning.divisions];
    if (!degrees) return [];

    const frequencies = [];
    const centsPerDivision = 1200 / tuning.divisions;
    let octave = 0;
    let degreeIndex = 0;

    for (let i = 0; i < numStrings; i++) {
        const degreeValue = degrees[degreeIndex];

        // Handle both simple numbers and {degree, cents} objects
        let degree, degreeCentOffset;
        if (typeof degreeValue === 'object') {
            degree = degreeValue.degree;
            degreeCentOffset = degreeValue.cents || 0;
        } else {
            degree = degreeValue;
            degreeCentOffset = 0;
        }

        // Apply user-specified cent offset if provided
        const userCentOffset = (centOffsets && centOffsets[degreeIndex]) ? centOffsets[degreeIndex] : 0;

        const totalDegrees = octave * tuning.divisions + degree;
        const baseCents = totalDegrees * centsPerDivision;
        const totalCents = baseCents + degreeCentOffset + userCentOffset;
        const freq = rootFreq * Math.pow(2, totalCents / 1200);

        frequencies.push({
            stringIndex: i,
            frequency: freq,
            degree: degree,
            octave: octave,
            baseCents: baseCents,
            centOffset: degreeCentOffset + userCentOffset,
            totalCents: totalCents
        });

        degreeIndex++;
        if (degreeIndex >= degrees.length) {
            degreeIndex = 0;
            octave++;
        }
    }

    return frequencies;
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TUNING_SYSTEMS,
        SCALE_DATABASE,
        TARGET_SCALE_PRESETS,
        getAvailableScalesForTuning,
        getAvailablePresetsForScale,
        generateScaleFrequencies
    };
}
