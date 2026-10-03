# DT-VT-001 検証・テストの共通証拠欄と非適用の記録

## 契約（seed候補）

| 項目 | 内容 |
|---|---|
| template ID／版 | `DT-VT-001`／`0.1.0-seed-candidate` |
| 状態 | seed候補。採否なし（DST-HARNESS-005は未採択の要求候補） |
| 想定する持ち主 | HELIX-BRAIN（汎用の欄の構造）。製品への適用と検証義務の導出はHELIX-HARNESS-CORE（HARNESS-L2-005、HARNESS-L2-022）。実行・保存・運転はHELIX-OS |
| 適用条件 | DT-VT-002の技法カード、DT-VT-101〜106の検証方法を使って証拠を残すすべての場合。本templateだけを単独で使う場面はない |
| 適用判定の記録 | 下の「非適用の記録」の形で、required／conditional／informational／N/Aと、理由・判断者・対象revision・要求への影響・再評価条件を残す |
| 必須入力 | 対象要求のIDとrevision、成果物の識別（pathまたはIDとdigest）、V字の対、oracle ID。欠けたら証拠を作らず、欠けた入力を未解決として戻す（DST-HARNESS-004） |
| 関係 | DT-VT-002（各カードは本templateの欄に固有の欄だけを足す）、DT-VT-003（選び方の案）、DT-VT-101〜106（対ごとの検証方法）、既存seed `DT-SDOP-002`（非機能の値ごとの測定方法）、`DT-SDOP-004` §7（表の行・マスを検証へ結ぶ） |
| 対（V-pair） | 全6組。組ごとの差はDT-VT-101〜106 |
| 区分 | unit・connection・compositeを問わない。区分ごとの差はDT-VT-101〜106 |
| 出典 | HARNESS-L2-005（対象revision、oracle、expected failure、証拠、有効期限、差戻し先、省いた検査の回収）、HARNESS-L2-003（L2.5の非適用記録の6項目）、HARNESS-L2-034（再測定trigger、別環境・別revisionで相殺しない）、HARNESS-L2-036（ローカルとCIの同一契約）、HARNESS-L2-056（設計側と検証側のoracle identityの一致）。旧 `docs/design/helix/L5-detail/design-template-json-authority.md` 74–77（verification／measurement欄）、旧 `docs/skills/verification.md` 87–91（artifactの欠落は中立でなく違反） |
| 限界 | 欄の名前と形は材料であり、正式なschemaではない（schemaはL3以降で選ぶ）。欄を全部埋めたことは、検証が正しいことを示さない |
| 置き換え | 正式な証拠schemaが入ったら、本templateは`superseded`とし、各欄の行き先を`check-replacement`で対応づける。旧版で作った証拠は、旧版のまま読めるようにする |

### 不成立例（negative oracle）

- 結果が分からない（unknown）のに、pass、N/A、0件のいずれかにする。
- N/Aに理由だけを書き、判断者・対象revision・再評価条件を書かない。
- 別のrevision・別の環境・別のscopeで取った結果を、今回の対象の証拠にする。
- 期待する失敗（Red）を観測していない検証を、振る舞いを確かめた証拠にする。
- 省いた検査を記録せず、回収先のticketも書かない。
- ローカルとCIで設定が違うのに、同じ結果として扱う。

### 正例と境界の負例

- 正例：対象要求`X`のrevision `r1`について、oracle `O-1`をDT-VT-105（L5↔L8）で実行し、Redを観測してからGreenを得た。設定のdigestがローカルとCIで一致し、有効期限（`r1`の変更まで）と差戻し先（L5）が書かれている。
- 境界の負例：同じ記録で、oracleの結果が取得できなかった（timeout）。`actual_result: unknown`とし、passにしない。対象要求の成立を主張しない。

### 完了条件

共通欄の必須項目が埋まっている、または理由付きのN/Aである。unknownがpass・N/A・0件へ変わっていない。省いた検査には回収先がある。**完了条件を満たしても、検証の合格・工程の完了・受入を意味しない。**

## 本体

### 1. 共通の証拠欄

各カード・各検証方法は、次の欄を共通に持ち、固有の欄だけを足す。形は材料であり、schemaの確定ではない。

```yaml
evidence_common:
  target_requirement_ids_and_revisions: [...]   # HARNESS-L2-005
  artifact_ref: {path_or_id, content_digest}     # 成果物の識別
  vpair: P1..P6                                  # 対。P1=L1↔L12 … P6=L6↔L7
  oracle_id: ...                                 # 設計側と検証側で同じであること（HARNESS-L2-056）
  oracle_kind: specified|derived|implicit|human|model-graded
  inputs_ref: {fixture_ids, data_digest, env_id}
  expected_failure: {description, observed_red: true|false, red_evidence_ref}
  actual_result: pass|fail|warning|unknown       # unknownをpassやN/Aにしない
  applicability: required|conditional|informational|N/A
  na_record: {...}                               # N/Aのとき必須。下の2節
  tool: {name, version, config_digest}           # ローカルとCIの同一契約の照合（HARNESS-L2-036）
  run: {executor: local|ci|human, started_at, head_sha, scope}
  valid_until_or_invalidation_trigger: ...       # 有効期限・再測定trigger（HARNESS-L2-034）
  backflow_target: L1..L5|same-stage-refactor    # 差戻し先（HARNESS-L2-022）
  omitted_checks: [{check_id, reason, recovery_ticket}]  # 省いた検査と回収先（HARNESS-L2-005）
```

### 2. 非適用の記録

HARNESS-L2-003がL2.5の非適用に求める6項目（非適用、理由、判定者、HEAD、要求への影響、再評価条件）を、他の技法・検証方法にも同じ形で使う。

```yaml
- card: DT-VT-002/C22
  applicability: N/A
  reason: "非画面と判定（判定記録 ref: ...）"
  decided_by: <role>
  head_sha: <sha>
  impact_on_requirements: none
  reevaluate_when: "画面を持つscopeが追加されたとき"
```

空欄を黙ってskipにしない。「要求がない」（例：性能要求がない）と「分からない」は別に書く。

### 3. oracleが外れる5つの型

各カードの「負のoracle」欄は、次の型で書く。

| 型 | 意味 | 例 |
|---|---|---|
| FN（見逃し） | oracleが弱く、欠陥があってもpassする | assertionなし、snapshotの丸呑み |
| FP（誤検出） | 正しいものをfailにする。FPが多いと無視・一括更新が常態化してFNになる | flaky、過剰に具体的なtest |
| 代理化（proxy） | 測りやすい量を目的と取り違える | coverage%、CI green、pass@1だけ |
| 同源化（common-mode） | oracleと実装が同じ誤解から作られる | AIが実装とtestを同時に作る、実装から期待値を写す |
| scope外推（extrapolation） | 別revision・別環境・別scopeの結果を流用する | HARNESS-L2-034「別環境・別revisionで相殺しない」 |

### 4. 旧HELIXとの対応

| 旧source | 保持する点 | 変更する点 | 理由 |
|---|---|---|---|
| 旧 `docs/design/helix/L5-detail/design-template-json-authority.md` 74–77 | templateがverification（対のtemplate ID、必要なoracle class、negative oracle、stale条件）とmeasurement（metric ID、unit、threshold、またはauthority付きN/A）を持つこと | JSON Schemaの欄名・`helix-design-*.v1`のschema IDは持ち込まず、Markdownの表とYAMLの形の材料にとどめる | 新世代のschemaはL3以降で選ぶ（`docs/helix-brain/candidates/design-template-system-requirements.md`末尾） |
| 旧 `docs/skills/verification.md` 87–91 | 必要なartifactの欠落を中立でなく違反として扱う | 旧`helix vmodel lint`等の検査順と`.helix/audit/`の置き場は持ち込まない | 旧CLI・旧runtimeを起動しない（AGENTS.md） |
| 旧 `docs/design/helix/L6-function-design/ci-verification-plan.md` 24–32 | local／boundary／global invariant／deferred obligationを別の欄に分け、省いた義務を回収する考え方 | 旧の「main／nightlyで回収」「full fallback」は採らず、`omitted_checks`の回収先ticketにする | 現行HARNESS-L2-005が「省いた検査を記録し、合流先のticketで回収する」に置き換えている |
