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
  "sixty-hexagrams-360-lines": {
    id: "sixty-hexagrams-360-lines",
    level: "PRIMARY_EXPLICIT",
    title: "六十四卦用止六十，合三百六十爻",
    note: "传世本《观物外篇》明载六十四卦用止六十，六十卦合三百六十爻。",
  },
  "four-principal-hexagrams": {
    id: "four-principal-hexagrams",
    level: "PRIMARY_EXPLICIT",
    title: "乾坤坎离为四正",
    note: "传世本《观物外篇》明载四正为乾、坤、坎、离，并说明四卦不用而成三百六十之用。",
  },
  "qiao-2007-annual-sequence": {
    id: "qiao-2007-annual-sequence",
    level: "MODERN_RECONSTRUCTION",
    title: "乔宗方 2007 年年度值卦解释",
    note: "论文以 1984 年鼎卦为起点，沿先天圆图顺时针排列 1984 至 2043 年年度值卦。",
  },
  "ma-zeng-2020-allocation": {
    id: "ma-zeng-2020-allocation",
    level: "MODERN_RECONSTRUCTION",
    title: "马振国、曾华才 2020 年 129600 年配卦方案",
    note: "以伏羲二进制卦数、变爻层级及排除四正卦规则生成元内逐年配卦表。",
  },
} as const;

export const CORE_EVIDENCE_IDS = [
  "cycle-hierarchy",
  "shi-heads",
  "epoch-bce-67017",
  "coordinate-labels",
] as const;
