---
plan_id: PLAN-L3-1642-bugbot-bounded-repair
title: "逸脱検出・限定修復の承認済みsource移管"
kind: add-design
layer: L3
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
drive: agent
status: draft
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-09-07T20:06:38Z"
  plan_id: PLAN-L3-1642-bugbot-bounded-repair
  approval_record_id: L3-PO-1642-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1642#issuecomment-5575191622"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: REDESIGN
entry_signals:
  - "po_directive:HELIX-bugbotの要求を取り込みCIとCursorに並行して先行する"
created: 2026-09-08
updated: 2026-09-08
owner: Codex / TL
github_issue_id: 1642
behavior_contract_id: BUGBOT-BOUNDED-REPAIR-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "承認済みsourceの意味不変移管と既存BRからの派生認識設計を所有する。要求・受入・権限は増やさない。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "原稿、既存GH-FR-007/011/014、Rule導出と変更伝播を照合する"
contract_postconditions: "BBRの承認済みsourceを正規配置へ移管し、承認時raw digest・原稿項目対応・移管直前のBR/R/AC bytesを保持して候補の第二正本を残さない"
contract_invariants: "生成と実行権の分離、意味正本の再利用、修復ごとの契約・独立検証・実consumer検証が成立した範囲のみ有効化し、要求承認のみで包括的書込みを許可しない"
contract_failures: "未提供別紙の確認済み扱い、scope拡張、承認捏造、義務欠落を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "意味不変の文書移管と既存BRからの派生認識設計のみ。実装の独立oracleとmutationは後続PLANで実証する。"
complexity_effect: net_negative
complexity_justification: "既存Authoring/Recoveryを再利用し、定型手修正と重複基盤を減らす。"
removal_trigger: "候補の第二正本は本移管で除去する。旧修復入口の退役は独立検証・実consumer・rollback証拠成立後に行う"
parent_design: docs/design/helix/L1-requirements/bugbot-bounded-repair-requests.md
pair_artifact: docs/test-design/helix/bugbot-bounded-repair-acceptance.md
dependencies:
  parent: docs/design/helix/L1-requirements/bugbot-bounded-repair-requests.md
  requires: []
  references:
    - issue:1639
    - issue:93
    - issue:192
    - issue:397
    - issue:1293
    - issue:1500
    - issue:1595
    - issue:1608
  blocks: []
generates:
  - { artifact_path: docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L1-requirements/bugbot-bounded-repair-requests.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/bugbot-bounded-repair-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/bugbot-bounded-repair-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/bugbot-bounded-repair-recognition.md, artifact_type: test_design }
modifies: []
agent_slots:
  - { role: tl, slot_label: "TL — 既存責務と追加差分を分離" }
  - { role: qa, slot_label: "QA — 原稿対応と禁止反例を検証" }
review_evidence: []
---

# 逸脱検出・限定修復

本PLANは要求と明示承認の束縛、および承認済み候補のcanonical source配置を所有する。L1/L3/L10の要求承認は取得済みであり、
canonical promotion・Requirement IR admission・実装・限定実証へ進める。同一要求の再承認待ちには戻さない。
A/Bは別PLAN・別受入・別完了で追跡し、正本化・該当IR admission・独立検証を省略しない。
要求承認だけで新しい自動書込みを包括的に許可しない。対象修復ごとの契約・独立検証・実consumer検証が
すべて成立した修復ID/版・対象・write-setの範囲だけを有効化する。
本差分は意味不変のsource移管であり、新配置の独立技術review前は`status: draft`、
`review_evidence: []`、`completion_claim_allowed: false`を維持する。
sourceの`authority_status: canonical_source`とPLAN確定、IR admission、runtime有効化を分離する。

## 承認対象と残る検収

`L3-PO-1642-001`は候補HEAD `98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d`の
L1/L3/L10各文書のraw digestと、人間が今回明示した有効化条件へ束縛されている。
基準mainでは条件がBBR-R03／BBR-AC03へ転記済みであり、本移管はそのbytesを保持する。
承認前のdigestを事後的に差し替えない。
`approved_at`はGitHub記録の作成時刻であり、人間メッセージの厳密な送信時刻ではない。
修復ごとの通常検収を一律の人間再承認へ変換せず、未定義の意味・権限拡張だけ正規改訂へ返す。
canonical配置の独立検収・親統合・main read-after、IR admission、実装・実consumer受入は
未完了であり、statusを完了へ変更しない。

原稿bytesは[基準mainの保全台帳](https://github.com/RetryYN/HELIX-HARNESS/blob/391020b882abedfa622a2910e906618fde980270/docs/governance/candidates/bugbot-intake-source.md)のBase64復号で再現する。正規化なしのSHA-256:
`c97b9dd32b8327696d77ae3f86cebeae0e3a2545766d3e4bb2c0f484e6a4828a`。
本workerは基準mainのBase64を復号し、8,033 bytesと上記digestを照合する。保全台帳は変更しない。
親から2026-09-08に、root原稿`01_REQUIREMENTS_DIRECTIVE.md`は既存ユーザー削除依頼に基づく
単一pathの監査付きpreflight後に削除・read-after済み、削除前原稿と保全bytesの完全一致、
A4/B5の全対応と未提供別紙義務を確認済みとの報告を受領した。これはB移管とは別のローカル整理であり、
本workerによる削除・削除前照合とは記録しない。原稿を再作成せず、全bytesはGit履歴から復元できる。
原稿共有先#1639とBの追跡先#1642を区別する。Issue追記後の本文全体へ原稿hashを適用しない。
別紙02/03/05は未提供であり、別紙03の18シナリオ照合は残義務である。

## 承認時の来歴と移管範囲

次のraw SHA-256は承認対象HEAD `98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d`の
ファイル全体（frontmatterを含む、正規化なし）から実測し、承認コメントの値と照合した。
承認メタデータと有効化条件を含む基準main `391020b882abedfa622a2910e906618fde980270`、
および新配置のdigestとは区別する。旧pathはGit履歴用の来歴であり、現行参照ではない。

| 承認時path | bytes | raw SHA-256 | 現行source |
|---|---:|---|---|
| `docs/governance/candidates/bugbot-bounded-repair-requests.md` | 1238 | `530b35bb77fb22bc4ea2643e86b24bffe5f5e91444445605b56b5968f0fb2f5f` | `docs/design/helix/L1-requirements/bugbot-bounded-repair-requests.md` |
| `docs/governance/candidates/bugbot-bounded-repair-requirements.md` | 5343 | `b5c66694c798fef30f182cd283492495c23ab828558192aea45d5764cfb62de9` | `docs/design/helix/L3-requirements/bugbot-bounded-repair-requirements.md` |
| `docs/governance/candidates/bugbot-bounded-repair-acceptance.md` | 2456 | `095ddf1e237c26d15cb4f227a03ae9b11267f6cedff94ea563246fa3b6192375` | `docs/test-design/helix/bugbot-bounded-repair-acceptance.md` |

基準mainのBBR-BR01..02段落、BBR-R01..05の見出しと本文、BBR-AC01..07の表行は
改行を含むbytes単位で移管後と照合する。承認対象HEADとの比較では、既にmainで行われた
有効化条件の追記（R03/AC03）だけを別差分として識別し、本workerによる変更と混同しない。
原稿B01..05とBR→R→ACの既存対応を維持する。既存候補をコピーして残す案は第二正本を
生むため採用せず、移動とGit履歴で保全する。新しい意味・FR ID・IR recordは追加しない。

L1↔L12の双方向pairを閉じるため、既存BR2件だけから
[派生認識draft](../test-design/helix/bugbot-bounded-repair-recognition.md)を追加する。
原承認3文書に含まれていたとは主張せず、新HEADの独立技術review対象とする。
新しい閾値や意味は足さず、利用目的達成は未認定のままとする。

## 工程表と検証計画

| 順序 | 作業 | 制約・検証 |
|---|---|---|
| 1 [直列] | 基準main・承認対象・原稿bytesを固定 | downstream_dependency。原承認と条件転記後のbytesを区別する |
| 2 [直列] | B source3の移動、PLAN参照、派生L12のみ更新 | file_conflict。同一sourceの重複を残さず、BR/R/ACのexact bytesを検査する |
| 3 [直列] | 専有treeのread-only局所検査とnormal commit | downstream_dependency。scoped PLAN lint、相互リンク、禁止語、git subject/range lint、explicit stageを実測する |
| 4 [直列] | 親へのcommit済みHEAD引渡し | downstream_dependency。独立review・catalog/pin・IR・CIの合成を親へ渡す。pushしない |

検証はNode 24.15.0と既存依存を読み取り専用で使用し、共有node_modulesへのinstall・cache生成を行わない。
`helix plan lint docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md`、`helix guard commitlint --subject`
および基準mainからcommit後HEADまでの`helix guard commitlint --range`を実行する。
commit直前に`git status`と`git diff --staged`で意図pathだけのstageを確認する。
局所検査のexitとoutput digestはcommit済みHEADへの引渡しで報告し、独立reviewの代用にしない。

## 親統合と後続実装の残義務

本workerのwrite scopeはB source3の移動、B PLAN、派生L12だけである。
`design-catalog.yaml`、全digest pin、scanner、snapshot、Requirement IR、runtime、共通テストは
変更しない。既存のsnapshot追従義務は削除せず、`modifies`から親の合成範囲へ明示移管する。
親はAの依存整合とIR順序の後に、catalog登録・実bytesのpin追従・scanner判定・snapshot/DB投影・
IR admission（#397・IR #1650）・CI #1651を合成する。本workerはその収束を待たず限定移管を引き渡す。
新配置HEADの独立review、CI、main read-afterは未実施であり、全gate greenや実装完成を主張しない。

後続実装は既存Authoring/Recovery、GH-FR-011、#1595/#1608の既存責務へ接続する。
修復ごとの契約・独立oracle/mutation・合法入力対照・実consumer、二重実行・途中失敗・CAS競合・
lease取消・累積予算・循環・禁止緑化、旧入口移管/rollbackと効果測定を省略しない。
Aの生成成功をBの新しい自動適用許可へ変換せず、未定義の意味・権限拡張だけ正規改訂へ返す。
別紙02/03/05・別紙03の18シナリオ照合を文書移管やBR派生認識で代替しない。

## 局所検証の実測と再現

基準mainからの移管対象は次のbytes列である。BRは段落、Rは見出しから次の見出し直前まで、
ACは表行を改行込みで連結した。全ファイルのdigestとは区別する。

| 対象 | 件数（前→後） | bytes（前→後） | 移管前後で一致するSHA-256 |
|---|---|---|---|
| BBR-BR01..02 | 2→2 | 435→435 | `a5dba64b0fa5fdcdbe8ad76a129c3f069690782008795bb6c57cf0d5055b6c23` |
| BBR-R01..05 | 5→5 | 2825→2825 | `0a949538ef4d96fa2603d203fe18af40e1b8a940ec91775b6a3fd179941ba5b4` |
| BBR-AC01..07 | 7→7 | 1951→1951 | `5c6dbfeeb7cdc6f0b7aa9554622e3e1cdfe3ead71db72058fe55122b8fe3d717` |

承認時のR本文は2,422 bytes、SHA-256 `560353c047ad90182de464ab65279c3efd74fe7d9928398ccf899dcd6c36e5cd`、
AC表行は1,635 bytes、SHA-256 `413acf233490efbbe58f34d6e04312d4af79cb29f4f50852ec522d56a002ca4c`。
基準mainとの差は承認条件を転記したR03／AC03だけであり、BR・他R・他ACは承認時ともbytes一致する。

次の局所CLI検査はNode 24.15.0・既存tsxのCJS APIから専有treeの`src/cli.ts`を起動した。
`NODE_PATH`で既存依存を参照し、`TSX_DISABLE_CACHE=1`で書込みcacheを使用しない。
別runtimeの起動、npm操作、共有rootのCLI source使用、DB rebuildは行っていない。

| CLI引数 | exit | stdout SHA-256 |
|---|---:|---|
| `plan lint docs/plans/PLAN-L3-1642-bugbot-bounded-repair.md` | 0 | `1844e4cc2fcb1931c8826ce12f835fdf62060be55fafca3b180db2ef334dfbd4` |
| `guard commitlint --subject 'docs(requirements): promote bounded repair canonical sources' --json` | 0 | `bcbd832d1ec489b13029ec5d68056430b5ff0fff789f01d0fe217fa5fada476c` |
| `doctor --gate design-language` | 0 | `9a265f6ca9018880cae70d3f3cf2c2ebfcc657a86eadb524b5a7718a518f2f07` |

PLAN lintの既存design-reality advisoryは維持する。独立review、catalog/IR/CI全体の合格ではない。
commit後のrange lintと最終HEAD再検証は引渡しで報告する。

### BR/R/ACと承認digestの再現コマンド

repository rootから実行する。書込みは行わず、Git履歴のraw bytesと現行sourceを比較する。

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const base = '391020b882abedfa622a2910e906618fde980270';
const approval = '98cdc24c12e47057b1a7d6d3b156a96bf5ef4d8d';
const sha = b => createHash('sha256').update(b).digest('hex');
const cases = [
  ['requests', 'docs/design/helix/L1-requirements/', 2, /^BBR-BR\d{2}:.*\n(?:[^\n]+\n)*/gm],
  ['requirements', 'docs/design/helix/L3-requirements/', 5, /^### BBR-R\d{2}[^\n]*\n[\s\S]*?(?=^##|$(?![\s\S]))/gm],
  ['acceptance', 'docs/test-design/helix/', 7, /^\| BBR-AC\d{2}[^\n]*\n/gm],
];
for (const [name, dir, count, pattern] of cases) {
  const oldPath = `docs/governance/candidates/bugbot-bounded-repair-${name}.md`;
  const current = readFileSync(`${dir}bugbot-bounded-repair-${name}.md`, 'utf8');
  const extract = s => [...s.matchAll(pattern)].map(m => Buffer.from(m[0]));
  const actual = extract(current);
  assert.equal(actual.length, count);
  assert.equal(existsSync(oldPath), false);
  const original = execFileSync('git', ['show', `${base}:${oldPath}`]);
  const approved = execFileSync('git', ['show', `${approval}:${oldPath}`]);
  assert.deepEqual(actual, extract(original.toString('utf8')));
  assert(current.includes(`approved_raw_digest: "sha256:${sha(approved)}"`));
  const earlier = extract(approved.toString('utf8'));
  assert.equal(earlier.length, count);
  const delta = actual.flatMap((b, i) => b.equals(earlier[i]) ? [] : [i + 1]);
  assert.deepEqual(delta, name === 'requests' ? [] : [3]);
  const bytes = Buffer.concat(actual);
  console.log(JSON.stringify({ name, count, bytes: bytes.length, sha256: sha(bytes), equal: true }));
}
JS
```
