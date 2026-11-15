const fs = require("node:fs");
const path = require("node:path");

const dataDir = __dirname.replace(/[\\/]scripts$/, "");
const inputPath = path.join(dataDir, "CET4luan_2.json");
const outputPath = path.join(dataDir, "CET4luan_2.csv");

// 表头需与 Supabase public.words 的列名保持一致
const COLUMNS = [
  { header: "wordRand", key: "wordRank" },
  { header: "headWord", key: "headWord" },
  { header: "content", key: "content" },
  { header: "bookld", key: "bookId" },
];

function escapeCell(value) {
  const text =
    value === null || value === undefined
      ? ""
      : typeof value === "string"
        ? value
        : JSON.stringify(value);

  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`未找到输入文件：${inputPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  const records = parseRecords(raw);

  function parseRecords(text) {
    try {
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      // 兼容 NDJSON：每行一个 JSON 对象
      return text
        .split(/\r?\n/)
        .filter((line) => line.trim())
        .map((line, index) => {
          try {
            return JSON.parse(line);
          } catch (error) {
            throw new Error(`第 ${index + 1} 行解析失败：${error.message}`);
          }
        });
    }
  }

  const lines = [COLUMNS.map((column) => column.header).join(",")];

  for (const record of records) {
    const row = COLUMNS.map((column) => escapeCell(record[column.key]));
    lines.push(row.join(","));
  }

  // 带 BOM，便于 Excel 正确识别 UTF-8 中文
  fs.writeFileSync(outputPath, `\uFEFF${lines.join("\n")}\n`, "utf8");

  console.log(`已转换 ${records.length} 条记录`);
  console.log(`输出文件：${outputPath}`);
}

main();
