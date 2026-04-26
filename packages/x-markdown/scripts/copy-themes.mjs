import { cp, mkdir, readdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, "..");
const srcThemesDir = resolve(rootDir, "src/themes");
const themesDir = resolve(rootDir, "themes");

await mkdir(themesDir, { recursive: true });

const files = await readdir(srcThemesDir);
const themeFiles = files.filter(file => file.endsWith(".css"));

await Promise.all(
  themeFiles.map(file =>
    cp(resolve(srcThemesDir, file), resolve(themesDir, file)),
  ),
);

console.log(`Copied ${themeFiles.length} theme files to themes.`);
