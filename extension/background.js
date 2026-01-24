// Enable side panel to open on bogleheads.org
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Returns badge color based on unread count thresholds
function getBadgeColor(count) {
  if (count <= 20) return '#22c55e';  // Green
  if (count <= 60) return '#eab308';  // Yellow
  return '#ff0000';                    // Red
}

// Listen for badge updates from content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'updateBadge') {
    if (message.unreadCount > 0) {
      chrome.action.setBadgeText({ text: String(message.unreadCount), tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: getBadgeColor(message.unreadCount), tabId: sender.tab.id });
      chrome.action.setBadgeTextColor({ color: '#ffffff', tabId: sender.tab.id });
    } else {
      chrome.action.setBadgeText({ text: '', tabId: sender.tab.id });
    }
  }
});

