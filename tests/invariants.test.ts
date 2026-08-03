import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateFromSignedYear,
  HUI_PER_YUAN,
  SHI_PER_HUI,
  SHI_PER_YUAN,
  SHI_PER_YUN,
  YEARS_PER_HUI,
  YEARS_PER_SHI,
  YEARS_PER_YUAN,
  YEARS_PER_YUN,
  YUN_PER_HUI,
  YUN_PER_YUAN,
} from "../dist/index.js";

test("元会运世常量互相一致", () => {
  assert.equal(YEARS_PER_SHI, 30);
  assert.equal(SHI_PER_YUN, 12);
  assert.equal(YEARS_PER_YUN, 360);
  assert.equal(YUN_PER_HUI, 30);
  assert.equal(SHI_PER_HUI, 360);
  assert.equal(YEARS_PER_HUI, 10_800);
  assert.equal(HUI_PER_YUAN, 12);
  assert.equal(YUN_PER_YUAN, 360);
  assert.equal(SHI_PER_YUAN, 4320);
  assert.equal(YEARS_PER_YUAN, 129_600);
});

test("跨越代表性年份时所有坐标保持在规定范围", () => {
  const samples = [-100_000, -67_018, -67_017, -2357, -87, 1, 544, 959, 2026, 62_583, 62_584, 100_000];

  for (const year of samples) {
    const result = calculateFromSignedYear(year);
    assert.ok(result.yuan.year >= 1 && result.yuan.year <= YEARS_PER_YUAN);
    assert.ok(result.hui.number >= 1 && result.hui.number <= HUI_PER_YUAN);
    assert.ok(result.hui.year >= 1 && result.hui.year <= YEARS_PER_HUI);
    assert.ok(result.yun.number >= 1 && result.yun.number <= YUN_PER_YUAN);
    assert.ok(result.yun.numberWithinHui >= 1 && result.yun.numberWithinHui <= YUN_PER_HUI);
    assert.ok(result.yun.year >= 1 && result.yun.year <= YEARS_PER_YUN);
    assert.ok(result.shi.number >= 1 && result.shi.number <= SHI_PER_YUAN);
    assert.ok(result.shi.numberWithinHui >= 1 && result.shi.numberWithinHui <= SHI_PER_HUI);
    assert.ok(result.shi.numberWithinYun >= 1 && result.shi.numberWithinYun <= SHI_PER_YUN);
    assert.ok(result.shi.year >= 1 && result.shi.year <= YEARS_PER_SHI);
    assert.ok(result.sexagenaryYear.index >= 1 && result.sexagenaryYear.index <= 60);
  }
});
