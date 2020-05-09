'use strict'
const { getById } = require('common/utils');
const remote = require('electron').remote;

let sliderWrapper;
let correctionWindow;

const colorMap = {};
let tones = [];
let i = 0;
let j = 1;

while (j < 256) {
    if (deltaE(rgb2lab([i, i, i]), rgb2lab([j, j, j])) >= 1.5) {
        tones.push(j);
        i = j++;
    } else j++
}
if (tones.pop() !== 255) tones.push(255);

function createWindow() {
    const BrowserWindow = remote.BrowserWindow;

    correctionWindow = new BrowserWindow({
        height: 540,
        width: 800
    });
    correctionWindow.setMenu(null);
}

function initCorrection(lux = 0) {
    if (!sliderWrapper) {
        sliderWrapper = getById('sliderWrapper');
    }
    // lux = Math.floor(Math.random() * 3000);

    const currentSlide = document.querySelector('.slide.active');
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const context = canvas.getContext('2d');
    context.drawImage(currentSlide, 0, 0, 960, 540);
    const data = context.getImageData(0, 0, 1920, 1080);
    let promise;

    if (false) {
        promise = new Promise((resolve, reject) => {
        })
    } else {
        promise = new Promise(function(resolve, reject) {
            for (var x = 0, len = data.data.length; x < len; x += 4) {
                const r = data.data[x];
                const g = data.data[x + 1];
                const b = data.data[x + 2];

                const averageColor = Math.floor((r + g + b) / 3);
                const swap = tones.find(tone => tone >= averageColor);

                let diff = swap - averageColor + Math.log(lux);
                if (swap + 20 <= 235) {
                    data.data[x] += diff;
                    data.data[x + 1] += diff;
                    data.data[x + 2] += diff;
                }

                // colorMap[averageColor] = colorMap[averageColor] + 1 || 1;
            }
            resolve(data);
        })
    }

    promise.then((data) => {
        context.putImageData(data, 0, 0);

        correctionWindow.loadURL(canvas.toDataURL());
        console.log(lux);
    })
}

function rgb2lab(rgb) {
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

function deltaE(labA, labB) {
    const deltaL = labA[0] - labB[0];
    const deltaA = labA[1] - labB[1];
    const deltaB = labA[2] - labB[2];
    const c1 = Math.sqrt(Math.pow(labA[1], 2) + Math.pow(labA[2], 2));
    const c2 = Math.sqrt(Math.pow(labB[1], 2) + Math.pow(labB[2], 2));
    const deltaC = c1 - c2;

    let deltaH = deltaA * deltaA + deltaB * deltaB - deltaC * deltaC;
    deltaH = deltaH < 0 ? 0 : Math.sqrt(deltaH);

    // const sc = 1 + 0.045 * c1;
    // const sh = 1 + 0.015 * c1;

    // const deltaLKlsl = deltaL / 1.0;
    // const deltaCkcsc = deltaC / sc;
    // const deltaHkhsh = deltaH / sh;

    const i = Math.pow(deltaL, 2); //+ Math.pow(deltaCkcsc, 2) + Math.pow(deltaHkhsh, 2);
    return i < 0 ? 0 : Math.sqrt(i);
}


module.exports = {
    createWindow,
    initCorrection
}