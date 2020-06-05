'use strict'

class Algorithm {
    constructor() {
        this.EColorMap = {};
        this.LColorMap = {};
        this.tones = [];

        this.correctionWindow;
        this.lux = 0;
        this.canvasWidth = 960;
        this.canvasHeight = 540;
        this.isDLType = false;

        let i = 0;
        let j = 1;
        
        while (j < 256) {
            if (this.deltaE(this.rgb2lab([i, i, i]), this.rgb2lab([j, j, j])) >= 1) {
                this.tones.push(j);
                i = j++;
            } else j++
        }

        if (this.tones[this.tones.length - 1] !== 255) this.tones.push(255);
        
        for (let color = 0; color < 256; color++) {
            this.EColorMap[color] = this.tones.find(tone => tone >= color)
        }
        console.log(this.tones);

        i = 1;
        j = 1;
        this.tones = [];
        
        while (j < 256) {
            const Li = this.getL(this.rgb2lab([i, i, i])) * 0.65;
            const Lj = this.getL(this.rgb2lab([j, j, j])) * 0.65;
            const a = (Lj - Li);
            const b = (Lj + Li) / 2;
            const c = a / b;

            const Li0 = this.getL(this.rgb2lab([i, i, i]));
            const Lip1 = this.getL(this.rgb2lab([i + 1, i + 1, i + 1]));
            const a1 = (Lip1 - Li0);
            const b1 = (Lip1 + Li0) / 2;
            const c1 = a1 / b1;
            
            if ( c > c1 ) {
                this.tones.push(j);
                i = j++;
            } else j++
        }

        if (this.tones[this.tones.length - 1] !== 255) this.tones.push(255);

        for (let color = 0; color < 256; color++) {
            this.LColorMap[color] = this.tones.find(tone => tone >= color)
        }
        console.log(this.tones);
    }

    createWindow() {
        this.correctionWindow = window.open('', 'Correction result');
        this.correctionWindow.document.write(`
            <body style="background: #333; display: flex; align-items: center; margin: 0;"></body>
            <canvas style="height: 100%; width: 100%" id="correctionCanvas"></canvas>
        `);
    }

    updateLuxValue(newLux) {
        this.lux = Math.log(Math.pow(newLux || 1, 3));

        if (!this.correctionWindow || this.correctionWindow.closed) {
            this.initCorrection.call(this);
        }
    }

    /**
     * @param {boolean} value - is DeltaL Correction needed
     */
    set setIsDLType(value) {
        return this.isDLType = value;
    }

    async initCorrection() {
        this.createWindow();
        this.currentSlide = document.querySelector('.slide.active');
        this.canvas = this.correctionWindow.document.getElementById('correctionCanvas');
        this.context = this.canvas.getContext('2d');
        
        this.canvas.width = this.canvasWidth;
        this.canvas.height = this.canvasHeight;
        
        this.context.drawImage(this.currentSlide, 0, 0, this.canvasWidth, this.canvasHeight);
        
        if (this.isDLType) {
            this.colorMap = this.LColorMap;
        } else {
            this.colorMap = this.EColorMap;
        }

        this.correctionWindow.requestAnimationFrame(this.toneCompression.bind(this));
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

    formatRGB(c) {
        return (c > 0.04045) ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92;
    } 

    formatXYZ(c) {
        return (c > 0.008856) ? Math.pow(c, 1 / 3) : (7.787 * c) + 16 / 116;
    } 

    rgb2xyz([r, g, b]) {
        r = this.formatRGB(r / 255);
        g = this.formatRGB(g / 255);
        b = this.formatRGB(b / 255);

        return [
            100 * (r * 0.4124 + g * 0.3576 + b * 0.1805),
            100 * (r * 0.2126 + g * 0.7152 + b * 0.0722),
            100 * (r * 0.0193 + g * 0.1192 + b * 0.9505)
        ]
    }

    rgb2lab(rgb) {
        return this.xyz2lab(this.rgb2xyz(rgb));
    }
    
    xyz2lab([x, y, z]) {
        x = this.formatXYZ(x / 0.95047 / 100);
        y = this.formatXYZ(y / 1.00000 / 100);
        z = this.formatXYZ(z / 1.08883 / 100);
        return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
    }

    getL(lab) {
        const fraction = lab[0] / 100;

        return (fraction > Math.pow(6/29, 3)) 
            ? 116 * Math.pow(fraction, 1/3) 
            : Math.pow(29/3, 3) * fraction;
    }

    deltaL(labA, labB) {
        return this.getL(labA) - this.getL(labB);
    }

    deltaE(labA, labB) {
        return Math.abs(this.deltaL(labA, labB), 2);
    }
}

export {
    Algorithm
}