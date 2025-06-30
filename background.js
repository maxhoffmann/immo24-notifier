const CHECK_INTERVAL = 10 * 1000; // 10 seconds
const TARGET_URL_PREFIX = "https://www.immobilienscout24.de/Suche";

const tabListingsMap = new Map(); // tabId → Set of listing IDs

// Periodically reload matching tabs
setInterval(() => {
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.url && tab.url.startsWith(TARGET_URL_PREFIX)) {
        chrome.tabs.reload(tab.id);
      }
    });
  });
}, CHECK_INTERVAL);

// After a tab reloads and finishes loading
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url.startsWith(TARGET_URL_PREFIX)
  ) {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabId },
        func: collectListingIds,
      },
      (results) => {
        if (chrome.runtime.lastError || !results || !results[0]) return;

        const newIds = new Set(results[0].result); // IDs found in the page
        const prevIds = tabListingsMap.get(tabId) || new Set();

        const addedIds = newIds.difference(prevIds);

        console.log(new Date().toLocaleString(), addedIds, prevIds.size);
        if (addedIds.size > 0 && prevIds.size > 0) {
          console.log(`‼️ ${addedIds.size} new listings`, addedIds);
          const titles = [...addedIds].map(
            (id) =>
              document.querySelector(`[data-exp-id="${id}"] h2`).innerText,
          );
          showNotification(
            tabId,
            `${addedIds.size} ${addedIds.size === 1 ? "neue Anzeige" : "neue Anzeigen"}`,
            titles.join(" | "),
          );
        } else {
          console.log("no new listings", prevIds);
        }

        // Update stored IDs
        tabListingsMap.set(tabId, newIds.union(prevIds));
      },
    );
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  const prefix = "immo24:";
  if (notificationId.startsWith(prefix)) {
    const tabId = parseInt(notificationId.slice(prefix.length), 10);
    if (!isNaN(tabId)) {
      try {
        const tab = await chrome.tabs.get(tabId);
        await chrome.tabs.update(tabId, { active: true });
        await chrome.windows.update(tab.windowId, { focused: true });
      } catch (err) {
        console.error("Failed to focus tab", err);
      }
    }
  }
});

// Function injected into page to collect listing IDs
function collectListingIds() {
  return Array.from(
    document.querySelectorAll('[data-testid="ListingsGrid"] [data-obid]'),
  )
    .map((el) => el.getAttribute("data-obid"))
    .filter(Boolean);
}

// Show notification from service worker
async function showNotification(tabId, title, message) {
  await chrome.notifications.create("immo24:" + tabId, {
    type: "basic",
    iconUrl: "immo.jpg",
    title: title,
    message: message,
  });
}
