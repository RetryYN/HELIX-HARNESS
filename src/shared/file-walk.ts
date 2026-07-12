import { readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

export interface WalkedFile {
  absolutePath: string;
  relativePath: string;
}

/**
 * recursive file inventoryの低位単一正本。live treeのreaddir→stat raceはskipし、
 * relative pathはOSに依存せずPOSIX separatorへ正規化する。
 */
export function walkFiles(
  root: string,
  repoRoot: string,
  extensions: readonly string[],
): WalkedFile[] {
  const files: WalkedFile[] = [];
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir).sort()) {
      const absolutePath = join(dir, name);
      let stat: ReturnType<typeof statSync>;
      try {
        stat = statSync(absolutePath);
      } catch {
        continue;
      }
      if (stat.isDirectory()) {
        visit(absolutePath);
      } else if (stat.isFile() && extensions.some((extension) => name.endsWith(extension))) {
        files.push({
          absolutePath,
          relativePath: relative(repoRoot, absolutePath).replaceAll("\\", "/"),
        });
      }
    }
  };
  visit(root);
  return files;
}
