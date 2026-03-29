import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, "../dist");
const indexJs = resolve(distDir, "index.js");

// Read index.js content
let content = readFileSync(indexJs, "utf-8");

// Add CSS import at the beginning of the file
const cssImport = 'import "./index.css";\n';
content = cssImport + content;

// Write back to file
writeFileSync(indexJs, content, "utf-8");

console.log("✓ Added CSS import to dist/index.js");
