/**
 * Perlin noise generator
 * 
 * Code adapted from https://en.wikipedia.org/wiki/Perlin_noise
 */
;(function (ns) {
    "use strict";

    // Imports
    let Vector2D = beejus.Vector2D;

    /**
     * Make a 2D array
     * 
     * @param {number} rows 
     * @param {number} cols 
     */
    function make2DArray(rows, cols) {
        let a = new Array(rows);

        for (let i = 0; i < rows; i++) {
            a[i] = new Array(cols);
        }

        return a;
    }

    /**
     * Linear interpolate
     */
    function lerp(a, b, t) {
        return (1 - t) * a + t * b;
    }

    /**
     * Perlin generator
     */
    class Perlin {

        /**
         * Constructor 
         * 
         * @param {number|undefined} xgrid if specified, the x grid dimension
         * @param {number} ygrid the y grid dimension
         */
        constructor(xgrid, ygrid) {
            if (typeof xgrid != "undefined") {
                this.buildGrid(xgrid, ygrid);
            }

            this.xgrid = xgrid;
            this.ygrid = ygrid;
            this.smoother = this.smoother0;
        }

        /**
         * No smoothing
         *
         * @param {number} t 
         */
        smoother0(t) {
            return t;
        }

        /**
         * 3t^2 - 2t^3 smoothing
         *  
         * @param {number} t 
         */
        smoother1(t) {
            let t2 = t * t;

            return 3 * t2 - 2 * t * t2;
        }

        /**
         * 6t^5 - 15t^4 + 10t^3 smoothing
         * 
         * @param {Number} t 
         */
        smoother2(t) {
            let t3 = t * t * t;
            let t4 = t3 * t;

            return 6 * t4 * t - 15 * t4 + 10 * t3;
        }


        /**
         * Build a random unit vector grid
         *
         * @param {number} xgrid the x grid dimension
         * @param {number} ygrid the y grid dimension
         */
        buildGrid(xgrid, ygrid) {
            // Make a new 2D array
            let g = make2DArray(ygrid, xgrid);

            for (let y = 0; y < ygrid; ++y) {
                for (let x = 0; x < xgrid; ++x) {
                    g[y][x] = new Vector2D().randomUnit();
                }
            }

            this.grid = g;
        }

        makeNoise(xsize, ysize) {
            let _this = this;
            let xgrid = this.xgrid;
            let ygrid = this.ygrid;

            /**
             * Find the dot product between a grid coordinate and
             * the given point.
             * 
             * @param {number} ix 
             * @param {number} iy 
             * @param {number} x 
             * @param {number} y 
             */
            function dotGridGradient(ix, iy, x, y) {
                let v = new Vector2D(x - ix, y - iy);

                let gx = ix < xgrid? ix: 0;
                let gy = iy < ygrid? iy: 0;

                return _this.grid[gy][gx].dot(v);
            }

            function noiseAt(x, y) {
                // Grid coordinates
                let x0 = x | 0; // To integer
                let y0 = y | 0;
                let x1 = x0 + 1;
                let y1 = y0 + 1;

                // Fractional part of grid coordinates
                let tx = x - x0;
                let ty = y - y0;

                // Smoothing
                tx = _this.smoother(tx);
                ty = _this.smoother(ty);

                let n0, n1;

                // Upper left and right grids
                n0 = dotGridGradient(x0, y0, x, y);
                n1 = dotGridGradient(x1, y0, x, y);
                let ix0 = lerp(n0, n1, tx);

                // Lower left and right grids
                n0 = dotGridGradient(x0, y1, x, y);
                n1 = dotGridGradient(x1, y1, x, y);
                let ix1 = lerp(n0, n1, tx);

                // Put them together
                let value = lerp(ix0, ix1, ty);

                return value;
            }

            // Need to have called buildGrid() first
            if (!xgrid || !ygrid) { return null; }

            // Make a new 2D array for results
            let g = make2DArray(ysize, xsize);

            // Ratio of output to input sizes
            let xratio = xgrid / xsize;
            let yratio = ygrid / ysize;

            // Fill the grid with noise
            for (let y = 0; y < ysize; ++y) {
                let gy = y * yratio;

                for (let x = 0; x < xsize; ++x) {
                    let gx = x * xratio;

                    g[y][x] = noiseAt(gx, gy);
                }
            }

            return g;
        }

        /**
         * Set the smoothing level
         * 
         * @param {number} n 0=raw, 1=smooth, 2=improved
         */
        setSmoothing(n) {
            switch (n) {
                case 0:
                    this.smoother = this.smoother0;
                    break;
                case 1:
                    this.smoother = this.smoother1;
                    break;
                case 2:
                    this.smoother = this.smoother2;
                    break;
            }
        }
    }

    // Exports
    ns.Perlin = Perlin;

}(typeof beejus == "object"? beejus: window));