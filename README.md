# 皇极经世：元会运世算法

[![CI](https://github.com/Ryanlyly-ai/huangji-jingshi/actions/workflows/ci.yml/badge.svg)](https://github.com/Ryanlyly-ai/huangji-jingshi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.6-339933.svg)](package.json)

一个可审计、可测试、零运行时依赖的 TypeScript 实现。用户输入任意非零历史年份，即可得到该年所处的元、会、运、世及年干支。

当前稳定范围是纪年骨架。完整值年卦体系仍在校勘，不会把后世解释或现代配表伪装成邵雍原文。

## 项目状态

| 模块 | 状态 | 说明 |
|---|---|---|
| 元会运世纪年 | 稳定 | 已有原书锚点、边界与不变量测试 |
| 年干支 | 稳定 | 以本元首年甲子连续推算 |
| 六十卦与三百六十爻 | 校勘中 | 原文规则与图序方向正在分层核对 |
| 完整年度配卦 | 尚未发布 | 不采用未经标注的现代重构作为默认答案 |
| 浏览器计算器/API | 规划中 | 将复用本仓库同一核心 |

## 已实现

- 第一元第一年采用公元前 67017 年；
- 无公元 0 年的 BCE/CE 转换；
- 1 元 = 12 会 = 360 运 = 4320 世 = 129600 年；
- 元、会、运、世及各层级内序号；
- 甲子、甲午交替世首和逐年六十甲子；
- 公元前 2357、前 87、公元 544、959 等原书历史锚点；
- 核心规则证据 ID 与来源等级。

## 快速使用

需要 Node.js 22.6 或更高版本。

```bash
npm install
npm run calculate -- 2026
npm run calculate -- -87
npm run calculate -- --json 2026
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
- [异文与勘误](docs/textual-variants.md)
- [贡献与校勘办法](CONTRIBUTING.md)

## 研究原则

计算结果所依赖的规则均登记证据 ID，并区分：原文明载、原文可推、后世阐释和现代重构。发现排印错误时先登记异文，不静默改写原书数据。

本项目欢迎程序贡献，也欢迎提供刻本、影印本和可靠论文的页码级旁证。学术使用可参考仓库中的 [`CITATION.cff`](CITATION.cff)。

## 路线

1. 核心纪年规范与锚点测试（已完成第一版）；
2. 六十卦、三百六十爻和圆图方向的逐条校勘；
3. 以可选方案实现完整年度配卦；
4. 浏览器计算器与公开 API；
5. 生成 129600 年全表并与独立资料交叉验证。

版本变化见 [CHANGELOG.md](CHANGELOG.md)。安全问题请按 [SECURITY.md](SECURITY.md) 私下报告。

## 版权

代码与本项目原创文档采用 MIT License。仓库不收录现代出版社 PDF；古籍文本的公共领域属性不等于现代整理、校点、排印和扫描文件可以自由再发布。
