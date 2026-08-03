#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { extname, resolve } from "node:path";

import {
  getMaZeng2020TableRow,
  MA_ZENG_SOURCE_COLUMN_NAMES,
  maZeng2020TableRowToSourceColumns,
  YEARS_PER_YUAN,
} from "../dist/index.js";

function usage() {
  console.log(`用法：
  npm run audit:ma-zeng -- /path/to/source.pdf
  npm run audit:ma-zeng -- /path/to/pdftotext-layout.txt
  npm run audit:ma-zeng -- /path/to/source.pdf --report /path/to/report.json

PDF 模式需要系统可执行 pdftotext。审计器只读取原表，不修改 PDF。`);
}

function readSource(sourcePath) {
  if (extname(sourcePath).toLowerCase() !== ".pdf") {
    return readFileSync(sourcePath, "utf8");
  }

  try {
    return execFileSync("pdftotext", ["-layout", sourcePath, "-"], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`无法调用 pdftotext：${message}`);
  }
}

function parseSourceRows(text) {
  const rows = [];

  for (const line of text.split(/\r?\n/)) {
    const columns = line.trim().split(/\s+/);
    if (
      columns.length !== MA_ZENG_SOURCE_COLUMN_NAMES.length
      || !/^\d+$/.test(columns[0] ?? "")
      || !/^S\d+B\d+-\d+$/.test(columns[1] ?? "")
      || !/^B\d+-\d+$/.test(columns[4] ?? "")
      || !/^S\d+-\d+$/.test(columns[8] ?? "")
      || !/^B\d+-\d+$/.test(columns[10] ?? "")
      || !/^S\d+B\d+-\d+$/.test(columns[12] ?? "")
    ) {
      continue;
    }
    rows.push(columns);
  }

  return rows;
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  usage();
  process.exit(args.length === 0 ? 1 : 0);
}

const reportIndex = args.indexOf("--report");
const reportArgument = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
if (reportIndex >= 0 && reportArgument === undefined) {
  console.error("--report 后必须给出 JSON 文件路径");
  process.exit(1);
}

const positional = args.filter((_, index) =>
  reportIndex < 0
  || (index !== reportIndex && index !== reportIndex + 1),
);
if (positional.length !== 1) {
  usage();
  process.exit(1);
}

const sourcePath = resolve(positional[0]);

try {
  const sourceRows = parseSourceRows(readSource(sourcePath));
  const fieldMismatchCounts = Object.fromEntries(
    MA_ZENG_SOURCE_COLUMN_NAMES.map((column) => [column, 0]),
  );
  const firstDifferences = [];
  let mismatchedRows = 0;
  const comparisonRows = Math.min(sourceRows.length, YEARS_PER_YUAN);

  for (let index = 0; index < comparisonRows; index += 1) {
    const actual = sourceRows[index];
    const expectedRow = getMaZeng2020TableRow(index + 1);
    const expected = maZeng2020TableRowToSourceColumns(expectedRow);
    let rowDiffers = false;

    for (let columnIndex = 0; columnIndex < expected.length; columnIndex += 1) {
      if (actual[columnIndex] === expected[columnIndex]) {
        continue;
      }
      rowDiffers = true;
      const column = MA_ZENG_SOURCE_COLUMN_NAMES[columnIndex];
      if (column !== undefined) {
        fieldMismatchCounts[column] += 1;
        if (firstDifferences.length < 20) {
          firstDifferences.push({
            row: index + 1,
            column,
            expected: expected[columnIndex],
            actual: actual[columnIndex],
          });
        }
      }
    }

    if (rowDiffers) {
      mismatchedRows += 1;
    }
  }

  const missingRows = Math.max(0, YEARS_PER_YUAN - sourceRows.length);
  const extraRows = Math.max(0, sourceRows.length - YEARS_PER_YUAN);
  const rowCountMatches = sourceRows.length === YEARS_PER_YUAN;
  const passed = rowCountMatches && mismatchedRows === 0;
  const report = {
    result: passed ? "PASSED" : "FAILED",
    expectedRows: YEARS_PER_YUAN,
    parsedRows: sourceRows.length,
    comparedRows: comparisonRows,
    matchedRows: comparisonRows - mismatchedRows,
    mismatchedRows,
    missingRows,
    extraRows,
    fieldMismatchCounts,
    firstDifferences,
  };

  const json = `${JSON.stringify(report, null, 2)}\n`;
  process.stdout.write(json);
  if (reportArgument !== undefined) {
    writeFileSync(resolve(reportArgument), json, "utf8");
  }
  process.exit(passed ? 0 : 1);
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`审计失败：${message}`);
  process.exit(1);
}
