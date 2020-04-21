'use strict'
const { getById } = require('common/utils');

let sliderWrapper;

function initCorrection(lux) {
    if (!sliderWrapper) {
        sliderWrapper = getById('sliderWrapper');
    }
    lux = Math.floor(Math.random() * 3000);

    console.log(lux);
}

module.exports = {
    initCorrection
}