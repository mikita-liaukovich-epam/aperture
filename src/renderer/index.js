'use strict';
// require('@/listener');
import '@/slider';
import { ipcRenderer } from 'electron';

console.log('SOME');

ipcRenderer.on('store-data', function (event, store) {
    switch (store.set) {
        case 'server': {
            setServerInfo(store.address, store.port);
            break;
        }
        case 'client': {
            setClientInfo(store.address);
            break;
        }
        case 'lux': {
            updateLuxValue(store.value);
        }
    }
});

function setServerInfo(address, port) {
    document.getElementById('server-ip').innerHTML = address;
    document.getElementById('server-port').innerHTML = port;
}

function setClientInfo(address) {
    document.getElementById('client-ip').innerHTML = address;
}

function updateLuxValue(value) {
    document.getElementById('lux-value').innerHTML = value;
}