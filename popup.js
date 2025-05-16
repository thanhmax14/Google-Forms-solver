document.getElementById("getAnswersBtn").addEventListener("click", () => {
  const button = document.getElementById("getAnswersBtn");
  button.classList.add("loading");

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: () => {
        if (typeof deleteAnswers === "function" && typeof getAnswers === "function") {
          deleteAnswers();
          getAnswers();
        }
      }
    }, () => {
      button.classList.remove("loading");
    });
  });
});
