import assert from "node:assert/strict";
import test from "node:test";

import {
  generateMaZeng2020TableRows,
  getMaZeng2020TableRow,
  maZeng2020CsvHeader,
  maZeng2020TableRowToCsv,
  maZeng2020TableRowToSourceColumns,
} from "../dist/index.js";

test("第一行精确复现马、曾总表的 16 列", () => {
  assert.deepEqual(
    maZeng2020TableRowToSourceColumns(getMaZeng2020TableRow(1)),
    [
      "1", "S1B1-1", "32", "45", "B1-1", "32", "13", "32",
      "S1-1", "0", "B1-1", "32", "S1B1-1", "32", "-67017", "1",
    ],
  );
});

test("第 69043 行精确复现公元 2026 年", () => {
  assert.deepEqual(
    maZeng2020TableRowToSourceColumns(getMaZeng2020TableRow(69_043)),
    [
      "69043", "S1B1-1", "32", "18", "B7-7", "31", "50", "30",
      "S2-192", "31", "B10-2302", "29", "S3B7-69043", "47", "2026", "69043",
    ],
  );
});

test("世卦保留四正原值，年度卦起点另行跳过四正", () => {
  const row = getMaZeng2020TableRow(2_461);
  assert.equal(row.shiHex, 0);
  assert.equal(row.yearHex, 32);
  assert.deepEqual(
    maZeng2020TableRowToSourceColumns(row),
    [
      "2461", "S1B1-1", "32", "45", "B1-1", "32", "13", "33",
      "S7-7", "1", "B11-83", "0", "S1B1-2461", "32", "-64557", "2461",
    ],
  );
});

test("末行和无公元 0 年边界正确", () => {
  assert.equal(getMaZeng2020TableRow(67_017).gregorian, -1);
  assert.equal(getMaZeng2020TableRow(67_018).gregorian, 1);
  assert.deepEqual(
    maZeng2020TableRowToSourceColumns(getMaZeng2020TableRow(129_600)),
    [
      "129600", "S1B1-1", "32", "0", "B12-12", "0", "1", "1",
      "S10-360", "0", "B12-4320", "1", "S10B12-129600", "2", "62583", "129600",
    ],
  );
});

test("生成器恰好遍历一元 129600 行", () => {
  let count = 0;
  let finalRow = 0;
  for (const row of generateMaZeng2020TableRows()) {
    count += 1;
    finalRow = row.no;
  }
  assert.equal(count, 129_600);
  assert.equal(finalRow, 129_600);
});

test("CSV 表头和行格式稳定", () => {
  assert.equal(
    maZeng2020CsvHeader(),
    "no,yuan,yuanHex,fourEmblemHex,hui,huiHex,term24Hex,duty60Hex,yun,yunHex,shi,shiHex,year,yearHex,gregorian,noRepeated",
  );
  assert.equal(
    maZeng2020TableRowToCsv(getMaZeng2020TableRow(1)),
    "1,S1B1-1,32,45,B1-1,32,13,32,S1-1,0,B1-1,32,S1B1-1,32,-67017,1",
  );
});
