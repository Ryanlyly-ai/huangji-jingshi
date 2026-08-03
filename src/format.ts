import type { HuangjiResult } from "./types.js";

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
