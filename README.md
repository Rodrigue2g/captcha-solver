# 🔐 captcha-solver

A Chrome Extension that automates solving captchas on [luckybird.io](https://luckybird.io/) by using a custom OCR model and a Node.js server.

---

## ✨ Features

- Autofills saved user credentials (`ID`, `Password`)
- Captures and processes captcha images from the login page
- Sends image data to a self-hosted OCR API for decoding
- Automatically logs in to the AIMS portal if captcha is valid

---

## 📦 Project Structure

```
captcha-solver/
│
├── extension/            # Chrome Extension files
│   ├── popup.html
│   ├── popup.js
│   ├── style.css
│   └── manifest.json
│
├── server/               # Node.js + Express captcha inference backend
│   ├── index.js
│   ├── model/            # Captcha recognition model (TensorFlow.js or custom)
│   └── ...
│
└── README.md
```

---

## 🧠 Credits

Inspired by:

- [AIMS-captcha-autofill](https://github.com/Arpit14387/AIMS-captcha-autofill)
- [Keras OCR Captcha Example](https://keras.io/examples/vision/captcha_ocr/)
- [NopeCHA](https://github.com/NopeCHALLC/nopecha-extension/tree/main)
---

## 🚀 Getting Started

### 🧩 1. Build & Load Chrome Extension

1. Open Chrome and go to `chrome://extensions`
2. Enable **Developer Mode** (top-right)
3. Click **Load unpacked** and select the `extension/` folder
4. You’ll now see the extension in your toolbar

---

### 🧠 2. Set Up & Run OCR Server (Node.js)

> The server receives image segments, processes them with a trained model, and returns the captcha text.

#### 📦 Install Dependencies

```bash
cd server
npm install
```

#### ⚙️ Start Server

```bash
node index.js
```

By default, the server listens at `http://localhost:3000` and handles POST requests to `/data`.

> If deploying publicly (e.g. Heroku, Render, Railway), update the URL in `popup.js` or the `captcha2()` function in the extension to match the deployed endpoint.

To deploy publicly for free, you can then set up an [ngrok tunnel](https://ngrok.com/our-product/secure-tunnels) to your localhost:
```
ngrok http 8080
```

++ Or with a [static domain](https://ngrok.com/blog-post/free-static-domains-ngrok-users) (remains the same) that you can get from your [ngrok dashboard](https://dashboard.ngrok.com/domains):
```
ngrok http --domain=<static-domain-from-ngrok> 8080
```

---

### 🧪 Example API Usage

```bash
curl -X POST http://localhost:3000/data \
     -H "Content-Type: application/json" \
     -d '{"array": [[true, false, ...], [...], ...]}'
```

Expected response:
```json
[12, 31, 24, 8, 47]  // Corresponding to characters using the labels_map
```

---

## 🔒 Security Notes

- Credentials are stored using `chrome.storage.sync`, which is synced across devices but not encrypted.
- For production use, consider encrypting stored data or using `chrome.identity` APIs.
- Captcha decoding is done via an external endpoint – ensure CORS headers are correctly configured in the server.

---

## 🛠 Future Improvements

- [ ] Add encryption for stored credentials
- [ ] Improve segmentation using TensorFlow.js
- [ ] Support dynamic captcha image sizes
- [ ] Dockerize the backend server for deployment
