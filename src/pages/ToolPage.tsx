import type { ReactNode } from "react";
import Base64Tool from "../components/tooling/Base64Tool";
import CronExpressionTool from "../components/tooling/CronExpressionTool";
import ImageCompressorTool from "../components/tooling/ImageCompressorTool";
import ImageToBase64Tool from "../components/tooling/ImageToBase64Tool";
import JsonFormatterTool from "../components/tooling/JsonFormatterTool";
import RandomGeneratorTool from "../components/tooling/RandomGeneratorTool";
import RegexTesterTool from "../components/tooling/RegexTesterTool";
import TimestampConverterTool from "../components/tooling/TimestampConverterTool";
import ToolScaffold from "../components/tooling/ToolScaffold";
import type { AppRoute, ToolDefinition } from "../types/tool";

interface ToolPageProps {
  tool: ToolDefinition;
  onNavigate: (route: AppRoute) => void;
}

export default function ToolPage({ tool, onNavigate }: ToolPageProps) {
  let content: ReactNode;

  switch (tool.slug) {
    case "base64-encoder-decoder":
      content = <Base64Tool />;
      break;
    case "json-formatter":
      content = <JsonFormatterTool />;
      break;
    case "regex-tester":
      content = <RegexTesterTool />;
      break;
    case "timestamp-converter":
      content = <TimestampConverterTool />;
      break;
    case "random-generator":
      content = <RandomGeneratorTool />;
      break;
    case "image-to-base64":
      content = <ImageToBase64Tool />;
      break;
    case "image-compressor":
      content = <ImageCompressorTool />;
      break;
    case "cron-expression-generator":
      content = <CronExpressionTool />;
      break;
    default:
      content = (
        <div className="tool-panel max-w-3xl">
          <p className="text-sm text-on-surface-variant">
            This tool slot is registered in the platform, but its interactive workspace is still being implemented.
          </p>
        </div>
      );
  }

  return (
    <ToolScaffold tool={tool} onNavigate={onNavigate}>
      {content}
    </ToolScaffold>
  );
}
