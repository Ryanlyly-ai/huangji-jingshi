import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateMaZeng2020Allocation,
  formatMaZeng2020Summary,
  fromAstronomicalYear,
  MA_ZENG_ON_DUTY_CODES,
  ON_DUTY_CLOCKWISE_CODES,
} from "../dist/index.js";

function codes(year: number): number[] {
  const result = calculateMaZeng2020Allocation({ era: "CE", year });
  return [
    result.hexagrams.yuan.fuxiCode,
    result.hexagrams.seasonPrincipal.fuxiCode,
    result.hexagrams.hui.fuxiCode,
    result.hexagrams.term.fuxiCode,
    result.hexagrams.onDuty2160.fuxiCode,
    result.hexagrams.yun360.fuxiCode,
    result.hexagrams.jiazi60.fuxiCode,
    result.hexagrams.annual.fuxiCode,
  ];
}

test("第一元首年与配表第一行一致", () => {
  const result = calculateMaZeng2020Allocation({ era: "BCE", year: 67_017 });
  assert.deepEqual(
    [
      result.hexagrams.yuan.fuxiCode,
      result.hexagrams.seasonPrincipal.fuxiCode,
      result.hexagrams.hui.fuxiCode,
      result.hexagrams.term.fuxiCode,
      result.hexagrams.onDuty2160.fuxiCode,
      result.hexagrams.yun360.fuxiCode,
      result.hexagrams.jiazi60.fuxiCode,
      result.hexagrams.annual.fuxiCode,
    ],
    [32, 45, 32, 13, 32, 0, 32, 32],
  );
  assert.equal(result.positions.yearWithinYuan, 1);
  assert.equal(result.hexagrams.annual.name, "复");
  assert.equal(result.adjustments.jiaziStartSkippedPrincipal, false);
});

test("2019 与 2026 年年度值卦复现论文和配表", () => {
  assert.equal(
    calculateMaZeng2020Allocation({ era: "CE", year: 2019 }).hexagrams.annual.fuxiCode,
    39,
  );
  assert.deepEqual(codes(2026), [32, 18, 31, 50, 30, 31, 29, 47]);

  const result = calculateMaZeng2020Allocation({ era: "CE", year: 2026 });
  assert.equal(result.hexagrams.annual.kingWenNumber, 13);
  assert.equal(result.hexagrams.annual.name, "同人");
  assert.equal(result.positions.onDutyBlock, 32);
  assert.equal(result.positions.yunSegment, 6);
  assert.equal(result.positions.jiaziSegment, 5);
  assert.equal(result.positions.yearWithinJiaziSegment, 43);
});

test("1984 至 2043 六十年以鼎起，遍历所有六十值卦", () => {
  const results = Array.from({ length: 60 }, (_, index) =>
    calculateMaZeng2020Allocation({ era: "CE", year: 1984 + index }),
  );
  const annualCodes = results.map((result) => result.hexagrams.annual.fuxiCode);
  const expectedNames = [
    "鼎", "恒", "巽", "井", "蛊", "升", "讼", "困", "未济", "解",
    "涣", "蒙", "师", "遁", "咸", "旅", "小过", "渐", "蹇", "艮",
    "谦", "否", "萃", "晋", "豫", "观", "比", "剥", "复", "颐",
    "屯", "益", "震", "噬嗑", "随", "无妄", "明夷", "贲", "既济", "家人",
    "丰", "革", "同人", "临", "损", "节", "中孚", "归妹", "睽", "兑",
    "履", "泰", "大畜", "需", "小畜", "大壮", "大有", "夬", "姤", "大过",
  ];

  assert.equal(annualCodes[0], 29);
  assert.equal(annualCodes[42], 47);
  assert.equal(annualCodes[58], 31);
  assert.equal(annualCodes[59], 30);
  assert.equal(new Set(annualCodes).size, 60);
  assert.deepEqual(new Set(annualCodes), new Set(ON_DUTY_CLOCKWISE_CODES));
  assert.deepEqual(results.map((result) => result.hexagrams.annual.name), expectedNames);
});

test("一元全周期的每个年度卦都排除四正卦", () => {
  assert.equal(MA_ZENG_ON_DUTY_CODES.length, 60);
  const epochAstronomicalYear = 1 - 67_017;

  for (let offset = 0; offset < 129_600; offset += 1) {
    const input = fromAstronomicalYear(epochAstronomicalYear + offset);
    const result = calculateMaZeng2020Allocation(input);
    assert.ok(ON_DUTY_CLOCKWISE_CODES.includes(result.hexagrams.annual.fuxiCode));
  }
});

test("第一元之外按 129600 年周期循环，且明确标注为周期性延伸", () => {
  const first = calculateMaZeng2020Allocation({ era: "BCE", year: 67_017 });
  const next = calculateMaZeng2020Allocation({ era: "CE", year: 62_584 });
  assert.equal(next.scheme.cyclicExtension, true);
  assert.equal(next.positions.yearWithinYuan, 1);
  assert.equal(next.hexagrams.annual.fuxiCode, first.hexagrams.annual.fuxiCode);
});

test("配卦摘要明确显示现代重构，并输出 2026 同人卦", () => {
  const summary = formatMaZeng2020Summary(
    calculateMaZeng2020Allocation({ era: "CE", year: 2026 }),
  );
  assert.match(summary, /现代重构，可选/);
  assert.match(summary, /年度值卦：䷌同人（伏羲数 47，文王序 13）/);
});
