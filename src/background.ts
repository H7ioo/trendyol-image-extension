import { receiveMessage } from "./utils";

receiveMessage({
  location: "chrome",
  action: "START_VIDEO_SELECT",
  callback(payload) {
    // TODO: Create a wrapper
    // Query the active tab in the current window
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const activeTab = tabs[0];
        // Send a message to the content script in the active tab
        chrome.tabs.sendMessage(activeTab.id!, {
          message: { action: "START_VIDEO_SELECT", payload },
        });
      }
    });
  },
});
