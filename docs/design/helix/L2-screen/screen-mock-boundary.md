---
title: "HELIX L2 画面・モック境界"
layer: L2
canonical_vmodel: L1-L12
canonical_layer: L2
canonical_pair: L11
kind: design
status: draft
freeze_blocking: true
created: 2026-07-04
updated: 2026-09-14
owner: Codex
pair_artifact: docs/test-design/helix/L2-screen-ux-test-design.md
---

# HELIX L2 画面・モック境界

L2は要求を引き出し、人と合意する工程である。画面プロトタイプは利用者・目的・操作・期待結果を
具体化するために用いる。L1企画から要求を導き、合意した要求をL3要件定義へ渡し、L11受入で検証する。
本書はその画面・可視化部分を扱う。HELIX全体のL2要求を画面だけで代表させない。

本revisionは現行L2／L11への整備案であり、旧revisionのconfirmedを引き継がない。
プロト合意記録・要求revision・L11受入証跡は未確認である。本文の整備だけで合意や受入を成立させない。

## 要求の出典と参照範囲

| 項目 | 現在の参照 |
|---|---|
| 旧画面要求（15画面と共通条件の移管元） | `docs/design/harness/L1-requirements/screen-requirements.md` |
| 旧screen設計（移管元。現行合意の証拠にしない） | `docs/design/harness/L2-screen/**` |
| HELIXのL2柱要求、特に§2.8 | `docs/design/helix/L1-requirements/pillar-requirements.md` |
| L11検証境界（旧物理pathを保持） | `docs/design/helix/L10-ux/ux-evidence-boundary.md` |
| test-design 対 | `docs/test-design/helix/L2-screen-ux-test-design.md` |

### 旧画面要求との照合

旧画面要求のPM-01..06／HM-01..08／GD-01は移管元の15画面であり、現行HELIXの画面数・採用済みscopeを固定しない。
以下は柱要求§2.8との内容照合先であり、要求の採用・プロト合意・L11受入が成立した対応表ではない。

| 現行要求 | 照合する旧画面 | 引き継ぐ条件の確認事項 |
|---|---|---|
| HBR-P9／HBR-P4：資産・進捗・依存・blockerの可視化 | PM-01..04／PM-06／HM-01..04／HM-07 | 一覧だけでなく根拠となる文書・trace・判定へ到達する。旧51 FRや9 driveを全HELIXの固定分母にしない |
| HBR-P7／HNFR-P3：計測と証跡への到達 | PM-05／HM-05／HM-08 | continuationのfreshness、検証前・データ欠落・実行済みの区別を保持する。旧Learning画面の存在をmemory要求の採用・充足としない |
| HNFR-AC／HNFR-P8：read-onlyと実行境界 | 全画面、特にPM-03／PM-06／HM-04／HM-06／HM-07 | CLIコピー・参照と実行を区別する。旧文書の再実行トリガーを実行権限の付与と読まない。PM-06の描画失敗・stale・共有範囲・性能条件も照合する |

GD-01のガイド・検索・学習連動、および共通の更新頻度・日本語表示・desktop範囲・keyboard操作等は、
上表の対応だけで採用済み／不要と判断しない。各条件の現行要求への採否と、その理由・承認revisionを確認する。
旧文書§5の「PASS」は旧trace検査の記載であり、現行要求・プロトrevisionへの合意やL11実操作の合格証拠ではない。

## 境界

### 画面一覧・詳細からの移管確認

旧`screen-list.md`と`screen-detail.md`の15画面は全文照合した。現行への移管では、画面IDと件数の一致に加え、
次を要求・プロト・受入に対応づける。

- 詳細書の必須schemaにあるPersona、Route、Security／Permission、State Persistenceは、詳細matrixでは
  独立した欄を持たない。共通規則・画面一覧のどの条件を各画面が継承するかを確認し、未定義と共通適用を区別する。
- PM-01の旧L0–L14 heatmap、HM-02の固定8×5軸、HM-03のmode／drive mappingは移管元の表現である。
  採用する表示は現行L1–L12とtyped分類へ対応づけ、旧enumや固定件数を要求の網羅分母にしない。
- filter・階層・tabを含む共有URL、browser back、scroll保持、案件scopeを確認する。
  queryや画面名だけでは共有した利用状況が再現できたことにならない。
- missing／stale／invalid／部分投影を成功表示にせず、参照先・診断へ到達できることを確認する。
  不足sampleのランキング、欠落証拠のgate pass、未取得データの空白成功を拒否する。
- 未知pathとMarkdownの描画では入力を実行せず、安全な表示またはfallbackへ移る。CLIコピーと実行を分離し、
  安全なrollback先がない場合に破壊的commandを自動生成・実行して成功扱いにしない。

上記は旧条件の照合事項であり、画面採用や非UI適用性を確定した記録ではない。

### 業務・遷移・部品・モックの照合結果

旧`business-flow.md`、`screen-flow.md`、`ui-element.md`、`wireframe.md`も全文確認した。

| 対象 | 未解決事項と移管時の扱い |
|---|---|
| 業務と遷移の対応 | BF-04が要求するHM-06→PM-03、BF-06のPM-04→PM-03は遷移表に直接edgeがない。経由遷移にするのか直接edgeを追加するのか、採用要求とプロトで確定する |
| シナリオの網羅 | 画面遷移S6「Doctor検出→Trace修正」は業務フロー対応表に明示されていない。BFもSも各6件という件数一致では対応済みとしない |
| 人間と自動実行の境界 | BF-02の人間CLI呼出し限定、Recovery全件の人間判断必須を自律基盤全体へ転用しない。現行の委任scope内の復旧と、人間判断が必要な意味変更・高影響操作を分ける。UIのread-only規則はCLI自走禁止を意味しない |
| 表示と操作 | HM-04／HM-07の「再実行トリガー」は共通read-only契約と照合し、表示更新・CLIコピー・実処理を区別する。NextActionCardの遷移やコピーだけで作業を実行済みにしない |
| 分類と状態 | PM-02のScrum S0–S4、旧pair、51 FR／9 drive等の部品定義を現行のtyped分類へ移す。unknown・stale・部分投影の意味を5値badgeで失わせない |
| 個別モック | 個別Low-FiはPM-01／03／06、HM-02／03／04、GD-01の7画面。残るPM-02／04／05、HM-01／05／06／07／08は共通骨格参照であり、個別操作・欠落・失敗状態の確認は別に必要 |
| 利用条件 | 日本語、keyboard操作、focus可視、色以外の状態表示、desktop範囲、polling、High-Fiの内製／外部選択を落とさない。旧「AAを意識する」という表現だけで現行accessibility受入が成立したとしない |

要求から業務シナリオ、画面遷移、部品、モック、L11の利用結果まで追跡し、間の欠落を画面一覧の存在で補わない。

旧`docs/design/harness/L2-screen/README.md`の工程規則は現行の凍結判断へ継承しない。

| 旧資料の記述 | 現行の扱い |
|---|---|
| L2は明示carryとしてL3 G3後に確定できる | 要件v1.3 §3に従い、L2要求・プロト合意または理由付き非UI適用性記録をL3凍結前に確認する。placeholderや起票済みだけで代替しない |
| L2の対はL10で、ワイヤーモック自体がテスト設計を兼ねる | 現行pairはL2／L11。モックは要求形成の入力であり、実利用・実データによるL11受入の証拠ではない |
| モック差分はL1 screen／business／functionalへ戻す | 利用要求の差分はL2へ戻し、企画の意味変更を伴う範囲をL1へ逆伝播する。影響するL3とL11を再評価する |

Low-Fi／High-Fiの選択、外部制作を必須にしない方針、外部成果と要求の照合は設計材料として保持する。
15画面・4 sub-doc等の過去の個数や、旧G1-traceのPASSを現行scope・承認・受入の固定値にしない。

- HELIX固有の画面要求は、柱要求§2.8のHBR-P9／HBR-P4／HBR-P7／HNFR-P3／HNFR-AC／HNFR-P8に対応づけ、利用者・操作・期待結果をプロトで確認する。
- `PLAN-DISCOVERY-10-helix-asset-visualization` が S4 confirmed になるまで、L2 から新しい UI 実装 scope を確定しない。
- `src/web/**`の実装や単体テストは、L11での実操作・accessibility受入を証明しない。
- L2はruntime stateのcutoverを承認しない。名称移行は`PLAN-M-02`のcutover decisionに従う。
- プロト合意には対象要求ID・要求revision・プロトrevision・合意者・判断記録を対応づける。未合意の要求をL3凍結済みとして渡さない。
- GitHub Issueの起票・closeやDBへの登録は、要求合意の代替にならない。

## 受入条件

| ID | 条件 |
|---|---|
| L2-AC-01 | 柱要求§2.8からプロト・L3要件・L11受入まで対応を辿れ、未合意・未検証の項目が見える |
| L2-AC-02 | モック、実装、総合テスト、L11受入の証跡を区別し、部分的なgreenから要求全体の充足を主張しない |
| L2-AC-03 | S4判断と対象要求・プロトの合意記録が揃うまで、visualizationを合意済みUI scopeとしてL3凍結へ渡さない |
