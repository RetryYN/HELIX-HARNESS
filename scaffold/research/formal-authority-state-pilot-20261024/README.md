# 上流authority状態モデルの形式化パイロット（Lean 4）

status: scaffold（仮組みの研究。正式な設計・検証・gateではない）
authority_effect: none
binding: [SCF-B-0163](../../bindings/SCF-B-0163.json)
対象: [上流authority状態モデル](../../../docs/governance/authority-state-model.md)（file sha256 `1c0336ec838d3603231ffe6689175e9422c9cb1d19476159f88ab27f6a6233eb`）

## 何をしたか

上流authority状態モデルの規則を、有限の抽象状態と遷移関数として[`AuthorityState.lean`](AuthorityState.lean)へ写した。
主な性質を、到達可能な全状態について Lean の定理として証明した。

あわせて、記録された失敗の型を一つずつ埋め込んだ変異モデルを作った。変異モデルでは、同じ性質を破る具体的な状態と操作（反例）があることも証明した。
これは設計TDDのRedに当たり、検査が既知の失敗を実際に検出できることを示す。

POの問い（2026-10-24、Anthropic の Lean による形式化を設計へ適用できるか）への試行である。
このパイロットは製品の正しさを示さず、文書が規則を守っていることも示さない。
示すのは「文書規則を写したモデルの内部で、規則同士が整合し、既知の失敗の型を規則が排除している」ことだけである。

## 旧HELIXとの対応（新規案）

- 旧HELIXには、全状態を対象にする形式検証（model checking・定理証明）の資産がない。
  - 検索範囲：`archive/legacy-generation-2026-09-14/` 全体。「形式検証」「model check」「モデル検査」「TLA+」「Alloy」「状態機械」「state machine」「invariant」「不変条件」を検索した。
  - 旧の「形式検証」は、schema・digest・provenance を再検証するという意味で使われていた。
- したがって、検査手段は**新規案**である。
- 最も近い旧資産は `LEGACY-ASSET-019A5DC002CDD69F9A65`（`docs/design/harness/L6-function-design/closure-authority-convergence.md`）。台帳上の disposition は unresolved。
  - L94–108：集合の保存則 `I = E⊎N⊎H⊎X`。
  - L109–113：green command や prose から gate を推測しない／human approval を自動生成しない。
  - 保持する点：分割を保存すること、別の表示から推定しないこと、前段の完了と後段の認可を別にすること。
  - 変える点：旧は実行時 assertion と unit test だった。本パイロットはモデル上の証明である。
  - 本パイロットはこの資産の意味を参照するだけで、copy せず、台帳の disposition も変えない。
- 現行の先行記録：[Design as Code 比較](../../../docs/governance/design-as-code-reference-comparison.md)「3. 具体例」の「モデル検査」項（#3168）。モデル検査を候補に挙げ、「モデルも実行結果も今回は作成していない」と留保している。本パイロットはその最初の試作である。

## 文書規則・定理・失敗事例の対応

| 文書の規則（authority-state-model.md） | Lean | 変異（Red） | 防ぐ失敗の事例 |
|---|---|---|---|
| target：`approved_revision` だけが対象revisionの現行意味authority。人間decisionまたはL3／L10の委任で遷移 | `approvalBound`（T1）、`step_inv`、`reachable_inv` | `stepMergeApproves`（PR merge を承認とする） | PR #1797（[上流運用モデル](../../../docs/governance/github-upstream-operating-model.md)：merge は承認revision・要求採否を生成しない） |
| fail-close：revision不一致・digest不一致では元状態を保持して停止 | `step`（前提不成立は状態不変）、T1 | `stepStaleDecision`（decisionの対象revisionを照合しない） | 前身harness UTW-005（stale な review・trace evidence を現在の HEAD へ再束縛しない） |
| carry_forward：`covered` は未被覆0件を確認した場合だけ | `coveredBound`（C1） | `stepPartialCovers`（一部の successor だけで covered）、`stepCloseCovers`（Issue close で covered） | PR #2564（兄弟対象の取りこぼし）、[開発repoチケット方針](../../../docs/governance/decisions/dev-repo-ticket-policy-po-decision-2026-10-09.md)（Issue close から完了を生成しない） |
| 意味変更・retire は人間decisionが必要 | `changeBound`（C2） | — | （文書規則の写し。具体的な事例は未特定） |
| source：変更しない | `source_frame` | — | （文書規則の写し） |
| work_projection・GitHub表示は他の四軸を変えない | `projection_frame` | `stepMergeApproves`、`stepCloseCovers` | PR #1797、チケット方針、[CI解禁判断](../../../docs/governance/decisions/stage1-implementation-and-ci-unlock-po-decision-2026-10-09.md) L73（CI green から受入を生成しない） |
| management：常に `authority_effect: none` | `management_frame` | — | [能力強化判断](../../../docs/governance/decisions/capability-reinforcement-po-decisions-2026-09-27.md) L117（仮登録・件数を移管完了へ読み替えない） |
| 一つの `status` から別軸の状態を推定しない | `authority_noninterference`（authority の次状態は authority と操作だけで決まる） | `stepGreenGuard`（承認の前提に CI green を読む） | CI解禁判断 L73、旧 closure-authority-convergence L109 |

「文書規則の写し」と書いた行は、失敗事例で裏付けた新しい予防規則ではない。文書がすでに定めている規則を、モデルへ写しただけである。

## 抽象化と解釈（落とした意味）

- 一つの要求identityだけを扱う。複数identityの合成、successor を複数に分けた場合の atom ごとの和集合、同名IDの統合禁止は扱わない。被覆は件数 `uncovered` に抽象化した。
- 状態値は文書の「現在使う値の例」を使った。値域を確定しない。
- `awaiting_parent_approval` から承認へ進む遷移は、文書の遷移図にない。モデルでは他の未承認状態と同じ扱いで decision を受け付ける。過大近似であり、T1 は成り立つ。
- 対象文書を更新したら、承認は引き継がず `draft` へ戻す（`edit`）。根拠は「承認は対象revisionに束縛される」という文書の規則で、それを遷移として表した解釈である。
- L3／L10 の委任は、対象の層だけで区別した。委任の成立条件（[上流運用モデル「L3／L10承認の委任」](../../../docs/governance/github-upstream-operating-model.md#l3l10承認の委任)）の中身は扱わない。
- work_projection には許可遷移の表がない。そのため任意の遷移を許す過大近似にした。新しい遷移表は作らない。
- management の `supersedes_registration_id` 付きの revision append、append-only であること、終端からの復帰の可否は扱わない（文書に明文がないものを固定しない）。
- liveness（正当な仕事がいずれ進むこと）は扱わない。safety（悪い状態に到達しないこと）だけを扱う。

## 再現方法

```
elan toolchain install leanprover/lean4:v4.34.1
cd scaffold/research/formal-authority-state-pilot-20261024
lean AuthorityState.lean      # 出力なし・終了0で全定理が検査済み
```

- `sorry` は使っていない。
- 確認時、全定理が依存する公理は Lean 標準の `propext` と `Quot.sound` だけだった（`#print axioms` で確認）。`native_decide` は使っていない。
- 証拠種別は scaffold である。新世代CIは未構築で、検査はローカルの手動実行に限る。

## 次に試せること（未実施・候補）

- 上流運用モデルの「作成側とレビュー対応側の責務」（Ready・merge・read-after）を同じ方式でモデル化する。#3649 の誤った merge 報告のような、確認前に完了を報告する型を検出の対象にする。
- HELIX-BRAIN の L4 契約（例：`claim_routes` の rule87 → rule93 → unresolved → none）を写し、L8 の有限期待がモデルから導けるかを照合する。
- どれも採択・gate・CI化を前提にしない。
