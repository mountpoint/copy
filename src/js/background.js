(function() {
  /**
   * Handle click on icon
   * "popup" not works with an onclick event.
   * Remove the popup.html from the manifest file. And keep the background page, and it will work.
   */
  chrome.browserAction.onClicked.addListener(function() {

  });

  /**
   * Actions after extension installed
   */
  chrome.runtime.onInstalled.addListener(function() {
    // default settings
    Ext.setValue({
      snippets: [],
      closePopupAfterCopy: true
    });
  });
})();
