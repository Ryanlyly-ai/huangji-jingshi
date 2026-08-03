# 皇极经世：元会运世算法

[![CI](https://github.com/Ryanlyly-ai/huangji-jingshi/actions/workflows/ci.yml/badge.svg)](https://github.com/Ryanlyly-ai/huangji-jingshi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.6-339933.svg)](package.json)

一个可审计、可测试、零运行时依赖的 TypeScript 实现。用户输入任意非零历史年份，即可得到该年所处的元、会、运、世及年干支。

默认稳定范围是纪年骨架。仓库另提供具名、显式启用的 `ma-zeng-2020` 年度配卦方案，并始终把它标为现代重构，不会伪装成邵雍原文或唯一算法。

## 项目状态

| 模块 | 状态 | 说明 |
|---|---|---|
| 元会运世纪年 | 稳定 | 已有原书锚点、边界与不变量测试 |
| 年干支 | 稳定 | 以本元首年甲子连续推算 |
| 六十四卦基础数据 | 已实现 | 伏羲卦数、文王序、卦名、卦符及逐爻反转已有测试 |
| 六十卦与三百六十爻 | 已完成第一轮校勘 | 四正卦、六十值卦与方向选择已有证据矩阵 |
| 完整年度配卦 | 已完成全表审计的可选方案 | `ma-zeng-2020` 与原表 129600 行 × 16 列零差异，固定标注现代重构 |
| 浏览器计算器/API | 规划中 | 将复用本仓库同一核心 |

## 已实现

- 第一元第一年采用公元前 67017 年；
- 无公元 0 年的 BCE/CE 转换；
- 1 元 = 12 会 = 360 运 = 4320 世 = 129600 年；
- 元、会、运、世及各层级内序号；
- 甲子、甲午交替世首和逐年六十甲子；
- 公元前 2357、前 87、公元 544、959 等原书历史锚点；
- 核心规则证据 ID 与来源等级。
- 六十四卦的伏羲二进制编码、文王序、卦名和 Unicode 卦符；
- 先天圆图顺时针六十值卦及逐爻反转工具；
- 马振国、曾华才 2020 年度配卦方案，含 2019 无妄、2026 同人等回归测试。
- 129600 行 CSV 生成器及源 PDF 逐字段审计器；
- 129600 行 × 16 列全表比对，差异为 0。

## 快速使用

需要 Node.js 22.6 或更高版本。

```bash
npm install
npm run calculate -- 2026
npm run calculate -- -87
npm run calculate -- --json 2026
npm run calculate -- --scheme ma-zeng-2020 2026
npm run calculate -- --scheme ma-zeng-2020 --json 2026
npm run generate:table -- --output /tmp/huangji-ma-zeng-2020.csv
npm test
npm run build
```

默认输出适合直接阅读：

```text
纪年：公元2026年（丙午）
元：第1元·甲，元内第69043年
会：第7会·午，会内第4243年
运：第192运·乙（本会第12运），运内第283年
世：第2302世·酉（本运第10世），世内第13年
```

使用 `--json` 可得到包含局部序号、天文纪年和证据 ID 的完整数据。

代码调用：

```ts
import { calculateHuangji } from "huangji-jingshi";

const result = calculateHuangji({ era: "CE", year: 2026 });

console.log(result.hui);            // { number: 7, branch: "午", year: 4243 }
console.log(result.yun);            // 第 192 运，乙运
console.log(result.shi);            // 第 2302 世，酉世，第 13 年
console.log(result.sexagenaryYear.name); // 丙午
```

年度配卦必须显式选择方案：

```ts
import { calculateMaZeng2020Allocation } from "huangji-jingshi";

const allocation = calculateMaZeng2020Allocation({ era: "CE", year: 2026 });
console.log(allocation.scheme.evidenceLevel);       // MODERN_RECONSTRUCTION
console.log(allocation.hexagrams.annual.name);     // 同人
console.log(allocation.hexagrams.annual.fuxiCode); // 47
```

负整数在便捷 API 和命令行中表示公元前：

```ts
import { calculateFromSignedYear } from "huangji-jingshi";

const hanWudi54 = calculateFromSignedYear(-87);
```

## 重要说明

“公元前 67017 年”是用传世本中的历史坐标反推得到的现代纪年表达，不是说邵雍原文直接写出了这一公历年份。推导与证据见：

- [算法规范](docs/algorithm-spec.md)
- [历史锚点](docs/chronology-anchors.md)
- [来源与证据层级](docs/source-provenance.md)
- [卦序与方向](docs/direction-and-order.md)
- [六十卦与年度配卦证据矩阵](docs/hexagram-evidence-matrix.md)
- [`ma-zeng-2020` 方案规范](docs/schemes/ma-zeng-2020.md)
- [129600 年全表审计报告](docs/audits/ma-zeng-2020-full-table.md)
- [异文与勘误](docs/textual-variants.md)
- [贡献与校勘办法](CONTRIBUTING.md)

## 研究原则

计算结果所依赖的规则均登记证据 ID，并区分：原文明载、原文可推、后世阐释和现代重构。发现排印错误时先登记异文，不静默改写原书数据。

本项目欢迎程序贡献，也欢迎提供刻本、影印本和可靠论文的页码级旁证。学术使用可参考仓库中的 [`CITATION.cff`](CITATION.cff)。

## 路线

1. 核心纪年规范与锚点测试（已完成第一版）；
2. 六十卦、三百六十爻和圆图方向的第一轮校勘（已完成）；
3. `ma-zeng-2020` 可选年度配卦方案（已完成第一版）；
4. 生成 129600 年全表并进行逐行差异审计（已完成，零差异）；
5. 浏览器计算器与公开 API（下一阶段）。

版本变化见 [CHANGELOG.md](CHANGELOG.md)。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

## 版权

代码与本项目原创文档采用 MIT License。仓库不收录现代出版社 PDF；古籍文本的公共领域属性不等于现代整理、校点、排印和扫描文件可以自由再发布。
