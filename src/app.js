import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";
import puppeteer from "puppeteer";
import { ApiError } from "./utils/ApiError.js";

const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
import userRouter from "./routes/userRoutes.js";
import otpRouter from "./routes/otpRoutes.js";
import specialistRouter from "./routes/specialistRoutes.js";
import appointmentRouter from "./routes/appointmentRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import queryRouter from "./routes/queryRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import feedbackRouter from "./routes/feedbackRoutes.js";

app.use("/api/user", userRouter);
app.use("/api/otp", otpRouter);
app.use("/api/specialist", specialistRouter);
app.use("/api/appointment", appointmentRouter);
app.use("/api/admin", adminRouter);
app.use("/api/query", queryRouter);
app.use("/api/messages", messageRouter);
app.use("/api/feedback", feedbackRouter);

// Skin Analysis Route
app.post("/api/analyzeDisease", async (req, res) => {
  const { userName } = req.body;

  try {
    // 1. Send to Flask API
    console.log("Entered here 1")
    const response = await axios.post(
      "http://127.0.0.1:5000/predict",
      req.body
    );

    const { condition, precautions, recommended_specialist } = response.data;

    console.log(response.data)

    console.log("Entered upto here3");

    // 2. Launch Puppeteer with safe config
    const browser = await puppeteer.launch({
      headless: "new", // use "new" or true
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    // 3. Generate HTML
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const reportHtml = `
      <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, sans-serif;
              background: #f0f4f8;
              padding: 40px;
              width: 800px;
              box-sizing: border-box;
            }
            .report-container {
              background: #fff;
              padding: 35px;
              border-radius: 20px;
              box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
            }
            h1 {
              color: #0d3b66;
              font-size: 32px;
              text-align: center;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 32px;
              padding-bottom: 20px;
              border-bottom: 1px solid #ccc;
            }
            .label {
              font-size: 20px;
              font-weight: bold;
              color: #222;
              margin-bottom: 8px;
            }
            .value {
              font-size: 16px;
              color: #444;
              line-height: 1.7;
            }
            .value ul {
              margin-top: 10px;
              padding-left: 20px;
            }
            .note {
              background-color: #e3f2fd;
              padding: 15px;
              border-radius: 10px;
              margin-top: 20px;
              color: #0d47a1;
              font-style: italic;
            }
            .footer {
              text-align: center;
              font-size: 13px;
              color: #888;
              margin-top: 40px;
            }
          </style>
        </head>
        <body>
          <div class="report-container">
            <h1>🧴 Skin Health Evaluation Report of ${userName}</h1>

            <div class="section">
              <div class="label">🔬 Detected Condition:</div>
              <div class="value">
                Based on your responses and skin image, the analysis indicates: <strong>${condition}</strong>.
                <br /><br />
                <em>${condition}</em> is a skin-related issue that can affect appearance and comfort. Early diagnosis and proper care can significantly reduce the risk of long-term complications.
              </div>
            </div>

            <div class="section">
              <div class="label">💡 General Description:</div>
              <div class="value">
                Skin conditions can vary from temporary irritations to chronic disorders. While some may resolve naturally, others require targeted treatment.
                <br /><br />
                Common symptoms include dryness, redness, itchiness, discoloration, and unusual texture. It's important to observe any changes and consult with specialists when needed.
              </div>
            </div>

            <div class="section">
              <div class="label">🛡️ Precautions & Self-Care Tips:</div>
              <div class="value">
                The following steps are recommended:
                <ul>
                  <li>🌤️ ${precautions}</li>
                  <li>🧼 Clean your face with mild, fragrance-free cleanser twice daily</li>
                  <li>💧 Moisturize consistently with dermatologist-approved products</li>
                  <li>🚫 Avoid prolonged sun exposure, pollutants, and dusty environments</li>
                  <li>🥦 Eat a balanced diet rich in Vitamin E and Omega-3</li>
                </ul>
                <div class="note">📌 Tip: Healthy skin starts from the inside. Drink plenty of water and sleep at least 7–8 hours every night.</div>
              </div>
            </div>

            <div class="section">
              <div class="label">👨‍⚕️ Recommended Specialist:</div>
              <div class="value">
                For professional consultation and long-term care, please visit a certified <strong>${recommended_specialist}</strong>.
                <br /><br />
                Specialists can recommend medical-grade treatments such as topical creams, phototherapy, or advanced skincare regimens based on your diagnosis.
              </div>
            </div>

            <div class="section">
              <div class="label">📌 Disclaimer:</div>
              <div class="value">
                This report is generated based on AI analysis of your provided  answers. It is not a substitute for medical diagnosis. Please consult a licensed dermatologist for an accurate evaluation.
              </div>
            </div>

            <div class="footer">
              Generated by SkinAI Engine | © 2025 Skin Connect
            </div>
          </div>
        </body>
      </html>
    `;

    // 4. Set content and wait
    await page.setContent(reportHtml, { waitUntil: "domcontentloaded" });
    await page.setViewport({ width: 850, height: 1200 });

    // Scroll to bottom in case content is tall (optional)
    // Scroll to bottom in case content is tall (optional)
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for content to fully render
    await new Promise((resolve) => setTimeout(resolve, 500));

    // 5. Screenshot full content
    const screenshotBuffer = await page.screenshot({
      type: "png",
      fullPage: true,
    });

    await browser.close();

    // 6. Send back the image
    res.set({
      "Content-Type": "image/png",
      "Content-Disposition":
        'attachment; filename="skin-evaluation-report.png"',
    });
    res.send(screenshotBuffer);
  } catch (error) {
    console.error("Error in analyzeDisease:", error.message);
    res.status(500).json(new ApiError(500, null, "Internal Server Error"));
  }
});

export { app };
export default app;

