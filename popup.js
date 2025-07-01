document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("button").addEventListener("click", () => {
    let options = {
      type: "basic",
      title: "x neue Anzeigen!",
      message: "auf ImmoScout24",
      iconUrl: "icon-48.png",
    };
    chrome.notifications.create(options);
  });
});
