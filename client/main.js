let id, pass;

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['captchaId', 'captchaPass'], (result) => {
    if (result.captchaId) document.getElementById("id").value = result.captchaId;
    if (result.captchaPass) document.getElementById("pass").value = result.captchaPass;
  });

  document.getElementById("go").addEventListener("click", handleGo);
  document.getElementById("clear").addEventListener("click", removeData);
});

function handleGo() {
  document.getElementById("Idle").style.display = "none";
  document.getElementById("running").style.display = "inherit";

  id = document.getElementById("id").value;
  pass = document.getElementById("pass").value;

  saveData();

  setTimeout(() => {
    chrome.tabs.update(undefined, { url: "https://aims.iith.ac.in/aims/" });
  }, 100);
}

function saveData() {
  chrome.storage.sync.set({ captchaId: id, captchaPass: pass });
}

function removeData() {
  chrome.storage.sync.clear();
  window.close();
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    setTimeout(() => {
      chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
        const url = tabs[0].url;

        if (url === "https://aims.iith.ac.in/aims/") {
          chrome.scripting.executeScript({ target: { tabId: tab.id }, func: captcha1 });
        }

        if (url === "https://aims.iith.ac.in/aims/login/loginHome") {
          chrome.scripting.executeScript({ target: { tabId: tab.id }, func: captcha2 });
        }
      });
    }, 500);
  }
});

// Injected Scripts
function captcha1() {
  const captcha = document.getElementById("appCaptchaLoginImg").src;

  chrome.storage.sync.get(["captchaId", "captchaPass"], (res) => {
    document.getElementById("captcha").value = captcha.split("/")[6];
    document.getElementById("uid").value = res.captchaId;
    document.getElementById("pswrd").value = res.captchaPass;
    document.getElementById("login").click();
  });
}

function captcha2() {
  (async function () {
    const src = document.getElementById("appCaptchaLoginImg").src;
    const blob = await fetch(src).then(res => res.blob());
    const dataUrl = await new Promise(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });

    const canvas = document.createElement('canvas');
    canvas.height = window.innerHeight;
    canvas.width = window.innerWidth;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.src = dataUrl;

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, img.width, img.height);
      const temparr = imgData.data;
      const arr2 = [];

      for (let i = 0; i < 30000; i += 4) {
        const gray = Math.floor(0.2989 * temparr[i] + 0.5870 * temparr[i + 1] + 0.1140 * temparr[i + 2]);
        arr2.push(gray);
      }

      const whitePoints = [];
      for (let i = 0, y = 1000; i < imgData.data.length; i += 4) {
        if (imgData.data[i] === 255 && imgData.data[i + 1] === 255 && imgData.data[i + 2] === 255) {
          const index = Math.floor(i / 4) % 150;
          if (!whitePoints.includes(index)) whitePoints.push(index);
        }
      }

      whitePoints.sort((a, b) => a - b);

      const segments = [];
      let points = [whitePoints[0]];

      for (let i = 0; i < whitePoints.length; i++) {
        if (whitePoints[i] !== whitePoints[i + 1] - 1) {
          points.push(whitePoints[i]);
          if (whitePoints[i + 1]) points.push(whitePoints[i + 1]);
        }
      }

      for (let i = 0; i < 10; i += 2) {
        let pad = (30 - (points[i + 1] - points[i])) / 2;
        points[i] = Math.max(0, points[i] - pad);
        points[i + 1] = Math.min(150, points[i + 1] + pad);
      }

      const finalarray = [];

      for (let i = 0; i < 10; i += 2) {
        const min = Math.floor(points[i]);
        const max = Math.floor(points[i + 1]);
        const arr3 = [];

        for (let y = 10; y < 50; y++) {
          for (let x = min; x < max; x++) {
            const index = x + 150 * y;
            arr3.push((arr2[index] / 255) > 0.5);
          }
        }
        finalarray.push(arr3);
      }

      const labels_map = {
        0: "2", 1: "3", 2: "4", 3: "5", 4: "6", 5: "7", 6: "8", 7: "9", 8: "A", 9: "B", 10: "C", 11: "D",
        12: "E", 13: "F", 14: "G", 15: "H", 16: "J", 17: "K", 18: "L", 19: "M", 20: "P", 21: "Q", 22: "R",
        23: "S", 24: "T", 25: "U", 26: "V", 27: "W", 28: "X", 29: "Y", 30: "a", 31: "b", 32: "c", 33: "d",
        34: "e", 35: "f", 36: "h", 37: "j", 38: "k", 39: "m", 40: "n", 41: "p", 42: "q", 43: "r", 44: "s",
        45: "t", 46: "u", 47: "v", 48: "w", 49: "x", 50: "y"
      };

      const postData = async (url, data) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ array: data })
        });
        return response.json();
      };

      postData('https://captcha14387.herokuapp.com/data', finalarray)
        .then((data) => {
          const result = data.map(index => labels_map[index]).join('');
          document.getElementById("captcha").value = result;
          document.getElementById("submit").click();

          setTimeout(() => {
            const error = document.getElementsByClassName("appMsgDiv").length > 0;
            if (error) {
              console.log("CAPTCHA Error: Refreshing...");
              document.getElementById("loginCapchaRefresh").click();
              setTimeout(captcha2, 1000);
            } else {
              window.close();
            }
          }, 1000);
        });
    };
  })();
}
