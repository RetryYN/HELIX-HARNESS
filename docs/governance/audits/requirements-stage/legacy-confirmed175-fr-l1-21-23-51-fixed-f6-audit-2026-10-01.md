# confirmed175 FR-L1-21/23/51 固定f6条件照合監査（2026-10-01）

旧source-qualified identityをそれぞれ分け、旧source・archive consumersと固定f6 L2/L11を条件単位で照合したread-only静的監査。監査基準mainは`a3340369530d06a636db6feb4a99a685a7c2c070`、固定pair revisionは`f6dad2a33e24f000b87d7f09b8d40288257e74cc`。[JSON](legacy-confirmed175-fr-l1-21-23-51-fixed-f6-audit-2026-10-01.json)に行・consumer・pair・decision/MPR rowのline/file SHAを記録した。

3行はいずれもasset `LEGACY-ASSET-6B6C5CB0E481BE01088B`内にあるが、別々のFR identityである。archive source file SHA-256は`a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`。行SHA-256はFR-L1-21=`b54119ad033bcb2f01c1977710d76249ab80a2789422ed02afa3c54d6ac3799b`（52行）、FR-L1-23=`920a9745ec190e871ab29af8463a9ab9cb991c43fbe723740d5b2f10dbe38b71`（54行）、FR-L1-51=`9f83dd9bd0baae0d6fca3e07f11fdc9756249875039a82aa77850a1c2a769e7a`（82行）。source authorityはconfirmed、carryは`preserved_pending_rehome`、各identityのsuccessorは未割当。

## 固定pairと条件別照合

| source-qualified identity | f6固定対象 | 固定pairで確認した条件 | 残る差分 |
|---|---|---|---|
| `harness/L1-requirements/functional-requirements.md::FR-L1-21` | HARNESS-L2-004/005と同IDのL11 | L2-004は要求→設計/テストtraceと変更時の再検証範囲、005はticket/riskに応じた検証義務・証拠とOSのCI組立を定める。L11はscope/revision、固定段数を避けた選択、省略記録・回収を受け入れる。 | 設計項目ごとのW観点対応、test-level間の重複判定、静的fail-close、抜け/重複一覧およびFR21単位のpass/fail oracleはf6にない。W条件の部分基盤があるが、identity固有の成立契約を閉じない。 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-23` | HARNESS-L2-002/003と同IDのL11 | L2-002は開発方式の選択・合成、L1–L3共通条件、方式ごとの品質/pair維持を定める。003とL11はfreeze、未合意・未検証時の進行禁止、pair確認、L2.5適用、backflowを定める。 | `PRODUCTION_SCRUM`をFull Vと同格にすること、L3 freeze後の各価値sliceごとのL4/L5設計・L6/L7実装・right-arm証拠、system整合、およびfullbackを既存asset導入に限定する組合せは特定されない。 |
| `harness/L1-requirements/functional-requirements.md::FR-L1-51` | HARNESS-L2-004/005、HELIXOS-L2-019と各L11 | 004はtrace/影響と再検証範囲、005は検証義務・証拠・OS運転境界、OS-019はevidence/continuity記録を提供する。 | artifact単位のred/yellow/green `artifact_progress` projection、source/test-edge/impact/recovery入力からの色判定、linked test/dependency reason出力は固定pairにない。旧consumerはredを未確認dependency/open impact/back-propagation欠落、yellowを実装・recovery中またはpassing test未確認、greenをlinked passing test-runとdependency-clearの両方がある状態へ具体化する。static test edgeだけではgreenにせず、recovery PLANの存在だけでもclearにしない。機能条件の閉包は成立しない。 |

### 固定本文の証拠

Pair document file SHA-256（f6）: HARNESS L2 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、HARNESS L11 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`、HELIX-OS L2 `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf`、HELIX-OS L11 `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680`。各対象IDを含む行集合のsection digestと行SHAはJSONの`fixed_pair_pins`に固定した。

## 旧consumer照合

旧archiveの`root`全体にあるmarkdown/source/config/testテキストを3 IDの完全一致tokenで検索し、関連箇所をread-onlyで確認した。JSONは84件のpath/line/file SHA/line SHA/text pinを保持する。主要な意味consumerは次の通り。

### FR-L1-21
- W-gate: `docs/design/harness/L3-functional/functional-requirements.md:741,759,776`, `docs/design/harness/L4-basic-design/function.md:351`, `docs/design/harness/L5-detailed-design/module-decomposition.md:211`, `docs/design/harness/L6-function-design/fr-unit-coverage.md:57`, `docs/plans/PLAN-L4-03-function.md:77`, `docs/migration/v2-import-ledger.md:116`.
- 表示・trace: `docs/design/harness/L1-requirements/screen-requirements.md:457`; A-133 / PLAN-L7 readiness mentions are historical status. `docs/skills/*review*` hits refer to cross-agent review, a same-number collision and not the W-gate identity.

### FR-L1-23
- Scrum/fullback: `docs/design/harness/L3-functional/functional-requirements.md:60,528,740,755,776`, `docs/design/harness/L4-basic-design/function.md:390`, `docs/design/harness/L5-detailed-design/module-decomposition.md:209`, `docs/design/harness/L6-function-design/fr-unit-coverage.md:59`, `docs/design/harness/L6-function-design/function-spec.md:246`, `docs/migration/v2-import-ledger.md:118,254-256,259`, `docs/plans/PLAN-L3-48-requirement-style-case-authority.md:46`.
- 表示: `docs/design/harness/L1-requirements/screen-requirements.md:67,459`. Trace/migration-plan mentions were retained as historical consumers; they do not establish a current pair or closure.

### FR-L1-51
- Progress projection: `docs/design/harness/L1-requirements/functional-requirements.md:133,270,315,319`, `docs/design/harness/L1-requirements/screen-requirements.md:136,180,478,495`, `docs/design/harness/L3-functional/functional-requirements.md:747,769,776`, `docs/design/harness/L4-basic-design/function.md:347,360,380,392`, `docs/design/harness/L5-detailed-design/physical-data.md:384`, `docs/design/harness/L6-function-design/fr-unit-coverage.md:33,87`, `docs/design/harness/L6-function-design/function-spec.md:286`.
- Historical realization/fullback: `docs/plans/PLAN-L7-56-artifact-progress-state.md:107,118-119`, `docs/plans/PLAN-REVERSE-56-artifact-progress-state.md:80,84,89`, legacy requirements v1.2 §artifact progress, L1 operational-test design and L8/L9 test-design catalog. These source records are not executed evidence or current acceptance.

Token hits in old prose that identify a different meaning, inventory count, or trace-only relation are preserved in JSON and excluded from functional condition attribution. Old runtime, CLI, test, hook, and CI were not invoked.

## FR21既存verification parity receiptと後発decision screen

FR-L1-21には既存の`HARNESS-L2-036` parity receiptがある。receiptは4 source lines（FR-L1-21/22とNFR-06/13）を合わせたsource setで、抜け/重複0、ticket-selected scope、dev-local/CI同一契約、editor fail時commit前修正、画面対象5軸、cross-detection四軸、およびNFR-13の`≥90%`運用目標を保持する。`MPR-RC-HARNESS-L2-036-002`と57候補判断の採択行、L2/L11節digestはJSONで固定した。

このreceiptはFR21のW-gate観点に具体的な後続条件を持つ重要な近接証拠だが、source集合にFR22/NFRが含まれ、FR21固有のsource-only dispositionではない。旧hook/CIの物理方式は再導入せず、`≥90%`を個別ticket pass閾値にしない。採択pairが存在することからFR-L1-21 source identity全体のsuccessorまたはclosureは生成されない。

2026-09-29の57候補、同日の11候補、2026-09-30 live26の採択/承認行を決定表にある採択/承認88行（57候補53件、11候補10件、live26 25件）を全件screenし、行digestと原文rowをJSONに保持した。条件追加のみの表行2件と保留行はidentity採択でないため母集団から除いた。semantic近接subsetはHARNESS-L2-036（FR21のparity）、HARNESS-L2-051（FR51のstage/evidence隣接）、HARNESS-L2-057（FR23のclosure/style隣接）。HARNESS-L2-051は別PHCAP08 source atomsのstage-exit receiptであり、artifact色projectionを定めない。HARNESS-L2-057もclosure条件を扱う隣接候補で、FR23のScrum style同格性やsliceごとの正規pairを定義しない。後発採択はf6へ遡及適用しない。

## 非主張と静的確認

FRの意味変更・retire、successor割当、atom closure、L3承認、実装許可はない。f6 pairは比較基準としてのみ扱った。監査はStep 5全体の完了を主張しない。静的検証ではsource行SHA、archive/holding file SHAの一致、fixed f6 pair row selection digest、MPR/decision pinsの整合、JSON構文と3 identity/target mappingを照合する。
