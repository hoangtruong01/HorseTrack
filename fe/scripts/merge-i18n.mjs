import fs from "fs";
import path from "path";

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    const value = source[key];
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      target[key] &&
      typeof target[key] === "object" &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

function mergeLocale(locale) {
  const dir = path.join("fe", "i18n", locale);
  const parts = [
    "translation.json",
    "navigation-shell.json",
    "pages-admin.json",
    "pages-owner-jockey.json",
    "pages-misc.json",
    "jockey-ui.json",
  ];

  let merged = {};
  for (const file of parts) {
    const filePath = path.join(dir, file);
    if (!fs.existsSync(filePath)) {
      console.warn(`skip missing: ${filePath}`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    merged = deepMerge(merged, data);
    console.log(`merged ${locale}/${file}`);
  }

  const outPath = path.join(dir, "translation.json");
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2) + "\n");
  console.log(`wrote ${outPath}`);
}

mergeLocale("en");
mergeLocale("vi");
