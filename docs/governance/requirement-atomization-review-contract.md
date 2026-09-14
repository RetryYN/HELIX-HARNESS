# 旧要求atom化 review contract

status: proposed_processing_contract
input_lines: [semantic line台帳](legacy-requirement-semantic-line-carry-forward.jsonl)
input_queue: [atom化review queue](legacy-requirement-atomization-review-queue.jsonl)
authority_model: [上流authority状態モデル](authority-state-model.md)

## 目的

AIが旧要求文書を読む際に、要約、現行実装、GitHub状態、旧語彙との衝突を理由としてsource意味を落とさないための処理契約である。721 review unitを順に読み、要求atom候補と非要求分類候補を作る。ただし、この処理だけでは要求採否、意味変更、対象別authority、successor、retireを成立させない。

## 入力単位

一回の処理入力は`review_unit_id`一件とし、次を同時に読む。

- queue行のsource path、source SHA-256、heading path、行範囲、`content_line_ids`。
- semantic line台帳にある各IDの原文とline digest。
- 同じheading直前・直後のreview unitと、同じsource lineへ接続済みの既存identity。
- 現行Concept、対象別L1、対象別L2／L11は配置・衝突候補を考えるために参照する。旧sourceの採否を上書きする正本として使わない。

source SHA、line digest、queue coverageのいずれかが一致しなければ処理せず、`source_drift`として停止する。

## proposal出力

AIはreview unitごとに、次の構造を持つproposalを作る。

```yaml
review_unit_id: REQATOM-QUEUE-NNNN
input_source_revision: exact-sha256
input_content_line_ids: []
line_coverage:
  consumed_once: []
  shared_context: []
  unresolved: []
candidate_atoms:
  - candidate_atom_id: stable-proposal-id
    source_line_ids: []
    exact_source_text: ""
    normalized_statement: ""
    candidate_kind: requirement | constraint | acceptance | premise | rationale | example | navigation | metadata | unresolved
    candidate_target: HELIX-HARNESS | HELIX-OS | HELIX-Web | HELIX-Web-OS | cross-product | unresolved
    candidate_granularity: unit | connection | composite | unresolved
    existing_identity_relations:
      - identity: source-qualified-id
        relation: exact | partial | adds-condition | conflicts | example-of | rationale-for | unrelated | unresolved
    retained_meaning: []
    possible_conflicts: []
    questions: []
proposal_status: needs_independent_review
meaning_change_applied: false
successor_requirement_ids: []
decision_record: null
```

`normalized_statement`は検索・比較用であり、原文を置換しない。`candidate_kind`が`navigation`や`metadata`でも、source lineを台帳から削除せずproposalに残す。

## line coverage

- `input_content_line_ids`の各IDを`consumed_once`、`shared_context`、`unresolved`のいずれかへ一回だけ置く。
- 一つのsource lineから複数atom候補を作る場合、同じline IDを各atomへ参照できるが、coverage集計では一回と数える。
- 複数行を一atomへまとめる場合、間の行を省略しない。
- 前後unitの行を参照するときは`shared_context`に置き、隣接unitの処理済み状態を生成しない。
- `unresolved`が一件でもあればreview unitを分類完了にしない。

## 責務候補の見方

- HARNESS候補: 外部提供するV-model、要求エンジン、Design Template、工程・設計・検証contract、要求する結果。
- HELIX-OS候補: 管理、統制、推進、検収、Worker、登録、state、log、learning、CI実行、GitHub projection、HARNESS自身の改善。
- HELIX-Web候補: 利用者へ提供するWeb製品の価値・機能・体験。
- HELIX-Web-OS候補: Web展開後のtenant、Connector job、credential、service state、配備、監視、復旧、許可log export。
- 複数責務を含む場合は一ownerへ丸めず、unit候補とconnection候補へ分ける。分割後も原文全体の未被覆意味を残す。

## 禁止する自動遷移

proposal生成、独立review、PR作成、Issue投影、CI、実装、類似度のいずれからも、次を自動生成しない。

- source authorityの採用・不採用・supersede。
- candidate targetから対象別authorityへの昇格。
- `preserved_pending_atomization`または`preserved_pending_rehome`の解消。
- 意味変更、縮退、統合、重複確定、retire。
- successor割当、L11被覆済み、実装済み、受入済み。

これらは対象revision、変更前後、保持atom、未被覆atom、L11影響を提示した後、人間decisionが必要なものだけ別の要求PRで扱う。

## proposalの機械確認

1. review unitのsource SHAと全line digestが入力台帳に一致する。
2. 入力line IDがcoverage三分類へ重複なく全件現れる。
3. 各candidate atomに原文、source line、kind、target、granularity、既存identity relationがある。
4. 原文にある否定、例外、停止、証拠、数量、actor、authority、failure条件が`retained_meaning`または`unresolved`に現れる。
5. `meaning_change_applied: false`、successor空、decision nullである。
6. A1の全proposalが揃うまでA2を開始しない。A2の元statusを昇格させない。

## GitHubへの投影

review unitやproposalをそのままIssueへ自動発行しない。独立review後、要求atom候補が成立した場合だけ、一つの原要求identityまたは一つの新規source-qualified atomを単位として要求PR案を作る。GitHubはlocal proposal revisionとdigestを参照する共有面であり、Issue本文を要求正本にしない。
