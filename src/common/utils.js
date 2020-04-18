const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds))
const $$ = el => document.querySelector(el);
const getById = el => document.getElementById(el);
const create = el => document.createElement(el);
const remove = (parent, child) => (parent.removeChild(child), parent);
const append = (parent, child) => (parent.appendChild(child), parent);
const setId = (el, newId) => (el.id = newId, el);
const addClass = (el, className) => (el.classList.add(className), el);
const addAttributes = (el, attrs) => {
    for (const name in attrs) {
        el.setAttribute(name, attrs[name].toString());
    }
    return el;
};

function getIPv4Address() {
    const interfaces = require('os').networkInterfaces();
    for (let devName in interfaces) {
        const iface = interfaces[devName];

        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }
    }

    console.warn('Address is 0.0.0.0! Check your network settings!');
    return '0.0.0.0';
}

module.exports = {
    $$,
    append,
    addAttributes,
    addClass,
    create,
    getById,
    getIPv4Address,
    remove,
    setId,
    sleep,
}