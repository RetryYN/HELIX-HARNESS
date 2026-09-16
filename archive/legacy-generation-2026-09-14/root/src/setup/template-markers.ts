export const HELIX_MANAGED_BLOCK_START = "<!-- HELIX:managed:start -->";
export const HELIX_MANAGED_BLOCK_END = "<!-- HELIX:managed:end -->";

export const HELIX_ADAPTER_JAPANESE_FIRST_NOTICE =
  "PO への進捗報告・調査結論・確認依頼など chat 出力は日本語を既定とする。docs / handover / adapter prose も日本語を基本とし、CLI 名・識別子・技術用語は原語のまま扱ってよい。";

export const HELIX_HOOK_COMMAND_TYPE_LINE = '            "type": "command",';
export const HELIX_HOOK_TIMEOUT_5_LINE = '            "timeout": 5,';
// SessionStart は feedback surface と memory recall を伴い、guard hook (実測 0.4s) より
// 構造的に重い。5s では実運用規模の repo で kill され、fail-open のまま session_start event と
// memory recall を恒常的に失う (PLAN-L7-471 の実測: 24.4s -> 修正後 4.19s)。
// consumer 配布面も同じ予算にするため built-in template と tracked template の両方で使う。
export const HELIX_HOOK_TIMEOUT_15_LINE = '            "timeout": 15,';
export const HELIX_HOOK_TIMEOUT_30_LINE = '            "timeout": 30,';
// Codex 0.144 実測: 実 session payload 付き session start は sandbox 内で最大 ~44s
// (PLAN-L7-417 Slice B)。session lifecycle hook は長め timeout を使う。
export const HELIX_HOOK_TIMEOUT_60_LINE = '            "timeout": 60,';
export const HELIX_HOOK_TIMEOUT_90_LINE = '            "timeout": 90,';
