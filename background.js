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
    const url = new URL(tab.url);
    const params = url.searchParams;
    if (params.get("sorting") && params.get("sorting") === "2") {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabId },
          func: collectListingIds,
        },
        (results) => {
          if (chrome.runtime.lastError || !results || !results[0]) return;

          const titleById = results[0].result;
          const newIds = new Set(Object.keys(titleById ?? {})); // IDs found in the page
          const prevIds = tabListingsMap.get(tabId) || new Set();

          const addedIds = newIds.difference(prevIds);

          console.log(new Date().toLocaleString());
          if (addedIds.size > 0 && prevIds.size > 0) {
            console.info(`‼️ ${addedIds.size} new listings`, addedIds);
            const ids = [...addedIds];
            const now = new Date();
            const time = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
            for (const id of ids) {
              showNotification(
                id,
                `[${time}] Neue Anzeige ${id}`,
                titleById[id] ?? '(keine Beschreibung)',
              );
            }
          } else {
            console.log("no new listings", prevIds);
          }

          // Update stored IDs
          tabListingsMap.set(tabId, newIds.union(prevIds));
        },
      );
    } else {
      console.info("fixed sorting");
      params.set("sorting", "2");
      chrome.tabs.update(tabId, { url: url.toString() });
    }
  }
});

chrome.notifications.onClicked.addListener(async (notificationId) => {
  const prefix = "immo24:";
  if (notificationId.startsWith(prefix)) {
    const exposeId = parseInt(notificationId.slice(prefix.length), 10);
    if (!isNaN(exposeId)) {
      try {
        const tab = await chrome.tabs.create({
          url: `https://www.immobilienscout24.de/expose/${exposeId}`,
        });
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
  ).reduce((acc, el) => {
    const id = el.getAttribute("data-obid");
    const title = el.querySelector(`[data-exp-id="${id}"] h2`)?.innerText;
    if (id && title) {
      acc[id] = title;
    }
    return acc;
  }, {});
}

// Show notification from service worker
async function showNotification(exposeId, title, message) {
  await chrome.notifications.create("immo24:" + exposeId, {
    type: "basic",
    iconUrl: "icon-48.png",
    title: title,
    message: message,
    requireInteraction: true,
  });
}
