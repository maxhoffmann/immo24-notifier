document.addEventListener("DOMContentLoaded", () => {
  const firstExpose = document.querySelector('#expose1');
  const secondExpose = document.querySelector('#expose2');

  firstExpose.addEventListener("input", (event) => {
    localStorage.setItem('expose1', event.target.value);
  });
  secondExpose.addEventListener("input", (event) => {
    localStorage.setItem('expose2', event.target.value);
  });

  if (localStorage.getItem('expose1')) {
    firstExpose.value = localStorage.getItem('expose1');
  }
  if (localStorage.getItem('expose2')) {
    secondExpose.value = localStorage.getItem('expose2');
  }

  document.querySelector("#test-example").addEventListener("click", async () => {
    const now = new Date();
    const time = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: `[${time}] Test-Anzeige XXXXXXXXX`,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
  document.querySelector("#test-one").addEventListener("click", async () => {
    const firstExposeId = firstExpose.value;
    const now = new Date();
    const time = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

    await chrome.notifications.create("immo24:" + firstExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: `[${time}] Test-Anzeige ${firstExposeId}`,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
  document.querySelector("#test-multiple").addEventListener("click", async () => {
    const firstExposeId = firstExpose.value;
    const secondExposeId = secondExpose.value;
    const now = new Date();
    const time = `${new Date().getHours().toString().padStart(2, "0")}:${new Date().getMinutes().toString().padStart(2, "0")}`;

    chrome.notifications.create("immo24:" + firstExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: `[${time}] Test-Anzeige ${firstExposeId}`,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
    chrome.notifications.create("immo24:" + secondExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: `[${time}] Test-Anzeige ${secondExposeId}`,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
});
