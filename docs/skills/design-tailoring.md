---
schema_version: skill.v1
name: design-tailoring
skill_type: design-contract
applies_to:
  layers:
    - L1
    - L2
    - L3
    - L4
    - L5
  drive_models:
    - Forward
    - Add-feature
    - Discovery
    - Scrum
---

# 設計テーラリング（design-tailoring）— 何を書き、どの粒度で、どこに記録するか

「どの design doc を書くべきか」「どこまで詳細に書くか」「この決定はどこに記録するか」を
判断するときに読む。個別 doc の書き方は `design-doc` / `documentation-and-adrs`、
PLAN 分解は `planning-and-task-breakdown` が正本。本 pack は**取捨選択と粒度の判断基準**を扱う。

## §1 判断の順序

1. **案件の性質を確定する** — 規模（PoC / 通常 / 高信頼）、対象領域（CLI / web / DB / agent）、
   制約（監査・PII・外部連携・不可逆操作の有無）。不明なら推測で重装備にせず、
   judgment-core §1-5 に従い妥当な仮定を明示して進むか、L1/L2 確定事項なら PO へ確認する。
2. **drive model を適用する** — Discovery/PoC（S0-S4）は検証設計中心で詳細設計を書かない。
   Forward は V-model の層責務（L5=unit 境界、L6=test design pair）に従う。
3. **個別調整する** — 案件固有の事情で書く / 書かないを上書きする。
4. **判断を記録する** — 取捨選択の理由を PLAN 本文に残す。**「なぜ書かないか」も設計判断である。**

## §2 書く（todo）か対象外（skip）かの基準

**skip してよい条件**: その関心事が案件に**構造的に存在しない**場合のみ。
例: UI の無い CLI PLAN → L2 screen sub-doc は skip。外部 API を呼ばない → external-IF 設計は skip。

**skip してはいけない**: 関心事は存在するが「書くのが面倒」「まだ決まっていない」場合。
未決事項は design doc の TBD 節か PLAN の残課題に積み、doc 自体は書く。
**gate を緑にする目的の skip は禁止**（adversarial-review の攻撃対象になる）。

**迷ったら自問する**:
- 障害・監査・引き継ぎのとき、この情報が無いと誰かが困るか？ → 困るなら書く。
- 情報の正本が他 doc に既にあるか？ → あるなら書かない（重複定義は第二の正本を作る。
  参照で済ませる）。

## §3 記載粒度の基準

- **PoC（Discovery / Scrum S2）**: 「何を検証し、何をもって成功とするか」が言えれば十分。
  要件は仮説として書く。詳細設計・運用設計は書かない（`poc` pack 参照）。
- **通常（Forward）**: 要件は FR/BR で ID 化しテストまで trace 必須。詳細設計は module 一覧 +
  主要ロジック。decision table は複雑な分岐がある場合のみ。
- **高信頼（auth / payments / PII / 不可逆に触れる）**: 上記に加え、threat model・incident
  runbook・rollback 設計を省略しない（escalation 境界は judgment-core §1-3）。
- 共通ルール: **1 つの要件 ID は 1 つの検証可能な文で書く**。「かつ」「または」で複数の振る舞いを
  含む要件は分割する（テストと 1 対 1 に trace できる単位が正しい粒度。
  acceptance-criteria-thinking §2 と同一原則）。

## §4 決定の記録先の使い分け

「どこに書くか」を散発的に判断せず、この表を引く:

| 決めたこと | 記録先 |
|---|---|
| アーキテクチャ・技術選定・トレードオフのある決定 | `docs/adr/`（`documentation-and-adrs` の型で）+ PLAN の references |
| 要求・要件そのもの | `docs/design/` の L1/L3 doc（FR/BR として ID 化） |
| 用語・データ項目の定義 | L0 glossary（他 doc はここを参照する。再定義しない） |
| 実装単位の設計 | L5/L6 design doc（PLAN の `parent_design` / `generates` で trace） |
| 未決事項・リスク | PLAN 残課題節 + 必要なら `debt-register` の規約で台帳化 |
| 書く / 書かないの方針とその理由 | PLAN 本文（§2 の判断ごと） |
| 作業の完了根拠 | PLAN `review_evidence`（green_commands + digest。prose 宣言は不可） |

## §5 設計判断の自由度を意識する

判断には自由度の高低がある（Anthropic skill authoring best practices の
degrees-of-freedom を設計判断へ適用）:

- **低自由度（規約準拠）**: naming・file 配置・frontmatter schema・commit 規約は裁量の余地なし。
  迷ったら既存規約に従い、規約が無ければ最頻パターンに合わせる。ここで創造性を発揮しない。
- **高自由度（アーキテクチャ選択）**: 境界の切り方・抽象化の粒度は対案とトレードオフ比較が必須
  （judgment-core §1-4。対案なしの単一案は「検討していない」と同義）。
- どちらか判別できないときは低自由度側（既存踏襲）に倒し、踏襲で問題が出る evidence が
  揃ってから高自由度の判断として ADR に起こす。

## §6 AI 実装案件での追加判断

- agent / LLM 呼び出しを含む設計は、prompt・tool・権限境界の設計（`agent-design` /
  `llm-agent-routing`）と、AI 出力の検証方法（`verification` / `adversarial-review`）を
  セットで todo にする。「AI に任せる範囲」自体が設計判断なので ADR に残す
  （例: 「テスト生成は AI、受入判定は独立 reviewer」）。
- 委譲する場合は判断の記録先も委譲ブリーフに含める（judgment-core §5 の 4 点セット。
  worker に記録先を推測させない）。

## §7 判断に迷ったときの最終規則

選択肢が複数残り、コストとリスクのトレードオフが拮抗する場合:

- L1/L2 確定・gate signoff・不可逆に触れるなら、**選択肢・利害得失・推奨を提示して PO に
  決めてもらう**。決まったらその場で ADR 化する。
- それ以外は evidence を集めて**決めて記録して進む**（judgment-core §1-5 bias to action）。
- どちらの場合も、traceability を壊す選択肢（ID を廃止して文章で書く等）は提示しない。
