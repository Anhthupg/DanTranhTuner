# Dan Tranh Tuner - Version History

## Version 2.0.0 (2025-10-31)

### Major Features
- **Hierarchical Tuning System**: Three-level architecture (Tuning System → Scale Pattern → Selected Pitches)
- **Microtonal Support**: Fine-tune each scale degree with ±50 cent adjustments
- **Custom Pitch Selection**: Select specific pitch classes from any scale pattern
- **Multi-EDO Support**: 5-EDO, 7-EDO, 12-EDO, 17-EDO, 19-EDO, 22-EDO, 24-EDO tuning systems

### New Features
- Microtonal Twist button for quick access to cent adjustments
- Live updates of pitch labels when changing tuning systems or scales
- Precise cent offset display for all non-12-EDO tuning systems
- Reset button for microtonal adjustments
- All/Clear buttons for custom pitch selection
- Minimal, compact UI design for both control sections

### Improvements
- String labels now show total cents from root note
- Accurate cent deviation display (e.g., "D+12", "G-18")
- Increased left margin (75px) for longer labels with cents information
- Real-time synchronization between microtonal and custom pitch sections
- Vietnamese Bắc (Microtone) preset with traditional inflections

### Technical Changes
- Cent offset calculation now based on `centDeviation` instead of `degreeCentOffset`
- Proper handling of both simple degrees and {degree, cents} objects
- Frequency generation includes microtonal adjustments
- Notation toggle support (A B C ↔ Do Re Mi)
- 17 language translations

## Version 1.1.2
- Added microtonal adjustments
- Hierarchical tuning system implementation

## Version 1.1.1
- 17 languages support
- Notation toggle feature

## Version 1.1.0
- Multi-string tuner with presets
- Attack detection and visual tracking

## Version 0.1.5
- Initial release
- Basic pitch detection using YIN algorithm
- Spectrogram visualization
