---
title: "HELIX L3 用語集 SSoT projection"
layer: L3
kind: add-design
status: placeholder
created: 2026-07-05
updated: 2026-07-05
owner: TL (Codex)
plan: PLAN-L3-07-requirements-binding-enforcement
related_l0: docs/governance/helix-harness-concept_v3.1.md
related_l3: docs/design/helix/L3-requirements/pillar-functional-requirements.md
related_l5: docs/design/helix/L5-detail/pillar-detail-design.md
pair_artifact: docs/test-design/helix/L3-pillar-acceptance-test-design.md
next_pair_freeze: L12
---

# HELIX L3 用語集 SSoT projection

## §0 位置づけ

本書は `HR-FR-P7-02` の「Glossary SSoT は memory entry、DDD bounded context、docs 用語の同義語/改名を結び、
用語発散を検出する」を L3 で接地する placeholder projection である。

単一 SSoT は `docs/governance/helix-harness-concept_v3.1.md` §10 用語集である。本書は用語を独自定義せず、
下流実装・文書監査・日本語運用で参照しやすい形に投影する。新規用語や意味変更が発生した場合は、まず
L0 §10 へ back-merge し、その後本書の projection を更新する。

## §1 SSoT 境界

| 領域 | 正本 | 本書の役割 | 禁止事項 |
|------|------|------------|----------|
| ユビキタス言語 | `docs/governance/helix-harness-concept_v3.1.md` §10 | L3 / L5 / L6 から使う参照入口を作る | L0 §10 と異なる独自定義を置かない |
| L3 要件 | `pillar-functional-requirements.md` `HR-FR-P7-02` | Glossary SSoT の受入境界を明示する | glossary 完了を runtime 実装完了に読み替えない |
| L5 contract | `HC-P7 knowledge-contract` | memory / glossary / context-map の結合境界を示す | per-agent memory silo を SSoT にしない |
| L6 関数 | `detectGlossaryDrift` / `validateContextMapBoundary` | drift finding の入力・出力を束ねる | supersedes なしの rename を close しない |
| 文書言語 | `design-language` gate | 日本語 prose と技術語許容の境界を説明する | 英語 prose を新規 debt として増やさない |

## §2 対訳 projection

この表は L0 §10 の用語を下流作業者向けに投影したもので、定義の正本ではない。関数名・CLI 名・rule ID は
原語のまま維持し、日本語説明を隣接させる。

| 識別子 / 用語 | 日本語名 | 説明 | 正本 |
|----------------|----------|------|------|
| `HELIX-HARNESS` | HELIX ハーネス | AI エージェントを安全に運用するための現行 product / repository 名 | L0 §10 / repository |
| `helix` | HELIX CLI | 現行 CLI 名。実行 alias の cutover は PLAN-M-02 の承認境界に従う | L3 `HR-FR-P6-04` |
| `.helix` | HELIX state directory | handover、memory、evidence、teams などの local state を置く現行 state dir | L0 §10 |
| `plan` | 進め方手順書 | 工程単位の作業計画。機能仕様そのものではなく進め方と証跡を管理する | L0 §10.1 |
| `gate` | 通過判定点 | 工程間で fail-close 判定を行う境界 | L0 §10.1 |
| `artifact` | 成果物 | PLAN が generates する設計、テスト設計、実装、テストコード | L0 §10.1 |
| `pair` | V-model 対 | 設計とテスト設計の双方向対応 | L0 §10.1 |
| `mode` | 開発経路種別 | Forward / Reverse / Discovery などの作業入口 | L0 §10.1 |
| `drive` | 実装主軸 | be / fe / db / agent など、作業の主担当軸 | L0 §10.1 |
| `agent_slot` | エージェント役割枠 | po / tl / qa / aim などの作業 slot | L0 §10.1 |
| `handover` | 引き継ぎ | session 間で next action と証跡を受け渡す状態 | L0 §10.1 |
| `trace` | 双方向追跡 | 上流 ID と下流 ID の対応関係 | L0 §10.1 |
| `Forward spine` | Forward 主線 | 各 mode が最終的に合流する L0-L14 の背骨 | L0 §10.2 |
| `completion decision packet` | 完了判断 packet | 未了、判断待ち、承認待ちを完了 claim から分離する判断材料 | L6 `HC-P9` |
| `semantic frontier` | 意味的 frontier | confirmed current と判断待ち機能を分け、数量だけの完了主張を防ぐ境界 | L3 §0.2 |
| `action-binding approval` | 実行束縛承認 | 高影響 action を actor / tool / target / params / snapshot に束縛して承認する境界 | L3 `HR-NFR-P8-01` |
| `cutover` | 切替 | 不可逆 rename / state migration を dry-run、rollback、backup、monitoring 付きで行う工程 | PLAN-M-02 |
| `version-up` | 版上げ | 今版外作業を future target へ park し、activation decision 後に進める工程 | L3 `HR-FR-P1-02` |
| `detectGlossaryDrift` | 用語 drift 検出 | glossary term、rename event、context crossing のずれを finding にする L6 関数 | L6 `HC-P7` |
| `validateContextMapBoundary` | context 境界検証 | bounded context と anti-corruption boundary の欠落を検出する L6 関数 | L6 `HC-P7` |

## §3 drift contract（発散検出契約）

Glossary drift は次の入力を持つ。

| 入力 | 必須項目 | drift 条件 |
|------|----------|------------|
| memory entry | term、source path、layer、supersedes | term が L0 §10 に無い、または supersedes なしに改名している |
| docs term | term、doc path、line、layer | L0 §10 と異なる独自定義をしている |
| DDD context | bounded context、published language、anti-corruption boundary | context crossing command が翻訳規則なしに用語を横断する |
| rename event | old token、new token、approval route、evidence | approval-gated cutover を経ずに旧 token を current として使う |

出力は `GlossaryDriftFinding[]` とし、少なくとも `term`、`sourcePath`、`kind`、`requiredRoute`、`severity` を持つ。
`severity=error` は L0 §10 に未 back-merge の新規用語、または承認なし rename を対象にする。
`severity=warning` は表記揺れ、説明不足、projection 未更新を対象にする。

## §4 日本語運用と allowlist

`design-language` gate の `TECHNICAL_WORD_ALLOWLIST` は、英語 prose を許す抜け道ではなく、CLI 名・識別子・
標準的な開発用語を日本語説明へ埋め込むための最小許容である。

今後 allowlist に語を追加する場合は、次のいずれかを満たす。

1. L0 §10 に登録済みで、本書 §2 の projection にも追加する。
2. 外部標準語であり、日本語説明と公式 source が隣接している。
3. machine surface の stable token であり、翻訳すると CLI / JSON / test oracle が壊れる。

この条件を満たさない英語文は prose debt として扱い、日本語へ直す。

## §5 実装降下

| L6 関数 | 入力 | 出力 | oracle |
|---------|------|------|--------|
| `buildBoundedRecallPacket` | memory query、引き継ぎ、用語 filter | `BoundedRecallPacket` | `HU-PILLAR-P7-01` |
| `detectGlossaryDrift` | §3 の入力集合 | `GlossaryDriftFinding[]` | `HU-PILLAR-P7-02` |
| `validateContextMapBoundary` | bounded context、公開言語、command route | `ContextBoundaryDecision` | `HU-PILLAR-P7-03` |

実装時は glossary projection を DB / relation graph / design-language gate と接続し、単なる文書一覧で完了扱いにしない。

## §6 現在の状態

- 本書は `PLAN-L3-07` Step 5 の placeholder artifact であり、confirmed 正本ではない。
- L0 §10 の back-merge 規則、L3 `HR-FR-P7-02`、L5 `HC-P7`、L6 `detectGlossaryDrift` の trace を束ねた。
- runtime 実装、doctor 接続、drift test は Forward descent の後続 Step で扱う。
- `PLAN-L3-07` の terminal 化には review evidence と必要な generated artifacts の追記が必要である。
