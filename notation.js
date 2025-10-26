/**
 * Musical Notation Converter
 * Converts between Letter notation (A B C) and Solfège notation (Do Re Mi)
 */

class NotationConverter {
    constructor() {
        // Letter to Solfège mapping
        this.letterToSolfege = {
            'C': 'Do',
            'C#': 'Do#',
            'Db': 'Reb',
            'D': 'Re',
            'D#': 'Re#',
            'Eb': 'Mib',
            'E': 'Mi',
            'F': 'Fa',
            'F#': 'Fa#',
            'Gb': 'Solb',
            'G': 'Sol',
            'G#': 'Sol#',
            'Ab': 'Lab',
            'A': 'La',
            'A#': 'La#',
            'Bb': 'Sib',
            'B': 'Si'
        };

        // Reverse mapping
        this.solfegeToLetter = {};
        Object.entries(this.letterToSolfege).forEach(([letter, solfege]) => {
            this.solfegeToLetter[solfege] = letter;
        });

        this.currentNotation = localStorage.getItem('notation') || 'letter';
        this.init();
    }

    init() {
        // Add event listeners to notation toggle buttons
        document.querySelectorAll('.notation-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const notation = e.target.dataset.notation;
                this.setNotation(notation);
            });
        });

        // Set initial state
        this.setNotation(this.currentNotation);
    }

    setNotation(notation) {
        this.currentNotation = notation;
        localStorage.setItem('notation', notation);

        // Update active button
        document.querySelectorAll('.notation-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.notation === notation);
        });

        // Trigger regeneration of strings to update all displays
        if (window.tuner) {
            window.tuner.generateStrings();
        }

        console.log(`Notation switched to: ${notation === 'letter' ? 'A B C' : 'Do Re Mi'}`);
    }

    // Convert a note string (e.g., "C4+15" or "Do4+15") to current notation
    convert(noteString) {
        if (!noteString) return noteString;

        // Extract components: note name, octave, cents offset
        const match = noteString.match(/^([A-G][#b]?|Do|Re|Mi|Fa|Sol|La|Si|Reb|Mib|Solb|Lab|Sib|Do#|Re#|Fa#|Sol#|La#)(\d)?([+-]\d+)?$/i);

        if (!match) return noteString;

        const [, noteName, octave, cents] = match;
        let convertedNote;

        if (this.currentNotation === 'solfege') {
            // Convert letter to solfège
            convertedNote = this.letterToSolfege[noteName] || noteName;
        } else {
            // Convert solfège to letter
            // Capitalize first letter for comparison
            const capitalizedNote = noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();
            convertedNote = this.solfegeToLetter[capitalizedNote] || noteName;
        }

        // Reconstruct the note string
        return convertedNote + (octave || '') + (cents || '');
    }

    // Convert just the note name (without octave/cents)
    convertNoteName(noteName) {
        if (!noteName) return noteName;

        if (this.currentNotation === 'solfege') {
            return this.letterToSolfege[noteName] || noteName;
        } else {
            const capitalizedNote = noteName.charAt(0).toUpperCase() + noteName.slice(1).toLowerCase();
            return this.solfegeToLetter[capitalizedNote] || noteName;
        }
    }

    // Convert scale pattern (e.g., "C-D-E-G-A" to "Do-Re-Mi-Sol-La")
    convertScale(scaleString) {
        if (!scaleString) return scaleString;

        const notes = scaleString.split('-');
        const convertedNotes = notes.map(note => this.convertNoteName(note.trim()));
        return convertedNotes.join('-');
    }

    // Get current notation
    getNotation() {
        return this.currentNotation;
    }

    // Check if current notation is solfège
    isSolfege() {
        return this.currentNotation === 'solfege';
    }
}

// Initialize notation converter when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.notationConverter = new NotationConverter();
});
