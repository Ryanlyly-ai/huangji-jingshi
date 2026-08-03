import type { HuangjiResult } from "./types.js";
import type { MaZeng2020AllocationResult } from "./schemes/ma-zeng-2020.js";

/** 将计算结果整理为适合命令行和网页展示的简明中文文本。 */
export function formatHuangjiSummary(result: HuangjiResult): string {
  return [
    `纪年：${result.displayYear}（${result.sexagenaryYear.name}）`,
    `元：第${result.yuan.number}元·${result.yuan.stem}，元内第${result.yuan.year}年`,
    `会：第${result.hui.number}会·${result.hui.branch}，会内第${result.hui.year}年`,
    `运：第${result.yun.number}运·${result.yun.stem}（本会第${result.yun.numberWithinHui}运），运内第${result.yun.year}年`,
    `世：第${result.shi.number}世·${result.shi.branch}（本运第${result.shi.numberWithinYun}世），世内第${result.shi.year}年`,
  ].join("\n");
}

/** 将可选的马、曾配卦方案整理为简明中文文本。 */
export function formatMaZeng2020Summary(
  result: MaZeng2020AllocationResult,
): string {
  const chronology = formatHuangjiSummary(result.chronology);
  type ResultHexagram = MaZeng2020AllocationResult["hexagrams"][
    keyof MaZeng2020AllocationResult["hexagrams"]
  ];
  const hexagram = (label: string, item: ResultHexagram) =>
    `${label}：${item.unicode}${item.name}（伏羲数 ${item.fuxiCode}，文王序 ${item.kingWenNumber}）`;

  return [
    chronology,
    "",
    `配卦方案：${result.scheme.label}【现代重构，可选】`,
    hexagram("元卦", result.hexagrams.yuan),
    hexagram("四季正卦", result.hexagrams.seasonPrincipal),
    hexagram("会卦", result.hexagrams.hui),
    hexagram("节卦", result.hexagrams.term),
    hexagram("2160 年值卦", result.hexagrams.onDuty2160),
    hexagram("360 年运卦", result.hexagrams.yun360),
    hexagram("60 年世卦（子变卦）", result.hexagrams.rawJiazi60),
    ...(result.adjustments.jiaziStartSkippedPrincipal
      ? [hexagram("年度序列起卦（跳过四正）", result.hexagrams.jiazi60)]
      : []),
    hexagram("年度值卦", result.hexagrams.annual),
  ].join("\n");
}
