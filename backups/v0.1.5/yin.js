/**
 * YIN Algorithm for Fundamental Frequency Detection
 *
 * The YIN algorithm is superior to simple FFT peak detection because:
 * 1. It finds the true fundamental frequency even when harmonics are louder
 * 2. It's designed specifically for pitch detection in musical instruments
 * 3. It handles the rich harmonic content of plucked strings (like Đàn Tranh)
 *
 * Reference: "YIN, a fundamental frequency estimator for speech and music"
 * by Alain de Cheveigné and Hideki Kawahara
 */

class YINDetector {
    constructor(sampleRate, bufferSize = 2048) {
        this.sampleRate = sampleRate;
        this.bufferSize = bufferSize;
        this.threshold = 0.15; // Default threshold for YIN algorithm
        this.probabilityThreshold = 0.1; // Minimum probability for valid detection
    }

    /**
     * Step 1: Difference function
     * Calculate the difference between the signal and itself shifted by tau
     */
    difference(buffer) {
        const yinBuffer = new Float32Array(this.bufferSize / 2);

        for (let tau = 0; tau < yinBuffer.length; tau++) {
            yinBuffer[tau] = 0;
            for (let i = 0; i < yinBuffer.length; i++) {
                const delta = buffer[i] - buffer[i + tau];
                yinBuffer[tau] += delta * delta;
            }
        }

        return yinBuffer;
    }

    /**
     * Step 2: Cumulative mean normalized difference function
     * This is the key innovation of YIN over autocorrelation
     */
    cumulativeMeanNormalizedDifference(yinBuffer) {
        const cmndf = new Float32Array(yinBuffer.length);
        cmndf[0] = 1;

        let runningSum = 0;
        for (let tau = 1; tau < yinBuffer.length; tau++) {
            runningSum += yinBuffer[tau];
            cmndf[tau] = yinBuffer[tau] / (runningSum / tau);
        }

        return cmndf;
    }

    /**
     * Step 3: Absolute threshold
     * Find the first tau where cmndf drops below threshold
     */
    absoluteThreshold(cmndf) {
        // Start from tau = 2 to avoid octave errors
        for (let tau = 2; tau < cmndf.length; tau++) {
            if (cmndf[tau] < this.threshold) {
                // Found a dip below threshold
                // Now find the local minimum in the vicinity
                while (tau + 1 < cmndf.length && cmndf[tau + 1] < cmndf[tau]) {
                    tau++;
                }
                return tau;
            }
        }

        // No dip below threshold found
        return -1;
    }

    /**
     * Step 4: Parabolic interpolation
     * Refine the period estimate for sub-sample accuracy
     */
    parabolicInterpolation(cmndf, tau) {
        if (tau < 1 || tau >= cmndf.length - 1) {
            return tau;
        }

        const s0 = cmndf[tau - 1];
        const s1 = cmndf[tau];
        const s2 = cmndf[tau + 1];

        // Parabolic interpolation formula
        const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));

        return tau + adjustment;
    }

    /**
     * Main detection function
     * Returns the detected frequency or -1 if no pitch detected
     */
    detect(buffer) {
        // Ensure buffer has enough data
        if (buffer.length < this.bufferSize) {
            return -1;
        }

        // Check if signal has sufficient energy
        const rms = this.calculateRMS(buffer);
        if (rms < 0.01) { // Silence threshold
            return -1;
        }

        // Step 1: Calculate difference function
        const yinBuffer = this.difference(buffer);

        // Step 2: Calculate cumulative mean normalized difference
        const cmndf = this.cumulativeMeanNormalizedDifference(yinBuffer);

        // Step 3: Find tau using absolute threshold
        let tau = this.absoluteThreshold(cmndf);

        if (tau === -1) {
            // If no clear pitch, try to find the global minimum
            tau = this.findGlobalMinimum(cmndf);

            // Check if the minimum is confident enough
            if (cmndf[tau] > this.probabilityThreshold) {
                return -1; // No confident pitch detected
            }
        }

        // Step 4: Refine with parabolic interpolation
        const refinedTau = this.parabolicInterpolation(cmndf, tau);

        // Convert tau to frequency
        const frequency = this.sampleRate / refinedTau;

        // Sanity check: typical musical range is 20Hz - 4000Hz
        if (frequency < 20 || frequency > 4000) {
            return -1;
        }

        return frequency;
    }

    /**
     * Find global minimum in CMNDF (fallback method)
     */
    findGlobalMinimum(cmndf) {
        let minTau = 2;
        let minValue = cmndf[2];

        for (let tau = 3; tau < cmndf.length; tau++) {
            if (cmndf[tau] < minValue) {
                minValue = cmndf[tau];
                minTau = tau;
            }
        }

        return minTau;
    }

    /**
     * Calculate RMS (Root Mean Square) for signal energy detection
     */
    calculateRMS(buffer) {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    /**
     * Set the threshold for detection sensitivity
     * Lower = more sensitive but more false positives
     * Higher = less sensitive but more accurate
     */
    setThreshold(threshold) {
        this.threshold = Math.max(0.01, Math.min(0.5, threshold));
    }

    /**
     * Get confidence level of last detection (based on CMNDF minimum)
     */
    getConfidence(buffer) {
        const yinBuffer = this.difference(buffer);
        const cmndf = this.cumulativeMeanNormalizedDifference(yinBuffer);
        const tau = this.absoluteThreshold(cmndf);

        if (tau === -1) return 0;

        // Confidence is inverse of CMNDF value (lower CMNDF = higher confidence)
        return 1 - Math.min(1, cmndf[tau]);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = YINDetector;
}
