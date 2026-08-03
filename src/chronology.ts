import {
  EARTHLY_BRANCHES,
  EPOCH_ASTRONOMICAL_YEAR,
  HEAVENLY_STEMS,
  YEARS_PER_HUI,
  YEARS_PER_SHI,
  YEARS_PER_YUAN,
  YEARS_PER_YUN,
} from "./constants.js";
import { CORE_EVIDENCE_IDS } from "./evidence.js";
import type {
  EarthlyBranch,
  HeavenlyStem,
  HistoricalYear,
  HuangjiResult,
} from "./types.js";

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function assertPositiveSafeInteger(value: number, name: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name}必须是正的安全整数`);
  }
}

function itemAt<T>(items: readonly T[], index: number): T {
  const value = items[mod(index, items.length)];
  if (value === undefined) {
    throw new RangeError("循环索引计算失败");
  }
  return value;
}

function stemAt(index: number): HeavenlyStem {
  return itemAt(HEAVENLY_STEMS, index);
}

function branchAt(index: number): EarthlyBranch {
  return itemAt(EARTHLY_BRANCHES, index);
}

export function toAstronomicalYear(input: HistoricalYear): number {
  if (input.era !== "BCE" && input.era !== "CE") {
    throw new TypeError("era 必须是 BCE 或 CE");
  }

  assertPositiveSafeInteger(input.year, "year");
  return input.era === "BCE" ? 1 - input.year : input.year;
}

export function fromAstronomicalYear(astronomicalYear: number): HistoricalYear {
  if (!Number.isSafeInteger(astronomicalYear)) {
    throw new RangeError("天文纪年必须是安全整数");
  }

  const result: HistoricalYear = astronomicalYear <= 0
    ? { era: "BCE", year: 1 - astronomicalYear }
    : { era: "CE", year: astronomicalYear };

  assertPositiveSafeInteger(result.year, "转换后的历史年份");
  return result;
}

export function formatHistoricalYear(input: HistoricalYear): string {
  toAstronomicalYear(input);
  return input.era === "BCE" ? `公元前${input.year}年` : `公元${input.year}年`;
}

/**
 * 将常用输入解析为历史纪年。
 *
 * - `2026`、`公元2026年`、`CE 2026` -> 公元 2026 年
 * - `-87`、`前87年`、`公元前87年`、`BCE 87` -> 公元前 87 年
 */
export function parseHistoricalYear(raw: string): HistoricalYear {
  const text = raw.trim().replace(/\s+/g, " ");

  const signed = /^([+-]?\d+)$/.exec(text);
  if (signed) {
    const value = Number(signed[1]);
    if (value === 0) {
      throw new RangeError("历史纪年不存在公元 0 年");
    }
    assertPositiveSafeInteger(Math.abs(value), "year");
    return value < 0 ? { era: "BCE", year: -value } : { era: "CE", year: value };
  }

  const bce = /^(?:公元前|前|BCE|BC)\s*(\d+)\s*年?$/i.exec(text);
  if (bce) {
    const year = Number(bce[1]);
    assertPositiveSafeInteger(year, "year");
    return { era: "BCE", year };
  }

  const ce = /^(?:公元|CE|AD)\s*(\d+)\s*年?$/i.exec(text);
  if (ce) {
    const year = Number(ce[1]);
    assertPositiveSafeInteger(year, "year");
    return { era: "CE", year };
  }

  throw new TypeError(`无法识别年份：${raw}`);
}

export function fromSignedHistoricalYear(signedYear: number): HistoricalYear {
  if (!Number.isSafeInteger(signedYear) || signedYear === 0) {
    throw new RangeError("带符号历史年份必须是非零安全整数；负数表示公元前");
  }
  assertPositiveSafeInteger(Math.abs(signedYear), "year");
  return signedYear < 0
    ? { era: "BCE", year: -signedYear }
    : { era: "CE", year: signedYear };
}

export function calculateHuangji(input: HistoricalYear): HuangjiResult {
  const astronomicalYear = toAstronomicalYear(input);
  const offset = astronomicalYear - EPOCH_ASTRONOMICAL_YEAR;
  const ordinalFromEpoch = offset + 1;

  if (!Number.isSafeInteger(offset) || !Number.isSafeInteger(ordinalFromEpoch)) {
    throw new RangeError("该年份与纪元起点的距离超出安全整数范围");
  }

  const yuanZeroBased = Math.floor(offset / YEARS_PER_YUAN);
  const yearZeroBasedInYuan = mod(offset, YEARS_PER_YUAN);
  const yuanNumber = yuanZeroBased + 1;

  const huiZeroBased = Math.floor(yearZeroBasedInYuan / YEARS_PER_HUI);
  const yearZeroBasedInHui = yearZeroBasedInYuan % YEARS_PER_HUI;

  const yunZeroBased = Math.floor(yearZeroBasedInYuan / YEARS_PER_YUN);
  const yunZeroBasedInHui = Math.floor(yearZeroBasedInHui / YEARS_PER_YUN);
  const yearZeroBasedInYun = yearZeroBasedInYuan % YEARS_PER_YUN;

  const shiZeroBased = Math.floor(yearZeroBasedInYuan / YEARS_PER_SHI);
  const shiZeroBasedInHui = Math.floor(yearZeroBasedInHui / YEARS_PER_SHI);
  const shiZeroBasedInYun = Math.floor(yearZeroBasedInYun / YEARS_PER_SHI);
  const yearZeroBasedInShi = yearZeroBasedInYuan % YEARS_PER_SHI;

  const sexagenaryIndex = mod(offset, 60);
  const sexagenaryStem = stemAt(sexagenaryIndex);
  const sexagenaryBranch = branchAt(sexagenaryIndex);

  return {
    input: { ...input },
    displayYear: formatHistoricalYear(input),
    astronomicalYear,
    ordinalFromEpoch,
    yuan: {
      number: yuanNumber,
      stem: stemAt(yuanNumber - 1),
      year: yearZeroBasedInYuan + 1,
    },
    hui: {
      number: huiZeroBased + 1,
      branch: branchAt(huiZeroBased),
      year: yearZeroBasedInHui + 1,
    },
    yun: {
      number: yunZeroBased + 1,
      numberWithinHui: yunZeroBasedInHui + 1,
      stem: stemAt(yunZeroBased),
      year: yearZeroBasedInYun + 1,
    },
    shi: {
      number: shiZeroBased + 1,
      numberWithinHui: shiZeroBasedInHui + 1,
      numberWithinYun: shiZeroBasedInYun + 1,
      branch: branchAt(shiZeroBased),
      year: yearZeroBasedInShi + 1,
    },
    sexagenaryYear: {
      index: sexagenaryIndex + 1,
      stem: sexagenaryStem,
      branch: sexagenaryBranch,
      name: `${sexagenaryStem}${sexagenaryBranch}`,
    },
    evidenceIds: CORE_EVIDENCE_IDS,
  };
}

export function calculateFromSignedYear(signedYear: number): HuangjiResult {
  return calculateHuangji(fromSignedHistoricalYear(signedYear));
}
