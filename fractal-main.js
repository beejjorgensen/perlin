/**
 * Fractal Perlin Noise test
 */
;(function (ns) {
    "use strict";

    let options = {};

    // Imports
    let Perlin = ns.Perlin;

    /**
     * Wrapper around querySelector 
     * @param {string|object} s 
     * @param {string|object} p 
     */
    function qs(s, p) {
        if (typeof s == "object") { return s; }

        if (p) {
            if (typeof p == "string") { p = qs(p); }
            return p.querySelector(s);
        }
        return document.querySelector(s);
    }

    /**
     * Read the options from the form
     */
    function parseOptions() {
        options.width = qs("#width").value;
        options.height = options.width; // Force square for now
        options.gridStart = qs("#grid-start").value;
        options.iterations = qs("#iterations").value;
        options.gainStart = qs("#gain-start").value;
        options.gain = qs("#gain").value;
        options.water = qs("#water").value;
    }

    /**
     * Generate the fractal
     */
    function generateFractal() {
        let layers = [];
        let gridsize = options.gridStart;

        // Generate n layers of Perlin Noise
        for (let i = 0; i < options.iterations; i++) {

            // New generator for this grid
            let perlin = new Perlin(gridsize, gridsize);
            perlin.setSmoothing(2); // Improved

            // New noise for canvas size
            let noise = perlin.makeNoise(options.width, options.height);

            // Save for compositing later
            layers.push(noise);

            // next grid size down
            gridsize *= 2;
        }

        // Merge layers
        // All the data goes from -1.0 to 1.0. We'll just add them weighted by gain.
        // Result stored in layers[0]

        let gain = options.gainStart;
        let layer0 = layers[0];

        for (let i = 1; i < layers.length; i++) {
            let layer = layers[i];

            // Loop through all pixels
            for (let j = 0; j < layer.length; j++) {
                for (let k = 0; k < layer[j].length; k++) {
                    let v = layer0[j][k] + layer[j][k] * gain;

                    // Clamp in -1..1
                    v = Math.min(Math.max(-1, v), 1);

                    layer0[j][k] = v;
                }
            }

            gain *= options.gain;
        }


        // Render onto canvas
        // Grayscale for now, but TODO colormap
        let canvas = qs("#fractal-perlin-canvas");

        canvas.width = options.width;
        canvas.height = options.height;

        let ctx = canvas.getContext('2d');

        let imageData = ctx.createImageData(options.width, options.height);
        let data = imageData.data;

        let noise = layers[0];

        let ai = 0; // Image data index;
        for (let y = 0; y < options.height; y++) {
            for (let x = 0; x < options.width; x++) {
                // Remap noise from -1..1 to 0..255
                let gray = ((noise[y][x] + 1)/2 * 255)|0;

                data[ai++] = gray; // Red
                data[ai++] = gray; // Green
                data[ai++] = gray; // Blue
                data[ai++] = 255;  // Alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Handle the refresh button being hit
     */
    function onRefresh() {
        parseOptions();
        generateFractal();
    }

    /**
     * On load handler
     */
     function onLoad() {
        parseOptions();
        generateFractal();

        qs("#refresh-button").addEventListener('click', onRefresh);
     }

    window.addEventListener('load', onLoad);

}(typeof beejus == "object"? beejus: window));