#!/usr/bin/env node

import { calculateHuangji, parseHistoricalYear } from "./chronology.js";
import { formatHuangjiSummary } from "./format.js";

function printUsage(): void {
  console.log(`用法：
  huangji 2026
  huangji -87
  huangji 公元前87年
  huangji "BCE 87"
  huangji --json 2026

负整数表示公元前；--json 输出完整机器可读结果；历史纪年不存在公元 0 年。`);
}

const args = process.argv.slice(2);

if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  printUsage();
  process.exit(args.length === 0 ? 1 : 0);
}

try {
  const json = args.includes("--json");
  const yearArgs = args.filter((arg) => arg !== "--json");
  const result = calculateHuangji(parseHistoricalYear(yearArgs.join(" ")));
  console.log(json ? JSON.stringify(result, null, 2) : formatHuangjiSummary(result));
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`计算失败：${message}`);
  process.exit(1);
}
