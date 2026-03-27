import express from "express";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function isLikelyBase64(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/").replace(/\s+/g, "");
  return normalized.length > 0 && normalized.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(normalized);
}

function respondError(res: express.Response, error: unknown, status = 400) {
  const message = error instanceof Error ? error.message : "Request failed";
  res.status(status).json({ error: message });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "2mb" }));

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.post("/api/tools/base64", (req, res) => {
    try {
      const { input = "", mode = "encode", urlSafe = false } = req.body as {
        input?: string;
        mode?: "encode" | "decode";
        urlSafe?: boolean;
      };

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
      const { input = "", action = "format", indent = 2 } = req.body as {
        input?: string;
        action?: "format" | "minify" | "validate";
        indent?: number;
      };

      const parsed = JSON.parse(input);
      const output =
        action === "minify"
          ? JSON.stringify(parsed)
          : action === "validate"
            ? JSON.stringify(parsed, null, indent)
            : JSON.stringify(parsed, null, indent);

      res.json({ output, valid: true });
    } catch (error) {
      respondError(res, error);
    }
  });

  app.post("/api/tools/regex", (req, res) => {
    try {
      const { pattern = "", flags = "", input = "" } = req.body as {
        pattern?: string;
        flags?: string;
        input?: string;
      };

      const regex = new RegExp(pattern, flags);
      const matches: Array<{ value: string; index: number; groups: string[] }> = [];

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
      const { direction = "epochToHuman", value = "", unit = "seconds" } = req.body as {
        direction?: "epochToHuman" | "humanToEpoch";
        value?: string;
        unit?: "seconds" | "milliseconds";
      };

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
      } = req.body as {
        length?: number;
        includeUppercase?: boolean;
        includeLowercase?: boolean;
        includeDigits?: boolean;
        includeSymbols?: boolean;
      };

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

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DevToolkit server running at http://localhost:${PORT}`);
  });
}

startServer();
