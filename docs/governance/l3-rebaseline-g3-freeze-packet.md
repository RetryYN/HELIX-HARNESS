# L3 rebaseline G1/G3 freeze packet v2（再生成中・承認不可）

状態: `draft-not-approvable`
対象 PLAN: `PLAN-L3-20-infinity-loop-g3-freeze`
再生成: 2026-07-23（Codex / TL）

本 packet は、PR #94 以降の同一HEAD文脈レビュー・DB追従要件と、PR #95〜#105で着地したGitHub運用要件・
trace hygiene・feedback dispositionを
反映して G1/G3 freeze を取り直すための資料である。旧 snapshot
`6bd3d8e060b12a5d8d25d9ff21befe728d23f9a4` と旧 packet review HEAD
`cea9ebac5a86952b30b57d5427a8293f7516307d` は後続の正本変更により失効しており、承認へ再利用しない。

先行するL3-21〜32はPR #94〜#105でmainへ着地し、§1のmaterial snapshotを固定した。downstream queueの
exact採番は§6のmanifestへ固定したが、packet PR自身の同一HEAD review・DB receipt、§5の5問回答反映、
未解決ゼロ監査が完了するまで、`status: review-ready`へ更新せず、本書をPO最終承認資料として提示してはならない。

## 1. Snapshot binding（先行PR着地後に固定）

- 最終成果物main HEAD: `b5e7c37078baa1e8de1f75df10f4dc4b4529b9c4`
- 最終成果物tree: `9aa8de92ff5069d6a828bce9a6b8d1947fa89c04`
- packetレビューHEAD: `PENDING_PACKET_PR_HEAD`
- requirements正本: `docs/governance/helix-harness-requirements_v1.3.md`
- requirements digest候補: `sha256:9ef0c31c7838f961ccf968ee70b6b23ce4c10f0108797e3f01ecaf88546529c6`
- L3 progression authority digest候補: `sha256:f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d`
- design catalog digest候補: `sha256:fca15ea362c8845eeb8c1a4bf0903bc27615a28d751ef793a6287c08f59ff692`
- review済みcatalog pin: PR #100最終receipt
  `https://github.com/RetryYN/HELIX-HARNESS/pull/100#issuecomment-5054328000`
  （HEAD `df952e6975f317c2c1d5bc7f5a7ef1febbefa3d3`でdigest内容review済み。以後catalog変更なし）
- final DB convergence receipt: `PENDING_SAME_HEAD_ISOLATED_REBUILD_X2`

上記 `PENDING_*` が一つでも残る間は承認不能とする。push、base更新、正本digest変更、CI self-healで
文脈reviewとDB receiptをstale化し、同じHEADへ取り直す。

## 2. Freeze対象と現在digest候補

### 2.1 Infinity Loop要件定義集合

- requirement definition ledger: 153/153登録、153/153 active、0/153 frozen
- L3/L10の完全な受入trace: 24 FR / 72 AC / 24 HAT
- Infinity Loop/GitHub rebaselineのL4 component・failure oracle到達: 141/153
  （残12はG3後のGitHub 5責務へ降下）
- Infinity Loop/GitHub rebaselineのL5責務: 19/24
  （残5はG3後にL4/L9、L5/L8の順で降下）
- pair freeze済み: 0/19、実装検証済み: 0/153、canonical実行済み: 0/1,246

これらは「設計在庫」と「freeze・実装・実行証拠」を分離した承認時点の基線である。G1/G3承認によって
L4以降、実装、oracle実行が完了したとは扱わない。

### 2.2 L3/L10正本成果物

| 領域 | L3設計digest | L10受入・system-test digest |
|---|---|---|
| Scrum→Vエンティティモデル（SRV-FR-101..112） | `d6ac0ebe30737d0534ccb98943b3e277eb9a551236761baaae8e6b77b14b04ac` | `bea0f4548fa223a4cceabed25a3bf8da0388d711c9be352122fb8d0b7ecccfe2` |
| lifecycle 4状態（LSS-FR-01..08） | `a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b` | `73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c` |
| worker共通契約（WCC-FR-01..08） | `20186dde0ca6abdc0d0d41bbf1c040ed2116d2fa01dc4c55119267175dd0be61` | `d3be187322ea9fdbda8dd703c9f32faaa62b33d3eeb8e8c0683febc4e938f631` |
| predecessor機構堅牢化（UTH-FR-001..035 / UTH-NFR-001..005） | `c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639` | `d352ba205db85aee1f5cb0f5bcf11fb86f1cb3e59b68b3aba3728b54bb6c416a` |
| GitHub運用投影（GOP-FR-01..14） | `42fc7bdcc43c245a714902723f3a21dd367d7006a853713aa5389a61a279dd21` | `7638e322a28a3bb866704feb2fbf431c1d1afba8154883f6f679bb5e52bb9600` |
| GitHub自律運用（GH-FR-001..017） | `46ac0554f1e268368111317373c22a839eb8a7f4325b47c1b4a42ccffde40d3f` | `fd2100f6449d26118f5da4ce3c0104537b82dc1c14331cf3d7329669ddada237` |
| merge admission（GH-FR-018..019） | `f8878a2c39233fb93a31aa1bc2cc257d9a64253db5b79264da19cd0b58369c35` | `f17b4477647ebe349d68b0cae92bedb7b16e898326b269968dac0b168707ded9` |
| approval / recovery（GH-FR-020） | `c874750a27031647495dd04c5e15113cef263f28904d991c553e61a70d37786f` | `74792349b5b0a8669f4e4b1228c775a57e44e6d85cbd292b562d1dcb83b69e86` |
| CI performance（GH-NFR-009..012） | `96e2b1e538138b8d25f46f082317526f3d2691547edb6c3713ae6957cbc5d002` | `ce58bddaabeda8c214b8678dd68dfcb171100444ec973206fbcfbdfd60530b75` |
| environment promotion（GH-FR-021 / GH-NFR-013..014） | `f5b13f4b1602eda78a9bd474f6a98050f089ad734fb90afc871fd15f75cb5410` | `2267f75d68599d2e3f5c559b4400174604836599d8c32a37ea2af4c418f3a691` |
| Update lifecycle（GH-FR-022） | `836b1a8161052f956aeaa8c52d2a6c63110b92a30eed4bdb03d18cc0b0f87163` | `117a856a0356da6c5ef7178d9efbe0e52377187b75d6a74d3ef2879b4e0d492d` |
| PLAN governance（GH-FR-023） | `16b2c56e4fc65a3e495d23262eb4a10356af296964289a31b617888396786a59` | `4d28725768506a67fa119d8851aa010114ddcde5c1cd8f315a68c5a369e13202` |

最終main HEADで全digestを再計算する。表に載せた候補digestと再計算値が一致しなければfreezeを拒否する。

## 3. 旧packetからの失効・修正点

1. requirements v1.3、Scrum acceptance、worker acceptance、GitHub operations designのdigestが旧値から変化した。
2. GH-FR-001..023、GH-NFR-009..014、GH-AC/T-001..034を旧packetが包含していなかった。
3. PR #94で同一HEAD文脈reviewとDB convergence receiptがmerge admission条件になった。
4. PR #95〜#105でCI性能、approval/recovery、environment promotion、Update lifecycle、PLAN governance、
   trace hygiene、feedback dispositionが追加された。
5. phantom `GH-FR-000`、欠落`GH-T-013`、L10/L12 metadata drift、worker acceptance 4責務欠落をL3-27で是正した。
6. Issue #30本文の18 FR / 54 AC、19 slice、旧PLAN-L3-15表記が現行基線と一致しない。
7. Issue #73/#74/#75は、G3時点でadopt / defer / successor実装済み / 別waveのdispositionとtraceを明記する必要がある。

## 4. G1/G3承認で成立する範囲

1. G1: L1/L2要求集合153件のcurrent revisionをsnapshot-boundで承認する。
2. G3: L3要件とL10 oracle設計を承認し、definition frozen receiptを153件へ発行可能にする。
3. requirements definition 153件を、各operational PLAN sliceのstatusとは独立してfrozenへ遷移可能にする。
4. 残12要求をGitHub 5責務へ降下するL4/L9・L5/L8の10個の小PRを開始可能にする。
5. その後の再集計で153/153・24/24が証明された責務だけをL6/L7へ進める。

承認はL4以降のpair freeze、実装、TDD、L8〜L12実行を代替しない。release、tag、production resource、identifier
cutoverは別のaction-binding approval境界を維持する。

### 4.0 PLAN slice closureとrequirements freezeの分離

L3-15以降のoperational PLANは、各PRのclosure boundary、同一HEAD独立review、CI、DB convergence receiptが
閉じた時点で個別に`confirmed`へ遷移できる。このstatusは「そのPLANが定義したL3判断sliceの完了」を示し、
requirements definition 153件のG1/G3 freeze、downstream ownership実装、L4着手承認を意味しない。

逆にG1/G3承認はrequirements definitionをsnapshot-boundでfreezeする判断であり、未実施のdownstream obligationを
完了扱いにせず、個別PLANのreview evidenceを代替しない。PLAN statusとdefinition lifecycleを同じenum・同じgateへ
混在させない。

### 4.1 G3後のGitHub 5責務・10小PR境界

各責務は、先にL4基本設計とL9結合oracleを1 PRで閉じ、そのmerge後にL5詳細契約とL8単体oracleを別PRで閉じる。
後段PRを先行PRへ混載せず、各PRで同一HEAD review、CI、DB追従receiptを取り直す。PLAN IDはG3後に正規generatorで
採番し、このpacketでは成果物pathと順序だけを固定する。

| 責務 | 第1 PR（L4↔L9） | 第2 PR（L5↔L8） |
|---|---|---|
| merge admission・CI性能 | `docs/design/helix/L4-basic-design/github-merge-admission-ci-performance.md` ↔ `docs/test-design/helix/L9-github-merge-admission-ci-performance-integration.md` | `docs/design/helix/L5-detail/github-merge-admission-ci-performance.md` ↔ `docs/test-design/helix/L8-github-merge-admission-ci-performance-contracts.md` |
| 承認・Recovery | `docs/design/helix/L4-basic-design/github-approval-recovery.md` ↔ `docs/test-design/helix/L9-github-approval-recovery-integration.md` | `docs/design/helix/L5-detail/github-approval-recovery.md` ↔ `docs/test-design/helix/L8-github-approval-recovery-contracts.md` |
| 環境promotion | `docs/design/helix/L4-basic-design/github-environment-promotion.md` ↔ `docs/test-design/helix/L9-github-environment-promotion-integration.md` | `docs/design/helix/L5-detail/github-environment-promotion.md` ↔ `docs/test-design/helix/L8-github-environment-promotion-contracts.md` |
| Update lifecycle | `docs/design/helix/L4-basic-design/github-update-lifecycle.md` ↔ `docs/test-design/helix/L9-github-update-lifecycle-integration.md` | `docs/design/helix/L5-detail/github-update-lifecycle.md` ↔ `docs/test-design/helix/L8-github-update-lifecycle-contracts.md` |
| PLAN workflow統制 | `docs/design/helix/L4-basic-design/github-plan-workflow-governance.md` ↔ `docs/test-design/helix/L9-github-plan-workflow-governance-integration.md` | `docs/design/helix/L5-detail/github-plan-workflow-governance.md` ↔ `docs/test-design/helix/L8-github-plan-workflow-governance-contracts.md` |

この10 PRはGitHub追加要件の残12件だけを閉じる。Issue #74のtest ownership backprop、AI Vision、
Universal Workflow、document semantic、canonical authority、runtime authorityをこの5責務へ算入してはならない。
それらは§6のmanifest-bound downstream obligationとして別分母で再集計する。

## 5. PO認識合わせ（5問単位、回答即時反映）

次の5問を一括提示し、各回答を本packetと関連要件へ即時反映する。回答反映後に未解決ゼロ監査と全revision提示を行い、
その後だけ最終G1/G3承認を求める。

1. **L3承認前のdraft PR**: 承認前は非正本のreview proposalとしてdraft PRを許可し、ready化・mergeは承認後だけとするか。
   推奨は「draft PRを許可」。現行GH-FR-020の「承認後にだけPR作成」と実運用をこの意味へ統一する。
2. **merge方式**: 全gate後もGitHub native auto-mergeを使わず、AI-Bがcurrent HEAD証拠を再照合して明示mergeするか。
   推奨は「AI-B明示merge」。GH-FR-023とrequirements v1.3へ合わせ、AGENTS.md / CLAUDE.md / audit-frameworkを後続で是正する。
3. **Update priority**: Update identityを維持したまま、証拠によりP0/P1/P2へ昇格可能とするか。
   推奨は「可能」。種別とpriorityを直交させ、P3=Updateという固定対応を解消する。
4. **flat PLAN migration**: G3ではtarget契約をfreezeし、L5契約後にsystem-wide Forward migrationをdual-greenで実行するか。
   推奨は「実移行はL5後」。別Featureへの無期限deferにはしない。
5. **AWS reference profile**: provider-independent契約を正本とし、最初のreferenceをAWS ECS Fargate + CDK TypeScript、DBが必要なfixtureだけRDSとするか。
   推奨は「採用」。production resource作成はaction-binding approvalまで行わない。

回答が新しい論点を発生させた場合は次の5問batchを作り、未解決を残したまま最終承認へ進まない。

## 6. 子Issue dispositionとIssue #30同期

| Issue | freeze前の必要記録 | 現在 |
|---|---|---|
| #73 predecessor hardening | 採用済み要件、別wave、未採用atomを分離し、L3/L10 traceを示す | `ADOPTED_L3_L10_PENDING_FREEZE`。PR #59/#89で監査37件、UTH-FR-001..035、UTH-NFR-001..005、UTH-AC-001..027がmainへ着地。実装完了ではなく、PO freezeとterminal closure PR待ち |
| #74 actionable feedback 7群 | 各feedbackをimplemented / successor PLAN / deferへexactly-one dispositionする | `DISPOSITION_MANIFEST_MERGED_PACKET_DB_PENDING`。unresolved-join=0。初期missing-test 100件は自己owner 8件とL3-28〜31のsuccessor disposition 92件、refactor 20件はL3-32の9/6/5 partitionへ固定し、PR #101〜#105でmainへ着地済み。packet HEADのDB projectionとfeedback event receiptが未完 |
| #75 model effort policy | PLAN-L7-310/311等へのtraceとIssue終端可否を確認する | `ADOPTED_IMPLEMENTATION_PENDING`。PO memoryの非対称既定を採用するが、現行`model-effort.ts`はfable/opus/frontier=high、spark=low、shallow時effort昇格の旧契約。PLAN-L7-310/311/343/415をstale化して別L6/L7修正waveへ送る |

#74 の初期 `missing-test-plan-id=100` は、自己owner 8件とsuccessor disposition 92件へexactly-one分解した。
`PLAN-L3-27`生成test 5件は同PLANがowner、G3 packet test 3件は`PLAN-L3-20`がownerである。残92件は次の
digest-bound manifestが全件を覆い、完了済みPLANへの推測帰属を禁止する。

| disposition | testファイル数 | case数 | authority |
|---|---:|---:|---|
| `PLAN-L3-28-feedback-test-owner-closure-disposition` | 6 | 21 | closure authority/materializationをsuccessor backprop |
| `PLAN-L3-29-feedback-test-owner-recognition-disposition` | 1 | 9 | recognition generatorのsemantic predecessorを`PLAN-L3-13`に固定 |
| `PLAN-L3-30-feedback-test-owner-direct-disposition` | 3 | 27 | document agent / Infinity strict / source boundaryをL4/L9またはL5/L8へbackprop |
| `PLAN-L3-31-feedback-test-owner-residual-disposition` | 9 | 35 | AI Vision / Universal Workflow / document / canonical / runtime authorityをpair closureへbackprop |

4 manifestのcase分母は21+9+27+35=92であり、自己owner 8件を加えると初期100件に一致する。各manifestはtest
file SHA-256、case数、authority path、required closureを固定し、targeted testが重複0・digest一致を検証する。
これはL6/L7実装完了claimではなく、G3後にL4/L9・L5/L8へ戻すownership schemaである。

L3-28〜30の57 caseは、次の6 workstreamへ分離する。case数だけでなくsemantic predecessorまたは
直接authorityが一致する単位で束ね、異なるpair routeを同じPRへ混ぜない。

| ownership workstream | case | pair closure境界 | 最小小PR数 |
|---|---:|---|---:|
| closure authority backfill | 12 | 既存detail authorityへのadditive L5/L8 backprop | 1 |
| closure evidence materialization | 9 | 既存detail authorityへのadditive L5/L8 backprop | 1 |
| hybrid recognition | 9 | recognition oracleのadditive L5/L8 backprop | 1 |
| document agent metadata | 6 | 既存detail authorityへのadditive L5/L8 backprop | 1 |
| Infinity Loop strict design contract | 20 | layer-ledger/pair-gate authorityへのadditive L5/L8 backprop | 1 |
| source boundary headless | 1 | source boundaryのadditive L4/L9 backprop | 1 |

合計は12+9+9+6+20+1=57、最小6小PRである。各rowが要求するL6/L7 test ownership bindingまたは
PLAN projectionは、このpair closure分母へ算入せずL6/L7 waveで別途exactly-once採番する。

L3-31の35 caseは、少なくとも次の5 workstreamへ分離する。先頭2件はGitHub 5責務とは別の
cross-layer product workstreamであり、同じ分母へ混ぜない。

| ownership workstream | case | pair closure境界 | 最小小PR数 |
|---|---:|---|---:|
| AI Vision | 7 | 新規L4/L9の後に新規L5/L8 | 2 |
| Universal Workflow | 5 | 新規L4/L9の後に新規L5/L8 | 2 |
| document semantic diff/report | 4 | 既存detail authorityへのadditive L5/L8 backprop | 1 |
| canonical/layer/L3 progression authority | 14 | authority gateのadditive L5/L8 backprop | 1 |
| runtime authority | 5 | runtime authority gateのadditive L5/L8 backprop | 1 |

合計は7+5+4+14+5=35、最小7小PRである。GitHub 10 PR、L3-28〜30の最小6 PR、本表の最小7 PRを
合わせると、L4/L9・L5/L8 pair closure段階の既知最小値は23小PRである。これはL6/L7 ownership bindingと
L3-32 refactor queueを含まない。全4 manifestのdownstream queueは
`docs/governance/l3-downstream-queue.json`の`L3Q-PC-001..023`へexactly-onceで採番した。
この23はpair closure分母として固定するが、全工程ではこの23を最終分母とせず、後続phaseを別分母で追跡する。

refactor warning 20件は`PLAN-L3-32-feedback-refactor-disposition`のdigest-bound manifestへ固定した。
literal/policy externalization 9件、CLI split/helper 6件、non-CLI module split 5件の9+6+5 partitionで全件を覆う。
`PLAN-L7-351`、`PLAN-L7-349`、`PLAN-L7-150`は方式を継承するpredecessorとしてのみ参照し、今回のwarningを
実装済みとしてattachしない。G3後に3 familyの新規additive L7 sliceを起票し、behavior不変のtest fence、
implementedまたはaccepted-debt receipt、feedback eventのplan/dispositionを順に閉じる。

3 familyを1 PRずつへ詰め込まない。`literal_policy_externalization`は6 source path、
`cli_decomposition`は1 source path、`non_cli_module_decomposition`は5 source pathを持つため、
familyとsource pathの組を最小sliceとすると6+1+5=12小PRである。同じsource pathでもfamilyが異なる変更は
別PRにし、各PRでbehavior fenceを先行または同一TDD closureへ束縛する。

pair closure後にL6/L7へ進む既知workstreamは、GitHub 5、L3-28〜30由来6、L3-31由来5の合計16である。
これらを`L3Q-IT-001..016`、refactorのfamily/source path 12件を`L3Q-RF-001..012`へ採番した。
L8〜L12 execution evidence前の
pair closure 23 + L6/L7 16 + refactor 12 = 51小PR予約slotは
`docs/governance/l3-downstream-queue.json`で一意性、連番、依存DAGを固定する。この51にはL8〜L12実行receipt、
CI self-heal、review remediation、追加責務発見時のdeltaを含めず、全工程の最終分母として固定しない。

Issue #30本文は最終packetと同じ24 FR / 72 AC、24責務、PLAN-L3-20、実行順へ同期する。Issue更新だけでfreezeを
成立させず、更新後のGitHub再観測をDB convergence receiptへ含める。

## 7. 最終承認条件と記録形式

次をすべて満たした後だけ、Issue #30またはpacket PRへ最終承認を記録する。

- final main HEAD / tree / requirements・成果物digestが固定済み
- latest HEADの独立AI-B文脈reviewがPASS
- GitHub Actions green
- clean隔離checkout・fixed clock・full DB rebuild 2回一致、stale=0、orphan=0
- 5問回答を正本へ反映済み
- unresolved audit 0
- Issue #30と#73/#74/#75のdisposition同期済み
- L3/L10 exact setと153件definition集合に欠落・重複なし

承認コメントは少なくとも次を含む。

```text
G1/G3 approve
material_head: <full SHA>
material_tree: <full tree SHA>
packet_review_head: <full SHA>
requirements_digest: sha256:<digest>
db_projection_digest: sha256:<digest>
db_checkpoint_digest: sha256:<digest>
decision_answers: <packet section / receipt ID>
```

承認記録後、AIがfreeze receipt、requirements definition lifecycle、Issue projectionを同一commit/DB episodeへ
収束させる。承認前はrequirements frozen claimとL4着手を行わない。個別operational PLANの`confirmed`は§4.0の
独立closure条件を満たす場合だけ許可し、G1/G3承認の代替証拠として扱わない。
