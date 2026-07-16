---
title: "HELIX Node/Python/Linux runtime surface台帳"
status: draft
created: 2026-07-16
updated: 2026-07-16
owner: Codex / TL
authority: ADR-009
schema: helix-runtime-surface-ledger.v1
---

# HELIX Node/Python/Linux runtime surface台帳

## §1 目的と判定境界

ADR-009の「active Bun dependency、loader、API、command、lock、CI、setup、distribution、rule/exampleを全surfaceで0にする」
というterminal cutover条件について、検索件数を完了証拠へ読み替えず、個々の出現を固定分母にする。本台帳は要件freeze向けの
candidate inventoryであり、Node cutover、Bun除去、runtime greenを証明しない。

machine artifactは`docs/governance/generated/helix-bun-surface-inventory-v1.json`である。artifact digestは
`docs/governance/generated/runtime-surface-inventory-digests-v1.json`を正本とする（inventory対象の本台帳へ自身のdigestを埋め込む再帰を禁止）。
active cutover inventoryはcommit `fcbf942835d0014e38c7e20fbd471580fd41af33`の2,029 blobにbindし、working-treeのcandidate docsは別source familyとして分母外とする。
generated artifactはcommit treeに含まれても再帰入力から除外する。NULを含むbinaryは`bun.lockb`を除きtext atom抽出対象外とする。
同一入力で2回生成しbyte-identicalである。

## §2 現行分母

| surface | atom | candidate disposition | terminal cutover blocker |
|---|---:|---|---|
| active execution surface | 81 | atomic cutoverでNode/npmへ置換 | yes |
| active code surface | 471 | Node APIへredesign/replace | yes |
| active rule surface | 8 | authority切替時に同一transactionで置換 | yes |
| active runtime state | 13 | current state contractを判定し置換 | yes |
| active design/evidence | 5,025 | target命令かhistorical commandか個別判定 | candidate yes |
| test fixture/oracle | 1,085 | Node oracleへredesign、Bun negative fixtureは明示保持 | yes |
| other surface | 180 | manual adjudication | yes |
| historical source | 51 | digest付きallowlist候補 | no |
| runtime evidence history | 128 | expiryまたは再生成 | no |
| **合計** | **7,042** | verified disposition 0 | blocking candidate 6,863 |

atomはfile、line、column、token、line context、file digest、atom digest、surface、candidate dispositionを持つ。
同一行に複数tokenがある場合も別atomであり、件数を行数やfile数へ暗黙縮約しない。

## §3 freezeとcutoverの条件

要件freezeには7,042/7,042の最終dispositionと、各active atomからNode replacement、negative fixture、または
historical allowlistへのexact edgeを要求する。terminal cutoverにはさらに次をすべて要求する。

1. active dependency/API/loader/command/lock/CI/setup/distribution atomが0。
2. historical referenceは理由、digest、到達不能性、review、再entry条件を持つ。
3. Bun negative fixtureをactive commandと区別し、fixture実行結果をreceipt化する。
4. `package-lock.json`、Node artifact、`node:sqlite`、hook、CI、distributionを同じactivation receiptへbindする。
5. Linux full gate、macOS/Windows compatibility gate、rollback rehearsalがgreenである。

現状はcandidate inventoryだけが閉じ、verified disposition 0/7,042、active Bun zeroはfalseである。

### §3.1 candidate disposition edge

7,042 atomの粗いsurface分類だけでは実装時の取捨選択が再現できないため、
`docs/governance/generated/helix-bun-disposition-candidates-v1.json`（SHA-256
`cba4235afb7d8d07d6c75df7b6700fd397e19ff3df756c5d583d902bf3186886`）にsource atom 7,042/7,042の
candidate dispositionをexact joinした。主な内訳は次のとおり。

- historical evidence系 4,772、Node control plane 660、Node/npm execution 453、Node test oracle 1,075。
- cutover normative contract 72、Bun negative fixture 10、manual semantic review 0。
- rows/unique atom IDは7,042/7,042、verified 0、coverage credit 0、authority receipt 0。

historical evidence候補は即時allowlistではない。到達不能性、consumerのNode command置換、digest、expiry、
独立reviewが揃わなければverifiedへ昇格しない。manual semantic review候補は個別規則で0へ収束したが、verifiedは0を維持する。

#### §3.1.1 adversarial review

独立review正本は`docs/governance/generated/helix-bun-disposition-adversarial-review-v1.json`
（SHA-256 `36b7de6ca734e9d33d4553e72994bbb7a8097601879698939ca16c194d55bc01`）である。
全7,042件のID/digest/location/coverage/authority invariantと、全dispositionの決定的標本38件を検査した結果、
29件の確定誤分類を検出した。

- historical過剰分類19件: ADR-009 current normative contract 9件、current design/rule内のactive Bun command 10件。
- negative fixture方向誤り10件: Bun必須を検査する旧oracleをBun禁止fixtureとして保持していたため、Node oracle rewriteへ戻す。
- correction overlay適用後のhistorical候補は4,591から4,572、normative contractは72から81、runtime/command rewriteは
  359から369、negative marker保持は10から0、Node fixture rewriteは1,075から1,085となる。

さらにhistorical bucketにはcommand-like文脈2,614件があり、確定誤分類10件を除く2,604件は後続semantic review対象である。
したがって`manual 0`はreview完了を意味せず、candidate artifact自体はreviewed inputとして保持し、correction overlayを次generatorへ
反映する。verified／coverage／authorityは0のままとする。

#### §3.1.2 non-PLAN historical command adjudication

`docs/plans/**`以外の残27件は
`docs/governance/generated/helix-bun-nonplan-historical-command-adjudication-v1.json`
（SHA-256 `bce1c71de01229a3d2ed64f5f669ca9076e763dab9edd14abbe10e7f27132aa6`）で全件個票化した。

- current normative 19件: test-design 16件、function contract 3件。
- active operational 3件: live auditがBun commandをcurrent再検証経路として参照。
- historical evidence 5件: dated audit 2、performance reference 2、外部research reference 1。
- stale prose 0件。既知29 correction overlayとの重複0件。

処置候補はruntime/command rewrite 6、Node fixture rewrite 16、historical evidence保持5である。先行overlayと累積すると
historical候補は4,550、runtime/command rewrite 375、Node fixture rewrite 1,101となる。非PLAN residualは0だが、
`docs/plans/**`の2,577件は未判定である。replacement replay、historical到達不能性receipt、authorityが無いため、
本個票もverified／coverage creditへ算入しない。

#### §3.1.3 corrected projection contract

base candidateを直接変更・verified化せず、既知29 correction、非PLAN 27 adjudication、将来PLAN adjudicationを合成する契約は
`docs/governance/generated/helix-bun-corrected-projection-contract-v1.json`
（SHA-256 `4fc05e8e215225b0581e11fdaa197d843004c52775cd652695db3cb8e05e82c9`）を正本とする。

3 overlay slotはordinalを持つが、後勝ちでsilent上書きしない。atom重複は明示supersession receiptが無ければ
`G-BUN-OVERLAY-CONFLICT`でfail-closeする。source digest、partition、row loss、summary、verification launderingも独立failure codeで拒否する。
この2/3時点のinterim projectionはadjudicated 56、disposition変更51、no-op historical 5、PLAN residual 2,577であった。
現行projectionは次項の3/3 artifactが supersedeする。interimはverified／coverage／authority 0の経過証跡としてのみ保持する。

#### §3.1.4 PLAN historical command semantic adjudication

PLAN residual 2,577件は
`docs/governance/generated/helix-bun-plan-semantic-adjudication-v1.json`
（SHA-256 `63b8d354a03f01137378124ee3aee262c74c77fe5246968abbdbf3ba4664da2b`）へ接続した。
先行adversarial reviewは2,577件のatom ID集合を保存していないため、暗黙predicateを再発明せず、
`docs/plans/**`かつ元candidateのhistorical bucket全4,472件をexact joinする包含監査とした。

- `active_consumer_command_replacement`: 2,210
- `historical_execution_evidence`: 359
- `stale_orphan`: 8
- `normative_transition`: 0

再構築2,577行はplan status（confirmed 2,463 / completed 110 / draft 4）、包含section heading、evidence section判定、
plan IDの外部consumer参照path/count、context/source digestを保持する。これにより対象PLAN 2,577/2,577を含む全historical
PLAN atom 4,472もsupersetとして分類済みで、unclassifiedは0である。ただし元2,577 ID集合のcustody欠落に対する
command syntax score＋atom ID再構築はcandidateであり、Node replacement replay、immutable unreachable receipt、独立reviewが
未閉鎖なのでverified/coverage/authorityは0、独立検証待ちは2,577のままとする。

3 overlayは`docs/governance/generated/helix-bun-corrected-projection-contract-v1.json`
（SHA-256 `fe4556d034896cddc055dff322fe73cdac87c4c957bc614f3446da28573031af`）へ順序付きで接続した。
base 7,042を保持したcandidate projectionはadjudicated 2,633、changed 2,261、no-op historical 372、
residual PLAN/non-PLAN 0となった。ただしprojection completeはverification completeではなく、verified/coverage/authorityは0である。

## §4 OS portability surface

machine artifactは`docs/governance/generated/helix-os-portability-surface-inventory-v1.json`で、digestは同じgenerated digest正本に固定する。
同じcommit tree 2,029 blobから、OS detection/claim 984、filesystem/lock/signal 232、shell entrypoint 133、environment path 196、
path/executable 565、process execution 96、SQLite runtime 75の計2,281 atomを固定した。active/code/test/design等のblocking candidateは2,083、verifiedは0である。

各atomは`OsAdapter`、thin entrypoint、同一contractのOS matrix fixture、historical allowlistのいずれかへexact routeする。
Linux言及数をLinux対応率へ読み替えず、clean Linux full workflow、macOS/Windows compatibility、OS別business logic 0、
OS別schema/lockfile 0の実行receiptが揃うまでportability coverageはfalseとする。同一入力の2回生成はbyte-identicalである。
