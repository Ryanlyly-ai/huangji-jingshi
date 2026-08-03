import type { EARTHLY_BRANCHES, HEAVENLY_STEMS } from "./constants.js";

export type Era = "BCE" | "CE";
export type HeavenlyStem = (typeof HEAVENLY_STEMS)[number];
export type EarthlyBranch = (typeof EARTHLY_BRANCHES)[number];

export interface HistoricalYear {
  era: Era;
  /** BCE、CE 均使用从 1 开始的正整数；不存在第 0 年。 */
  year: number;
}

export type EvidenceLevel =
  | "PRIMARY_EXPLICIT"
  | "PRIMARY_DERIVED"
  | "COMMENTARY"
  | "MODERN_RECONSTRUCTION";

export interface EvidenceItem {
  id: string;
  level: EvidenceLevel;
  title: string;
  note: string;
}

export interface HuangjiResult {
  input: HistoricalYear;
  displayYear: string;
  /** 天文纪年：公元前 1 年为 0，公元前 2 年为 -1。 */
  astronomicalYear: number;
  /** 以公元前 67017 年为 1；更早年份可以为 0 或负数。 */
  ordinalFromEpoch: number;
  yuan: {
    /** 第一元为 1；向前推算时可以为 0 或负数。 */
    number: number;
    stem: HeavenlyStem;
    year: number;
  };
  hui: {
    number: number;
    branch: EarthlyBranch;
    year: number;
  };
  yun: {
    number: number;
    numberWithinHui: number;
    stem: HeavenlyStem;
    year: number;
  };
  shi: {
    number: number;
    numberWithinHui: number;
    numberWithinYun: number;
    branch: EarthlyBranch;
    year: number;
  };
  sexagenaryYear: {
    index: number;
    stem: HeavenlyStem;
    branch: EarthlyBranch;
    name: string;
  };
  evidenceIds: readonly string[];
}
