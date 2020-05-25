'use strict'

let i = 0;
let j = 1;

function log(functionName, value) {
    console.log(functionName, value)
}

class Algorithm {
    constructor() {
        this.colorMap = {};
        this.tones = [];
        
        this.correctionWindow;
        this.correctionLineUp = null;
        this.lux = 0;

        while (j < 256) {
            if (this.deltaE(this.rgb2lab([i, i, i]), this.rgb2lab([j, j, j])) >= 1.5) {
                this.tones.push(j);
                i = j++;
            } else j++
        }
        if (this.tones.pop() !== 255) this.tones.push(255);
    }

    createWindow() {
        log('createWindow', this.correctionWindow);
        
        this.correctionWindow = window.open('', 'Correction result');
        this.correctionWindow.document.write('<canvas id="correctionCanvas"></canvas>');

        this.correctionWindow.on('closed', () => {
            console.warn(this.correctionWindow, true);
            this.correctionWindow = null
            console.warn(this.correctionWindow, false);
        })
    }    

    updateLuxValue(newLux = 0) {
        this.lux = newLux;
        log('updateLuxValue', this.lux);

        if (!this.correctionLineUp) {
            this.correctionLineUp = true;
            this.initCorrection.call(this);
        }
    }

    async initCorrection() {
        this.createWindow();
        log('initCorrection', this.correctionLineUp);
        this.currentSlide = document.querySelector('.slide.active');
        this.canvas = this.correctionWindow.document.getElementById('correctionCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.canvas.width = 960;
        this.canvas.height = 540;
        
        this.context.drawImage(this.currentSlide, 0, 0, 960, 540);
        
        if (false) {

        } else {
            log('initCorrection', 'set correctionLineUp')
            this.correctionLineUp = setInterval(this.toneCorrection.bind(this), 1000);
        }
    }

    toneCorrection() {
        log('toneCorrection', this.lux);
        if (this.correctionWindow) {
            this.context.drawImage(this.currentSlide, 0, 0, 960, 540);
            this.data = this.context.getImageData(0, 0, 1920, 1080);
    
            for (var x = 0, len = this.data.data.length; x < len; x += 4) {
                const r = this.data.data[x];
                const g = this.data.data[x + 1];
                const b = this.data.data[x + 2];
    
                const averageColor = Math.floor((r + g + b) / 3);
                const swap = this.tones.find(tone => tone >= averageColor);
        
                let diff = swap - averageColor + Math.log(this.lux);
                if (swap + 20 <= 235) {
                    this.data.data[x] += diff;
                    this.data.data[x + 1] += diff;
                    this.data.data[x + 2] += diff;
                }
    
                // colorMap[averageColor] = colorMap[averageColor] + 1 || 1;
            }
            this.context.putImageData(this.data, 0, 0);
        } else {
            clearInterval(this.correctionLineUp);
            this.correctionLineUp = null;
        }
    }

    rgb2lab(rgb) {
        let r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
            x, y, z;
    
        const formatRGB = c => (c > 0.04045) ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
        const formatXYZ = c => (c > 0.008856) ? Math.pow(c, 1 / 3) : (7.787 * c) + 16 / 116;
    
        r = formatRGB(r);
        g = formatRGB(g);
        b = formatRGB(b);
    
        x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
        z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    
        x = formatXYZ(x);
        y = formatXYZ(y);
        z = formatXYZ(z);
    
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
    }

    deltaE(labA, labB) {
        const deltaL = labA[0] - labB[0];
        const deltaA = labA[1] - labB[1];
        const deltaB = labA[2] - labB[2];
        const c1 = Math.sqrt(Math.pow(labA[1], 2) + Math.pow(labA[2], 2));
        const c2 = Math.sqrt(Math.pow(labB[1], 2) + Math.pow(labB[2], 2));
        const deltaC = c1 - c2;
    
        let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
        deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);
    
        const i = Math.pow(deltaL, 2);
        return i < 0 ? 0 : Math.sqrt(i);
    }
}

module.exports = {
    Algorithm
}