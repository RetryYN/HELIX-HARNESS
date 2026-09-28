# P1 HR-FR-HYB-006 feedback機能単位の旧→新残差処置監査

基準main: `d6daba2279dcbdb1a6dfa239d0f1e183e6971476`（PR #2280 merge後）。本記録は旧v1.3 HR-FR-HYB-006／HR-AC-HYB-006のarchiveと6fabd125 baselineを別revisionのまま、feedback lifecycleとnegative oracleの機能単位で照合する。要求採択、新候補作成、source holding解除、実装・実行受入を生成しない。PR #2280のMCP profile functional-unit auditは記録形式の先例として参照し、feedback機能の被覆根拠とは扱わない。

## 範囲と数え方

旧条件は`archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md:290`と`docs/governance/requirements-source/helix-requirements-v1.3-baseline-6fabd125.txt:275`。asset `LEGACY-ASSET-02319C2481B9E01698D5`、source item `REQSRC-SUP-00217`。両revisionのline SHA-256は`2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931`。archive file SHA-256は`788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`、baseline file SHA-256は`1eecfe3cbbbf1c61956b23ddbd2f28a5146233d0d0be15fddd8098998ed097e1`。

各revisionの行を4 clause spansへ分け、8 lineage atomとして扱う。phrase/span SHAとholding、source item、処置は[機械可読crosswalk](os-v13-hyb-006-feedback-functional-unit-crosswalk-2026-09-29.json)に固定した。

| 機能条件 | lineage atoms | 現行との関係 | 処置 |
|---|---|---|---|
| feedback semantic lifecycleと旧surface | `...FR-LIFECYCLE` × 2（span SHA `020aeef9…d2c539`） | OS-007はintake/classify/ack/pending/resolutionを区別。OS-009は一般的なdurable event/idempotent projection。`reverse-candidate`、feedback eventの正確な遷移、SessionStart surface全体の一致はない。 | `partial_adopted_contract_with_pending_residual`。部分関係のみでclosureに数えない。 |
| 未ack findingの消失拒否 | `...AC-UNACK` × 2（span SHA `25dab270…ad2b`） | 採択OS-007は未ack findingを消さず、対L11は内容消失を拒否する。 | `adopted_exact_condition`。この2 atomのみ条件単位で充足。行全体のclosureではない。 |
| prose handoverだけで解決しない | `...AC-PROSE-ONLY` × 2（span SHA `03980f7a…08b4`） | OS-044 L2/L11の登録済み未採択候補がこの否定条件だけを対象にする。 | `existing_unadopted_candidate`。候補receiptのno-loss範囲だけを記録し、採択扱いしない。 |
| source HEAD不一致の拒否 | `...AC-HEAD-MISMATCH` × 2（span SHA `674e5051…c97d9`） | OS-007のsource/revision provenance、OS-008のCI HEAD、OS-011のmerge計画、GitHub reviewのexact base/content HEADは各適用範囲で部分関係。全feedback originに対する不一致拒否とは同一でない。 | `preserved_pending_no_exact_general_successor`。一般化せずholdingに保全。 |

## 8 lineage atom一覧

source line SHA-256は同一行内の4 spansで共通。span SHA-256は各atomの識別値。archive側prose-only atomのsource-lines ledger／receipt／register差は注記のとおり保持する。

| Atom ID | revision:line | source line SHA-256 | span SHA-256 | source holding | source-lines disposition |
|---|---|---|---|---|---|
| `V13-ARCHIVE-L0290-HR-FR-HYB-006-FR-LIFECYCLE` | archive:290 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:020aeef97aa35a0a606864ff5d0a333a51cd5b549c05b950c63859e2f7d2c539` | `MPR-SH-SUPPLEMENTARY-003` | `preserved_pending` |
| `V13-ARCHIVE-L0290-HR-FR-HYB-006-AC-UNACK` | archive:290 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:25dab270774a8804bba37ab1de8d94dd3c8e65367c8a3788ef2538c716adad2b` | `MPR-SH-SUPPLEMENTARY-003` | `preserved_pending` |
| `V13-ARCHIVE-L0290-HR-FR-HYB-006-AC-PROSE-ONLY` | archive:290 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:03980f7a4f1f6e65e6b6e8ac5eff71b2d461558cc127c2d9091721ea790208b4` | `MPR-SH-SUPPLEMENTARY-003` | `candidate_scope` |
| `V13-ARCHIVE-L0290-HR-FR-HYB-006-AC-HEAD-MISMATCH` | archive:290 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:674e5051c30608c826b24da23f8492c1bb131e7dabe7d3aa91df0ffea97c97d9` | `MPR-SH-SUPPLEMENTARY-003` | `preserved_pending` |
| `V13-BASE-6FAB-L0275-HR-FR-HYB-006-FR-LIFECYCLE` | baseline:275 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:020aeef97aa35a0a606864ff5d0a333a51cd5b549c05b950c63859e2f7d2c539` | `MPR-SH-V13-BASELINE-001` | `preserved_pending` |
| `V13-BASE-6FAB-L0275-HR-FR-HYB-006-AC-UNACK` | baseline:275 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:25dab270774a8804bba37ab1de8d94dd3c8e65367c8a3788ef2538c716adad2b` | `MPR-SH-V13-BASELINE-001` | `preserved_pending` |
| `V13-BASE-6FAB-L0275-HR-FR-HYB-006-AC-PROSE-ONLY` | baseline:275 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:03980f7a4f1f6e65e6b6e8ac5eff71b2d461558cc127c2d9091721ea790208b4` | `MPR-SH-V13-BASELINE-001` | `candidate_scope` |
| `V13-BASE-6FAB-L0275-HR-FR-HYB-006-AC-HEAD-MISMATCH` | baseline:275 | `sha256:2125ab8a351eea42abeb00975c7ff99a80fed5fe914b5c84a50bf6ca4945b931` | `sha256:674e5051c30608c826b24da23f8492c1bb131e7dabe7d3aa91df0ffea97c97d9` | `MPR-SH-V13-BASELINE-001` | `preserved_pending` |

## 全体判定

| 指標 | 数 | 意味 |
|---|---:|---|
| source revision | 2 | archive line 290、baseline line 275 |
| functional clause | 4 | lifecycle、unack loss、prose-only resolution、source HEAD mismatch |
| lineage atom | 8 | 4 clause × 2 source revisions |
| 採択済み条件充足 | 2/8 | 未ack finding消失拒否のみ |
| 採択済み部分関係 | 2/8 | lifecycle atom。部分relationは充足に数えない |
| 既存未採択候補 | 2/8 | OS-044 prose-only resolution |
| preserved pending | 2/8 | source HEAD mismatch |
| 完全な旧source line closure | 0/2 | 4 clauseすべての関係が閉じたlineはない |
| source-lines／receipt／register lineage整合 | 0 conflict | 両prose-only atomのID・disposition・atom-set digestが一致 |

OS-007の採択済みL2/L11は未ack findingを保持する要件を支える。一方、同じ行に含まれるfeedback状態列、reverse-candidate段階、event/projection構成、SessionStart表示まで満たすとは言えない。OS-009のdurability/projectionは一般契約との部分関係に留める。旧event名、projection方式、SessionStart hook/runtimeを復活させず、技術surfaceをsemantic lifecycleそのものとして扱わない。

## 既存候補と登録照合

`HELIXOS-L2-044`と対L11はprose handover単独をresolution evidenceとしない限定候補で、`MPR-RC-HELIXOS-L2-044-001`は`registered_proposal`／`authority_effect:none`。coverage receiptとregisterはarchive・baseline両方のprose-only atomを候補入力2件として記録し、no-lossもその2 atomに限る。receipt自体が両source line全体をpartialと明記し、残る6 atomをholdingに保全している。

source-lines ledger、receipt、registerを直接照合した。archiveとbaseline双方のprose-only atomはsource-lines ledger／receiptで`candidate_scope`かつ`candidate_input:true`、registerのcarried atom IDとatom-set digestも一致する。lineage表示の不整合は確認されない。

## 責務と判断境界

機能の現行ownerはHELIX-OSである。OS-007がfeedback状態・原証拠を保持し、OS-009が一般的なevent永続化と冪等projectionを持つ。sourceはCONNECT等の新しいtransport ownerやruntimeを要求していないため、owner選択は不要である。OS-044が親として記載するL1-006はLABO評価へ渡す観測・改善loopであり、prose-only finding resolutionとの直接親関係は明瞭でない。採択済みOS-007の親L1-002/004/007/008との候補導出関係を、OS-044採択前に照合する。本文は変更しない。

POの意味判断が要るのは、旧技術記述から意味を変える場合に限る。未決項目は次の二点である。

- Pending feedbackをsession開始時に可視化する振る舞い自体を保持するのか、旧SessionStart surfaceだけを旧方式として終端するのか。
- Source HEAD不一致拒否をPR review findingの既存exact-HEAD適用に限るのか、他種feedback sourceにも広げるのか。

OS-044の採択／保留／意味変更・retireは同候補の既存PO判断項目に残る。本監査から新しい候補、承認、source dispositionは作らない。

## 検証境界

archive line 290とbaseline line 275のline/span SHA-256、8 atom ID、既存source-lines／receipt／registerの参照関係、OS-007／009／011とOS-044 L2/L11を静的照合した。旧runtime、hook、adapter、CLI、test、CIは実行していない。意味採択、source holding解除、実装・運用・利用者受入は確認していない。
