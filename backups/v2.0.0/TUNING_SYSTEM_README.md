# Hierarchical Tuning System - Dan Tranh Tuner

## Overview

The Dan Tranh Tuner now features a comprehensive hierarchical tuning system inspired by MAML Tuner's architecture. This system provides three levels of control for precise tuning customization.

## Three-Level Hierarchy

### 🎵 Level 1: Tuning System
**What it does:** Defines how the octave is divided into discrete pitch steps.

**Available Options:**
- **12-EDO (Standard)** - Standard 12-tone equal temperament (Western music)
- **5-EDO (Pentatonic)** - Five equal divisions of the octave
- **7-EDO (Southeast Asian)** - Seven equal divisions
- **17-EDO (Arabic/Turkish)** - Seventeen divisions, approximates Arabic maqam intervals
- **19-EDO (Meantone)** - Approximates 1/3-comma meantone temperament
- **22-EDO (Superpyth)** - Supports superpythagorean intervals
- **24-EDO (Quarter-tone)** - Quarter-tone system used in Arabic and Persian music

### 🎼 Level 2: Scale Pattern
**What it does:** Selects which notes/degrees from the tuning system to use.

**Available Patterns** (dynamically filtered based on Tuning System):
- **Pentatonic Scales (5 notes)**
  - Major Pentatonic - Bright, happy scale (Do-Re-Mi-Sol-La)
  - Minor Pentatonic - Melancholic scale (La-Do-Re-Mi-Sol)
  - Vietnamese Bắc (Northern) - C-D-E-G-A
  - Vietnamese Nam (Southern) - C-D-F-G-A
  - Chinese Gong (宫) - Traditional Chinese pentatonic
  - Japanese Hirajoshi - Traditional Japanese scale

- **Heptatonic Scales (7 notes)**
  - Major (Ionian) - Standard major scale (Do-Re-Mi-Fa-Sol-La-Ti)
  - Minor (Natural/Aeolian) - Natural minor scale
  - Dorian - Minor with raised 6th, jazzy feel
  - Phrygian - Spanish/flamenco character
  - Mixolydian - Major with flat 7th, blues/rock feel

- **Hexatonic Scales (6 notes)**
  - Blues - Blues scale with blue notes
  - Whole Tone - Dreamy, ambiguous scale

- **Chromatic** - All available pitches in the tuning system

### 🎯 Level 3: Instrument Preset
**What it does:** Pre-configured instrument tunings combining Tuning System + Scale Pattern with default settings.

**Available Presets:**
- **Đàn Tranh Presets:**
  - Đàn Tranh 5-note (Major) - 17 strings, E3 start, 12-EDO + Major Pentatonic
  - Đàn Tranh 5-note (Minor) - 17 strings, E3 start, 12-EDO + Minor Pentatonic
  - Đàn Tranh Bắc (Northern) - 17 strings, C3 start, Traditional Northern Vietnamese
  - Đàn Tranh Nam (Southern) - 17 strings, C3 start, Traditional Southern Vietnamese
  - Đàn Tranh 7-note (Major) - 21 strings, C3 start, Full diatonic major
  - Đàn Tranh 7-note (Minor) - 21 strings, A2 start, Full diatonic minor

- **Experimental Microtonal:**
  - 7-EDO Pentatonic - 5 notes from 7-EDO system (15 strings)
  - 7-EDO Heptatonic - All 7 tones of 7-EDO (21 strings)
  - 17-EDO Pentatonic - Pentatonic subset of 17-EDO (17 strings)

- **Custom Configuration** - Manually configure all parameters

## How It Works

### Cascading Dropdown Logic

1. **Select Tuning System** → The Scale Pattern dropdown automatically updates to show only compatible scales
2. **Select Scale Pattern** → The Instrument Preset dropdown updates to show compatible presets
3. **Select Instrument Preset** → Automatically sets the Tuning System, Scale Pattern, number of strings, and starting note

### Example Workflow

**Example 1: Traditional Vietnamese Tuning**
```
1. Tuning System: 12-EDO (Standard)
2. Scale Pattern: Vietnamese Bắc (5 notes)
3. Instrument Preset: Đàn Tranh Bắc (Northern)
4. Result: 17 strings tuned to C-D-E-G-A pattern starting from C3
```

**Example 2: Experimental 7-EDO**
```
1. Tuning System: 7-EDO (Southeast Asian)
2. Scale Pattern: Major Pentatonic (5)
3. Instrument Preset: 7-EDO Pentatonic
4. Result: 15 strings using 5 selected tones from 7-EDO system
```

**Example 3: Custom Blues Scale**
```
1. Tuning System: 12-EDO (Standard)
2. Scale Pattern: Blues (6)
3. Instrument Preset: Custom Configuration
4. Adjust: Number of strings and starting note as needed
5. Result: Custom blues scale tuning
```

## Technical Details

### File Structure

- **tuning-systems-data.js** - Complete database of tuning systems, scale patterns, and presets
- **tuner.js** - Updated with hierarchical tuning system integration
- **index.html** - UI with three cascading dropdowns

### Data Structures

```javascript
// Tuning System
{
  name: '12-EDO (Standard Western)',
  divisions: 12,
  kind: 'EDO',
  description: 'Standard 12-tone equal temperament'
}

// Scale Pattern
{
  name: 'Major Pentatonic',
  noteCount: 5,
  degrees: {
    12: [0, 2, 4, 7, 9],  // Degrees in 12-EDO
    17: [0, 3, 6, 10, 13], // Degrees in 17-EDO
    // ... for other tuning systems
  }
}

// Instrument Preset
{
  name: 'Đàn Tranh 5-note (Major)',
  l2: '12-edo',              // References Tuning System
  l3: 'major-pent',          // References Scale Pattern
  notesPerOctave: 5,
  defaultStart: 'E3',
  defaultStrings: 17
}
```

### Frequency Generation Algorithm

The system generates frequencies using this formula for EDO (Equal Division of Octave) systems:

```
cents = (octave * divisions + degree) * (1200 / divisions)
frequency = rootFrequency * 2^(cents / 1200)
```

Where:
- `divisions` = number of equal divisions in the tuning system
- `degree` = the scale degree (from the scale pattern)
- `octave` = which octave repetition
- `rootFrequency` = frequency of the starting note

## Benefits

1. **Flexibility** - Mix and match any tuning system with any compatible scale pattern
2. **Educational** - Learn about different tuning systems and scales
3. **Microtonal Support** - Explore quarter-tones, 7-EDO, 17-EDO, and other microtonal systems
4. **Traditional Scales** - Access authentic Vietnamese, Chinese, and Japanese scales
5. **Quick Presets** - One-click access to common Đàn Tranh tunings
6. **Extensibility** - Easy to add new tuning systems, scales, or presets in the data file

## Adding Custom Content

### To add a new tuning system:
Edit `tuning-systems-data.js` and add to `TUNING_SYSTEMS`:

```javascript
'15-edo': {
    name: '15-EDO',
    divisions: 15,
    kind: 'EDO',
    description: 'Fifteen equal divisions'
}
```

### To add a new scale pattern:
Add to `SCALE_DATABASE` with degrees for each tuning system:

```javascript
'my-scale': {
    name: 'My Custom Scale',
    noteCount: 5,
    degrees: {
        12: [0, 3, 5, 7, 10],  // For 12-EDO
        17: [0, 4, 7, 10, 14],  // For 17-EDO
    },
    description: 'My custom scale description'
}
```

### To add a new preset:
Add to `TARGET_SCALE_PRESETS`:

```javascript
'my-preset': {
    name: 'My Custom Preset',
    l2: '12-edo',
    l3: 'my-scale',
    notesPerOctave: 5,
    defaultStart: 'D3',
    defaultStrings: 16,
    description: 'My custom instrument preset'
}
```

## Compatibility

- **Browser Support**: Modern browsers with ES6 support
- **Legacy Fallback**: Code includes fallback for old single-dropdown system
- **Mobile Responsive**: Dropdowns work on mobile devices

## Version

- **Version**: 1.1.2
- **Date**: 2025-10-31
- **Architecture**: Based on MAML Tuner's multi-layer system

## Credits

- **Original Đàn Tranh Tuner**: Phan Gia Anh Thư
- **Contributors**: Ngô Thanh Nhàn and Đàn Tranh students
- **Tuning System Architecture**: Inspired by MAML Tuner (anhthupg.github.io/MAMLTuner/)
