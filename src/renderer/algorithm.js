'use strict'

let i = 0;
let j = 1;

class Algorithm {
    constructor() {
        this.colorMap = {};
        this.tones = [];
        
        this.correctionWindow;
        this.lux = 0;
        this.canvasWidth = 960;
        this.canvasHeight = 540;

        while (j < 256) {
            if (this.deltaE(this.rgb2lab([i, i, i]), this.rgb2lab([j, j, j])) >= 1.5) {
                this.tones.push(j);
                i = j++;
            } else j++
        }

        if (this.tones.pop() !== 255) this.tones.push(255);
        
        for (let color = 0; color < 256; color++) {
            this.colorMap[color] = this.tones.find(tone => tone >= color)
        }
        console.log(this.colorMap);
    }

    createWindow() {
        this.correctionWindow = window.open('', 'Correction result');
        this.correctionWindow.document.write(`
            <body style="background: #333; display: flex; align-items: center; margin: 0;"></body>
            <canvas style="height: 100%; width: 100%" id="correctionCanvas"></canvas>
        `);
    }

    updateLuxValue(newLux = 0) {
        this.lux = Math.log(Math.pow(newLux, 3));

        if (!this.correctionWindow || this.correctionWindow.closed) {
            this.initCorrection.call(this);
        }
    }

    async initCorrection() {
        this.createWindow();
        this.currentSlide = document.querySelector('.slide.active');
        this.canvas = this.correctionWindow.document.getElementById('correctionCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        this.context.drawImage(this.currentSlide, 0, 0, this.canvasWidth, this.canvasHeight);
        
        if (false) {

        } else {
            this.correctionWindow.requestAnimationFrame(this.toneCompression.bind(this));
        }
    }

    async toneCompression() {
        if (!this.correctionWindow.closed) {
            this.context.drawImage(this.currentSlide, 0, 0, this.canvasWidth, this.canvasHeight);
            this.slideData = this.context.getImageData(0, 0, this.canvasWidth, this.canvasHeight);
            const data = this.slideData.data;
            
            for (let x = 0; x < data.length; x += 4) {                
                const averageColor = ~~((data[x] + data[x + 1] + data[x + 2]) / 3);
                const diff = this.colorMap[averageColor] - averageColor + this.lux;

                data[x] += diff;
                data[x + 1] += diff;
                data[x + 2] += diff;                    
            }
            
            this.context.putImageData(this.slideData, 0, 0);

            this.correctionWindow.requestAnimationFrame(this.toneCompression.bind(this));
        } else {
            this.correctionWindow = null;
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

export {
    Algorithm
}