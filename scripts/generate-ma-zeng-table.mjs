#!/usr/bin/env node

import { once } from "node:events";
import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

import {
  generateMaZeng2020TableRows,
  maZeng2020CsvHeader,
  maZeng2020TableRowToCsv,
} from "../dist/index.js";

function usage() {
  console.log(`用法：
  npm run generate:table -- --output /path/to/huangji-ma-zeng-2020.csv

生成第一元 129600 行 CSV。生成物不自动提交到仓库。`);
}

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(0);
}

const outputIndex = args.indexOf("--output");
const outputArgument = outputIndex >= 0 ? args[outputIndex + 1] : undefined;
if (outputArgument === undefined) {
  usage();
  process.exit(1);
}

const outputPath = resolve(outputArgument);
const stream = createWriteStream(outputPath, { encoding: "utf8" });

async function writeLine(line) {
  if (!stream.write(`${line}\n`)) {
    await once(stream, "drain");
  }
}

try {
  await writeLine(maZeng2020CsvHeader());
  let rowCount = 0;
  for (const row of generateMaZeng2020TableRows()) {
    await writeLine(maZeng2020TableRowToCsv(row));
    rowCount += 1;
  }
  stream.end();
  await once(stream, "finish");
  console.log(`已生成 ${rowCount} 行：${outputPath}`);
} catch (error) {
  stream.destroy();
  const message = error instanceof Error ? error.message : String(error);
  console.error(`生成失败：${message}`);
  process.exit(1);
}
