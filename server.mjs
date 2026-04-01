import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isLikelyBase64(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  return normalized.length > 0 && normalized.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(normalized);
}

function respondError(res, error, status = 400) {
  const message = error instanceof Error ? error.message : "Request failed";
  res.status(status).json({ error: message });
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const distPath = path.join(__dirname, "dist");

app.use(express.json({ limit: "2mb" }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.post("/api/tools/base64", (req, res) => {
  try {
    const { input = "", mode = "encode", urlSafe = false } = req.body ?? {};
    const detectedMode = isLikelyBase64(input) ? "decode" : "encode";
    const finalMode = mode ?? detectedMode;

    let output =
      finalMode === "decode"
        ? Buffer.from(
            input.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, ""),
            "base64",
          ).toString("utf-8")
        : Buffer.from(input, "utf-8").toString("base64");

    if (urlSafe && finalMode === "encode") {
      output = output.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    }

    res.json({ output, detectedMode });
  } catch (error) {
    respondError(res, error);
  }
});

app.post("/api/tools/json", (req, res) => {
  try {
    const { input = "", action = "format", indent = 2 } = req.body ?? {};
    const parsed = JSON.parse(input);
    const output =
      action === "minify" ? JSON.stringify(parsed) : JSON.stringify(parsed, null, indent);

    res.json({ output, valid: true });
  } catch (error) {
    respondError(res, error);
  }
});

app.post("/api/tools/regex", (req, res) => {
  try {
    const { pattern = "", flags = "", input = "" } = req.body ?? {};
    const regex = new RegExp(pattern, flags);
    const matches = [];

    if (flags.includes("g")) {
      for (const match of input.matchAll(regex)) {
        matches.push({
          value: match[0],
          index: match.index ?? 0,
          groups: match.slice(1).map((group) => group ?? ""),
        });
      }
    } else {
      const match = regex.exec(input);
      if (match) {
        matches.push({
          value: match[0],
          index: match.index ?? 0,
          groups: match.slice(1).map((group) => group ?? ""),
        });
      }
    }

    res.json({ matches });
  } catch (error) {
    respondError(res, error);
  }
});

app.post("/api/tools/timestamp", (req, res) => {
  try {
    const { direction = "epochToHuman", value = "", unit = "seconds" } = req.body ?? {};

    if (direction === "epochToHuman") {
      const numeric = Number(value);
      const epochMs = unit === "seconds" ? numeric * 1000 : numeric;
      const date = new Date(epochMs);

      if (Number.isNaN(date.getTime())) {
        throw new Error("Invalid timestamp value");
      }

      res.json({
        iso: date.toISOString(),
        utc: date.toUTCString(),
        local: date.toLocaleString(),
      });
      return;
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date input");
    }

    const epoch = unit === "seconds" ? Math.floor(date.getTime() / 1000) : date.getTime();
    res.json({ epoch: String(epoch) });
  } catch (error) {
    respondError(res, error);
  }
});

app.post("/api/tools/random", (req, res) => {
  try {
    const {
      length = 16,
      includeUppercase = true,
      includeLowercase = true,
      includeDigits = true,
      includeSymbols = true,
    } = req.body ?? {};

    const charset = [
      includeUppercase ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "",
      includeLowercase ? "abcdefghijklmnopqrstuvwxyz" : "",
      includeDigits ? "0123456789" : "",
      includeSymbols ? "!@#$%^&*()-_=+[]{};:,.<>?" : "",
    ].join("");

    if (!charset) {
      throw new Error("Select at least one character set");
    }

    const bytes = crypto.randomBytes(length);
    const value = Array.from(bytes, (byte) => charset[byte % charset.length]).join("");
    res.json({ value });
  } catch (error) {
    respondError(res, error);
  }
});

app.use(express.static(distPath));
app.get("*", (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`DevToolkit server running at http://localhost:${PORT}`);
});
