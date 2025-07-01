document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("button").addEventListener("click", () => {
    chrome.notifications.create({
      type: "basic",
      title: "x neue Anzeigen!",
      message: "auf ImmoScout24",
      iconUrl: "icon-48.png",
    });
  });
});
