export interface Base64Request {
  input: string;
  mode: "encode" | "decode";
  urlSafe?: boolean;
}

export interface JsonRequest {
  input: string;
  action: "format" | "minify" | "validate";
  indent?: number;
}

export interface RegexRequest {
  pattern: string;
  flags: string;
  input: string;
}

export interface TimestampRequest {
  direction: "epochToHuman" | "humanToEpoch";
  value: string;
  unit: "seconds" | "milliseconds";
}

export interface RandomRequest {
  length: number;
  includeUppercase: boolean;
  includeLowercase: boolean;
  includeDigits: boolean;
  includeSymbols: boolean;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error ?? "Request failed");
  }

  return payload as T;
}

export const api = {
  health: () => request<{ status: string; timestamp: string }>("/api/health"),
  transformBase64: (body: Base64Request) =>
    request<{ output: string; detectedMode?: "encode" | "decode" }>("/api/tools/base64", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  formatJson: (body: JsonRequest) =>
    request<{ output: string; valid: boolean; error?: string }>("/api/tools/json", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  testRegex: (body: RegexRequest) =>
    request<{
      matches: Array<{
        value: string;
        index: number;
        groups: string[];
      }>;
      error?: string;
    }>("/api/tools/regex", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  convertTimestamp: (body: TimestampRequest) =>
    request<{
      epoch?: string;
      iso?: string;
      local?: string;
      utc?: string;
    }>("/api/tools/timestamp", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  generateRandom: (body: RandomRequest) =>
    request<{ value: string }>("/api/tools/random", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

export async function copyToClipboard(value: string) {
  await navigator.clipboard.writeText(value);
}
