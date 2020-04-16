'use strict';
import { $$ } from 'common/utils.js';
import { ipcRenderer } from 'electron';

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
    $$('.server-ip').innerHTML = address;
    $$('.server-port').innerHTML = port;
}

function setClientInfo(address) {
    $$('.client-ip').innerHTML = address;
}

function updateLuxValue(value) {
    $$('.lux-value').innerHTML = value;
}