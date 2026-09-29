# 旧Design Grounding取込台帳の51行分類案

- audit id: `legacy-candidate-design-grounding-intake-classification-reassessment-2026-09-29`
- 対象状態: #2353/#2356/#2360適用後の51行。最新baseline: merged main `a9b36cd43866d30aaca7c1edc654a44a36e47eb3` (#2366 merge)。
- authority effect: `none`。分類・atom境界の提案のみ。採択、successor、coverage、受入、実装、完了を示さない。
- 入力: 同名JSONにcommit/path/SHA-256を固定し、merge済み依存pinを更新・再照合。source asset `LEGACY-ASSET-A422448C3CACBCA75D0C`、原稿全体、対応requests/requirements/acceptance、PLAN-L3-91を読了。

## 分類基準

- プロダクト動作、統合動作、authority境界、traceability、受入動作は `condition/product_requirement_atom` を維持する。
- census・実装順・Issue保守など作業方法を命じる規範は `condition/management_process_condition` とする。
- 概要ラベルや既存能力の状況・由来の記述は `explanation` とする。
- source textとIDを変えず、複数行で一つの意味を作る箇所は同じatom境界として記録する。

## 提案とcount impact

| 現在の行状態 | 提案 | 件数 |
|---|---|---:|
| condition / product_requirement_atom / unknown | 維持 | 29 |
| condition / product_requirement_atom / unknown | condition / management_process_condition | 13 |
| condition / product_requirement_atom / unknown | explanation | 9 |

対象51行内の差分は condition −9、explanation ＋9、product atom −22、management condition ＋13。merged #2361の正確なeffective baselineはcondition 901、explanation 2928、product atom 893、management condition 7、product route unknown 544。今回の51行案だけを単独適用するとcondition 892、explanation 2937、product atom 871、management condition 20、unknown 522となる。別集合の#2363案−12と#2366案−11を重ねた提案上baselineは544−12−11＝521で、そこへこの51行案を加えた算術値は499。これらはproposal-onlyの分類算術であり、採択、handoff、successor assignment、coverage、resolution、closureを意味しない。unknown routeは被覆を意味しない。

## 行別分類案

| source ID | archive physical line | 提案 | 原文（source ledger） | atom境界と判断 |
|---|---:|---|---|---|
| `LEGACY-CAND-LINE-000840` | 31 | 再分類: management condition | 現行 HELIX Design Harness を作り直してはならない。 | §1「現行実装を前提」冒頭の規範。既存Design Harnessを作り直さないという作業・構成指示で、独立した利用者向け動作条件は定義しない。 管理条件。実装接続範囲を制約する指示として原文を保持する。 |
| `LEGACY-CAND-LINE-000842` | 34 | 再分類: explanation | 1. **Design Grounding** — 良い設計判断をするための前提・外部知識を揃える | §0の3項目リスト（原稿物理行34–36）。3領域の概要ラベルであり、規範の詳細は後続§2–4にある。 説明。概要を独立した製品要件へ重複計上しない。 |
| `LEGACY-CAND-LINE-000843` | 35 | 再分類: explanation | 2. **Human Reaction Semantics** — 人間の「違う・使いにくい・ダサい・分かりにくい」を意味分類する | §0の3項目リスト（原稿物理行34–36）。3領域の概要ラベルであり、規範の詳細は後続§2–4にある。 説明。概要を独立した製品要件へ重複計上しない。 |
| `LEGACY-CAND-LINE-000844` | 36 | 再分類: explanation | 3. **Design Convergence** — 人間との反復で何が受容・拒否・未解決かを保持し、収束を判定する | §0の3項目リスト（原稿物理行34–36）。3領域の概要ラベルであり、規範の詳細は後続§2–4にある。 説明。概要を独立した製品要件へ重複計上しない。 |
| `LEGACY-CAND-LINE-000850` | 47 | 再分類: management condition | 少なくとも現行で確認済みの以下は「新規実装候補」ではなく接続先として扱う。 | §1導入文と直後の物理行49–54の既存機構一覧。既存を調査し接続先として扱う作業指示と、根拠となる現状一覧を分けて分類する。 管理条件。実装調査・統合方法を定め、プロダクトの外部動作を定義しない。 |
| `LEGACY-CAND-LINE-000851` | 49 | 再分類: explanation | - Screen Applicability 系の判定・永続化 | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000852` | 50 | 再分類: explanation | - Prototype / Walkthrough / human decision / finding / back-propagation を扱う既存契約 | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000853` | 51 | 再分類: explanation | - Design Registry の revision・authority・binding・supersession | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000854` | 52 | 再分類: explanation | - UI domain / pattern profile | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000855` | 53 | 再分類: explanation | - Visual / Interaction / Accessibility / Performance 等の既存 evidence role | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000856` | 54 | 再分類: explanation | - 既存 Research skill / project explorer / tech docs / OSS research 系能力 | §1の既存機構一覧（物理行49–54）。censusで確認した当時の実装・契約を接続先として記録する一覧。 説明。既存責務の由来・構造を示す情報である。 |
| `LEGACY-CAND-LINE-000942` | 178 | 維持: product atom | - accessibility | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000943` | 179 | 維持: product atom | - interaction/state correctness | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000944` | 180 | 維持: product atom | - navigation dead-end | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000945` | 181 | 維持: product atom | - responsive | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000946` | 182 | 維持: product atom | - performance | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000947` | 183 | 維持: product atom | - requirement consistency | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000948` | 184 | 維持: product atom | - evidence/revision consistency | §5の「機械判定可能なものは極力HELIXへ委任」直下の例示リスト（物理行178–184）。例示一式で委任対象の品質領域を具体化する。 製品動作要件の適用領域を定める例示として保持。 |
| `LEGACY-CAND-LINE-000949` | 186 | 維持: product atom | 一方、以下をモデル単独で最終決定してはならない。 | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000950` | 188 | 維持: product atom | - 美的好み | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000951` | 189 | 維持: product atom | - ブランドらしさ | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000952` | 190 | 維持: product atom | - 世界観 | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000953` | 191 | 維持: product atom | - 「高級」「親しみやすい」等の主観意味 | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000954` | 192 | 維持: product atom | - 表現・文章ニュアンス | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000955` | 193 | 維持: product atom | - 人間が明示的に保持したいVisual/UX preference | §5の「以下をモデル単独で最終決定してはならない」と例示リスト（物理行186–193）。禁止の対象意味を限定する一つの規範単位。 プロダクトauthority境界として維持。 |
| `LEGACY-CAND-LINE-000978` | 225 | 維持: product atom | - Issueの `root/capability/task/finding` 階層を壊さない。 | §7の各独立bullet（原稿物理行225–230）。既存Issue階層を保つ統合契約として機構の作業追跡に影響する。 プロダクト要件として維持。issue階層を保つ動作境界であり、単なる作業計画ではない。 |
| `LEGACY-CAND-LINE-000979` | 226 | 維持: product atom | - Design形成状態を必要なら別semantic stateとして持つ。 | §7の独立bullet。形成状態をIssue階層と分けて表現するシステム構成・追跡条件。 プロダクト要件として維持。 |
| `LEGACY-CAND-LINE-000980` | 227 | 維持: product atom | - 各Design作業は source Requirement / Design problem / Evidence / Prototype revision にtrace可能であること。 | §7の独立bullet。各Design workのsource Requirement等へのtrace条件。 プロダクト要件として維持。 |
| `LEGACY-CAND-LINE-000981` | 228 | 維持: product atom | - Research不足・Human decision待ちが一部にあっても、影響しない承認済み作業まで全停止させない。 | §7の独立bullet。未解決が局所にあるときの無関係な承認済み作業の継続動作。 プロダクト要件として維持。 |
| `LEGACY-CAND-LINE-000982` | 229 | 維持: product atom | - exact revision / provenance / evidence bindingを維持する。 | §7の独立bullet。revision・provenance・evidence bindingの整合動作。 プロダクト要件として維持。 |
| `LEGACY-CAND-LINE-000983` | 230 | 再分類: management condition | - Issueが古い場合はmain実装を優先し、重複機構を起票しない。 | §7の独立bullet。古いIssueと現行mainを比較して重複起票を避ける運用指示。 管理条件。時点依存のIssue運用/census指示で、ユーザー向け動作契約ではない。 |
| `LEGACY-CAND-LINE-000986` | 236 | 維持: product atom | 1. 外部事例が豊富な未知Design taskで、調査なしPrototype生成をGateできる。 | §8の独立受入条件1。必要前提・調査とDesign Ready判定を結ぶ。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000987` | 237 | 維持: product atom | 2. Research Evidenceから「何をDesignへ取り込んだか」を追跡できる。 | §8の独立受入条件2。Research evidenceから設計判断へのtraceを検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000988` | 238 | 維持: product atom | 3. 「ダサい」「分かりにくい」「何を見ればよいか分からない」を同一Findingとして扱わず意味分類できる。 | §8の独立受入条件3。反応意味を分類し単一findingへの誤統合を防ぐ。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000989` | 239 | 維持: product atom | 4. Prototype communication failure時にDesign自体を不要に再生成しない。 | §8の独立受入条件4。communication failureに対する再作業の限定動作を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000990` | 240 | 維持: product atom | 5. Human acceptedな設計軸が次revisionで壊れたことを検出できる。 | §8の独立受入条件5。受容済み設計軸の変更検知を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000991` | 241 | 維持: product atom | 6. objective UX green / human preference reject を同時に表現できる。 | §8の独立受入条件6。客観品質と人間選好の同時表現を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000992` | 242 | 維持: product atom | 7. Human reaction原文とAI interpretationが分離される。 | §8の独立受入条件7。原文とAI解釈の分離を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000993` | 243 | 維持: product atom | 8. Design Registry・Screen Applicability等の既存責務を複製しない。 | §8の独立受入条件8。既存責務の重複を抑止する統合境界を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000994` | 244 | 維持: product atom | 9. 全結果がcurrent revision / authority / evidenceへ束縛される。 | §8の独立受入条件9。revision・authority・evidenceの正当性を検査する。 プロダクト受入要件として維持。 |
| `LEGACY-CAND-LINE-000995` | 245 | 維持: product atom | 10. Full HELIXで動作し、将来HELIX Lite consumerへ必要最小契約だけ配布可能な責務境界にする。 | §8の独立受入条件10。Fullと将来Liteで異なるconsumer/dependency境界を検査する。 将来条件を含むプロダクト受入要件として維持。採用や実装時期はここでは示さない。 |
| `LEGACY-CAND-LINE-000998` | 251 | 再分類: management condition | 1. **Current Design Harness implementation census** | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-000999` | 252 | 再分類: management condition | 2. 既存責務とのowner/contract map作成 | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001000` | 253 | 再分類: management condition | 3. Design Premise / Research Adequacy | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001001` | 254 | 再分類: management condition | 4. Human Reaction schema + routing | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001002` | 255 | 再分類: management condition | 5. Design Axis / Finding lineage | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001003` | 256 | 再分類: management condition | 6. Convergence evaluator | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001004` | 257 | 再分類: management condition | 7. 既存Screen Applicability / Design Registryへの接続 | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001005` | 258 | 再分類: management condition | 8. deterministic test / mutation / stale revision test | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001006` | 259 | 再分類: management condition | 9. 実プロジェクトでdogfood | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |
| `LEGACY-CAND-LINE-001007` | 260 | 再分類: management condition | 10. Evidenceを確認してからcanonical requirement/version-up | §9の10段階の順序付き導入手順（物理行251–260）。各step IDを保ち、全体として一つの履歴的な作業順序を構成する。 管理プロセス条件。後続requirements/Issueはauthority-first順序へ是正しているが、このsource行の規範意味・順序は書き換えない。 |

## 曖昧な行

次の行は製品アーキテクチャ要件とプロジェクト作業指示、または要求と概要の境界に見える。提案ラベルは上の件数に含む。

| source ID | 提案 | 境界が曖昧な理由 |
|---|---|---|
| `LEGACY-CAND-LINE-000840` | 再分類: management condition | 既存実装を再構築しない制約は統合設計へ影響するが、製品の観測可能な動作より作業者への実装制約として書かれているためmanagement condition案。 |
| `LEGACY-CAND-LINE-000842` | 再分類: explanation | Design Groundingは要求領域名にも読める。ここでは詳細な§2の要件群に先行する概要項目としてexplanation案。 |
| `LEGACY-CAND-LINE-000843` | 再分類: explanation | Human Reaction Semanticsは要求領域名にも読める。詳細な§3の要件群に先行する概要項目としてexplanation案。 |
| `LEGACY-CAND-LINE-000844` | 再分類: explanation | Design Convergenceは要求領域名にも読める。詳細な§4の要件群に先行する概要項目としてexplanation案。 |
| `LEGACY-CAND-LINE-000850` | 再分類: management condition | 既存機構へ接続するという規範はアーキテクチャ要件にも読めるが、§1のimplementation censusに向けた作業指示としてmanagement condition案。 |
| `LEGACY-CAND-LINE-000978` | 維持: product atom | Issue階層は管理プロセスの分類にも見えるが、既存Issue連携の維持をプロダクトが満たす統合動作と読み、product atomを維持。 |

## 旧sourceと判断史の照合

- intake §0–1の概要・実装censusと、同名requests/requirements/acceptanceを照合した。requestsは3 BRを要求の親として持ち、requirementsはDG/HR/DCとIssue追跡、scope限定、authority境界を機能契約として具体化している。
- PLAN-L3-91は#1558所有の候補整理、runtime/canonical変更なし、原稿保全とtraceを記す。旧intakeの§9順序は、隣接requirementsおよび#1558本文でauthority-firstへ是正されている。ここでは旧順序をsource historyとして保ち、順序内容は書き換えず、管理条件に分類する。
- #1558の公開Issue本文（2026-09-29閲覧）は、DG/HR/DC契約、Issue形成状態とtrace、影響scope限定、候補/authority分離を説明する。Issue状態はsource分類の入力権限や要求採択の根拠に使っていない。
- merged #2363の16 ID、#2366の14 ID、後続の#2364 521-cutoff sampleの20 IDは本51 IDと重複しない。#2364は別の後続route sampleであり、今回の51行分類proposalの選定を遡及変更しない。また、#2364をstage全体の最終sampleとは扱わない。#2356/#2360の対象IDも別行で、今回の51 IDへ適用差分はない。

## 制約

- この51行は独立したbounded classification proposalであり、#2364の後続route sampleと統合しない。#2364との重複は0件。#2364のsample選定は遡及変更せず、stage全体の最終sampleとも表現しない。

- 全51行のcurrent route labelは `unknown`。保持するproduct atom 29行もunknownのままとする。
- management conditionへの再分類はproduct successorの不存在やretireを意味しない。explanationへの再分類もsourceの規範文を削除・無効化しない。
- 原文・source line SHA・physical line bytes SHAは同名JSONに収録。静的なsource identity/count整合、merged dependency pins、#2363/#2366/#2364とのID非重複だけを検証し、旧runtime、CLI、test、CI、hookは実行していない。
