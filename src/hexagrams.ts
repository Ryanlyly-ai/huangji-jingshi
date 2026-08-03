export type HexagramLine = "yin" | "yang";

export interface Hexagram {
  /** 伏羲先天二进制卦数：坤为 0，乾为 63。 */
  fuxiCode: number;
  /** 通行文王卦序，从 1 开始。 */
  kingWenNumber: number;
  name: string;
  unicode: string;
  /** 六爻自下而上排列。 */
  linesBottomToTop: readonly HexagramLine[];
}

type HexagramDefinition = readonly [kingWenNumber: number, name: string];

const DEFINITIONS_BY_FUXI_CODE: readonly HexagramDefinition[] = [
  [2, "坤"], [23, "剥"], [8, "比"], [20, "观"],
  [16, "豫"], [35, "晋"], [45, "萃"], [12, "否"],
  [15, "谦"], [52, "艮"], [39, "蹇"], [53, "渐"],
  [62, "小过"], [56, "旅"], [31, "咸"], [33, "遁"],
  [7, "师"], [4, "蒙"], [29, "坎"], [59, "涣"],
  [40, "解"], [64, "未济"], [47, "困"], [6, "讼"],
  [46, "升"], [18, "蛊"], [48, "井"], [57, "巽"],
  [32, "恒"], [50, "鼎"], [28, "大过"], [44, "姤"],
  [24, "复"], [27, "颐"], [3, "屯"], [42, "益"],
  [51, "震"], [21, "噬嗑"], [17, "随"], [25, "无妄"],
  [36, "明夷"], [22, "贲"], [63, "既济"], [37, "家人"],
  [55, "丰"], [30, "离"], [49, "革"], [13, "同人"],
  [19, "临"], [41, "损"], [60, "节"], [61, "中孚"],
  [54, "归妹"], [38, "睽"], [58, "兑"], [10, "履"],
  [11, "泰"], [26, "大畜"], [5, "需"], [9, "小畜"],
  [34, "大壮"], [14, "大有"], [43, "夬"], [1, "乾"],
] as const;

function mod(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function assertFuxiCode(code: number): void {
  if (!Number.isInteger(code) || code < 0 || code > 63) {
    throw new RangeError("伏羲卦数必须是 0 至 63 的整数");
  }
}

function assertLineNumber(lineNumber: number): void {
  if (!Number.isInteger(lineNumber) || lineNumber < 1 || lineNumber > 6) {
    throw new RangeError("爻位必须是 1 至 6 的整数；1 为初爻，6 为上爻");
  }
}

export function hexagramLinesBottomToTop(
  fuxiCode: number,
): readonly HexagramLine[] {
  assertFuxiCode(fuxiCode);
  return Object.freeze(
    Array.from({ length: 6 }, (_, index) =>
      (fuxiCode & (1 << (5 - index))) === 0 ? "yin" : "yang",
    ),
  );
}

export function unicodeHexagram(kingWenNumber: number): string {
  if (
    !Number.isInteger(kingWenNumber)
    || kingWenNumber < 1
    || kingWenNumber > 64
  ) {
    throw new RangeError("文王卦序必须是 1 至 64 的整数");
  }
  return String.fromCodePoint(0x4dc0 + kingWenNumber - 1);
}

export const HEXAGRAMS_BY_FUXI_CODE: readonly Hexagram[] = Object.freeze(
  DEFINITIONS_BY_FUXI_CODE.map(([kingWenNumber, name], fuxiCode) =>
    Object.freeze({
      fuxiCode,
      kingWenNumber,
      name,
      unicode: unicodeHexagram(kingWenNumber),
      linesBottomToTop: hexagramLinesBottomToTop(fuxiCode),
    }),
  ),
);

export function getHexagramByFuxiCode(fuxiCode: number): Hexagram {
  assertFuxiCode(fuxiCode);
  const hexagram = HEXAGRAMS_BY_FUXI_CODE[fuxiCode];
  if (hexagram === undefined) {
    throw new RangeError("伏羲卦数没有对应卦");
  }
  return hexagram;
}

/**
 * 将指定爻阴阳反转。伏羲卦数的最高位对应初爻，最低位对应上爻。
 */
export function flipHexagramLine(
  fuxiCode: number,
  lineNumber: number,
): number {
  assertFuxiCode(fuxiCode);
  assertLineNumber(lineNumber);
  return fuxiCode ^ (1 << (6 - lineNumber));
}

/** 乾、坤、坎、离四正卦，以伏羲卦数表示。 */
export const PRINCIPAL_FUXI_CODES = Object.freeze([0, 18, 45, 63] as const);

/**
 * 马振国、曾华才配表采用的先天圆图顺时针数组。
 * 从姤（31）起，依次递减至坤（0），再由复（32）递增至乾（63）。
 */
export const FUXI_CIRCLE_CLOCKWISE_CODES: readonly number[] = Object.freeze([
  ...Array.from({ length: 32 }, (_, index) => 31 - index),
  ...Array.from({ length: 32 }, (_, index) => 32 + index),
]);

const PRINCIPAL_CODE_SET: ReadonlySet<number> = new Set(PRINCIPAL_FUXI_CODES);

/** 先天圆图顺时针排除乾、坤、坎、离后所得六十值卦。 */
export const ON_DUTY_CLOCKWISE_CODES: readonly number[] = Object.freeze(
  FUXI_CIRCLE_CLOCKWISE_CODES.filter((code) => !PRINCIPAL_CODE_SET.has(code)),
);

export function isPrincipalHexagram(fuxiCode: number): boolean {
  assertFuxiCode(fuxiCode);
  return PRINCIPAL_CODE_SET.has(fuxiCode);
}

/** 从当前圆图位置顺时针寻找下一支非四正卦。 */
export function nextOnDutyCodeClockwise(fuxiCode: number): number {
  assertFuxiCode(fuxiCode);
  const start = FUXI_CIRCLE_CLOCKWISE_CODES.indexOf(fuxiCode);
  if (start < 0) {
    throw new RangeError("卦数不在先天圆图序列中");
  }

  for (let step = 1; step <= 64; step += 1) {
    const candidate = FUXI_CIRCLE_CLOCKWISE_CODES[
      mod(start + step, FUXI_CIRCLE_CLOCKWISE_CODES.length)
    ];
    if (candidate !== undefined && !PRINCIPAL_CODE_SET.has(candidate)) {
      return candidate;
    }
  }

  throw new RangeError("无法找到下一支值卦");
}

export function advanceOnDutyCodeClockwise(
  startFuxiCode: number,
  steps: number,
): number {
  assertFuxiCode(startFuxiCode);
  if (!Number.isSafeInteger(steps)) {
    throw new RangeError("推进步数必须是安全整数");
  }
  const start = ON_DUTY_CLOCKWISE_CODES.indexOf(startFuxiCode);
  if (start < 0) {
    throw new RangeError("起始卦必须是排除四正卦后的六十值卦之一");
  }
  const result = ON_DUTY_CLOCKWISE_CODES[
    mod(start + steps, ON_DUTY_CLOCKWISE_CODES.length)
  ];
  if (result === undefined) {
    throw new RangeError("值卦推进计算失败");
  }
  return result;
}
