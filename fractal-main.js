/**
 * Fractal Perlin Noise test
 */
;(function (ns) {
    "use strict";

    let options = {};
    let layer0 = null;

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
        //options.water = qs("#water").value;
    }

    /**
     * Do some color mapping
     *
     * @param {number} n from -1..1
     */
    function noiseToColor(n) {

        /**
         * Return an [r,g,b] array for an n value and a colorMap
         */
        function lerpColors(colorMap, n) {
            
            /**
             * Regular lerp
             */
            function lerp(a, b, t) {
                return a + (b - a) * t;
            }

            /**
             * Lerp between two color components in the color map
             */
            function getColor(colorIndex, t) { 
                let colorValue0 = colorMap[i0][1][colorIndex];
                let colorValue1 = colorMap[i1][1][colorIndex];

                return lerp(colorValue0, colorValue1, t);
            }

            // Find our color range indexes
            let i0, i1;

            for (let i = 1; i < colorMap.length; i++) {
                if (n <= colorMap[i][0]) {
                    i0 = i - 1;
                    i1 = i;
                    break;
                }
            }

            // Compute local t (from 0..1) in this color map range
            let v0 = colorMap[i0][0];
            let v1 = colorMap[i1][0];

            let t = (n - v0) / (v1 - v0);

            // Build and return RGB values
            return [getColor(0, t), getColor(1, t), getColor(2, t)];
        }

        // Remap from -1..1 to 0..1
        n = (n + 1) / 2;

        // Clamp 0..1, just in case
        n = Math.max(Math.min(n, 1), 0);

        // Color map
        /*
        let colorMap = [
            [0.0, [0, 0, 0x33]],
            [0.2, [0, 0, 0xff]],
            [0.4, [0, 0xff, 0xff]],
            [0.6, [0, 0x66, 0x33]],
            [0.8, [0xe5, 0xff, 0xcc]],
            [1.0, [0x66, 0x2a, 0]]
        ];
        */
        let colorMap = [
            [0.0, [0xe5, 0xff, 0xcc]],
            [0.6, [0x84, 0x5b, 0x15]],
            [0.8, [0xff, 0xff, 0xff]],
            [1.0, [0xff, 0xff, 0xff]]
        ];

        // Lerp the colors and return
        return lerpColors(colorMap, n);
    }

    /**
     * Render layer0 to the canvas
     */
    function renderToCanvas(){
        // Render onto canvas
        // Grayscale for now, but TODO colormap
        let canvas = qs("#fractal-perlin-canvas");

        canvas.width = options.width;
        canvas.height = options.height;

        let ctx = canvas.getContext('2d');

        let imageData = ctx.createImageData(options.width, options.height);
        let data = imageData.data;

        let noise = layer0;

        let ai = 0; // Image data index;
        for (let y = 0; y < options.height; y++) {
            for (let x = 0; x < options.width; x++) {
                let r, g, b;

                // Remap noise from -1..1 to 0..255
                //let gray = ((noise[y][x] + 1)/2 * 255)|0;
                //data[ai++] = gray; // Red
                //data[ai++] = gray; // Green
                //data[ai++] = gray; // Blue

                // Remap noise to color
                [r, g, b] = noiseToColor(noise[y][x]);
                data[ai++] = r;   // Red
                data[ai++] = g;   // Green
                data[ai++] = b;   // Blue
                data[ai++] = 255; // Alpha
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    /**
     * Generate the fractal
     */
    function generateFractal() {
        let gridsize = options.gridStart;
        let gain = options.gainStart;

        layer0 = null;

        // Generate and merge n layers of Perlin Noise
        for (let i = 0; i < options.iterations; i++) {

            // New generator for this grid
            let perlin = new Perlin(gridsize, gridsize);
            perlin.setSmoothing(2); // Improved

            // New noise for canvas size
            let layer = perlin.makeNoise(options.width, options.height);

            // If we're first, nothing to merge, so save and continue
            if (layer0 === null) {
                layer0 = layer;
                continue;
            }

            // Merge layers

            // Loop through all pixels
            for (let j = 0; j < layer.length; j++) {
                for (let k = 0; k < layer[j].length; k++) {
                    let v = layer0[j][k] + layer[j][k] * gain;

                    // Clamp in -1..1
                    v = Math.min(Math.max(-1, v), 1);

                    layer0[j][k] = v;
                }
            }

            // Modify the gain
            gain *= options.gain;

            // next grid size down
            gridsize *= 2;
        }

        renderToCanvas();
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