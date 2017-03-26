/**
 * Simple 2D vector class
 */
;(function (ns) {
    "use strict";

    /**
     * Holds a 2D Vector
     */
    class Vector2D {

        /**
         * Constructor
         */
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        /**
         * Helper function to create a random unit vector
         */
        randomUnit() {
            let r = Math.random();
            let a = 2 * Math.PI * r;

            this.x = Math.cos(a);
            this.y = Math.sin(a);

            return this;
        }

        /**
         * Return the dot product of this vector and another 
         * 
         * @param {Vector2D} v 
         */
        dot(v) {
            return this.x * v.x + this.y * v.y;
        }
    }

    // Exports
    ns.Vector2D = Vector2D;

}(typeof beejus == "object"? beejus: window));