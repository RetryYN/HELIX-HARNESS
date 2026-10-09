# template seedの意味対応案

base `8eccdd645288a5cea1eebdb49c93edcde5dae9da`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `9a490ecc4616b20ea1ec954513a60691e22b760fa3f16ae246a10487f55faaa0`。canonical L2/L11/MPRとseed26件は未変更。現在の候補は採用判断に出せる完成状態ではない。

## 作業単位

SEEDFIRST（#2846）はDT-VT-001（共通証拠）とDT-VT-102（L2/L11）をBRAIN032の15descriptorへ対応づける最初の起草である。全機構/全V-pairに必要な最小seedをこの2件に縮めない。採用対象set/版/適用規則を今回決定しない。

sourceの契約表・見出し・table行・listをJSON上で分け、各記載を元line/hashへ戻れるようにした。元のYAML/例値は説明材料のままであり、新しいschema/型/enumにしない。required input、negative oracle、completion等はsource参照で識別する。必須section/fieldの全identity・要否と意味owner、downstream kind、measurementの定義は不足/未確認を保持し、完全な意味契約として返さない。

VT102が参照するVT002/003の技法・選択条件と、unit/connection/compositeのseed比較は残る。参照があるだけで依存や全カード必須を生成せず、Prototype/PoCを別々に判定し、unknownと根拠付きN/Aを分ける。成果物の状態・合否と人の受入は既存HARNESS契約に残す。

旧sourceのarchive path・asset ID・行範囲・全体SHAはJSONの`legacy_sources`へ固定した。

- `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md`:74–77 — 意味構造/verification/measurementと説明を分離
- `archive/legacy-generation-2026-09-14/root/docs/skills/verification.md`:87–91 — 必要artifactの欠落を中立へ変換しない
- `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/ci-verification-plan.md`:24–32 — 検証義務の区別と延期義務の回収
- `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md`:28–40/73–79/197–220 — 対/test basis、人の受入、未処理feedback、追加oracleの分離
- `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L2-screen-ux-test-design.md`:26–35 — 受入観点と要求revision/実操作/人の証拠
- `archive/legacy-generation-2026-09-14/root/docs/skills/acceptance-criteria-thinking.md`:45–76 — 観測可能AC、偽完了拒否、判定不能を未決保持

`legacy_comparison`に保持/変更/理由を分ける。旧CLI/層/schema/固定差戻し/回収先方式は移植せず、全旧source移管を主張しない。source行hashは、UTF-8の一行にLF一つを加えたbytesのSHA-256（空行は対象外）。見出しはline/text/levelへ対応づける。

## 続ける作業

選択seedの個々の意味・field/owner/要否・限界とsource対応を詰め、技法・unit/connection/composite・対検証の条件付き依存を比較して最小setを提案する。その対象revisionが固定できてから採用判断へ送る。未選択候補は保全し、正式N/A/retireへ変換しない。今回のJSON化から採用・実装/CI・受入・Issue完了・L3再開を生成しない。

## 既決packet

OS002追補は[判断記録](../decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)に従いPR #2855で採用反映済み。前OSTRACE packetと内包する既決packetをJSONの`resolved_packet.packet`へ完全一致で保持する。
