import type { EvidenceItem } from "./types.js";

/**
 * 核心计算所用规则的证据登记表。
 * 详细书目信息与页码见 docs/source-provenance.md。
 */
export const EVIDENCE_REGISTRY: Readonly<Record<string, EvidenceItem>> = {
  "cycle-hierarchy": {
    id: "cycle-hierarchy",
    level: "PRIMARY_EXPLICIT",
    title: "元会运世层级",
    note: "一元十二会、三百六十运、四千三百二十世；一世三十年。",
  },
  "shi-heads": {
    id: "shi-heads",
    level: "PRIMARY_EXPLICIT",
    title: "甲子、甲午为世首",
    note: "传世本《观物外篇》明载‘凡甲子甲午为世首’。",
  },
  "epoch-bce-67017": {
    id: "epoch-bce-67017",
    level: "PRIMARY_DERIVED",
    title: "本元起点为公元前 67017 年",
    note: "由第 2232 世甲午对应公元前 87 年及第 2253 世甲子对应公元 544 年独立反推。",
  },
  "coordinate-labels": {
    id: "coordinate-labels",
    level: "PRIMARY_DERIVED",
    title: "元会运世干支标签",
    note: "由原书连续标题及尧时坐标归纳：元、运循十干，会、世循十二支。",
  },
} as const;

export const CORE_EVIDENCE_IDS = [
  "cycle-hierarchy",
  "shi-heads",
  "epoch-bce-67017",
  "coordinate-labels",
] as const;
