import * as tf from "@tensorflow/tfjs"

let model = null;

export async function predictCaptcha(inputArray) {
  await loadModel();

  const inputTensor = tf.tensor(inputArray).reshape([5, 1200]);
  const prediction = model.predict(inputTensor);
  const scores = await prediction.array();

  const result = scores.map(score =>
    score.indexOf(Math.max(...score)).toString()
  );

  return result;
}

// Load model once at startup
async function loadModel() {
    if (!model) {
      model = await tf.loadLayersModel("https://captcha14387.herokuapp.com/model.json");
      console.log("Model loaded");
    }
}