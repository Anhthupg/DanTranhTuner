# Đàn Tranh Tuner - Changelog

## v2.0.1 (2025-01-XX)

### Major Features: Root Note vs Starting Note Separation

**Breaking Changes:**
- Separated Root Note (reference pitch) from Starting Note (scale degree selection)
- Starting Note dropdown now shows scale degrees, not chromatic pitches

**New Features:**
1. **Root Note Control**
   - Select any chromatic pitch (C2-C4) as the scale reference
   - Independent from which scale degree you start on

2. **Root Cent Offset**
   - Fine-tune root note with ±50¢ adjustment
   - Entire scale shifts by this offset
   - Displayed in tablature relative to 12-EDO

3. **Starting Note as Scale Degree**
   - Dropdown now shows numbered scale notes (e.g., "1. C3", "2. D3+14¢")
   - Choose which degree of the generated scale to start instrument from
   - Enables true modal rotations

4. **Dynamic Starting Note Dropdown**
   - Automatically updates when root, scale pattern, or custom pitches change
   - Shows actual frequencies with cent deviations
   - Generates up to 4 octaves worth of options

### Improvements
- Tablature now shows total deviation from 12-EDO (includes root offset + pattern deviation)
- All cent offsets measured relative to 12-EDO as comparison foundation
- Better support for microtonal root notes
- Clearer separation of concepts for advanced users

### Technical Changes
- `updateStartingNoteDropdown()`: Generates scale from root+offset, populates with actual notes
- `generateStringsFromHierarchicalSystem()`: Uses rootNote + rootCentOffset + startingDegreeIndex
- Preset loading: Sets rootNote instead of startingNote
- Event listeners: Root and offset changes trigger dropdown update + regeneration

### Bug Fixes
- Starting note dropdown now constrains to actual scale degrees (no more random chromatic notes)
- Root cent offset properly applied to all generated strings
- Custom pitch selection updates starting note options correctly

---

## v2.0.0 (2025-01-XX)

### Major Release: Hierarchical Tuning System

**Architecture:**
- L2: Tuning Systems (EDO divisions)
- L3: Scale Patterns (degree selection)
- L5: Target Presets (instrument configurations)

**Supported Tuning Systems:**
- 12-EDO (Standard Western)
- 5-EDO, 7-EDO, 17-EDO, 19-EDO, 22-EDO, 24-EDO

**Scale Patterns:**
- Pentatonic: Major, Minor, Vietnamese (Bắc/Nam), Chinese, Japanese
- Heptatonic: Major, Minor, Dorian, Phrygian, Mixolydian
- Hexatonic: Blues, Whole Tone
- Chromatic: All degrees

**Features:**
- Microtonal twist controls for each scale degree
- Custom pitch selection from any scale pattern
- Real-time pitch detection with attack-based color coding
- Spectrogram visualization
- Multi-language support (17 languages)
- Letter/Solfège notation toggle

---

## v1.1.1 (2025-01-XX)
- Added 17 language translations
- Notation toggle: Letter (A B C) ↔ Solfège (Do Re Mi)

## v1.1.0 (2025-01-XX)
- Initial public release
- 16/17/21 string presets
- Basic microtonal support
- YIN pitch detection algorithm

