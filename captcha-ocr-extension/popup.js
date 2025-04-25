const fileInput = document.getElementById("fileInput");
const output = document.getElementById("output");

fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  output.textContent = "Processing...";

  const reader = new FileReader();
  reader.onload = async (event) => {
    const base64 = event.target.result.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");

    try {
      const res = await fetch("https://burro-in-crow.ngrok-free.app/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64 })
      });

      if (!res.ok) throw new Error("Server error");

      const data = await res.json();
      output.textContent = "Prediction: " + data.result;

      // Optional: Copy to clipboard
      navigator.clipboard.writeText(data.result).then(() => {
        console.log("[Captcha Solver] Copied to clipboard");
      });
    } catch (err) {
      console.error("Prediction failed:", err);
      output.textContent = "Prediction failed.";
    }
  };

  reader.readAsDataURL(file);
});
