---
title: "安全capability broker 要件authority"
layer: L3
kind: add-design
status: confirmed
authority_status: current_requirements_v1.3.12
created: 2026-08-18
updated: 2026-08-19
owner: Security / TL
parent_requirements: docs/governance/helix-harness-requirements_v1.3.md
pair_artifact: docs/test-design/helix/security-capability-broker-acceptance.md
related_issue: 679
---

# 安全capability broker 要件authority

## 0. 正本境界

本書はIssue #679のL3要件とL10受入条件を対として保持するcurrent authority projectionである。
`docs/governance/helix-harness-requirements_v1.3.md` v1.3.12へPO確認済みの候補IDを昇格し、
本書はその詳細設計と後続atomic sliceの境界を示す。requirementsを超えてruntime、doctor、DB、
PR admissionの未実装能力を完了扱いにはしない。

既存の`PLAN-L7-553-machine-delete-secret-egress-guard`、`machine-safety-guard`、
`secret-egress-hook`は、既存の限定されたpre-execution guardの実装・観測資産である。本書は
それらを包括的安全正本として再利用せず、behavior atomを棚卸ししたうえで後続のatomic sliceへ
接続する。current guardのgreenは、未実装のphysical identity、provenance、sink、sandbox、
runtime coverageの失敗を相殺しない。

## 1. 分類軸を混同しない安全authority

安全判定は一つの`risk` enumへ潰さず、次のtyped tupleを保持する。各軸は独立したschema fieldで
あり、欠落・未知・複数候補は推測せず`unresolved`としてfail-closeする。

```text
operation_capability
  + target_identity
  + execution_provenance
  + data_classification
  + sink_authority
  + impact_profile
  + approval_binding
  + postcondition / rollback / expiry
```

### 1.1 operation capability（操作能力）

`operation_capability`は次のclosed setからexactly oneを選ぶ。

| capability | 例 | 初期判定 |
|---|---|---|
| `read` | read、build、test、status | bounded inputなら許可候補 |
| `create` | 新規repo内artifactの生成 | targetとscopeを検証 |
| `modify` | 明示された単一artifactの変更 | physical identityを検証 |
| `delete` | 明示された単一artifactの削除 | narrow fenceを検証 |
| `truncate` | file、DB、blobの内容消去 | high以上、既定拒否 |
| `overwrite_replace` | 既存targetへの上書き・置換 | high以上、既定拒否 |
| `permission_process_service` | permission、process、service操作 | high以上、既定拒否 |
| `container_cloud_repository` | container、cloud、GitHub targetの変更 | typed targetとaction binding必須 |
| `network_egress` | 外部network sinkへの送信 | data/sink broker必須 |
| `credential_access` | secret、credential、tokenの取得・利用 | default deny |
| `unknown` | parse不能、内容不明、分類衝突 | 必ず拒否 |

`delete`と`truncate`、`modify`と`overwrite_replace`を同じsafe操作として扱わない。
package script、interpreter、nested shell、alias相当の実行も、字面ではなく解決後のcapabilityを
判定する。

### 1.2 target identity（対象同一性）

path targetは次の証拠を別々に保持する。

- `lexical_target`: 入力で宣言されたrepo-relative POSIX pathまたはtyped external target。
- `physical_target`: realpath（実体パス）、ancestor symlink/junction（祖先リンク/接合）、mount（マウント）、device/inode（デバイス/inode）、file type（ファイル種別）。
- `target_set`: exact member list、cardinality、glob・再帰・生成展開の有無。
- `repository_identity`: repository（リポジトリ）、worktree（作業木）、Git object（Gitオブジェクト）、GitHub owner/name（所有者/名前）、ref（参照）、HEAD（基準点）。

lexical pathがrepo内でもphysical targetがrepo外、symlink/junctionで境界を越える、mount/bind
またはhardlinkで同一実体が別pathから到達できる、target集合を確定できない場合は拒否する。
TOCTOUを防ぐため、判定時と実行直前のidentity digestを一致させる。一致しない場合は再実行せず
新しいpreflightを要求する。

### 1.3 execution provenance（実行来歴）

`execution_provenance`は次のclosed setとする。

| provenance | 条件 | 許可境界 |
|---|---|---|
| `direct_literal` | literal commandとtargetを完全にparse済み | 他軸の検証後のみ |
| `bounded_wrapper` | allowlist wrapperを再帰上限内で展開済み | 展開後のexact tupleを再検証 |
| `inspected_script` | script本文、interpreter、argv、依存入力をdigest束縛済み | sandboxまたはaction binding |
| `generated_indirect` | 変数、glob、find/xargs、動的コードで対象が生成 | host直接実行を拒否 |
| `unknown` | parse不能、解析深度超過、未登録wrapper | 必ず拒否 |

`generated_indirect`を`direct_literal`へ昇格させない。解析不能時にhost実行へfallbackせず、
credentialなし・network deny・repo外filesystemなしのsandboxへ送るか、実行を拒否する。

### 1.4 data classification と sink authority

送信元dataと送信先sinkを同じ`network_allowed` booleanへ畳み込まない。

| data classification | 既定扱い |
|---|---|
| `public` | 登録済みsinkへ送信候補 |
| `repository_content` | exact artifact、目的、retentionを束縛 |
| `sensitive` / `pii` | broker外送信を拒否、action binding必須 |
| `credential` | 外部送信・ログ・command argvへの出力を拒否 |
| `unknown` | 分類不能として拒否 |

`sink_authority`は`local_workspace`、`git_object`、`github_api`、`network_endpoint`、
`cloud_control_plane`、`process_environment`、`unknown`を区別する。sinkがexact target、
目的、認可範囲、expiry、read-before、dry-run、postcondition、rollback可否を持たない場合は
`approval_required`ではなく`unresolved`としてfail-closeする。

## 2. impact、approval、結果契約

`impact_profile`はproduction影響、破壊性、credential access、external side effect、blast radius、
rollback可否を個別boolean／enumで保持する。これらから導出した`risk_class`は要約値であり、
入力の代替や承認の根拠として単独利用しない。

- repo内の明示的な単一file read/build/testは、identityとprovenanceが検証できれば許可候補。
- truncate、overwrite/replace、permission/process/service、host root、container/cloud/GitHubの
  destructive操作は、exact target、dry-run、postcondition、rollback情報がない限り拒否。
- credential access、credentialを含むdataのegress、repository archiveの外部送信は既定拒否。
- irreversible、production、external publish、state cutoverは`human_approval`境界を維持。
- reversibleだが高影響な操作は、同一HEAD・同一target identity・同一policy digestへ束縛した
  `action_binding`を要求する。approval receiptがない状態でcommandを実行しない。

結果receiptは`decision`を`allow`、`blocked`、`unresolved`、`approval_required`のexact setで返し、
operation（操作）、target（対象）、provenance（来歴）、data（データ）、sink（送信先）、policy version（ポリシー版）、identity digest（同一性ダイジェスト）、reason code（理由コード）、
postcondition、rollback、expiryを値非表示で保存する。secret、PII、個人absolute path、raw command、
raw payloadをログ・DB・PRへ出力しない。

## 3. runtime coverage とAND admission

Claude Code hook、Codex CLI/IDE hook、Cursor、hosted tool、worker sandboxは別surfaceとして
coverage matrixへ登録する。hook非強制surfaceは「hookがある」と扱わず、capability brokerまたは
sandboxを唯一の実行境界とする。matcher drift、hook trust drift、coverage unknown、sandbox
unavailableはfail-closeする。

canonical authorityの失敗をlegacy guardや別scannerのgreenで相殺しない。admissionは次のAND条件を
満たす場合だけ後続実行へ進む。

```text
requirements / policy current
AND physical target current
AND provenance bounded
AND data-sink policy current
AND approval binding current (必要時)
AND runtime surface covered
AND postcondition / rollback / expiry valid
```

## 4. current要件と後続slice

以下のIDはrequirements v1.3.12へ昇格済みのcurrent FR/ACである。runtime実装の完了を意味せず、
各sliceは対応する実装・検証・独立review・main read-afterを別途要求する。

| 要件ID | 要件 | 対応受入 |
|---|---|---|
| `SEC-FR-CAP-001` | operation capabilityとimpactを独立typed fieldで保持し、未知・混同・欠落を拒否する | `SEC-AC-CAP-001` |
| `SEC-FR-CAP-002` | lexical/physical target、target set、TOCTOU identityを実行直前に検証する | `SEC-AC-CAP-002` |
| `SEC-FR-CAP-003` | direct/bounded/script/generated/unknown provenanceを区別し、未検証間接実行をhostへ渡さない | `SEC-AC-CAP-003` |
| `SEC-FR-CAP-004` | data classificationとsink authorityを分離し、credential／PII／archive egressをbroker外で拒否する | `SEC-AC-CAP-004` |
| `SEC-FR-CAP-005` | external/destructive actionをexact target、dry-run、postcondition、rollback、expiry、action bindingへ束縛する | `SEC-AC-CAP-005` |
| `SEC-FR-CAP-006` | hook/sandbox coverageをruntime別に検査し、unsupported surfaceをhost実行へfallbackしない | `SEC-AC-CAP-006` |
| `SEC-FR-CAP-007` | canonical safety failureをlegacy greenで相殺せず、値非表示のreceiptへ全reasonを記録する | `SEC-AC-CAP-007` |

実装は次の別PRへ分割する。

1. physical filesystem identity
2. recursive target expansionとexecution provenance
3. credential sinkとGitHub target authority
4. network/cloud destructive typed adapter（ネットワーク/クラウド破壊操作の型付きadapter）
5. Claude/Codex hook parity（hook同等性）、Cursor/hosted unsupported surface（未対応surface）、doctor（診断）の是正

本書へruntime実装、既存guardの再配線、GitHub設定apply、credential操作、sandbox cutoverを混載しない。
