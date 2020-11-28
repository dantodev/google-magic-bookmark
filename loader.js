function start() {
  let bookmarkId = location.hash.substr(1);
  let storageKey = `bookmark-${bookmarkId}`;
  
  chrome.storage.sync.get([storageKey], storage => {
    if (storage.hasOwnProperty(storageKey)) {
      let data = storage[storageKey];

      chrome.tabs.getCurrent(tab => {
        chrome.storage.sync.set({
          [storageKey]: {
            tabId: tab.id,
            url: tab.url
          }
        });
        chrome.storage.sync.set({
          [`tab-${tab.id}`]: bookmarkId
        });
  
        location.href = data.url;
      });
    } else {
      renderMessage("Bookmark reference could not be found.");
    }
  });
  
}

function renderMessage(message) {
  document.body.innerHTML = message;
}


start();
