import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const host = join(root, "..");

const HEADER = "/* 由 neko-shared/sync.mjs 自动生成，请勿直接修改；改动请写在 neko-shared/src 下 */\n";

const LAYOUTS = [
  { probe: "src/.vuepress/components", dir: "src/.vuepress/components", extension: ".ts", stripExport: false },
  { probe: "web", dir: "web/shared", extension: ".js", stripExport: true },
];

const SOURCES = [
  { source: "src/eggs.js", name: "neko-shared-eggs" },
  { source: "src/chat.js", name: "neko-shared-chat" },
];

/** 浏览器直出的经典脚本没有模块系统，去掉顶层 export 关键字即可变成全局声明 */
function toGlobalScript(code) {
  return code.replace(/^export (?=(?:const|let|var|function|async function)\b)/gm, "");
}

const layout = LAYOUTS.find(({ probe }) => existsSync(join(host, probe)));

if (!layout) {
  console.log("[neko-shared] 未在宿主仓库根目录运行，跳过同步");
  process.exit(0);
}

SOURCES.forEach(({ source, name }) => {
  const code = readFileSync(join(root, source), "utf8");
  const file = join(host, layout.dir, name + layout.extension);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, HEADER + (layout.stripExport ? toGlobalScript(code) : code), "utf8");
  console.log(`[neko-shared] ${source} -> ${file}`);
});
