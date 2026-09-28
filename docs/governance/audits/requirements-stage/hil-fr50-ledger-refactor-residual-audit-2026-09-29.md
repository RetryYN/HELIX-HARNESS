# HIL-FR-50 台帳リファクタリング残差監査（2026-09-29）

基準main: `b72399eef5c3e6745a0769d1578420b8583c2814`。本書はHIL-FR-50の旧原文・旧受入設計と、現行HARNESS／OS要求・受入の限定照合である。要求の採択・変更、候補の採択、実装・実行、HIL-FR-50全体または要求ステージの完了を生成しない。旧sourceは読取りのみで、旧test・runtimeは実行していない。

## 旧sourceと受入設計

| 資産 | path・行 | file SHA-256 | 行SHA-256 | 記録 |
|---|---|---|---|---|
| 旧L1要求 | [`infinity-loop-platform-requirements.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md):140 | `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb` | `9d9c14e1dac400ad6cf1cacdd6a54d82d4a09374d128af2ba3036652655fde54` | `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`, `requirements.json#/HIL-FR-50` |
| 旧operational acceptance | [`L1-infinity-loop-operational-test-design.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L1-infinity-loop-operational-test-design.md):74 (`HOT-HIL-47`) | `4f8f67664e360dcb8b40f9c834953d026c9bf3b359a79a64e68fa2296689e576` | `adfcfa83affc9b2daac49075154862a6144ae8f9418d0721cf9fb4471102e25f` | `LEGACY-ASSET-AFE91778057B7E76BEEC` |
| 旧system acceptance | [`L9-infinity-loop-platform-system-test-design.md`](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/helix/L9-infinity-loop-platform-system-test-design.md):60 (`HST-HIL-033`) | `e518b0cfe15ca4b999bd85120b8d74941a18ab0939ff6cda3dc20a8b7611b705` | `ca599ca3e09d84e2471daa427ba39ba13e91901a8e3371313e192efdb1489d2b` | `LEGACY-ASSET-8CEC5559B69B216F7CCF` |

旧FR-50は、layer ledgerの重複・責務混在・semantic/name collision・変更波及・孤立edgeを比較し、externalize/commonize/objectize/semantic-rename/split/mergeの候補を作る能力を記述している。behavior-preservingな変更をDesign Refactorへ送る前に、全上下・左右consumer、前後oracle、pair維持、rollbackを揃える。要求・公開contractの意味変更はRedesignへ、永続state変更はRetrofitへ返す。

HOT-HIL-47はledger重複、責務混在、semantic/name collision、孤立edgeと、pair／behavior／public／DB差分を個別に入力し、pairとoracleを保つ最小変更だけをDesign Refactorへ送る。HST-HIL-033はexternalize/commonize/objectize/rename/split/merge、pair破壊、behavior/public/DB変更を個別に入力し、契約変更をRedesign、state変更をRetrofitへ送り、rollback欠落を拒む。両caseの「設計済み／未実装」は旧testの実行結果を示さない。

## 現行authorityと責務

2026-09-28のHARNESS判断記録は、対象L2/L11 bytesをそれぞれSHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` と `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` に固定し、L2/L11一式と明示24候補を採用した。判断記録は[ここ](../../decisions/helix-harness-requirements-po-decision-2026-09-28.md)。現在の本文は後続追補を含むため、固定判断のauthorityを現行全文へ無条件に拡張しない。

- **HARNESS-L2-003/004** は、意味を保つ変更を右側で扱い、意味変更・public contract等を適切な左側へBackflowする。refactorがpublic contract・要求・architecture・stateの意味を変えない境界、Scoped Reverse、通常照合と独立した構造改善のticket化も記す（[L2 rows 105–115](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-003)）。対L11は一般的なrefactor routeと反例を確認するが、layer ledger専用の全consumer/pair/rollback receiptは列挙しない（[L11 row 211](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-016)）。
- **HARNESS-L2-016** のL2/L11候補revision `MPR-RC-HARNESS-L2-016-004` は同HARNESS判断記録の明示24候補に含まれ採用済みである。L2ではリファクタリング単体（row 330）を、L11では振る舞い・契約・要求を保つrefactor、意味変更時のBackflow、性能baseline/regressionを要求する。L11本文は正常・不合格条件を定めるが、FR-50固有のledger restructure receiptは定めない。
- **HARNESS-L2-042** は旧v1.3のDesign Refactor判定とepisode分離から別途導出され、2026-09-29の[57候補判断](../../decisions/po-decision-2026-09-29-57candidates.md)で`MPR-RC-HARNESS-L2-042-001`が採択された（L2節digest `sha256:7da6b3394cbc96bdf028a4738000554e1cf7a946595c4abf43504b24968f34eb`、L11節digest `sha256:3ba00726800c61f1de165e48e6f62ea4359a368a50a9e9cd1517deb09df395f9`）。042はsemantic similarity、consumer、oracle、dependency graphによるDesign Refactor判定と機能追加のepisode分離を扱う（[L2 042](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-042)、[L11 042](../../../helix-harness/L11-acceptance/product-acceptance.md#harness-l2-042)）。042はFR-50の旧atomをsourceとしていないため、FR-50のformal successorまたは全条件の代替と扱わない。
- **HARNESS-L2-048** はO9由来の未採択命名・safe rename候補である。直接入力は旧HIL-FR-40等の選択17 spansに限り、HIL-FR-53 line 143と残余条件を明示的にholdingへ残す（[L2 048 source boundary](../../../helix-harness/L2-requirements/product-requirements.md#harness-l2-048)）。この候補は旧FR-50のlayer-ledger refactorを所有せず、名前が似ること、rename語の共通性からFR-50の被覆・後継を推定しない。
- **HELIX-OS** はauthority/source/revision/projectionとwriter operationの実行記録を持つ。HELIXOS-L2-015/016/019の既存責務に加え、採択済みHELIXOS-L2-038 revision -001はHARNESSが定めるlayer/template意味を入力としてwriter・snapshot・appendを運転するが、ledgerの意味、候補の妥当性、HARNESSのadmissionを決めない（[L2-038](../../../helix-os/L2-requirements/governance-requirements.md#helixos-l2-038)、57候補判断のrevision）。現行038 revision -002追補は未採択で、FR-46/47のwriter negative outcomesを対象にする。FR-50のsemantic classificationやDesign Refactor判定をOSへ移さない。
- **HELIX-BRAIN** の役割語彙候補は再利用知識をHARNESS-COREへ返すにとどまり、製品固有の命名decision、consumer一覧、test oracle対応、renameを所有しない（[BRAIN requirement](../../../helix-brain/L2-requirements/brain-requirements.md)、590–594行）。本FR-50 auditはBRAINへ意味ownerを移さない。

## 条件ごとの照合

| HIL-FR-50の条件 | 現行で確認できる意味 | 残る差分 |
|---|---|---|
| ledger重複、責務混在、semantic/name collision、変更波及、孤立edgeの検出・比較 | 042は意味類似性・consumer・oracle・dependency graphを比較する。016は契約・要求を保つrefactorを扱う | これら5種のlayer-ledger-specific triggerを別々に評価し、ledger diff/findingへ出す条件は現行L2/L11にない。042の汎用比較から旧5種を実装済み扱いしない |
| externalize/commonize/objectize/semantic-rename/split/merge候補 | 042は統合・共通化判定のsemantic basisとrefactor routeを持つ。048は命名と限定safe renameを扱う | 旧操作集合に対するledgerのidentity、候補・差分、split/merge relationを記録するL2/L11 oracleは未特定。048のO9限定scopeをFR-50へ広げない |
| 全上下・左右consumer、前後oracle、pair維持の確認 | 003/004/016/042はpair・oracle・consumerを複数の工程／候補の責務として含む | 旧caseが求める一つの変更scopeに対するconsumer全体、前後oracle、全pair保存の集約receiptと不足時rejectは、確認した現行L11で明示されない |
| behavior-preserving変更だけDesign Refactorへ通す | 003/004/016/042は意味を保つ変更と意味を変えるBackflowを分ける | 上記ledger-specific impact/pair evidenceが欠けた状態で、判定を未評価に保つ／Design Refactorを成功にしないoracleは具体化されていない |
| 要求/public contract変更はRedesign、persistent state変更はRetrofitへ | 003/004のBackflowと042の意味変更routeが上流authorityを保護する。旧L2 row 105はFR-50 routeを記載する | Design RefactorからRedesignとRetrofitへ振り分ける全般の根拠はあるが、layer ledger candidateでpublic contract／persistent state差分を各々与えたFR-50専用negative caseは未確認 |
| rollbackの証拠 | 016は失敗時の適格版への戻し等の一般境界を持つ。042は比較・判定を持つ | layer-ledger refactor単位のrollback plan/receipt欠落拒否と変更前状態へ戻す追跡は、FR-50に結ぶL11 caseで明示されない |

したがって、現行はrefactorの大枠（意味保存、上流Backflow、Design Refactor判定、性能条件）を保持する一方、FR-50固有のlayer-ledger候補生成・総impact/pair確認・rollback受入を弱めている。これは旧runtime/API移植の要否ではなく、要求・受入に旧caseの必須条件が具体化されていないという限定所見である。

## 次の候補化範囲

次に作成側が要求候補を起草する場合は、HARNESS-L2-003/004/016と採択済み042を前提に、FR-50専用のlayer-ledger trigger、候補差分、対象scopeの上下左右consumerとbefore/after oracle、pair保存、Design Refactor／Redesign／Retrofitへのroute、rollback証拠の欠落時に未評価または不成立とする条件を対L11で具体化する。042の採択revisionは変更せず、FR-50 line 140をこの候補の直接sourceとして登録し、そのsource atomだけの範囲・保持・差分を新しいreceiptへ結ぶ。HARNESSが意味判定を担い、OSは別途有効な操作authorityの下で実行・保存・projectionを行う。操作名や既存の一般条件を新しい承認手続きへ変換しない。

候補の所属・kind・`version_target`はこの監査だけでは確定しない。既存L2-016のrevision更新か、042と並ぶ別unitかを候補起草時にparent/責務と併せて明示し、既採択bytesのauthorityを追補へ自動継承しない。L3設計で固定する技術実装・データ形式と区別する。

## 範囲外と未完了

- HIL-FR-51（Authoring Admissionの操作結果区分）、FR-52（複数資産canonical更新）、FR-53（asset identity/revisionとrename・move・split・merge・supersede）、FR-54（portfolio coverage）、FR-55（template example coverage）は本監査のcoverage主張から明示的に除外する。特にFR-54/55とHARNESS-L2-044/043の候補・受入を再監査しない。
- 現行の旧要求crosswalkはHIL-FR-50に`semantic_residual_unaddressed`、formal successor `unassigned`を記録する（[`legacy-ir45-remaining-disposition-2026-09-28.json`](legacy-ir45-remaining-disposition-2026-09-28.json) のHIL-FR-50 record）。本監査は残差の一部を現行042・016・048と分けて限定し直すが、register/receiptの訂正やformal successor assignmentを行わない。
- 旧IR全体、HIL-BR-25、HIL-NFR-29の全条件、旧HAC/HAT、legacy candidate母集団、旧実装、受入実行、正式なFR-50後継割当、全旧source無損失を閉じない。要求ステージの終了判断にも使わない。
