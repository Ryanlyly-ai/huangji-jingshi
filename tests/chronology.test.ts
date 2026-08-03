import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateFromSignedYear,
  calculateHuangji,
  formatHuangjiSummary,
  formatHistoricalYear,
  fromAstronomicalYear,
  parseHistoricalYear,
  toAstronomicalYear,
} from "../dist/index.js";

test("历史纪年与天文纪年互转，不引入公元 0 年", () => {
  assert.equal(toAstronomicalYear({ era: "BCE", year: 1 }), 0);
  assert.equal(toAstronomicalYear({ era: "BCE", year: 2 }), -1);
  assert.equal(toAstronomicalYear({ era: "CE", year: 1 }), 1);
  assert.deepEqual(fromAstronomicalYear(0), { era: "BCE", year: 1 });
  assert.deepEqual(fromAstronomicalYear(1), { era: "CE", year: 1 });
  assert.equal(formatHistoricalYear({ era: "BCE", year: 87 }), "公元前87年");
});

test("解析中文、英文与带符号年份", () => {
  assert.deepEqual(parseHistoricalYear("2026"), { era: "CE", year: 2026 });
  assert.deepEqual(parseHistoricalYear("-87"), { era: "BCE", year: 87 });
  assert.deepEqual(parseHistoricalYear("公元前87年"), { era: "BCE", year: 87 });
  assert.deepEqual(parseHistoricalYear("BCE 87"), { era: "BCE", year: 87 });
  assert.deepEqual(parseHistoricalYear("CE 544"), { era: "CE", year: 544 });
  assert.throws(() => parseHistoricalYear("0"), /不存在公元 0 年/);
});

test("公元前 67017 年是第一元第一年甲子", () => {
  const result = calculateFromSignedYear(-67_017);
  assert.equal(result.ordinalFromEpoch, 1);
  assert.deepEqual(result.yuan, { number: 1, stem: "甲", year: 1 });
  assert.deepEqual(result.hui, { number: 1, branch: "子", year: 1 });
  assert.deepEqual(result.yun, {
    number: 1,
    numberWithinHui: 1,
    stem: "甲",
    year: 1,
  });
  assert.deepEqual(result.shi, {
    number: 1,
    numberWithinHui: 1,
    numberWithinYun: 1,
    branch: "子",
    year: 1,
  });
  assert.equal(result.sexagenaryYear.name, "甲子");
});

test("尧甲辰锚点：公元前 2357 年为第 2156 世第 11 年", () => {
  const result = calculateFromSignedYear(-2357);
  assert.equal(result.ordinalFromEpoch, 64_661);
  assert.equal(result.yuan.number, 1);
  assert.equal(result.hui.number, 6);
  assert.equal(result.hui.branch, "巳");
  assert.equal(result.yun.number, 180);
  assert.equal(result.yun.stem, "癸");
  assert.equal(result.shi.number, 2156);
  assert.equal(result.shi.branch, "未");
  assert.equal(result.shi.year, 11);
  assert.equal(result.sexagenaryYear.name, "甲辰");
});

test("公元前 87 年为第 2232 世甲午首年", () => {
  const result = calculateFromSignedYear(-87);
  assert.equal(result.ordinalFromEpoch, 66_931);
  assert.equal(result.shi.number, 2232);
  assert.equal(result.shi.branch, "亥");
  assert.equal(result.shi.year, 1);
  assert.equal(result.sexagenaryYear.name, "甲午");
});

test("公元 544 年为第 2253 世甲子首年", () => {
  const result = calculateFromSignedYear(544);
  assert.equal(result.ordinalFromEpoch, 67_561);
  assert.equal(result.shi.number, 2253);
  assert.equal(result.shi.branch, "申");
  assert.equal(result.shi.year, 1);
  assert.equal(result.sexagenaryYear.name, "甲子");
});

test("公元 959 年对应原书历史年表终点己未", () => {
  const result = calculateFromSignedYear(959);
  assert.equal(result.ordinalFromEpoch, 67_976);
  assert.equal(result.shi.number, 2266);
  assert.equal(result.shi.year, 26);
  assert.equal(result.sexagenaryYear.name, "己未");
});

test("公元 2026 年回归值", () => {
  const result = calculateHuangji({ era: "CE", year: 2026 });
  assert.equal(result.ordinalFromEpoch, 69_043);
  assert.deepEqual(result.yuan, { number: 1, stem: "甲", year: 69_043 });
  assert.deepEqual(result.hui, { number: 7, branch: "午", year: 4243 });
  assert.deepEqual(result.yun, {
    number: 192,
    numberWithinHui: 12,
    stem: "乙",
    year: 283,
  });
  assert.deepEqual(result.shi, {
    number: 2302,
    numberWithinHui: 142,
    numberWithinYun: 10,
    branch: "酉",
    year: 13,
  });
  assert.equal(result.sexagenaryYear.name, "丙午");
});

test("第一元前后边界连续", () => {
  const before = calculateFromSignedYear(-67_018);
  const last = calculateFromSignedYear(62_583);
  const next = calculateFromSignedYear(62_584);

  assert.deepEqual(before.yuan, { number: 0, stem: "癸", year: 129_600 });
  assert.equal(before.sexagenaryYear.name, "癸亥");
  assert.equal(last.yuan.number, 1);
  assert.equal(last.yuan.year, 129_600);
  assert.equal(last.sexagenaryYear.name, "癸亥");
  assert.deepEqual(next.yuan, { number: 2, stem: "乙", year: 1 });
  assert.equal(next.sexagenaryYear.name, "甲子");
});

test("极端年份不会产生不安全的纪元序号", () => {
  assert.throws(
    () => calculateHuangji({ era: "CE", year: Number.MAX_SAFE_INTEGER }),
    /超出安全整数范围/,
  );
  assert.throws(
    () => fromAstronomicalYear(Number.MIN_SAFE_INTEGER),
    /必须是正的安全整数/,
  );
});

test("生成人类可读的中文摘要", () => {
  const summary = formatHuangjiSummary(calculateFromSignedYear(2026));
  assert.match(summary, /纪年：公元2026年（丙午）/);
  assert.match(summary, /元：第1元·甲，元内第69043年/);
  assert.match(summary, /会：第7会·午，会内第4243年/);
  assert.match(summary, /运：第192运·乙（本会第12运），运内第283年/);
  assert.match(summary, /世：第2302世·酉（本运第10世），世内第13年/);
});
