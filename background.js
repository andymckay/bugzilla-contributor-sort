browser.pageAction.onClicked.addListener((tab) => {
  browser.tabs.create({"url": `/bugzilla.html?tabId=${tab.id}`});
});

function handler(request, sender, sendResponse) {
  if (request.valid && request.valid === true) {
    browser.browserAction.setBadgeText({text: 'ON', tabId: request.tabId});
  } else {
    browser.browserAction.setBadgeText({text: '', tabId: request.tabId});
  }
}



function checkValid(tabId, changeInfo, tab) {
  let ask_flag = null;

  function ask() {
    browser.tabs.sendMessage(tabId, {query: 'isValid'})
    .then(response => {
      window.clearInterval(ask_flag);
      if (response.isValid) {
        browser.pageAction.show(tabId);
      }
    });
  }

  if (tab.url.startsWith('https://bugzilla.mozilla.org/')) {
    ask_flag = window.setInterval(ask, 3000);
  }

}

browser.tabs.onUpdated.addListener(checkValid);
