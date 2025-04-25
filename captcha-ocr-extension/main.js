// main.js (service_worker)
chrome.runtime.onInstalled.addListener(() => {
  console.log("[Captcha Solver] Extension installed.");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "ping") {
    console.log("[Captcha Solver] Received ping.");
    sendResponse({ ok: true });
  }

  return true;
});

