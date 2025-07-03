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
    await chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: "x neue Anzeigen!",
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
  document.querySelector("#test-one").addEventListener("click", async () => {
    const firstExposeId = firstExpose.value;

    await chrome.notifications.create("immo24:" + firstExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: "Test-Anzeige: "+firstExposeId,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
  document.querySelector("#test-multiple").addEventListener("click", async () => {
    const firstExposeId = firstExpose.value;
    const secondExposeId = secondExpose.value;

    chrome.notifications.create("immo24:" + firstExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: "Test-Anzeige: "+firstExposeId,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
    chrome.notifications.create("immo24:" + secondExposeId, {
      type: "basic",
      iconUrl: "icon-48.png",
      title: "Test-Anzeige: "+secondExposeId,
      message: "auf ImmoScout24",
      requireInteraction: true,
    });
  });
});
