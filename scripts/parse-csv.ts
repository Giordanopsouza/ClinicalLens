import fs from "fs";
import path from "path";
import zlib from "zlib";
import Papa from "papaparse";

type ParseRow = Record<string, unknown>;

export function parseCsvGz<T extends ParseRow = ParseRow>(filename: string): T[] {
  const filePath = path.join(process.cwd(), "data", filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing data file: ${filePath}`);
  }

  const gzBuffer = fs.readFileSync(filePath);
  const csvString = zlib.gunzipSync(gzBuffer).toString("utf-8");

  const parsed = Papa.parse<T>(csvString, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  });

  if (parsed.errors.length > 0) {
    console.warn(
      `Parse warnings for ${filename}:`,
      parsed.errors.slice(0, 5).map((error) => error.message),
    );
  }

  return parsed.data.filter((row) => Object.keys(row).length > 0);
}
