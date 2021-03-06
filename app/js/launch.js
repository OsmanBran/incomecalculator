/**
 * Response variable to be set when responding to IPC message asynchronously
 */
var asyncResponseMethod = null;

/**
 * Called when the user clicks on the extension icon in the address bar
 */
chrome.browserAction.onClicked.addListener(function(tab) {
  launchCalculator(true, null);
});

/**
 * Open or focus the main page
 */
function launchCalculator(focus, sendResponse) {
  // Check if a tab is open
  // BUG Tab check does not work in Firefox
  var indexURL = chrome.extension.getURL("index.html");
  chrome.tabs.query({ url: indexURL }, function(tabs) {
    if (tabs.length === 0) {
      // Add event listener to respond when the page has loaded
      if (sendResponse !== null) {
        asyncResponseMethod = sendResponse;
        chrome.tabs.onUpdated.addListener(checkLoad);
      }
      chrome.tabs.create({ url: indexURL, active: focus });
    } else {
      // If there's more than one, close all but the first
      var len = tabs.length, i = 1;
      for (i; i < len; i++) {
        chrome.tabs.remove(tabs[i].id);
      }

      // Focus the window and tab containing the page we want
      chrome.tabs.update(tabs[0].id, {active: true});
      chrome.windows.update(tabs[0].windowId, {focused: true});

      // Tell the injected script to send data
      if (sendResponse !== null) {
        sendResponse("Done!");
      }
    }
  });
}

/**
 * Listen for checkTab messages from the injected script
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.checkTab){
    // Pass along the sendReponse method for delayed use
    launchCalculator(false, sendResponse);

    // Keep the port open for async response
    return true;
  }
});

/**
 * Checks if the page has finished loading
 */
function checkLoad(tabId, info, tab) {
  // "loading" seems to achieve enough wait time
  if (tab.url == chrome.extension.getURL("index.html")) {
    if (info.status == "complete") { // "complete"
      chrome.tabs.onUpdated.removeListener(checkLoad);
      asyncResponseMethod("Done!");
      asyncResponseMethod = null;
    }
  }
}
