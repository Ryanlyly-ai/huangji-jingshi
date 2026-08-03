#!/usr/bin/env node

import { calculateHuangji, parseHistoricalYear } from "./chronology.js";
import { formatHuangjiSummary, formatMaZeng2020Summary } from "./format.js";
import { calculateMaZeng2020Allocation } from "./schemes/ma-zeng-2020.js";

function printUsage(): void {
  console.log(`用法：
  huangji 2026
  huangji -87
  huangji 公元前87年
  huangji "BCE 87"
  huangji --json 2026
  huangji --scheme ma-zeng-2020 2026
  huangji --scheme ma-zeng-2020 --json 2026

负整数表示公元前；--json 输出完整机器可读结果；历史纪年不存在公元 0 年。
ma-zeng-2020 是有明确来源标签的现代重建，不属于默认核心结果。`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

try {
  const json = args.includes("--json");
  const schemeIndex = args.indexOf("--scheme");
  const scheme = schemeIndex >= 0 ? args[schemeIndex + 1] : undefined;
  if (schemeIndex >= 0 && scheme === undefined) {
    throw new TypeError("--scheme 后必须给出方案 ID");
  }
  if (scheme !== undefined && scheme !== "ma-zeng-2020") {
    throw new TypeError(`不支持的配卦方案：${scheme}`);
  }

  const yearArgs = args.filter((arg, index) =>
    arg !== "--json"
    && (
      schemeIndex < 0
      || (index !== schemeIndex && index !== schemeIndex + 1)
    ),
  );
  const input = parseHistoricalYear(yearArgs.join(" "));

  if (scheme === "ma-zeng-2020") {
    const result = calculateMaZeng2020Allocation(input);
    console.log(json
      ? JSON.stringify(result, null, 2)
      : formatMaZeng2020Summary(result));
  } else {
    const result = calculateHuangji(input);
    console.log(json
      ? JSON.stringify(result, null, 2)
      : formatHuangjiSummary(result));
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`计算失败：${message}`);
  process.exit(1);
}
