(function() {
  var DEFAULT_COLOR = '#d0d0d0';
  var DEFAULT_HOT_COLOR = '#ffeb3b';
  var DEFAULT_HOT_THRESHOLD = 50;
  var DEFAULT_FONT_SIZE = 100;

  var table = null;
  var currentColor = DEFAULT_COLOR;

  function init() {
    table = document.getElementById('posts_table');
    if (!table) return;

    // Load settings and apply initial state
    chrome.storage.sync.get(['stripeColor', 'hideRead', 'readThreads', 'highlightHot', 'hotThreshold', 'hotColor', 'fontSize', 'hideOld', 'maxAgeDays'], function(result) {
      currentColor = result.stripeColor || DEFAULT_COLOR;
      var readThreads = result.readThreads || {};
      if (Array.isArray(readThreads)) readThreads = {};
      var fontSize = result.fontSize || DEFAULT_FONT_SIZE;

      applyFontSize(fontSize);
      applyFilters(readThreads);
      trackClicks(readThreads);
    });
  }

  function getDataRows() {
    var rows = document.querySelectorAll('#posts_table tbody tr');
    return Array.from(rows).filter(function(row) {
      return !row.querySelector('th');
    });
  }

  function getThreadId(row) {
    var link = row.querySelector('td a[href*="viewtopic.php"]');
    if (link) {
      var match = link.href.match(/t=(\d+)/);
      return match ? match[1] : null;
    }
    return null;
  }

  function getLastPostId(row) {
    var links = row.querySelectorAll('td a[href*="viewtopic.php?p="]');
    for (var i = 0; i < links.length; i++) {
      var match = links[i].href.match(/p=(\d+)/);
      if (match) return match[1];
    }
    return null;
  }

  function getReplyCount(row) {
    var cell = row.querySelector('td.NoMobile');
    if (cell) {
      var text = cell.textContent.trim();
      var count = parseInt(text, 10);
      return isNaN(count) ? 0 : count;
    }
    return 0;
  }

  function getThreadAgeDays(row) {
    var cells = row.querySelectorAll('td.NoMobile');
    for (var i = 0; i < cells.length; i++) {
      var cell = cells[i];
      var link = cell.querySelector('a');
      if (link) {
        var text = link.textContent.trim();
        var yearMatch = text.match(/^(\d{4})$/);
        if (yearMatch) {
          var year = parseInt(yearMatch[1], 10);
          var now = new Date();
          var threadDate = new Date(year, 0, 1);
          var diffDays = Math.floor((now - threadDate) / (1000 * 60 * 60 * 24));
          return diffDays;
        }
        var dateMatch = text.match(/^(\d{1,2})\/(\d{1,2})$/);
        if (dateMatch) {
          var month = parseInt(dateMatch[1], 10) - 1;
          var day = parseInt(dateMatch[2], 10);
          var now = new Date();
          var year = now.getFullYear();
          var threadDate = new Date(year, month, day);
          if (threadDate > now) {
            threadDate = new Date(year - 1, month, day);
          }
          var diffDays = Math.floor((now - threadDate) / (1000 * 60 * 60 * 24));
          return diffDays;
        }
        var timeMatch = text.match(/^(\d{1,2}):(\d{2})$/);
        if (timeMatch) {
          return 0;
        }
      }
    }
    return 0;
  }

  function applyFontSize(size) {
    if (!table) return;
    table.style.setProperty('font-size', size + '%', 'important');
  }

  function applyStripes(color) {
    if (!table) return;
    currentColor = color || currentColor;

    chrome.storage.sync.get(['highlightHot', 'hotThreshold', 'hotColor'], function(result) {
      var highlightHot = result.highlightHot || false;
      var hotThreshold = result.hotThreshold || DEFAULT_HOT_THRESHOLD;
      var hotColor = result.hotColor || DEFAULT_HOT_COLOR;

      var rows = getDataRows();
      var count = 0;

      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        if (row.style.display === 'none') continue;

        var replyCount = getReplyCount(row);
        var bgColor;

        if (highlightHot && replyCount >= hotThreshold) {
          bgColor = hotColor;
        } else {
          bgColor = (count % 2 === 0) ? currentColor : '#ffffff';
        }

        row.style.setProperty('background-color', bgColor, 'important');
        count++;
      }
    });
  }

  function applyFilters(readThreads) {
    if (!table) return;

    chrome.storage.sync.get(['hideRead', 'hideOld', 'maxAgeDays', 'stripeColor'], function(result) {
      var hideRead = result.hideRead || false;
      var hideOld = result.hideOld || false;
      var maxAgeDays = result.maxAgeDays || 30;
      currentColor = result.stripeColor || currentColor;

      var rows = getDataRows();
      rows.forEach(function(row) {
        var shouldHide = false;

        if (hideRead) {
          var threadId = getThreadId(row);
          var lastPostId = getLastPostId(row);
          var savedPostId = threadId ? readThreads[threadId] : null;
          var isFullyRead = savedPostId && savedPostId === lastPostId;
          if (isFullyRead) shouldHide = true;
        }

        if (hideOld && !shouldHide) {
          var ageDays = getThreadAgeDays(row);
          if (ageDays > maxAgeDays) shouldHide = true;
        }

        row.style.display = shouldHide ? 'none' : '';
      });

      applyStripes(currentColor);
    });
  }

  function trackClicks(readThreads) {
    var rows = getDataRows();
    rows.forEach(function(row) {
      var links = row.querySelectorAll('td a[href*="viewtopic.php"]');
      links.forEach(function(link) {
        if (link.dataset.tracked) return;
        link.dataset.tracked = 'true';
        link.addEventListener('click', function() {
          var threadId = getThreadId(row);
          var lastPostId = getLastPostId(row);
          if (threadId && lastPostId) {
            readThreads[threadId] = lastPostId;
            chrome.storage.sync.set({ readThreads: readThreads });
          }
        });
      });
    });
  }

  // Listen for messages from the side panel
  chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.type === 'stripeColor') {
      applyStripes(message.value);
    } else if (message.type === 'applyStripes') {
      applyStripes();
    } else if (message.type === 'applyFilters') {
      chrome.storage.sync.get(['readThreads'], function(result) {
        var readThreads = result.readThreads || {};
        if (Array.isArray(readThreads)) readThreads = {};
        applyFilters(readThreads);
      });
    } else if (message.type === 'fontSize') {
      applyFontSize(message.value);
    }
  });

  // Also listen for storage changes (backup for side panel communication)
  chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (namespace !== 'sync' || !table) return;

    if (changes.fontSize) {
      applyFontSize(changes.fontSize.newValue || DEFAULT_FONT_SIZE);
    }
    if (changes.stripeColor) {
      currentColor = changes.stripeColor.newValue || DEFAULT_COLOR;
      applyStripes(currentColor);
    }
    if (changes.highlightHot || changes.hotThreshold || changes.hotColor) {
      applyStripes();
    }
    if (changes.hideRead || changes.hideOld || changes.maxAgeDays || changes.readThreads) {
      chrome.storage.sync.get(['readThreads'], function(result) {
        var readThreads = result.readThreads || {};
        if (Array.isArray(readThreads)) readThreads = {};
        applyFilters(readThreads);
      });
    }
  });

  init();

  window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
      init();
    }
  });
})();
