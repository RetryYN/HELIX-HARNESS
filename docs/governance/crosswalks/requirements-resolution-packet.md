# template seedの意味対応案

base `5643121bea60acdd4f6177730aa7a7f266073d18`。[JSON候補](requirements-resolution-packet.json)、SHA-256 `912d9377dc693bddaba47b15730079c88cb9b121eae57fafead7eaf0c8ed6fee`。canonical L2/L11/MPRとseed26件は未変更。非画面の要求/受入知識sliceについて独立review後に対象revisionの採否を問う。全体の最小seed packはまだ未確定。

## 作業単位

SEEDFIRST（#2846）はVT001共通証拠・VT102 L2/L11と、VT002のC01/C02/C08/C26の技法意味を、非画面・技術的不確実性なしの要求/受入知識sliceとして提案する。2templateと4cardの選択理由をJSONへ記録した。全機構/全V-pairの最小setをこのsliceへ縮めない。

VT001の15共通field、VT102の5固有fieldと共通欄継承を識別し、意味・source行・要否とowner境界へ結ぶ。measurementは実施契約のprofile/環境・設定digest・有効期限/再測定条件を参照し数値を新設しない。downstreamは共通/観点別証拠・N/A記録・省略義務/Backflow参照を識別する。field定義と案件値/実行結果の未決を区別し、初回記録前に将来の受入receiptを要求しない。

Prototype/PoCは別々に根拠付きN/A/適用を扱う。Redは適用契約が要求する場合に照合し、静的reviewや人の判断のすべてへRed実行を追加しない。未実行/unknownをN/Aへ変換しない。C01/C02はreview/trace、C08は合意例と反例、C26は利用者接点のある成果での人の受入を持つ。tool名・cost・HELIX例は参考のまま。C36の旧cardのモデル/共通context条件、VT003の選択matrix、画面技法早見は採用せず、独立性と検証義務は正本のConcept/HARNESSと開発repo運用を区別する。

旧sourceのarchive path・asset ID・行範囲・全体SHAはJSONの`legacy_sources`へ固定した。

- `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/design-template-json-authority.md`:74–77 — 意味構造/verification/measurementと説明を分離
- `archive/legacy-generation-2026-09-14/root/docs/skills/verification.md`:87–91 — 必要artifactの欠落を中立へ変換しない
- `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/ci-verification-plan.md`:24–32 — 検証義務の区別と延期義務の回収
- `archive/legacy-generation-2026-09-14/root/docs/process/forward/L08-L14-verification-phase.md`:28–40/73–79/197–220 — 対/test basis、人の受入、未処理feedback、追加oracleの分離
- `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L2-screen-ux-test-design.md`:26–35 — 受入観点と要求revision/実操作/人の証拠
- `archive/legacy-generation-2026-09-14/root/docs/skills/acceptance-criteria-thinking.md`:45–76 — 観測可能AC、偽完了拒否、判定不能を未決保持

`legacy_comparison`に保持/変更/理由を分ける。旧CLI/層/schema/固定差戻し/回収先方式は移植せず、全旧source移管を主張しない。source行hashは、UTF-8の一行にLF一つを加えたbytesのSHA-256（空行は対象外）。見出しはline/text/levelへ対応づける。

## 採否と残り

独立reviewでscope・15descriptor・各field/技法の意味とsource対応・未完境界を確認してから、この知識sliceの対象revision採否を問う。採用だけで案件の合意/受入・実行を生成しない。画面/PoC・他pair・unit/connection/compositeのseed比較と全体最小setは残り、26候補と未選択cardを保全する。正式schema/runtime/実装・L3再開は別。

## 既決packet

OS002追補は[判断記録](../decisions/os-template-trace-002-supplement-po-decision-2026-10-10.md)に従いPR #2855で採用反映済み。前OSTRACE packetと内包する既決packetをJSONの`resolved_packet.packet`へ完全一致で保持する。
