# 卦序与方向约定

## 原文语义

传世《观物外篇》解释先天图时说：

- 数往者顺，是左旋；
- 知来者逆，是右行；
- 四正为乾、坤、坎、离。

这些词首先描述图义，不能未经说明就等同于屏幕上的顺时针、逆时针，也不能直接等同于程序数组的递增、递减。

## 程序落地要求

未来加入年度配卦前，必须同时固定：

1. 所据图版与版本；
2. 图的上、下、左、右方位；
3. 卦象由内向外还是由外向内读取；
4. “左旋、右行”在该图上的视觉路径；
5. 数组索引 0 所代表的卦；
6. 索引递增方向；
7. 乾、坤、坎、离是排除整卦、排除部分爻，还是在不同层级采用不同规则。

在以上问题完成校验前，核心 API 不输出值年卦。

## 建议的数据结构

```ts
interface HexagramSequenceDefinition {
  id: string;
  sourceId: string;
  diagramOrientation: string;
  startHexagram: string;
  indexDirection: "forward" | "reverse";
  semanticDirection: "数往" | "知来";
  exclusions: readonly string[];
  evidenceLevel: EvidenceLevel;
}
```

这样可以并存多个学术方案，而不把其中一种伪装成唯一原意。
