# HELIX-OS L3 機能要件（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 HELIX自身の段階リリース

状態: 固定L2/L11を詳細化するL3候補。親 `HELIXOS-L2-014`、`version_target: 1.0`。POの2026-09-27段階リリース判断と2026-09-28の固定L2/L11採択はsource pinに記録する。これはL3承認、実装・配布許可ではない。現行のMPR metadataや登録状態から追加authorityを作らない。G0ではStage 2b、prerequisiteなしに配置されており、先行Stage完了gateを加えない。

### FR-OS-014 — HELIX段階の構成、再現、検証と切戻し

OSは、固定L2-014の内部段階releaseについて、stage identityと範囲、同じHARNESS pack体系から選択したpack/dependency、configuration/data format、対応environment、capabilityと限界、範囲内acceptance evidence、更新・切戻し条件を一組として記録し、宣言範囲の端から端作業・人の担当工程・状態継承・自己依存なしを追跡する。stageの受入・統合・更新・切戻し・運用検証をpack単体の結果から分離し、1.0到達判定とも分ける。OSはHARNESS契約、SECURITY authority/policy、INFRASTRUCTURE実資源・復旧能力、要求ownerの意味判断を代行しない。外部公開とHARNESSサービス⑥の製品releaseはこの親の対象外である。

**版・意味境界**: `v0.x`等はHELIX内部stageを識別し、公開semver/tagではない。`v1.0`は1.0到達判定を通った構成の表記で、外部公開許可を含まない。stage受入はL2が挙げるscope、品質条件、必要な安全依存を弱めず、未成立能力を「できないこと」に含める。INFRASTRUCTURE-L1-023は1.0より後・版未定として対象外のまま保つ。

**担当**: OSはstageの構成管理・生成・検証・配布・rollback運転と対応証拠を束ねる。HARNESSはpack boundary/call contract/verification-and-acceptance contractを定める。INFRASTRUCTUREはL1-017/018のbackup・restore、L1-019のrollback targetとdata互換、L1-020の独立復旧、L1-022の稼働環境identityと構成を定める。stage一般の環境health確認を追加しない。SECURITYは、固定親の資格情報方針と、対象scopeで選択された操作に必要なcredential/egress/operation authority条件を持つ。各ownerの契約・実状態が不足しているときOSはunknown/unfinishedを保ち、該当ownerへ返す。人手作業は同じ必須契約・authority・evidenceを代替せず、scope内工程の担当・結果を記録する。

### AC-OS-014 — L2句ごとの受入条件

各ACは固定L2の同じ番号の要求句を扱う。positive、個別negative、未見正常、失敗時の戻し先はL10 functional-verification.mdの同じ番号のCASE群にある。CASEの実行結果やこの候補本文は受入済みを意味しない。

- **AC-OS-014-01 内部stage identity**（L2呼び方）: stage ID・対象scope・能力範囲を内部識別として一緒に保持し、public version/release identity、stage success、1.0到達を別状態にする。stage IDは外部tagから推測しない。外部公開とWeb提供はstage成立から推定せず、既存の別判断に残す。
- **AC-OS-014-02 同じpack体系と必要な安全依存**: 別系統の簡易実装を作らず、HARNESS-L2-010/011の同じpack体系からstageを組み、次の段階では必要に応じてそのpackを追加・更新する。pack/dependency identity・契約/成果物版・入力/出力・required dependency・verification scope/oracle・所有・収載/除外を照合する。HARNESS-L2-022の適用対象evidence契約、INFRASTRUCTURE-L1-017/018のbackup/restore（それらのoperationがscopeにある場合）、L1-019のrollback compatibility/procedure、L1-020の独立復旧、L1-022の宣言済み実行環境identity/構成を、それぞれ対応operationに限って照合する。SECURITY-L2-005 credential-use、L2-008 operation authorityはその操作に必要な範囲で扱う。L2-006 egressは明示scope内に実際のnetwork送信operationがある場合に限り、L2-016 classification recordは、明示されたnetwork送信operationがL2-006のdata classification inputを使う場合だけその入力sourceとして参照し、それ以外はstage一般のegressまたはasset classification条件を追加しない。安全依存のmissing/unknown/stale/conflictは成立を保留して該当ownerへ返し、必要な安全依存が揃ったstageに対して選択されていない無関係機構の完成を追加条件にしない。人による実施も同じ依存closureを満たす必要がある。
- **AC-OS-014-03 限定範囲でも仕事が一周する**: 宣言範囲で要求確認→作業→検証→結果記録の各工程と依存・出力がつながる。自動でない工程は担当者と担当内容を明記し、人の判断を生成・代替しない。小さい範囲であることは未接続の機能を並べる理由にならない。
- **AC-OS-014-04 一組として保存・再現**: pack/dependency identityと版、configuration、data format、対応環境、capability/limitation、scope内受入evidence、更新・rollback条件を同じrevision-bound tupleへ結ぶ。source tag単独をstageとしない。
- **AC-OS-014-05 案件data・secret・credentialの分離**: stage素材とfixtureは合成dataだけを使い、実案件data、secret値、credential値を含めない。それらのbackup/migrationは別scopeの参照にとどめ、stage artifact/evidenceへ同梱しない。
- **AC-OS-014-06 次段階の構築・検証と復帰**: stable prior stageを次段階の構築基盤として使い、priorの構成・artifactを保持して次stageを構築・検証する。検証後に切り替える際も案件stateとrecordのidentity/value/historyを引き継ぐ。切替後に問題があればprior stageの構成・artifact/configurationへ戻す一方、案件state/recordは切替後の現在のidentity/value/historyを引き継ぎ、prior時点の案件checkpointで更新を巻き戻さない。prior構成の保持、forward cutover時のstate/record継承、rollback時の構成復帰、rollback時のstate/record継承を別々に照合する。
- **AC-OS-014-07 自己依存のない起動・更新・復旧**: stageが開発中tree、次stage、別の稼働stage、または未宣言dependencyなしに起動・更新・復旧できることを宣言済みdependency graphと対応環境から確かめる。段階を細かく分けて隠れた自己依存を検出し、除去した後のdependency graphと復旧経路を確認する。graph上の参照だけからruntime dependencyを推測しない。
- **AC-OS-014-08 stage・pack・1.0の判定分離**: pack単体success、stage scope acceptance/integration/update/rollback/operation evidence、1.0到達判断を別identity/stateで保持する。stage提供を理由に最終要求やstage内必要品質を減らさない。範囲の限定だけを記録する。
- **AC-OS-014-09 ownership boundary**: OS/HARNESS/INFRASTRUCTURE/SECURITYの対象句と証拠をそれぞれのownerへ結び、対象製品のHARNESSサービス⑥releaseとHELIX自身のstage releaseを分ける。ownerを決められない未指定caseはunknownとして既存親へ戻し、新ownerを作らない。
- **AC-OS-014-10 未成立能力・INFRA-023の境界**: 未成立能力をcapability setの「できないこと」とし、必要な人手工程を記録する。人の分担は必要な安全条件・authority不足の免除にならない。INFRASTRUCTURE-L1-023の後続能力を必須にせず、stage対象や1.0へ前倒ししない。
- **AC-OS-014-11 旧source差分**: 固定L2で保持したFRS-BR-008の内部利用意味、FRS-BR-009の安全依存閉包と組合せ検証を現在のHARNESS/INFRA/SECURITY契約から再導出する。POが外した旧CI先行利用・wait/rerun metricと保留したCursor限定委譲を復活させず、Lite/Full名や旧CI/runtime/test identityも移さない。

### 親句別旧source disposition

旧要求の項目別起点はsource pinと[本件の不変source・pair監査記録](../../governance/audits/requirement-registration/os-stage2b-014-repair02-2026-10-05.json)、および[review01訂正監査](../../governance/audits/requirement-registration/os-stage2b-014-review01-repair-2026-10-05.json)に保持する。以下の「再利用」は形式・意味の起点を指し、旧IDや実装の再利用ではない。

| 固定L2句 | 旧sourceの項目 | dispositionと差分 |
|---|---|---|
| 014 呼び方・版の分離 | FRS-BR-008内部利用、distribution L3/L10の対象artifact版 | 内部段階と外部配布を分ける意味を再導出。旧profile、channel、public package版を置換し、1.0と外部公開を分離するPO判断を保持。固定L2:623のWeb提供も段階とは別判断に残す。 |
| 014 pack体系・安全依存 | FRS-BR-009安全依存閉包、FRS-R-23/24とFRS-AC-025/026 | 必要dependencyと組合せevidenceを再導出。現HARNESS-010/011/022および選択操作に該当するSECURITY/INFRA契約へ対応付け、次stageでは同じpack体系のpackを必要に応じて追加・更新する。必要安全依存の欠落はfail-closeし、無関係機構の完成は条件にしない。旧CI・旧pack schemaは置換。 |
| 014 狭い一周と担当 | 旧FRS-BR-008「正式配布前の内部利用」 | 内部stageで狭い作業を一周する意味を再導出。旧CI先行利用の具体化はPOにより除外。人の分担は追加承認へ変えない。 |
| 014 stage一式 | distribution L3構成再現・受入条件、対応ST-DIST L10 | configuration/evidence/update/rollbackを束ねる考えを再導出。旧manifest schema/Node/CLI/PowerShellを移さず、現行tuple項目を使う。 |
| 014 data/secret/credential | distribution L3の対象物境界とpaired ST-DIST-002のDB/state/memory/credential/PII/path混入拒否（旧distribution L3:24–39、旧L10:24–25）。backupは旧distribution sourceに記述なし。 | 分離条件を保持し、値を含まない合成fixtureへ再導出。固定L2:627とINFRASTRUCTURE-L1-017〜019をbackup・移行の現行根拠とし、実data/credential、顧客artifactを持ち込まず、SECURITY ownerを保持。旧distributionの記述をbackup要件の根拠として使わない。 |
| 014 prior→next/rollback | FRS-BR-009組合せ更新とdistribution rollback evidence | prior状態・case state継承を再導出。旧配布対象/手順へ固定せず、INFRA-017/018/019との境界を明示。 |
| 014 self-dependency | FRS-R-23/24 recovery/dependency conditions、旧distribution recovery | 独立起動・復旧を保持し、現INFRA-020/022とHARNESS-010の宣言dependencyで再導出。旧runtimeの構成を移さない。 |
| 014 acceptanceと1.0分離 | FRS-BR-009の統合検証 | pack / stage / 1.0の判定分離を再導出。旧CI green/test合格を証拠にしない。 |
| 014 owners | FRS-BR-009 safe dependency responsibility、distributionの対象製品境界 | 現固定L2のOS/HARNESS/INFRA/SECURITY分担を保持。旧package distribution ownerをOSへ混同せず、HARNESSサービス⑥と区別。 |
| 014 未成立能力・023 | PO 9/27 stage-release decisions、旧FRSの先行利用意味 | 能力限界を明示する親意味を保持。L1-023の後続版扱いと不前倒しを厳密に保持し、旧段階導入語彙を追加しない。 |
| 014 FRS処分 | FRS-BR-008/009と旧stage acceptance | 固定PO処分どおりcarried 5 atomsとCursor pending atomを分ける。旧CI利用/wait/rerunを除き、旧IDを現行要件へしない。 |

旧共通L3定義148–168はFR/ACと受入の対応形式、旧共通L10 process 162–170および195–207は検証case形式の比較起点である。旧README（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/README.md:38–41`、`LEGACY-ASSET-9A772391C7FB1298D45F`、source full SHA-256 `949b0da00d2a417e1b36d3679b89735de7adadf831f567dbe383dfe6337f19e4`）が示すL3→L12配置と旧L10 processのL3↔L10対応差は固定sourceの差として保持し、現行層対応は現行L3/L10の6 canonical文書に従う。旧定義の163–165 `engineering_discipline_required`、G3/L12 gate、旧runtime/test/CIは移植しない。
