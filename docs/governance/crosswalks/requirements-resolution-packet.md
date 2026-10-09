# template seedの意味対応案

base `8eccdd645288a5cea1eebdb49c93edcde5dae9da`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `3df97393dba85973c3564dd63ac8e28049002e21e80d14d00f4d8385a0090330`。canonical L2/L11/MPRとseed26件は未変更。現在の候補は採用判断に出せる完成状態ではない。

## 作業単位

SEEDFIRST（#2846）はDT-VT-001（共通証拠）とDT-VT-102（L2/L11）をBRAIN032の15descriptorへ対応づける最初の起草である。全機構/全V-pairに必要な最小seedをこの2件に縮めない。採用対象set/版/適用規則を今回決定しない。

sourceの契約表・見出し・table行・listをJSON上で分け、各記載を元line/hashへ戻れるようにした。元のYAML/例値は説明材料のままであり、新しいschema/型/enumにしない。required input、negative oracle、completion等はsource参照で識別する。必須section/fieldの全identity・要否と意味owner、downstream kind、measurementの定義は不足/未確認を保持し、完全な意味契約として返さない。

VT102が参照するVT002/003の技法・選択条件と、unit/connection/compositeのseed比較は残る。参照があるだけで依存や全カード必須を生成せず、Prototype/PoCを別々に判定し、unknownと根拠付きN/Aを分ける。成果物の状態・合否と人の受入は既存HARNESS契約に残す。

旧L5 template JSON authority74–77、verification87–91、CI plan24–32、旧検証工程28–40/73–79/197–220、screen受入26–35、acceptance criteria45–76を読み、欠落/trace/人の受入/未完義務とJSON意味・説明の分離を起点にする。旧CLI/層/schema/固定差戻し/回収先方式は移植しない。sourceの全条件移管は主張しない。

## 続ける作業

選択seedの個々の意味・field/owner/要否・限界とsource対応を詰め、技法・unit/connection/composite・対検証の条件付き依存を比較して最小setを提案する。その対象revisionが固定できてから採用判断へ送る。未選択候補は保全し、正式N/A/retireへ変換しない。今回のJSON化から採用・実装/CI・受入・Issue完了・L3再開を生成しない。

## 既決packet

OS002追補は[判断記録](../decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)に従いPR #2855で採用反映済み。前OSTRACE packetと内包する既決packetをJSONの`resolved_packet.packet`へ完全一致で保持する。
