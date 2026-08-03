import { YEARS_PER_HUI, YEARS_PER_YUAN } from "../constants.js";
import { calculateHuangji } from "../chronology.js";
import {
  advanceOnDutyCodeClockwise,
  flipHexagramLine,
  getHexagramByFuxiCode,
  isPrincipalHexagram,
  nextOnDutyCodeClockwise,
  ON_DUTY_CLOCKWISE_CODES,
  type Hexagram,
} from "../hexagrams.js";
import type { EvidenceLevel, HistoricalYear, HuangjiResult } from "../types.js";

export const MA_ZENG_2020_SCHEME_ID = "ma-zeng-2020";
export const MA_ZENG_2020_EVIDENCE_LEVEL =
  "MODERN_RECONSTRUCTION" satisfies EvidenceLevel;

export const MA_ZENG_2020_EVIDENCE_IDS = Object.freeze([
  "sixty-hexagrams-360-lines",
  "four-principal-hexagrams",
  "qiao-2007-annual-sequence",
  "ma-zeng-2020-allocation",
] as const);

const YEARS_PER_SEASON = 32_400;
const YEARS_PER_TERM_HEXAGRAM = 5_400;
const YEARS_PER_ON_DUTY_HEXAGRAM = 2_160;
const YEARS_PER_YUN_HEXAGRAM = 360;
const YEARS_PER_JIAZI_HEXAGRAM = 60;

const SEASON_PRINCIPAL_CODES = Object.freeze([45, 63, 18, 0] as const);

/** 十二消息卦，对应总表十二会的会卦。 */
export const MA_ZENG_HUI_CODES = Object.freeze([
  32, 48, 56, 60, 62, 63, 31, 15, 7, 3, 1, 0,
] as const);

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function rotateToStart(
  sequence: readonly number[],
  startValue: number,
): readonly number[] {
  const start = sequence.indexOf(startValue);
  if (start < 0) {
    throw new RangeError("方案起始卦不在六十值卦序列中");
  }
  return Object.freeze([...sequence.slice(start), ...sequence.slice(0, start)]);
}

/** 一元内六十支 2160 年值卦，以复卦（伏羲数 32）起。 */
export const MA_ZENG_ON_DUTY_CODES: readonly number[] = rotateToStart(
  ON_DUTY_CLOCKWISE_CODES,
  32,
);

export interface MaZeng2020AllocationResult {
  scheme: {
    id: typeof MA_ZENG_2020_SCHEME_ID;
    label: string;
    evidenceLevel: typeof MA_ZENG_2020_EVIDENCE_LEVEL;
    /** 元外年份按 129600 年周期循环，是本项目对配表的周期性延伸。 */
    cyclicExtension: true;
  };
  chronology: HuangjiResult;
  positions: {
    yearWithinYuan: number;
    season: number;
    yearWithinSeason: number;
    termLine: number;
    yearWithinTerm: number;
    onDutyBlock: number;
    yearWithinOnDutyBlock: number;
    yunSegment: number;
    yearWithinYunSegment: number;
    jiaziSegment: number;
    yearWithinJiaziSegment: number;
  };
  hexagrams: {
    yuan: Hexagram;
    seasonPrincipal: Hexagram;
    hui: Hexagram;
    term: Hexagram;
    onDuty2160: Hexagram;
    yun360: Hexagram;
    /** 变爻所得原值，对应总表 Shi Hex；可能为四正卦。 */
    rawJiazi60: Hexagram;
    /** 年度序列起卦；原值为四正卦时已经顺时针跳过。 */
    jiazi60: Hexagram;
    annual: Hexagram;
  };
  adjustments: {
    /** 子变卦若落四正卦，则年卦起点顺时针移至下一值卦。 */
    jiaziStartSkippedPrincipal: boolean;
  };
  evidenceIds: typeof MA_ZENG_2020_EVIDENCE_IDS;
}

/**
 * 马振国、曾华才 2020 年配表方案。
 *
 * 这是可选的现代重建，不是核心纪年结果，也不声称是邵雍唯一原法。
 */
export function calculateMaZeng2020Allocation(
  input: HistoricalYear,
): MaZeng2020AllocationResult {
  const chronology = calculateHuangji(input);
  const yearZeroBasedInYuan = mod(
    chronology.ordinalFromEpoch - 1,
    YEARS_PER_YUAN,
  );

  const seasonZeroBased = Math.floor(yearZeroBasedInYuan / YEARS_PER_SEASON);
  const yearZeroBasedInSeason = yearZeroBasedInYuan % YEARS_PER_SEASON;
  const seasonPrincipalCode = SEASON_PRINCIPAL_CODES[seasonZeroBased];
  if (seasonPrincipalCode === undefined) {
    throw new RangeError("四季正卦计算失败");
  }

  const termLineZeroBased = Math.floor(
    yearZeroBasedInSeason / YEARS_PER_TERM_HEXAGRAM,
  );
  const termCode = flipHexagramLine(
    seasonPrincipalCode,
    termLineZeroBased + 1,
  );

  const huiZeroBased = Math.floor(yearZeroBasedInYuan / YEARS_PER_HUI);
  const huiHexagramCode = MA_ZENG_HUI_CODES[huiZeroBased];
  if (huiHexagramCode === undefined) {
    throw new RangeError("会卦计算失败");
  }

  const onDutyBlockZeroBased = Math.floor(
    yearZeroBasedInYuan / YEARS_PER_ON_DUTY_HEXAGRAM,
  );
  const onDutyCode = MA_ZENG_ON_DUTY_CODES[onDutyBlockZeroBased];
  if (onDutyCode === undefined) {
    throw new RangeError("2160 年值卦计算失败");
  }
  const yearZeroBasedInOnDuty =
    yearZeroBasedInYuan % YEARS_PER_ON_DUTY_HEXAGRAM;

  const yunSegmentZeroBased = Math.floor(
    yearZeroBasedInOnDuty / YEARS_PER_YUN_HEXAGRAM,
  );
  const yunCode = flipHexagramLine(onDutyCode, yunSegmentZeroBased + 1);
  const yearZeroBasedInYun =
    yearZeroBasedInOnDuty % YEARS_PER_YUN_HEXAGRAM;

  const jiaziSegmentZeroBased = Math.floor(
    yearZeroBasedInYun / YEARS_PER_JIAZI_HEXAGRAM,
  );
  const rawJiaziCode = flipHexagramLine(yunCode, jiaziSegmentZeroBased + 1);
  const skippedPrincipal = isPrincipalHexagram(rawJiaziCode);
  const jiaziCode = skippedPrincipal
    ? nextOnDutyCodeClockwise(rawJiaziCode)
    : rawJiaziCode;
  const yearZeroBasedInJiazi =
    yearZeroBasedInYun % YEARS_PER_JIAZI_HEXAGRAM;
  const annualCode = advanceOnDutyCodeClockwise(
    jiaziCode,
    yearZeroBasedInJiazi,
  );

  return {
    scheme: {
      id: MA_ZENG_2020_SCHEME_ID,
      label: "马振国、曾华才 2020 年配表方案",
      evidenceLevel: MA_ZENG_2020_EVIDENCE_LEVEL,
      cyclicExtension: true,
    },
    chronology,
    positions: {
      yearWithinYuan: yearZeroBasedInYuan + 1,
      season: seasonZeroBased + 1,
      yearWithinSeason: yearZeroBasedInSeason + 1,
      termLine: termLineZeroBased + 1,
      yearWithinTerm:
        (yearZeroBasedInSeason % YEARS_PER_TERM_HEXAGRAM) + 1,
      onDutyBlock: onDutyBlockZeroBased + 1,
      yearWithinOnDutyBlock: yearZeroBasedInOnDuty + 1,
      yunSegment: yunSegmentZeroBased + 1,
      yearWithinYunSegment: yearZeroBasedInYun + 1,
      jiaziSegment: jiaziSegmentZeroBased + 1,
      yearWithinJiaziSegment: yearZeroBasedInJiazi + 1,
    },
    hexagrams: {
      yuan: getHexagramByFuxiCode(32),
      seasonPrincipal: getHexagramByFuxiCode(seasonPrincipalCode),
      hui: getHexagramByFuxiCode(huiHexagramCode),
      term: getHexagramByFuxiCode(termCode),
      onDuty2160: getHexagramByFuxiCode(onDutyCode),
      yun360: getHexagramByFuxiCode(yunCode),
      rawJiazi60: getHexagramByFuxiCode(rawJiaziCode),
      jiazi60: getHexagramByFuxiCode(jiaziCode),
      annual: getHexagramByFuxiCode(annualCode),
    },
    adjustments: {
      jiaziStartSkippedPrincipal: skippedPrincipal,
    },
    evidenceIds: MA_ZENG_2020_EVIDENCE_IDS,
  };
}
