import { useEffect, useState } from "react";
import { CheckCircle2, Copy, RefreshCw, ShieldCheck, ShieldX, XCircle } from "lucide-react";
import CopyToast from "../ui/CopyToast";
import { useClipboardFeedback } from "../../hooks/useClipboardFeedback";
import { useI18n } from "../../i18n";

const sampleHeader = `{
  "alg": "HS256",
  "typ": "JWT"
}`;

const samplePayload = `{
  "sub": "1234567890",
  "name": "John Doe",
  "admin": true,
  "iat": 1516239022
}`;

const sampleSecret = "a-string-secret-at-least-256-bits-long";

type JwtStatus = "empty" | "valid" | "invalid" | "verified" | "unverified";

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return window.btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  const binary = window.atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJsonSegment(value: unknown) {
  return bytesToBase64Url(new TextEncoder().encode(JSON.stringify(value)));
}

function decodeJsonSegment(segment: string) {
  return JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
}

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function signHs256(signingInput: string, secret: string, secretIsBase64Url: boolean) {
  const keyBytes = secretIsBase64Url ? base64UrlToBytes(secret) : new TextEncoder().encode(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await window.crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(signingInput));
  return bytesToBase64Url(new Uint8Array(signature));
}

export default function JwtDebuggerTool() {
  const { language } = useI18n();
  const { copy, isCopied, toast } = useClipboardFeedback();
  const [token, setToken] = useState("");
  const [headerJson, setHeaderJson] = useState(sampleHeader);
  const [payloadJson, setPayloadJson] = useState(samplePayload);
  const [secret, setSecret] = useState(sampleSecret);
  const [secretIsBase64Url, setSecretIsBase64Url] = useState(false);
  const [status, setStatus] = useState<JwtStatus>("empty");
  const [message, setMessage] = useState("");
  const [syncingFromToken, setSyncingFromToken] = useState(false);

  const text =
    language === "zh-CN"
      ? {
          encodedToken: "Encoded Token",
          decodedHeader: "Decoded Header",
          decodedPayload: "Decoded Payload",
          signature: "签名校验",
          tokenPlaceholder: "粘贴 JWT，或编辑右侧 JSON 后自动生成...",
          secretPlaceholder: "输入用于 HS256 校验或签名的 secret",
          base64UrlSecret: "Secret 使用 Base64URL 编码",
          copyToken: "复制 Token",
          copyHeader: "复制 Header",
          copyPayload: "复制 Payload",
          generateExample: "生成示例",
          validJwt: "JWT 结构有效",
          invalidJwt: "JWT 无效",
          signatureVerified: "签名已验证",
          signatureUnverified: "签名不匹配",
          unsupportedAlg: "当前仅支持 HS256 签名生成与校验。",
          invalidJson: "Header 或 Payload 不是有效 JSON。",
          invalidToken: "Token 必须包含 header.payload.signature 三段。",
          invalidSecret: "Secret 不是有效的 Base64URL 内容。",
          empty: "等待输入",
        }
      : {
          encodedToken: "Encoded Token",
          decodedHeader: "Decoded Header",
          decodedPayload: "Decoded Payload",
          signature: "Signature Verification",
          tokenPlaceholder: "Paste a JWT, or edit the JSON on the right to generate one...",
          secretPlaceholder: "Enter the secret used to verify or sign HS256",
          base64UrlSecret: "Secret is Base64URL encoded",
          copyToken: "Copy token",
          copyHeader: "Copy header",
          copyPayload: "Copy payload",
          generateExample: "Generate example",
          validJwt: "Valid JWT",
          invalidJwt: "Invalid JWT",
          signatureVerified: "Signature verified",
          signatureUnverified: "Signature mismatch",
          unsupportedAlg: "Only HS256 signing and verification is supported.",
          invalidJson: "Header or payload is not valid JSON.",
          invalidToken: "Token must contain header.payload.signature.",
          invalidSecret: "Secret is not valid Base64URL content.",
          empty: "Waiting for input",
        };

  async function rebuildToken(nextHeaderJson = headerJson, nextPayloadJson = payloadJson, nextSecret = secret, nextSecretIsBase64Url = secretIsBase64Url) {
    setSyncingFromToken(false);

    try {
      const parsedHeader = JSON.parse(nextHeaderJson);
      const parsedPayload = JSON.parse(nextPayloadJson);

      if (parsedHeader.alg !== "HS256") {
        setStatus("valid");
        setMessage(text.unsupportedAlg);
        const unsignedToken = `${encodeJsonSegment(parsedHeader)}.${encodeJsonSegment(parsedPayload)}.`;
        setToken(unsignedToken);
        return;
      }

      const signingInput = `${encodeJsonSegment(parsedHeader)}.${encodeJsonSegment(parsedPayload)}`;
      const signature = await signHs256(signingInput, nextSecret, nextSecretIsBase64Url);
      setToken(`${signingInput}.${signature}`);
      setStatus("verified");
      setMessage(text.signatureVerified);
    } catch (error) {
      setStatus("invalid");
      setMessage(error instanceof DOMException ? text.invalidSecret : text.invalidJson);
    }
  }

  async function decodeToken(nextToken: string, nextSecret = secret, nextSecretIsBase64Url = secretIsBase64Url) {
    setToken(nextToken);
    setSyncingFromToken(true);

    if (!nextToken.trim()) {
      setStatus("empty");
      setMessage(text.empty);
      return;
    }

    const segments = nextToken.trim().split(".");
    if (segments.length !== 3 || !segments[0] || !segments[1]) {
      setStatus("invalid");
      setMessage(text.invalidToken);
      return;
    }

    if (nextSecretIsBase64Url) {
      try {
        base64UrlToBytes(nextSecret);
      } catch {
        setStatus("invalid");
        setMessage(text.invalidSecret);
        return;
      }
    }

    try {
      const decodedHeader = decodeJsonSegment(segments[0]);
      const decodedPayload = decodeJsonSegment(segments[1]);
      setHeaderJson(formatJson(decodedHeader));
      setPayloadJson(formatJson(decodedPayload));

      if (decodedHeader.alg !== "HS256") {
        setStatus("valid");
        setMessage(text.unsupportedAlg);
        return;
      }

      const expectedSignature = await signHs256(`${segments[0]}.${segments[1]}`, nextSecret, nextSecretIsBase64Url);
      const verified = expectedSignature === segments[2];
      setStatus(verified ? "verified" : "unverified");
      setMessage(verified ? text.signatureVerified : text.signatureUnverified);
    } catch (error) {
      setStatus("invalid");
      setMessage(text.invalidJwt);
    }
  }

  useEffect(() => {
    void rebuildToken(sampleHeader, samplePayload, sampleSecret, false);
  }, []);

  function handleHeaderChange(nextValue: string) {
    setHeaderJson(nextValue);
    void rebuildToken(nextValue, payloadJson);
  }

  function handlePayloadChange(nextValue: string) {
    setPayloadJson(nextValue);
    void rebuildToken(headerJson, nextValue);
  }

  function handleSecretChange(nextValue: string) {
    setSecret(nextValue);
    if (syncingFromToken) {
      void decodeToken(token, nextValue);
      return;
    }

    void rebuildToken(headerJson, payloadJson, nextValue);
  }

  function handleSecretEncodingChange(nextValue: boolean) {
    setSecretIsBase64Url(nextValue);
    if (syncingFromToken) {
      void decodeToken(token, secret, nextValue);
      return;
    }

    void rebuildToken(headerJson, payloadJson, secret, nextValue);
  }

  function resetExample() {
    setHeaderJson(sampleHeader);
    setPayloadJson(samplePayload);
    setSecret(sampleSecret);
    setSecretIsBase64Url(false);
    void rebuildToken(sampleHeader, samplePayload, sampleSecret, false);
  }

  const statusTone =
    status === "verified"
      ? "text-tertiary bg-tertiary/10"
      : status === "valid"
        ? "text-secondary bg-secondary/10"
        : status === "unverified" || status === "invalid"
          ? "text-error bg-error/10"
          : "text-on-surface-variant bg-surface-container-high";
  const StatusIcon = status === "verified" || status === "valid" ? CheckCircle2 : status === "empty" ? XCircle : ShieldX;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] gap-6 items-stretch">
      <section className="tool-panel flex h-full min-h-[720px] flex-col">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="tool-label">{text.encodedToken}</p>
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ${statusTone}`}>
              <StatusIcon className="w-4 h-4" />
              {message}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={resetExample} className="icon-button" aria-label={text.generateExample}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void copy(token, "jwt-token", text.copyToken)}
              className={`icon-button ${isCopied("jwt-token") ? "copy-button-active" : ""}`}
              aria-label={text.copyToken}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>
        <textarea
          value={token}
          onChange={(event) => void decodeToken(event.target.value)}
          className="tool-textarea flex-1 min-h-[560px] placeholder:text-on-surface-variant/45"
          placeholder={text.tokenPlaceholder}
          spellCheck={false}
        />
      </section>

      <section className="flex h-full flex-col gap-6">
        <div className="tool-panel">
          <div className="flex items-center justify-between mb-3">
            <p className="tool-label">{text.decodedHeader}</p>
            <button
              type="button"
              onClick={() => void copy(headerJson, "jwt-header", text.copyHeader)}
              className={`icon-button ${isCopied("jwt-header") ? "copy-button-active" : ""}`}
              aria-label={text.copyHeader}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={headerJson}
            onChange={(event) => handleHeaderChange(event.target.value)}
            className="tool-textarea min-h-[180px]"
            spellCheck={false}
          />
        </div>

        <div className="tool-panel">
          <div className="flex items-center justify-between mb-3">
            <p className="tool-label">{text.decodedPayload}</p>
            <button
              type="button"
              onClick={() => void copy(payloadJson, "jwt-payload", text.copyPayload)}
              className={`icon-button ${isCopied("jwt-payload") ? "copy-button-active" : ""}`}
              aria-label={text.copyPayload}
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={payloadJson}
            onChange={(event) => handlePayloadChange(event.target.value)}
            className="tool-textarea min-h-[260px]"
            spellCheck={false}
          />
        </div>

        <div className="tool-panel">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-tertiary" />
            <p className="tool-label">{text.signature}</p>
          </div>
          <textarea
            value={secret}
            onChange={(event) => handleSecretChange(event.target.value)}
            className="tool-textarea min-h-[120px] placeholder:text-on-surface-variant/45"
            placeholder={text.secretPlaceholder}
            spellCheck={false}
          />
          <label className="switch-row mt-4">
            <input
              type="checkbox"
              checked={secretIsBase64Url}
              onChange={(event) => handleSecretEncodingChange(event.target.checked)}
              className="sr-only"
            />
            <div className={`switch-track ${secretIsBase64Url ? "switch-track-active" : ""}`}>
              <div className="switch-thumb" />
            </div>
            <span className="text-xs font-medium text-on-surface-variant">{text.base64UrlSecret}</span>
          </label>
        </div>
      </section>
      <CopyToast toast={toast} />
    </div>
  );
}
