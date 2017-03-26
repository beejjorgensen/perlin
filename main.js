/**
 * Perlin Noise test
 */
;(function (ns) {
    "use strict";

    let perlin;

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
     * Draw Perlin noise on the canvas
     */
    function showPerlin(canvasElem, createNew) {
        let canvas = qs(canvasElem);

        // Parameters for the Perlin noise
        let gridWidth = 40;
        let gridHeight = 20;

        const mult = 15;
        let canvasWidth = gridWidth * mult;
        let canvasHeight = gridHeight * mult;

        // Resize the canvas as appropriate
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;

        // Make a new noise generator
        if (createNew) {
            perlin = new Perlin(gridWidth, gridHeight);
        }

        // Set the smoothing
        perlin.setSmoothing(parseInt(qs("#smooth-selector").value));

        // Make the noise
        let noise = perlin.makeNoise(canvasWidth, canvasHeight);

        // Draw it to a canvas
        let ctx = canvas.getContext('2d');

        let imageData = ctx.createImageData(canvasWidth, canvasHeight);
        let data = imageData.data;

        let ai = 0; // Image data index;
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
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
     * On Smooth mode changed
     */
    function onSmoothChange() {
        showPerlin("#perlin-canvas");
    }

    /**
     * On refresh
     */
    function onRefresh() {
        showPerlin("#perlin-canvas", true);
    }

    /**
     * On load
     */
    function onLoad() {
        qs("#refresh-button").addEventListener('click', onRefresh);
        qs("#smooth-selector").addEventListener('change', onSmoothChange);

        showPerlin("#perlin-canvas", true);
    }

    window.addEventListener('load', onLoad);

}(typeof beejus == "object"? beejus: window));