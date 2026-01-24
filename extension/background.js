// Enable side panel to open on bogleheads.org
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });

// Auto-open side panel when navigating to bogleheads.org
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('bogleheads.org')) {
    chrome.sidePanel.open({ tabId: tabId });
  }
});

// Also open when a bogleheads.org tab becomes active
chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.get(activeInfo.tabId, function(tab) {
    if (tab.url && tab.url.includes('bogleheads.org')) {
      chrome.sidePanel.open({ tabId: activeInfo.tabId });
    }
  });
});
