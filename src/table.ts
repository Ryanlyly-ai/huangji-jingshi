import {
  EARTHLY_BRANCHES,
  EPOCH_ASTRONOMICAL_YEAR,
  HEAVENLY_STEMS,
  YEARS_PER_YUAN,
} from "./constants.js";
import { fromAstronomicalYear } from "./chronology.js";
import { calculateMaZeng2020Allocation } from "./schemes/ma-zeng-2020.js";

export const MA_ZENG_SOURCE_COLUMN_NAMES = Object.freeze([
  "no",
  "yuan",
  "yuanHex",
  "fourEmblemHex",
  "hui",
  "huiHex",
  "term24Hex",
  "duty60Hex",
  "yun",
  "yunHex",
  "shi",
  "shiHex",
  "year",
  "yearHex",
  "gregorian",
  "noRepeated",
] as const);

export type MaZengSourceColumnName =
  (typeof MA_ZENG_SOURCE_COLUMN_NAMES)[number];

/** 对应马振国、曾华才总表的 16 列。 */
export interface MaZeng2020TableRow {
  no: number;
  yuan: string;
  yuanHex: number;
  fourEmblemHex: number;
  hui: string;
  huiHex: number;
  term24Hex: number;
  duty60Hex: number;
  yun: string;
  yunHex: number;
  shi: string;
  shiHex: number;
  year: string;
  yearHex: number;
  /** 无公元 0 年；负数表示公元前。 */
  gregorian: number;
  noRepeated: number;
}

function assertOrdinal(ordinal: number): void {
  if (
    !Number.isSafeInteger(ordinal)
    || ordinal < 1
    || ordinal > YEARS_PER_YUAN
  ) {
    throw new RangeError(`行号必须是 1 至 ${YEARS_PER_YUAN} 的整数`);
  }
}

function signedHistoricalYear(era: "BCE" | "CE", year: number): number {
  return era === "BCE" ? -year : year;
}

/**
 * 生成马、曾 2020 方案第一元的指定一行。
 * 行号 1 对应公元前 67017 年，行号 129600 对应公元 62583 年。
 */
export function getMaZeng2020TableRow(
  ordinal: number,
): MaZeng2020TableRow {
  assertOrdinal(ordinal);
  const input = fromAstronomicalYear(
    EPOCH_ASTRONOMICAL_YEAR + ordinal - 1,
  );
  const result = calculateMaZeng2020Allocation(input);

  const stemNumber = ((ordinal - 1) % HEAVENLY_STEMS.length) + 1;
  const branchNumber = ((ordinal - 1) % EARTHLY_BRANCHES.length) + 1;
  const huiNumber = result.chronology.hui.number;
  const yunNumber = result.chronology.yun.number;
  const shiNumber = result.chronology.shi.number;

  return {
    no: ordinal,
    yuan: "S1B1-1",
    yuanHex: result.hexagrams.yuan.fuxiCode,
    fourEmblemHex: result.hexagrams.seasonPrincipal.fuxiCode,
    hui: `B${huiNumber}-${huiNumber}`,
    huiHex: result.hexagrams.hui.fuxiCode,
    term24Hex: result.hexagrams.term.fuxiCode,
    duty60Hex: result.hexagrams.onDuty2160.fuxiCode,
    yun: `S${((yunNumber - 1) % HEAVENLY_STEMS.length) + 1}-${yunNumber}`,
    yunHex: result.hexagrams.yun360.fuxiCode,
    shi: `B${((shiNumber - 1) % EARTHLY_BRANCHES.length) + 1}-${shiNumber}`,
    // 原表的 Shi Hex 保留子变卦原值；若落四正，只调整年度卦起点。
    shiHex: result.hexagrams.rawJiazi60.fuxiCode,
    year: `S${stemNumber}B${branchNumber}-${ordinal}`,
    yearHex: result.hexagrams.annual.fuxiCode,
    gregorian: signedHistoricalYear(input.era, input.year),
    noRepeated: ordinal,
  };
}

export function maZeng2020TableRowToSourceColumns(
  row: MaZeng2020TableRow,
): readonly string[] {
  return MA_ZENG_SOURCE_COLUMN_NAMES.map((column) => String(row[column]));
}

export function* generateMaZeng2020TableRows(): Generator<MaZeng2020TableRow> {
  for (let ordinal = 1; ordinal <= YEARS_PER_YUAN; ordinal += 1) {
    yield getMaZeng2020TableRow(ordinal);
  }
}

function escapeCsvField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

export function maZeng2020TableRowToCsv(row: MaZeng2020TableRow): string {
  return maZeng2020TableRowToSourceColumns(row)
    .map(escapeCsvField)
    .join(",");
}

export function maZeng2020CsvHeader(): string {
  return MA_ZENG_SOURCE_COLUMN_NAMES.join(",");
}
