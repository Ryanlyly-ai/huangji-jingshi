/** 一世的年数。 */
export const YEARS_PER_SHI = 30;

/** 一运包含十二世。 */
export const SHI_PER_YUN = 12;

/** 一会包含三十运。 */
export const YUN_PER_HUI = 30;

/** 一元包含十二会。 */
export const HUI_PER_YUAN = 12;

export const YEARS_PER_YUN = YEARS_PER_SHI * SHI_PER_YUN;
export const YEARS_PER_HUI = YEARS_PER_YUN * YUN_PER_HUI;
export const YEARS_PER_YUAN = YEARS_PER_HUI * HUI_PER_YUAN;
export const YUN_PER_YUAN = YUN_PER_HUI * HUI_PER_YUAN;
export const SHI_PER_HUI = SHI_PER_YUN * YUN_PER_HUI;
export const SHI_PER_YUAN = SHI_PER_HUI * HUI_PER_YUAN;

/**
 * 本项目采用的第一元第一年：公元前 67017 年。
 * 这是由传世本的历史锚点反推所得，不是原文直接写出的公历年份。
 */
export const EPOCH_BCE_YEAR = 67_017;

/** 公元前 67017 年对应的天文纪年；天文纪年以 0 表示公元前 1 年。 */
export const EPOCH_ASTRONOMICAL_YEAR = 1 - EPOCH_BCE_YEAR;

export const HEAVENLY_STEMS = [
  "甲",
  "乙",
  "丙",
  "丁",
  "戊",
  "己",
  "庚",
  "辛",
  "壬",
  "癸",
] as const;

export const EARTHLY_BRANCHES = [
  "子",
  "丑",
  "寅",
  "卯",
  "辰",
  "巳",
  "午",
  "未",
  "申",
  "酉",
  "戌",
  "亥",
] as const;
