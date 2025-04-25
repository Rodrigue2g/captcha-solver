console.log("[Captcha Solver] content.js injected into page!");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("[Captcha Solver] Received message:", request);

  if (request.action === "getCaptchaBase64") {
    try {
      const img = document.querySelector(".el-image__inner");

      if (!img) {
        console.warn("[Captcha Solver] No image element found.");
        sendResponse({ base64: null });
        return true;
      }

      if (!img.src) {
        console.warn("[Captcha Solver] Image found but src is missing.");
        sendResponse({ base64: null });
        return true;
      }

      if (!img.src.startsWith("data:image")) {
        console.warn("[Captcha Solver] Image src is not base64 format.");
        sendResponse({ base64: null });
        return true;
      }

      console.log("[Captcha Solver] Sending base64 back.");
      sendResponse({ base64: img.src });
      return true; // Important: indicate async response
    } catch (error) {
      console.error("[Captcha Solver] Error in content script:", error);
      sendResponse({ base64: null });
      return true;
    }
  }

  // Always respond somehow even if wrong action
  console.warn("[Captcha Solver] Unknown action received.");
  sendResponse({ base64: null });
  return true;
});
