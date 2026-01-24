// Enable side panel to open on bogleheads.org
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Listen for badge updates from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'updateBadge') {
    if (message.unreadCount > 0) {
      chrome.action.setBadgeText({ text: String(message.unreadCount), tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#ff0000', tabId: sender.tab.id });
      chrome.action.setBadgeTextColor({ color: '#ffffff', tabId: sender.tab.id });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: sender.tab.id });
    }
  }
});

