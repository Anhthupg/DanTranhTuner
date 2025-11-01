# Microtonal Tuning Guide - Dan Tranh Tuner

## Overview

The Dan Tranh Tuner now supports **microtonal adjustments**, allowing you to fine-tune each scale degree by **cents** (hundredths of a semitone). This enables authentic traditional tunings, experimental microtonality, and precise intonation adjustments.

## What are Cents?

- **1 cent** = 1/100 of a semitone
- **100 cents** = 1 semitone (e.g., C to C#)
- **1200 cents** = 1 octave

### Examples:
- **C4 + 0** = Standard C4 (no adjustment)
- **C4 + 50** = Halfway between C and C# (quarter-tone sharp)
- **C4 - 24** = C slightly flat (about 1/4 semitone flat)
- **C4 + 14** = C slightly sharp (very subtle, ~1/7 semitone)

## How to Use Microtonal Adjustments

### Step 1: Select Your Base Tuning

1. **Tuning System**: Choose how the octave is divided (e.g., 12-EDO, 7-EDO)
2. **Scale Pattern**: Select which notes from the system (e.g., Major Pentatonic, Vietnamese Bắc)
3. **Instrument Preset**: Pick a preset or choose Custom

### Step 2: Show Microtonal Controls

Click the **"⚙️ Show Microtonal Adjustments"** button below the main controls.

### Step 3: Adjust Each Scale Degree

You'll see controls for each note in your scale pattern:

```
Degree 0° (≈C)  [slider: -50 to +50]  [number input: 0]
Degree 2° (≈D)  [slider: -50 to +50]  [number input: 0]
Degree 4° (≈E)  [slider: -50 to +50]  [number input: 0]
...
```

- **Slider**: Drag to adjust cents smoothly
- **Number Input**: Type exact cent values
- **Range**: -50 to +50 cents (half a semitone in each direction)

### Step 4: Generate Strings

The strings will automatically regenerate as you adjust values. The tuner display will show notes with their cent offsets:

- `E3` - No offset
- `G3+14` - G3 sharp by 14 cents
- `D4-24` - D4 flat by 24 cents

## Pre-configured Microtonal Scales

### Vietnamese Bắc (Microtone) 🎚️

This preset demonstrates traditional Vietnamese microtonal inflections:

**Scale Pattern**: Vietnamese Bắc (Microtone)
**Adjustments**:
- Degree 0 (C): 0 cents - Root note, no adjustment
- Degree 2 (D): -14 cents - Slightly flattened second
- Degree 4 (E): 0 cents - Third stays pure
- Degree 7 (G): +2 cents - Fifth slightly sharpened
- Degree 9 (A): 0 cents - Sixth stays pure

These subtle adjustments create the characteristic sound of traditional Northern Vietnamese music.

## Use Cases

### 1. Traditional Tunings

Many traditional music systems use intervals that don't match 12-EDO exactly:

- **Vietnamese**: Subtle flattening of certain degrees
- **Thai/Cambodian**: Using 7-EDO with specific inflections
- **Arabic/Turkish**: Quarter-tones and maqam-specific adjustments
- **Indian**: Sruti adjustments for ragas

### 2. Experimental Microtonality

Create your own microtonal scales:

```
Example: "Stretched" Pentatonic
- C:  0 cents (root)
- D: +8 cents (slightly sharp)
- E: +14 cents (moderately sharp)
- G: +6 cents (slightly sharp)
- A: +10 cents (slightly sharp)
```

### 3. Historical Temperaments

Approximate historical tuning systems within 12-EDO:

- **Pythagorean**: Sharpen fifths slightly
- **Meantone**: Flatten fifths, widen major thirds
- **Well Temperaments**: Different adjustments per key

### 4. Intonation Correction

If your instrument naturally plays certain notes sharp or flat, use microtonal adjustments to compensate:

```
Example: String Compensation
String 5 naturally plays -12 cents flat → Set to +12 cents to compensate
```

## Technical Details

### How Cent Offsets Are Applied

The frequency calculation uses this formula:

```
frequency = rootFreq × 2^((baseCents + centOffset) / 1200)
```

Where:
- `baseCents` = position in the tuning system
- `centOffset` = your microtonal adjustment
- `1200` = cents per octave

### Combining with Different Tuning Systems

Microtonal adjustments work with **any** tuning system:

#### 12-EDO (Standard Western)
- Base step: 100 cents
- Example: Degree 2 (D) = 200 cents + your offset

#### 7-EDO (Southeast Asian)
- Base step: 171.43 cents (1200/7)
- Example: Degree 2 = 342.86 cents + your offset

#### 17-EDO (Arabic/Turkish)
- Base step: 70.59 cents (1200/17)
- Example: Degree 3 = 211.76 cents + your offset

### Precision

- Adjustments are in whole cents (integers)
- Range: -50 to +50 cents per degree
- Display: Offsets ≥ ±1 cent are shown (e.g., `D4+14`)

## Examples

### Example 1: Quarter-Tone Blues

```
Tuning System: 12-EDO
Scale Pattern: Blues (6 notes)
Adjustments:
- Root:     0
- b3:     -50 (quarter-tone flat)
- 4:        0
- b5:       0
- 5:        0
- b7:     -25
```

### Example 2: Just Intonation Approximation

```
Tuning System: 12-EDO
Scale Pattern: Major Pentatonic
Adjustments:
- C (1/1):    0 cents
- D (9/8):   +4 cents (closer to just 204 cents)
- E (5/4):  -14 cents (closer to just 386 cents)
- G (3/2):   +2 cents (closer to just 702 cents)
- A (5/3):  -16 cents (closer to just 884 cents)
```

### Example 3: 7-EDO with Custom Inflections

```
Tuning System: 7-EDO
Scale Pattern: Major Pentatonic (5 of 7)
Adjustments:
- Degree 0:   0
- Degree 2: +10 (brighten the second)
- Degree 3:  -5 (soften the third)
- Degree 5:   0
- Degree 6:  +8 (lift the seventh)
```

## Tips for Using Microtonality

### Start Small
- Begin with adjustments of ±5 to ±15 cents
- Larger adjustments (±30 to ±50) create dramatic effects

### Listen Carefully
- Small changes (1-5 cents) are very subtle
- Medium changes (10-20 cents) are clearly audible
- Large changes (30+ cents) approach the next note

### Reset Easily
- Change the Scale Pattern to reset all adjustments to 0
- Or manually set each slider back to 0

### Experiment
- Traditional systems often use:
  - -10 to -20 cents for "sweet" intervals
  - +5 to +15 cents for "bright" intervals
  - Mix of both for character

### Document Your Tunings
- Note down your cent values for each degree
- Save screenshots of your settings
- Share your discoveries!

## Different Tuning System Behaviors

### Equal Divisions (EDO)
All scales in EDO systems have their degrees adjusted by the same cent amount across all octaves.

**Example with 12-EDO, Major Pentatonic, +10 cents on degree 2 (D):**
- D3: 200 + 10 = 210 cents above C3
- D4: 200 + 10 = 210 cents above C4 (one octave higher)
- D5: 200 + 10 = 210 cents above C5 (two octaves higher)

### Non-EDO Systems (7-EDO vs 12-EDO)

Different tuning systems create completely different pitch grids:

**7-EDO** (1200 ÷ 7 = 171.43 cents per step):
```
Step 0: 0 cents        (like C)
Step 1: 171.43 cents   (between C# and D)
Step 2: 342.86 cents   (between D# and E)
Step 3: 514.29 cents   (between F and F#)
Step 4: 685.71 cents   (between F# and G)
Step 5: 857.14 cents   (between G# and A)
Step 6: 1028.57 cents  (between A# and B)
```

**12-EDO** (1200 ÷ 12 = 100 cents per step):
```
Step 0: 0 cents    (C)
Step 1: 100 cents  (C#)
Step 2: 200 cents  (D)
Step 3: 300 cents  (D#)
...
```

**Visual Comparison:**
```
12-EDO: |---|---|---|---|---|---|---|---|---|---|---|---|
         C  C#  D  D#  E   F  F#  G  G#  A  A#  B   C

7-EDO:  |-------|-------|-------|-------|-------|-------|-------|
         0      1       2       3       4       5       6       0
```

Notice that **no 7-EDO step aligns with 12-EDO notes** (except the octave)! This creates a completely different musical system.

### Adding Microtonal Adjustments on Top

When you select **7-EDO** + **Major Pentatonic** + **adjust degree 2 by +10 cents**:

1. Base 7-EDO degree 2 = 342.86 cents
2. Add your adjustment: 342.86 + 10 = **352.86 cents**
3. This is closer to E in 12-EDO (400 cents) but still unique

The microtonal adjustment **fine-tunes within the existing grid** of whatever tuning system you've chosen.

## Troubleshooting

### Microtone Section Won't Show
- Make sure you've selected a valid Tuning System and Scale Pattern
- Some combinations may not be available
- Try clicking "Generate" first

### Adjustments Not Applied
- Check that the cent values are set (not 0)
- Click "Generate" to regenerate strings
- Verify the Scale Pattern supports the tuning system

### Notes Display Without Cent Offset
- Offsets less than ±1 cent are not displayed
- Check the number input to verify your setting
- Offsets are applied even if not shown in the label

### Preset Resets My Adjustments
- This is intentional - presets have their own configurations
- Use "Custom Configuration" to preserve your adjustments
- Or adjust after selecting the preset

## Advanced: Creating Custom Microtonal Presets

You can add your own microtonal scales to the data file:

Edit `tuning-systems-data.js` → `SCALE_DATABASE`:

```javascript
'my-custom-scale': {
    name: 'My Custom Microtonal Scale',
    noteCount: 5,
    degrees: {
        12: [
            {degree: 0, cents: 0},      // Root
            {degree: 2, cents: -10},    // Second (flat)
            {degree: 4, cents: -14},    // Third (very flat)
            {degree: 7, cents: +2},     // Fifth (sharp)
            {degree: 9, cents: 0}       // Sixth (pure)
        ]
    },
    description: 'My custom microtonal scale description',
    allowMicrotone: true
}
```

Then add a preset:

```javascript
'my-custom-preset': {
    name: 'My Custom Instrument',
    l2: '12-edo',
    l3: 'my-custom-scale',
    notesPerOctave: 5,
    defaultStart: 'C3',
    defaultStrings: 16,
    description: 'My custom microtonal tuning'
}
```

## Resources

### Learn More About Microtonality
- **Xenharmonic Wiki**: https://en.xen.wiki/
- **EDO Calculator**: Calculate cents for any EDO
- **Just Intonation**: Study pure interval ratios
- **Maqam World**: Learn about Arabic/Turkish maqams

### Vietnamese Traditional Tuning
- Research traditional Đàn Tranh master recordings
- Study regional variations (Bắc, Trung, Nam)
- Consult with traditional music teachers

## Version

- **Version**: 1.1.2
- **Feature**: Microtonal Cent Adjustments
- **Date**: 2025-10-31

## Credits

Microtonal features inspired by traditional Vietnamese music practices and the broader microtonal music community.
