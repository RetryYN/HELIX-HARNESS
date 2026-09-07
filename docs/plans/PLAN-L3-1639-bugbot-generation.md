---
plan_id: PLAN-L3-1639-bugbot-generation
title: "定型生成・正規操作の承認済みsource移管"
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
  approved_at: "2026-09-07T20:06:36Z"
  plan_id: PLAN-L3-1639-bugbot-generation
  approval_record_id: L3-PO-1639-001
  approval_source: human_gate_record
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/issues/1639#issuecomment-5575191362"
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
github_issue_id: 1639
behavior_contract_id: BUGBOT-GENERATION-001
responsibility_owner: requirements-authority-materialization
engineering_discipline_required: true
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: retained
backprop_decision: not_required
backprop_decision_reason: "承認済みL1/L3/L10 sourceの意味不変移管を本PLANで所有する。L12認識条件の不足は残義務として保持する。"
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "原稿、既存GH-FR-007/014、Rule導出と変更伝播を照合する。限定修復権限は別PLANで扱う"
contract_postconditions: "BBGのL1/L3/L10 sourceへ意味不変で移管し、承認候補のraw digestと原稿の項目対応を保持して第二正本を残さない"
contract_invariants: "生成と実行権の分離、意味正本の再利用、source配置だけによるruntime有効化禁止"
contract_failures: "未提供別紙の確認済み扱い、scope拡張、承認捏造、義務欠落を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceは承認済み文書の移管のみ。実装の独立oracleとmutationは後続実装で実証する。"
complexity_effect: net_negative
complexity_justification: "既存Authoring/Recoveryを再利用し、定型手修正と重複基盤を減らす。"
removal_trigger: "候補の第二正本は本移管で除去する。旧手書き入口はBBG-R04/AC05の後継consumer検証・rollback成立後に退役する"
parent_design: docs/design/helix/L1-requirements/bugbot-generation-requests.md
pair_artifact: docs/test-design/helix/bugbot-generation-acceptance.md
dependencies:
  parent: docs/design/helix/L1-requirements/bugbot-generation-requests.md
  requires: []
  references:
    - issue:1642
    - issue:93
    - issue:192
    - issue:397
    - issue:1293
    - issue:1500
    - issue:1595
    - issue:1608
  blocks: []
generates:
  - { artifact_path: docs/governance/candidates/bugbot-intake-source.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L3-1639-bugbot-generation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L1-requirements/bugbot-generation-requests.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L3-requirements/bugbot-generation-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/bugbot-generation-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
agent_slots:
  - { role: tl, slot_label: "TL — 既存責務と追加差分を分離" }
  - { role: qa, slot_label: "QA — 原稿対応と禁止反例を検証" }
review_evidence: []
---

# 定型生成・正規操作

本PLANは要求と明示承認の束縛、承認済み候補のcanonical source配置を所有する。
L1/L3/L10の要求承認は取得済みであり、同一要求の再承認待ちには戻さない。
A/Bは別PLAN・別受入・別完了で追跡し、正本化・該当IR admission・独立検証を省略しない。
本差分は意味不変のsource移管であり、新配置の独立技術review前は`status: draft`、
`review_evidence: []`を維持する。sourceの`authority_status: canonical_source`とPLAN確定、
Requirement IR admission、実装完了、包括的自動書込みの成立を分離する。

## 承認対象と残る検収

`L3-PO-1639-001`は候補HEAD `a2325edb8425f4e84421ef2fd1f07c6c6d668dd7`の
L1/L3/L10各文書のraw digestへ束縛されている。承認メタデータの追加で元のdigestを差し替えない。
`approved_at`はGitHub記録の作成時刻であり、人間メッセージの厳密な送信時刻ではない。
要求承認と技術review・CI・main read-after・実consumer受入を分離する。
Bの有効化条件は#1642が所有し、Aの生成成功を修復の適用許可に変換しない。

原稿bytesは`docs/governance/candidates/bugbot-intake-source.md`のBase64復号で再現する。正規化なしのSHA-256:
`c97b9dd32b8327696d77ae3f86cebeae0e3a2545766d3e4bb2c0f484e6a4828a`。
原文の項目対応・保全read-after・候補移管の検査後にroot原稿を退役する義務を維持するが、
本sliceでは保全台帳を変更せず、root原稿も削除しない。
別紙02/03/05は未提供であり、別紙03の18シナリオ照合は残義務である。

## 承認時の来歴と移管範囲

次のraw SHA-256は承認対象HEAD `a2325edb8425f4e84421ef2fd1f07c6c6d668dd7`の
ファイル全体（frontmatterを含む、正規化なし）から再計測した値である。
承認メタデータを含む移管直前base `cf85c603986b87905514d2d3ebcdd1fde1aaa2b2`や
移管後文書のdigestで上書きしない。旧pathはGit履歴を読む来歴であり、現行参照ではない。

| 承認時path | bytes | raw SHA-256 | 現行source |
|---|---:|---|---|
| `docs/governance/candidates/bugbot-generation-requests.md` | 1275 | `6f238c1e5216d3d9030f84205b693dc897f9bf7fb437ae732749c1291ff28619` | `docs/design/helix/L1-requirements/bugbot-generation-requests.md` |
| `docs/governance/candidates/bugbot-generation-requirements.md` | 3237 | `5a1393d66839180f16e8c0db046070b882171792db929d20dc1316aab683faae` | `docs/design/helix/L3-requirements/bugbot-generation-requirements.md` |
| `docs/governance/candidates/bugbot-generation-acceptance.md` | 2040 | `f0665116a0f25a7170bb78b203e9ff7f2e241cd7bd0530072aae53ff06fe7db8` | `docs/test-design/helix/bugbot-generation-acceptance.md` |

BBG-BR01..02の要求段落、BBG-R01..04の見出しと要件本文、BBG-AC01..06の表行を
承認対象および移管直前baseとbytes単位で照合する。変更は配置、相互参照、来歴、source状態と
未完了境界に限定する。candidate本文のコピーを残す案は第二正本となるため採用せず、Git履歴で保全する。
原稿A01..04の対応とBR→R→ACの既存対応を維持し、新しい意味・FR ID・IR recordを追加しない。

## 工程表と検証計画

| 順序 | 作業 | 状態・検証 |
|---|---|---|
| 1 [直列] | 承認元・原稿・既存sourceを照合 | 同一文書を扱うためfile_conflict。指定baseと承認対象HEADを固定する |
| 2 [直列] | 3候補をMove/Updateし参照とcatalogを更新 | downstream_dependency。要求・ACのbytes照合とリンク実在検査を行う |
| 3 [直列] | 既存CLIで検証しDB/snapshotを再生成 | shared_state。plan lint、governance、post-merge-status、db rebuild、design-language、pair検査を行う |
| 4 [直列] | 新配置HEADの独立技術review | downstream_dependency。親へcommit済みHEADと残義務を渡す。PR #1641のsealed receiptを流用しない |

commit前に`helix guard commitlint --subject 'docs: move approved bugbot generation sources to canonical paths'`
と`git status`／`git diff --staged`を検証し、意図pathだけをnormal commitする。pushは本workerの範囲外である。

実装計画は既存Authoring/RecoveryとGH-FR-007/014、#1608を再利用する後続実装へ分離する。
本sliceは文書移管のみであり、runtime/gateコード、test基準、B/#1642、三社IR、CIを変更しない。

## 移管の局所検証

Node 24.15.0で`node --import tsx src/cli.ts`を既存HELIX CLI入口として実行した。
以下はsource移管の局所証拠であり、独立技術reviewやruntime受入の代用ではない。

| CLI引数 | exit | stdout SHA-256 | 判定範囲 |
|---|---:|---|---|
| `plan lint docs/plans/PLAN-L3-1639-bugbot-generation.md` | 0 | `1681481c40ae77313b41da3e236553a51fc5b1bb29a91403e51aa92b336ea77c` | 対象PLAN、既存design-reality advisoryは維持 |
| `plan lint --gate governance` | 0 | `af09abbfa549e5a994b405ba5d7927b4f61228b6a23f48e4a6b6fe3a7de309ed` | frontmatter/cross-record 1209件 |
| `plan lint --gate post-merge-status` | 0 | `578fb42085ee874bd41c96b2d5b596988f486a3f61890239b580cf7edb9e8d59` | 移管前base上の局所検査。新HEADの統合完了ではない |
| `doctor --gate design-language` | 0 | `2984186f00d314baf5e104cfd8be45622668c83c8d144c9e98b215c432c3e9e4` | 人間向け2384文書、英語prose 0 |
| `db rebuild --json` | 0 | `eb258dfcea30024d69ffb5134b4dcb2a65b523ec89419c56aeca0aeca1807ee8` | 専有treeで`ok: true`、rebuild findings 0。main convergenceではない |
| `vmodel lint` | 1 | `2b6c3d59a51abc56b24870d23e1b961dc71469459f73f2b2b52be97befdbff91` | L1 sourceのpair欠落1件。draftでもfail-close |

`db rebuild`が生成した`docs/governance/generated/outstanding-snapshot.json`はbaseとbytes一致し、
SHA-256は`b9128b757a7a21a71f9a7213b67d9df17166633feb8d9c3fb00efbc97146b190`である。
他レーンのsnapshotを取り込まず、95件のdecision集合を削減しない。
既存doctor関数の局所呼出しではdesign-coverage、l12-hybrid-recognition、document-agent-metadataが
`ok: true`、l3-progression-authorityだけがcatalogの`digest_mismatch`となった。
全doctor greenやL12認識条件の充足は主張しない。

### 要求・ACのbytes照合手順

repository rootでNode 24.15.0から次を実行する。ファイルを作成せず、Gitの承認対象とbaseの両方を
照合する。BR段落2件・R見出しと本文4件・AC表行6件には改行も含める。

```sh
node --input-type=module <<'JS'
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const refs = ['a2325edb8425f4e84421ef2fd1f07c6c6d668dd7', 'cf85c603986b87905514d2d3ebcdd1fde1aaa2b2'];
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const cases = [
  ['requests', 'docs/design/helix/L1-requirements/', 2, /^BBG-BR\d{2}:.*\n(?:[^\n]+\n)*/gm],
  ['requirements', 'docs/design/helix/L3-requirements/', 4, /^### BBG-R\d{2}[^\n]*\n[\s\S]*?(?=^##|$(?![\s\S]))/gm],
  ['acceptance', 'docs/test-design/helix/', 6, /^\| BBG-AC\d{2}[^\n]*\n/gm],
];
for (const [name, dir, count, pattern] of cases) {
  const oldPath = `docs/governance/candidates/bugbot-generation-${name}.md`;
  const current = readFileSync(`${dir}bugbot-generation-${name}.md`, 'utf8');
  const extract = text => [...text.matchAll(pattern)].map(m => Buffer.from(m[0]));
  const actual = extract(current);
  assert.equal(actual.length, count);
  assert.equal(existsSync(oldPath), false);
  for (const ref of refs) {
    const original = execFileSync('git', ['show', `${ref}:${oldPath}`]);
    assert.deepEqual(actual, extract(original.toString('utf8')));
    if (ref === refs[0]) assert(current.includes(`approved_raw_digest: "sha256:${sha(original)}"`));
  }
  const bytes = Buffer.concat(actual);
  console.log(JSON.stringify({ name, count, bytes: bytes.length, sha256: sha(bytes), equal: true }));
}
JS
```

実測では3集合ともexit 0で承認対象・baseの両方に一致した。

| 保全対象 | bytes | SHA-256 |
|---|---:|---|
| BR01..02の要求段落 | 504 | `11a27911e707dfb0ceedf2938fb91aac00c562e9480ba4bfc769de8718daefc0` |
| R01..04の見出し・要件本文 | 1413 | `efbb2ff6445229012b0ba1ab7cbe7e4275b6b151ff8015028a9c485758e7b884` |
| AC01..06の表行 | 1206 | `c40cfd994a0773c0a7810ce54481abb5a44749facbcb026271a6d0132bdb9571` |

保全台帳自体もbaseとbytes一致し、Base64復号結果は8033 bytesと原稿SHA-256に一致した。
承認メタデータ不変、L3↔L10の双方向参照、全Markdownリンクの実在、catalogの各source一回登録も
メモリ内検査で確認した。元要求を再生成したり、実装成功receiptを作成したりしていない。

## 残義務・親への引継ぎ

- **L1↔L12**: `l12-canonical-vmodel-direction-directive_v0.1.md` §3と要件正本v1.3 §2/§7の
  正規pairを適用する。参照例PLAN-L3-78のL12認識文書と異なり、Aの承認済み3文書には
  BBG-BR01..02に対応するL12認識条件がない。`src/vmodel/lint.ts`のpair-exists検査は
  draftでもpair欠落を検出する。新規認識条件・架空path・免除は作らず、不足を親へ渡す。
  これは要求の再承認待ちではなく、未接続のtrace義務である。L3↔L10の充足で相殺しない。
- **catalogのreviewed digest**: `src/lint/l3-progression-reviewed-digests.ts`のcatalog pinは
  `c2c52dcc8641f675c53e42a040c6a681b3c9091c7d6e2c38e22d8e6987b8a6d1`、本配置で3 path追加後の
  実測SHA-256は`fb435afb3a17a576f862626f23b9ab9bdd21af4f77c35938b490279cb2bc1be2`であり、
  `l3-progression-authority`は`digest_mismatch`を返す。独立review後のdigest追従を親へ渡す。
  runtime/gateコードの変更は本worker範囲外であるため、pinやテスト基準を変更してgreen化しない。
- **独立技術review**: 新canonical配置のexact HEADを対象に新しいreviewを受ける。
  PR #1641は候補・承認反映の履歴に限定し、新配置のsealed receiptとして扱わない。
- **IR・実装**: 既存ACとの詳細照合、該当Requirement IR admission、後続設計・実装・独立oracle・
  mutation・実consumer受入は未完了。Bの限定修復権限は#1642所有のまま維持する。
- **実測・別紙**: BBG-AC06の効果閾値・標本数・対象consumerの既存NFR接続、同条件の実測、
  別紙02/03/05と18シナリオ全件照合を残す。source配置の成功をこれらの合格へ読み替えない。
- **統合後の検証**: CI、main read-after、DB convergenceを別途行う。専有treeのdb rebuildは
  local projection確認であり、main convergenceや完成のreceiptではない。
