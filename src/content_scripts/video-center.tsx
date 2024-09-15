import { inject, postMessage, receiveMessage } from "../utils";

window.addEventListener("load", function() {

  inject("/js/inject_scripts/video-center.js");

});

receiveMessage({
  action: "START_VIDEO_SELECT", location: "chrome", callback(payload) {
    postMessage({ action: "START_VIDEO_SELECT", payload })
  },
})

