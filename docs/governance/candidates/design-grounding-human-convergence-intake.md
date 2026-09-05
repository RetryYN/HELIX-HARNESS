# Design Grounding原稿の取込台帳

Issue #1558。候補のみ、main未統合・新policy未承認・runtime未実装。

## 全項目trace

原稿§0/1→requestsとrequirementsの目的/既存実装調査。
§2 DG-R-01..04→requirements同ID群、AC1/2/8。
§3 HR-R-01..04→requirements同ID群、AC3/4/6/7。
§4 DC-R-01..04→requirements同ID群、AC5/9。
§5→客観/人間意味境界。§6→#1556形成と限定探索。§7→Issue階層/trace/局所保留。
§8の10条件→acceptanceの1..10。§9→authority-firstへ順序是正、実装→dogfoodは承認後。

## 最適化

原文の実装済み主張を全体完成の証拠とは扱わず、4667d601の対象sourceを静的確認した。
前提の分類・人間反応・軸状態は別軸。人間の原文はproject-owned evidenceへ、memoryや個人profileへ入れない。
原文の完全一致版はremote commit e4f3a7fefの本台帳へ保全済み。以下は末尾空白だけ正規化した表示。
原稿3件の削除は通常apply_patchで再試行したがforeign-edit guardが拒否した。
root原稿は残存し削除未完了。追加承認待ちではなく、明示削除依頼とguardの接合問題として追跡する。

## 原文（historical input-only、採用authorityではない）

````markdown
# HELIX Design Harness 大幅強化 指示書 v0.1

## 0. 目的

現行 HELIX Design Harness を作り直してはならない。
既に存在する **Screen Applicability / Prototype・Walkthrough / Design Registry / UI Domain Pattern / Evidence Binding** を正本として再利用し、現在弱い次の3領域だけを強化する。

1. **Design Grounding** — 良い設計判断をするための前提・外部知識を揃える
2. **Human Reaction Semantics** — 人間の「違う・使いにくい・ダサい・分かりにくい」を意味分類する
3. **Design Convergence** — 人間との反復で何が受容・拒否・未解決かを保持し、収束を判定する

最終目的は「AIに良いデザインを一発生成させる」ことではない。
**外界の良い実例を観測し、人間の趣向・意味判断を必要な箇所だけ取り込み、客観品質と主観品質を分離したままデザインを効率良く収束させること**である。

---

## 1. 現行実装を前提とすること

着手前に main の implementation census を行い、Issue本文や旧設計書を実装真実として扱わないこと。

少なくとも現行で確認済みの以下は「新規実装候補」ではなく接続先として扱う。

- Screen Applicability 系の判定・永続化
- Prototype / Walkthrough / human decision / finding / back-propagation を扱う既存契約
- Design Registry の revision・authority・binding・supersession
- UI domain / pattern profile
- Visual / Interaction / Accessibility / Performance 等の既存 evidence role
- 既存 Research skill / project explorer / tech docs / OSS research 系能力

**禁止:** 同等責務の別Engine、別Registry、別Prototype Gate、別Research subsystemを並立させること。

---

## 2. Design Grounding 要求

### DG-R-01 Premise Assessment
PrototypeまたはDesign candidate生成前に、その判断に必要な前提を構造化する。

最低限、以下を分類できること。

- `KNOWN`
- `SUPPORTED`
- `CONTESTED`
- `UNKNOWN`
- `STALE`
- `NOT_APPLICABLE`

対象には、既存Requirement、既存Design、対象画面、技術制約、ブランド/表現制約、ユーザー文脈、既存実装、外部先行事例を含める。

### DG-R-02 Research Obligation
不足前提から調査義務を派生する。調査種別は固定の件数条件ではなく、Design Problemに応じて選択する。

例:
- 公式Guideline / Standard
- 優良な実サービス
- OSS / Design System
- 競合・類似プロダクト
- 自repo既存UI
- Accessibility
- Responsive / Performance
- UX prior art

### DG-R-03 Research Adequacy
「Web検索した」「N件集めた」を完了条件にしてはならない。

調査結果が最低限、
`論点 → Evidence → 設計への含意 → 採用/非採用理由 → 未解決点`
へ接続されて初めてDesign Ready候補とする。

不足時は `RESEARCH_REQUIRED` / `POC_REQUIRED` / `HUMAN_CONTEXT_REQUIRED` 等へ戻し、モデルの事前知識だけで穴埋めしてはならない。

### DG-R-04 General Premise Alignmentとの共通化
今後HELIX全体に Premise Adequacy が入る場合、Design専用ロジックをforkしない。
Design Groundingは共通Premise契約のprojection/adaptorとして接続可能な形にする。

---

## 3. Human Design Reaction 要求

### HR-R-01 Raw Reaction保存
人間の原文を改変せず保存し、AI解釈と分離する。

### HR-R-02 Reaction Classification
Walkthrough等の反応を少なくとも以下へ分類可能にする。

- `OBJECTIVE_DEFECT`
- `USABILITY_PROBLEM`
- `INTENT_MISMATCH`
- `VISUAL_PREFERENCE`
- `CONTENT_SEMANTIC_MISMATCH`
- `INSUFFICIENT_RESEARCH`
- `PROTOTYPE_COMMUNICATION_FAILURE`
- `UNRESOLVED`

複数分類を許可する。

### HR-R-03 Authority分離
AI分類・原因仮説はproposalであり、人間の原文や既存Requirementを書き換えるauthorityを持たない。

`OBJECTIVE_DEFECT`等は客観Evidenceで検証し、`VISUAL_PREFERENCE`やブランド感・言葉のニュアンス等は人間authorityを保持する。

### HR-R-04 Recovery Routing
分類結果から再作業の種類を区別する。

例:
- research不足 → Design Researchへ戻す
- prototypeの見せ方不足 → Prototype表現だけ修正
- intent mismatch → Requirement/Design Re-entry
- objective defect → Design/Implementation修正
- visual preference → 次の比較Prototypeへ

「人間がRejectしたら全部デザイン再生成」は禁止する。

---

## 4. Design Convergence 要求

### DC-R-01 Design Axis State
Prototype revisionごとに、比較対象となる設計軸を `ACCEPTED / REJECTED / UNRESOLVED / NOT_EVALUATED` で保持できること。

設計軸は固定enumだけにせず、Typography、Density、Layout、Navigation、Motion、Card structure等を安定ID付きで扱えること。

### DC-R-02 Accepted Regression
一度受容された設計軸を、別要求・新Evidenceなしに後続revisionで破壊した場合はDesign Regressionとして検出する。

### DC-R-03 Finding Lineage
Findingについて
`発生 → 仮説 → 修正 → 次revision → 解消/再発/別原因`
を追跡できること。

同一Findingの再発と、新しいFindingを区別する。

### DC-R-04 Convergence判定
単一のHuman Approveだけを収束証拠にしてはならない。

少なくとも、
- blocking findingが残っていない
- accepted axisのregressionがない
- unresolved human-meaning axisが許容範囲内
- required objective evidenceがgreen
- current revision/provenanceが一致

を満たしてDesign agreement候補とする。

---

## 5. Objective UX と Human Meaning の境界

機械判定可能なものは極力HELIXへ委任する。

例:
- accessibility
- interaction/state correctness
- navigation dead-end
- responsive
- performance
- requirement consistency
- evidence/revision consistency

一方、以下をモデル単独で最終決定してはならない。

- 美的好み
- ブランドらしさ
- 世界観
- 「高級」「親しみやすい」等の主観意味
- 表現・文章ニュアンス
- 人間が明示的に保持したいVisual/UX preference

ただし既に人間が承認済みのDesign constraint/profile内での具体化は、毎回再承認を要求しない。

---

## 6. Requirement Formationとの接続

Design Harnessは上位の要求形成と分離しない。

```text
企画
→ Premise Alignment / Research
→ Requirement Discovery
→ Requirement Research
↔ PoC / Screen Prototype
→ Requirement Selection / Validation
→ L3
→ Design Grounding
→ Prototype / Walkthrough
→ Human Reaction
→ Design Convergence
→ Design Registry / Implementation
```

要件確定前でも、**調査・比較・PoC・Prototypeの限定作業は許可**する。
ただし候補状態の意味を本実装authorityへ昇格させてはならない。

---

## 7. GitHub / Workflow 要求

- Issueの `root/capability/task/finding` 階層を壊さない。
- Design形成状態を必要なら別semantic stateとして持つ。
- 各Design作業は source Requirement / Design problem / Evidence / Prototype revision にtrace可能であること。
- Research不足・Human decision待ちが一部にあっても、影響しない承認済み作業まで全停止させない。
- exact revision / provenance / evidence bindingを維持する。
- Issueが古い場合はmain実装を優先し、重複機構を起票しない。

---

## 8. 受入条件

1. 外部事例が豊富な未知Design taskで、調査なしPrototype生成をGateできる。
2. Research Evidenceから「何をDesignへ取り込んだか」を追跡できる。
3. 「ダサい」「分かりにくい」「何を見ればよいか分からない」を同一Findingとして扱わず意味分類できる。
4. Prototype communication failure時にDesign自体を不要に再生成しない。
5. Human acceptedな設計軸が次revisionで壊れたことを検出できる。
6. objective UX green / human preference reject を同時に表現できる。
7. Human reaction原文とAI interpretationが分離される。
8. Design Registry・Screen Applicability等の既存責務を複製しない。
9. 全結果がcurrent revision / authority / evidenceへ束縛される。
10. Full HELIXで動作し、将来HELIX Lite consumerへ必要最小契約だけ配布可能な責務境界にする。

---

## 9. 実装順序

1. **Current Design Harness implementation census**
2. 既存責務とのowner/contract map作成
3. Design Premise / Research Adequacy
4. Human Reaction schema + routing
5. Design Axis / Finding lineage
6. Convergence evaluator
7. 既存Screen Applicability / Design Registryへの接続
8. deterministic test / mutation / stale revision test
9. 実プロジェクトでdogfood
10. Evidenceを確認してからcanonical requirement/version-up

大規模再設計や一括実装を禁止する。既存機構へ小さく接続し、各sliceで既存責務との重複・authority侵害・revision driftを独立検証すること。

````
