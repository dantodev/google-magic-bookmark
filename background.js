function start() {
  chrome.browserAction.onClicked.addListener(handleExtensionButton);
  chrome.webNavigation.onDOMContentLoaded.addListener(debounce(500, handleNavigation));
  chrome.webNavigation.onHistoryStateUpdated.addListener(debounce(500, handleNavigation));
}

function handleExtensionButton(tab) {
  console.log("clicked button", tab.id, tab.url);

  getBookmarkIdForTab(tab.id, bookmarkId => {
    if (bookmarkId !== null) {
      console.log("tab already has a bookmark", { tabId, bookmarkId });
      return;
    }
    
    console.log("create initial bookmark");
    chrome.bookmarks.create(
      { parentId: "1", title: tab.title, url: tab.url },
      bookmark => {
        // store bookmark entry to allow reopen last url
        updateBookmark(bookmark.id, tab);

        // store tab/bookmark reference
        chrome.storage.sync.set({ [`tab-${tab.id}`]: bookmark.id });
      }
    );
  });
}

function debounce(time, callback) {
  return (...args) => {
    setTimeout(() => {
      callback(...args);
    }, time);
  };
}

function handleNavigation(event) {
  if (event.frameId !== 0) {
    return;
  }
  
  console.log("its not a frame", event);
  chrome.tabs.getSelected(null, tab => {
    console.log("current tab", tab);
    getBookmarkIdForTab(event.tabId, bookmarkId => {
      console.log("got bookmark id", bookmarkId);
      if (bookmarkId !== null) {
        updateBookmark(bookmarkId, tab);
      }
    });
  });
}

function getBookmarkIdForTab(tabId, callback) {
  let storageKey = `tab-${tabId}`;
  chrome.storage.sync.get([storageKey], storage => {
    callback(storage.hasOwnProperty(storageKey) ? storage[storageKey] : null);
  });
}

function updateBookmark(bookmarkId, tab) {
  console.log("set bookmark entry", { bookmarkId, tab });

  // update in storage
  chrome.storage.sync.set({
    [`bookmark-${bookmarkId}`]: {
      tabId: tab.id,
      url: tab.url
    }
  });
  
  // update bookmark title and url
  chrome.bookmarks.update(bookmarkId, {
    url: chrome.runtime.getURL(`index.html#${bookmarkId}`),
    title: tab.title
  });
}

start();
