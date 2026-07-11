export const HELIX_MANAGED_BLOCK_START = "<!-- HELIX:managed:start -->";
export const HELIX_MANAGED_BLOCK_END = "<!-- HELIX:managed:end -->";

export const HELIX_ADAPTER_JAPANESE_FIRST_NOTICE =
  "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。";

export const HELIX_HOOK_COMMAND_TYPE_LINE = '            "type": "command",';
export const HELIX_HOOK_TIMEOUT_5_LINE = '            "timeout": 5,';
// Codex 0.144 実測: 実 session payload 付き session start は sandbox 内で最大 ~44s
// (PLAN-L7-417 Slice B)。session lifecycle hook は長め timeout を使う。
export const HELIX_HOOK_TIMEOUT_60_LINE = '            "timeout": 60,';
export const HELIX_HOOK_TIMEOUT_90_LINE = '            "timeout": 90,';
