import { COMMON_COMPONENTS, componentNames, SCREEN_SPECS, SPECIFIC_COMPONENTS } from "./catalog";
import type { RenderedScreen, ScreenSpec, StatusLevel, UiTokens } from "./types";

const STATUS_LABELS: Record<StatusLevel, string> = {
  ok: "正常",
  warn: "警告",
  error: "失敗",
  empty: "未作成",
  loading: "読込中",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function statusBadge(level: StatusLevel, tokens: UiTokens): string {
  const token = tokens.color.status[level];
  const label = STATUS_LABELS[level];
  return `<span class="status-badge status-${level}" aria-label="${escapeHtml(label)}" style="color:${token.fg};background:${token.bg}">${escapeHtml(token.icon)} ${escapeHtml(label)}</span>`;
}

function componentList(title: string, names: string[]): string {
  return `<section class="component-section"><h2>${escapeHtml(title)}</h2><ul>${names
    .map((name) => `<li data-component="${escapeHtml(name)}">${escapeHtml(name)}</li>`)
    .join("")}</ul></section>`;
}

export function renderScreen(screen: ScreenSpec, tokens: UiTokens): RenderedScreen {
  const components = componentNames();
  for (const name of [...screen.specificComponents, ...screen.commonComponents]) {
    if (!components.has(name)) throw new Error(`unknown component in ${screen.id}: ${name}`);
  }

  const html = `<article class="screen screen-${screen.category.toLowerCase()}" data-screen-id="${escapeHtml(screen.id)}" data-read-only="true">
  <header class="screen-header">
    <p class="screen-url">${escapeHtml(screen.url)}</p>
    <h1>${escapeHtml(screen.id)} ${escapeHtml(screen.name)}</h1>
    ${statusBadge(screen.primaryStatus, tokens)}
  </header>
  <p class="screen-mission">${escapeHtml(screen.mission)}</p>
  ${componentList("画面固有コンポーネント", screen.specificComponents)}
  ${componentList("共通コンポーネント", screen.commonComponents)}
  <footer class="screen-footer">
    <button type="button" class="copy-command" data-command="ut-tdd status" aria-label="CLI command copy only">CLIコピー</button>
    <span class="readonly-note">read-only / UI直接実行なし</span>
  </footer>
</article>`;

  return { screen, html };
}

export function renderAllScreens(tokens: UiTokens): RenderedScreen[] {
  return SCREEN_SPECS.map((screen) => renderScreen(screen, tokens));
}

export function renderAppShell(tokens: UiTokens): string {
  const rendered = renderAllScreens(tokens);
  return `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <title>HELIX-HARNESS UI</title>
  <style>
    :root {
      --fg: ${tokens.color.fg.default};
      --muted: ${tokens.color.fg.muted};
      --canvas: ${tokens.color.canvas.default};
      --subtle: ${tokens.color.canvas.subtle};
      --border: ${tokens.color.border.default};
      --accent: ${tokens.color.accent.fg};
      --gutter: ${tokens.size.layout.gutter}px;
      --row-height: ${tokens.size.table.rowHeight}px;
      --font-body: ${tokens.type.font.body};
      --font-mono: ${tokens.type.font.mono};
    }
    body { margin: 0; min-width: ${tokens.size.layout.minWidth}px; color: var(--fg); background: var(--canvas); font: ${tokens.type.fontSize.body}px/${tokens.type.lineHeight.body} var(--font-body); }
    main { display: grid; grid-template-columns: repeat(3, minmax(320px, 1fr)); gap: var(--gutter); padding: var(--gutter); }
    .screen { border: 1px solid var(--border); border-radius: ${tokens.size.radius.md}px; background: var(--subtle); padding: var(--gutter); }
    .screen-header { display: grid; gap: 6px; align-items: start; }
    .screen-url, .readonly-note { color: var(--muted); font-family: var(--font-mono); font-size: ${tokens.type.fontSize.small}px; }
    h1 { margin: 0; font-size: ${tokens.type.fontSize.h1}px; }
    h2 { font-size: ${tokens.type.fontSize.h2}px; margin-bottom: 4px; }
    ul { margin: 0; padding-left: 20px; }
    li { min-height: var(--row-height); }
    .status-badge { display: inline-flex; width: fit-content; min-height: ${tokens.size.control.minTarget}px; align-items: center; border-radius: ${tokens.size.radius.sm}px; padding: 0 8px; font-weight: ${tokens.type.weight.bold}; }
    .copy-command { min-height: ${tokens.size.control.height}px; min-width: ${tokens.size.control.minTarget}px; border: 1px solid var(--accent); background: ${tokens.color.accent.subtle}; color: var(--accent); border-radius: ${tokens.size.radius.sm}px; }
    .copy-command:focus { outline: ${tokens.focus.ringWidth}px ${tokens.focus.ringStyle} ${tokens.focus.ringColor}; outline-offset: ${tokens.focus.ringOffset}px; }
  </style>
</head>
<body>
  <main>
${rendered.map((entry) => entry.html).join("\n")}
  </main>
</body>
</html>`;
}

export function componentCoverageSummary(): {
  screenCount: number;
  commonCount: number;
  specificCount: number;
  readOnly: boolean;
} {
  const readOnly = [...COMMON_COMPONENTS, ...SPECIFIC_COMPONENTS].every(
    (component) => component.readOnly,
  );
  return {
    screenCount: SCREEN_SPECS.length,
    commonCount: COMMON_COMPONENTS.length,
    specificCount: SPECIFIC_COMPONENTS.length,
    readOnly,
  };
}
