import * as tf from "@tensorflow/tfjs"

let model = null;

// Load model once
async function loadModel() {
  if (!model) {
    console.log("loading")
    model = await tf.loadLayersModel("https://burro-in-crow.ngrok-free.app/final_modelV2/model.json"); // Local path to saved model
    console.log("Model loaded");
  }
}

export async function predictCaptchaFromImage(base64) {
  await loadModel();

  const buffer = Buffer.from(base64, "base64");
  const image = await loadImage(buffer);
  const canvas = createCanvas(200, 50);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(image, 0, 0, 200, 50);

  const imageData = ctx.getImageData(0, 0, 200, 50);
  const grayscale = [];

  for (let i = 0; i < imageData.data.length; i += 4) {
    const r = imageData.data[i];
    const g = imageData.data[i + 1];
    const b = imageData.data[i + 2];
    grayscale.push((r * 0.299 + g * 0.587 + b * 0.114) / 255);
  }

  const input = tf.tensor4d(grayscale, [1, 50, 200, 1]); // HWC shape
  const prediction = model.predict(input);
  const scores = await prediction.array();

  const timestepPreds = scores[0].map(t => t.indexOf(Math.max(...t)));
  const decoded = decodeCTCGreedy(timestepPreds, 62);
  const result = decoded.map(i => "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[i] || "").join("");

  return result;
}

function decodeCTCGreedy(predictions, blank) {
  let output = [], prev = null;
  for (const idx of predictions) {
    if (idx !== blank && idx !== prev) output.push(idx);
    prev = idx;
  }
  return output;
}
