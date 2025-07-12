// Working variables
let timerActive = false;
let blockedSites = [];
let timeLimit = 30; // Fallback (minutes)

// Load settings
chrome.storage.sync.get(['sites', 'hours', 'minutes'], (data) => {
  blockedSites = data.sites || [];
  timeLimit = (data.hours || 0) * 60 + (data.minutes || 30);
});

// Tab monitoring
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => checkSite(tab.url));
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url) checkSite(tab.url);
});

// Site checking
function checkSite(url) {
  if (!url) return;
  try {
    const domain = new URL(url).hostname;
    const isBlocked = blockedSites.some(site => domain.includes(site));
    
    if (isBlocked && !timerActive) {
      timerActive = true;
      chrome.alarms.create('siteTimer', { delayInMinutes: timeLimit });
    } else if (!isBlocked && timerActive) {
      chrome.alarms.clear('siteTimer');
      timerActive = false;
    }
  } catch(e) { console.log("URL parsing error"); }
}

// WORKING NOTIFICATION CODE (no warnings)
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'siteTimer') {
    const notificationId = 'focus-' + Date.now();
    
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: '⏰ Focus Reminder',
      message: `You've spent ${formatTime(timeLimit)} on this site!`,
      priority: 2
    }, (id) => {
      if (chrome.runtime.lastError) {
        console.error("Notification failed:", chrome.runtime.lastError);
      }
    });
    
    timerActive = false;
  }
});

// Helper function
function formatTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}