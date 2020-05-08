"use strict";
import { ipcRenderer } from "electron";
import { addAttributes, create, getById } from "common/utils";
import { readFileSync, readdirSync } from "fs";
import * as path from "path";
import { slide } from "./slider.js";
import { initCorrection } from "./algorithm";
import "../static/server/style.scss";

const isDevelopment = process.env.NODE_ENV !== 'production';

document.body.innerHTML = readFileSync(
  path.join(__static, "server/index.html"),
  "utf8"
);

let slider = getById("slider");
let sliderItems = getById("slides");
let prev = getById("prev");
let next = getById("next");

let slideItems = document.createDocumentFragment();
readdirSync(path.join(__static, "images/slides")).forEach(file => {
  const img = addAttributes(create("img"), {
    src: isDevelopment ? `images/slides/${file}` : path.resolve(__static, `images/slides/${file}`),
    alt: file,
    class: "slide",
    draggable: false,
  });
  slideItems.appendChild(img);
});

readdirSync(path.join(__static, "videos")).forEach(file => {
  const video = addAttributes(create("video"), {
    src: isDevelopment ? `videos/${file}` : path.resolve(__static, `videos/${file}`),
    alt: file,
    class: "slide",
    draggable: false,
    preload: "metadata",
    loop: "",
  });
  slideItems.appendChild(video);
});

sliderItems.appendChild(slideItems);

slide(slider, sliderItems, prev, next);

ipcRenderer.on("store-data", function (event, store) {
  switch (store.set) {
    case "server": {
      setServerInfo(store.address, store.port);
      break;
    }
    case "client": {
      setClientInfo(store.address);
      break;
    }
    case "lux": {
      updateLuxValue(store.value);
      initCorrection(store.value);
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    initCorrection()
  }
})

function setServerInfo(address, port) {
  getById("server-ip").innerHTML = address;
  getById("server-port").innerHTML = port;
}

function setClientInfo(address) {
  getById("client-ip").innerHTML = address;
}

function updateLuxValue(value) {
  getById("lux-value").innerHTML = value;
}
