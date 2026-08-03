import assert from "node:assert/strict";
import test from "node:test";

import {
  FUXI_CIRCLE_CLOCKWISE_CODES,
  flipHexagramLine,
  getHexagramByFuxiCode,
  HEXAGRAMS_BY_FUXI_CODE,
  nextOnDutyCodeClockwise,
  ON_DUTY_CLOCKWISE_CODES,
  PRINCIPAL_FUXI_CODES,
} from "../dist/index.js";

test("伏羲卦数完整映射至互不重复的六十四文王卦", () => {
  assert.equal(HEXAGRAMS_BY_FUXI_CODE.length, 64);
  assert.equal(new Set(HEXAGRAMS_BY_FUXI_CODE.map((item) => item.kingWenNumber)).size, 64);
  assert.deepEqual(
    HEXAGRAMS_BY_FUXI_CODE.map((item) => item.kingWenNumber).sort((a, b) => a - b),
    Array.from({ length: 64 }, (_, index) => index + 1),
  );

  assert.deepEqual(
    [0, 18, 45, 63].map((code) => getHexagramByFuxiCode(code).name),
    ["坤", "坎", "离", "乾"],
  );
  assert.equal(getHexagramByFuxiCode(47).name, "同人");
  assert.equal(getHexagramByFuxiCode(47).unicode, "䷌");
});

test("四正卦逐爻反转与现代配表的二十四节卦一致", () => {
  const lineChanges = (code: number) =>
    Array.from({ length: 6 }, (_, index) => flipHexagramLine(code, index + 1));

  assert.deepEqual(lineChanges(45), [13, 61, 37, 41, 47, 44]);
  assert.deepEqual(lineChanges(63), [31, 47, 55, 59, 61, 62]);
  assert.deepEqual(lineChanges(18), [50, 2, 26, 22, 16, 19]);
  assert.deepEqual(lineChanges(0), [32, 16, 8, 4, 2, 1]);
});

test("圆图顺时针序列排除四正后恰有六十值卦", () => {
  assert.equal(FUXI_CIRCLE_CLOCKWISE_CODES.length, 64);
  assert.equal(new Set(FUXI_CIRCLE_CLOCKWISE_CODES).size, 64);
  assert.equal(ON_DUTY_CLOCKWISE_CODES.length, 60);
  assert.equal(new Set(ON_DUTY_CLOCKWISE_CODES).size, 60);
  for (const principal of PRINCIPAL_FUXI_CODES) {
    assert.ok(!ON_DUTY_CLOCKWISE_CODES.includes(principal));
  }

  assert.equal(nextOnDutyCodeClockwise(0), 32);
  assert.equal(nextOnDutyCodeClockwise(18), 17);
  assert.equal(nextOnDutyCodeClockwise(45), 46);
  assert.equal(nextOnDutyCodeClockwise(63), 31);
});
