# 設計・実装検証の品質保証定義（L3〜L10）

status: active_governance_definition
authority_effect: none

## 1. 目的・置き場所の選定理由・境界

本書は、PO指示②「設計TDD整理＋設計検証用CI」（[#3510 comment 6324741206](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6324741206)）および2026-10-28のPO指摘「品質保証どうやってるのか謎だし、そもそも定義してないから馬鹿みたいに巨大JSONになったんじゃないの？」「いつまで手書きするものを増やし続けるの？」（[#3510 comment 6457411605](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6457411605)）を受け、L3〜L10の各層における**合格条件**、**検査手段（機械判定／人の判断）**、**持ち物上限（[#3510 comment 6408252809](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6408252809)）を超えたときに止める検査**、および**手書き凍結記録の廃止とchecker出力への移行境界**を定義する。

- **置き場所の選定理由**: `docs/governance/` 配下は、[上流authority状態モデル](authority-state-model.md)、[GitHub上流運用モデル](github-upstream-operating-model.md)、[旧資産の完全一致再利用統制](legacy-asset-reuse-control.md)、[テンプレート作業の分担と読取り入口](template-work-allocation.md)のように、リポジトリ横断で現在の意味を持ち更新され続ける統制・運用定義を版番号（`_vN`）や日付を付けずに置く正本ディレクトリである（[AGENTS.md](../../AGENTS.md)「再構築の原則」第6項）。本定義も後続のchecker実装・運用更新で同じファイルを更新し続けるため、`docs/governance/design-verification-quality-assurance.md` を正本とする。
- **境界**: 本書は既存の承認済み要求・判断記録・統制決定を検査仕様へ対応付ける定義であり、新しい承認gate、必須status check、一律のKB容量上限、または要求意味の変更を作らない。checkerおよびworkflowの実装自体は後続依頼で行う。

---

## 2. 起点の確認（旧HELIX・現行判断記録・失敗事例）

### 2.1 旧HELIXの起点（`archive/legacy-generation-2026-09-14/`）

| Asset ID | 旧path・参照行 | SHA-256 | 起点とする内容 |
|---|---|---|---|
| `LEGACY-ASSET-DA012A9B04D5BE9419CE` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md`（`27-90`行） | `65400847881f1a72b273f0bdeff503a5ea302705cd0e71d7913fc7d0f8dd18fb` | work authorityと意味影響から必要なverification obligationを導出し、required verificationの削除・緩和・無記録先送りなしに`local`／`boundary`／`global_invariant`を検証する契約（`§0`, `CIS-R-04..08`）。 |
| `LEGACY-ASSET-79B70809D0A1EE2D5392` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-ci-performance-requirements.md`（`14-35`行） | `7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1` | PRでの影響検査（変更L、上下隣接、対応Vペア、trace consumer）とcorrectness／性能Recoveryの分離（`GH-NFR-009..011`）。 |
| `LEGACY-ASSET-08BD701EF2577835D9F7` | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md`（`19-40`行） | `0c5dd33f48710ae692c5ae71b63996f0ba2f8aab1af417cf33d5c02260c76c73` | 実装・test・計測事実をVモデル資産へ照合・backfillするReverse（`SR0..SR4`）、`pair_freeze_pass`、再発findingのdetector昇格（`SRV-FR-001..014`）。 |
| `LEGACY-ASSET-1C7E5C0B33364FBF9EC6` | `archive/legacy-generation-2026-09-14/root/.github/workflows/harness-check.yml`（`1-39`行） | `7c18b3f208886c443957f4cdbf919de77da233e6759007b8501624c054e7d099` | 旧世代のGitHub Actions集約check（PR・main push・nightly cron・Lite/Full lane）。 |
| `LEGACY-ASSET-68D46138F1FA40748C52` | `archive/legacy-generation-2026-09-14/root/docs/process/modes/reverse.md`（`1-50`行） | `459b0454d97a6d991be963703f20238e38f0eba6684b8035f067d54458032b83` | 右側のReverseが作るのは実装の説明書ではなく、次の変更を拘束できる最小契約であること（同`add-feature.md` §1.1 `LEGACY-ASSET-2B9358513E5A143AB960`も同旨）。 |

### 2.2 現行の判断記録・境界

| 文書path・参照行 | SHA-256 | 適用する既決方針 |
|---|---|---|
| [harness-v-valley-process-po-decisions-2026-09-26.md](decisions/harness-v-valley-process-po-decisions-2026-09-26.md)（`40-60`行、`62-92`行） | `650264f78387d317eb5dec7a58c14197ac2c97ef712f05cd30ce5e11869cd5ea` | PR前CIはticketとの関係（Forward小＝原子CI、中＝境界証明、大＝システム証明、触るconnector、変更種別）で決め、ticket範囲外の変更を止める。merge直後の全件実行・夜間補完はしない。下位の証拠を積み上げ、上位固有義務との差分だけを証明する（構成的保証と差分証明）。 |
| [required-outside-scope-pieces-po-decision-2026-10-22.md](decisions/required-outside-scope-pieces-po-decision-2026-10-22.md)（`58-80`行） | `85f3304aabe6d525dc92ac63dfd7bbef284b5afdc3ed66af514badf7b30b9136` | 10/12限定対象の進行において、全件CIやnightlyを初回条件として復元しない。 |
| [design-as-code-tdd-po-decision-2026-10-21.md](decisions/design-as-code-tdd-po-decision-2026-10-21.md)（`13-32`行） | `9077a70944946b5d5211ca785b0aaf82a298ffb3e5cb1b04690562a8e0c888c9` | 上位pairを根拠に独立期待・反例を先に定め（[DT-VT-105](../../scaffold/verification-test-template-seed-20261001/README.md)の同源化禁止）、不足を識別するRed・最小設計のGreen・意味保存のRefactorで進める。 |
| [.github/workflows/README.md](../../.github/workflows/README.md)（`1-7`行） | `f9aacf18ab16d324cb921302222fbc01bc6cf9296d6dc94d7068680db37e850c` | `.github/workflows/` へ新しいworkflowを置くのは、承認済みHARNESS検証契約と対象製品要求から新世代CIを導出した後に限る。 |

### 2.3 失敗事例の起点

1. **設計JSONの74MB肥大（[#3510 comment 6408252809](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6408252809)）**: V字の右側（L8/L9の照合設計）に、実装前のうちから全返却の期待・seed・RFC6902 COPY・hash・巨大fixture材料を書き込み、`docs/helix-brain` が74MB（L8副ファイル22MB、L9 11.8MB、L8本体7.2MB）に肥大した工程取り違え。
2. **L3義務要素の独立導出漏れ（[PR #3759 R1-m1](https://github.com/RetryYN/HELIX-HARNESS/pull/3759#issuecomment-6454875415)）**: `HARNESS-L3-009-B02`（`L3B#/requirements/5`）の義務「AI/言語/projectの差だけで必要な論点を恣意的に増減させない」のうち、「project差」が独立期待導出（`O1..O4`）とL8 probe対照から落ちたまま `blocking_a_count: 0` とした事例。
3. **非公開内部関数の公開関数凍結誤認（[PR #3763 R1-m1](https://github.com/RetryYN/HELIX-HARNESS/pull/3763#issuecomment-6455590289)）**: `L5#/functions` 外の `planned_private_symbol`（`_build_source_occurrence_array`、呼出し元未特定）を、凍結単位「公開関数1つ（`public_function`）」として記録した事例。
4. **手作業reviewの反復と手書き凍結記録の増殖（[#3510 comment 6457411605](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6457411605)、PR [#3761](https://github.com/RetryYN/HELIX-HARNESS/pull/3761#issuecomment-6455302679)・[#3764](https://github.com/RetryYN/HELIX-HARNESS/pull/3764#issuecomment-6455979090)・[#3765](https://github.com/RetryYN/HELIX-HARNESS/pull/3765#issuecomment-6456141958)・[#3766](https://github.com/RetryYN/HELIX-HARNESS/pull/3766#issuecomment-6456230390)・[#3767](https://github.com/RetryYN/HELIX-HARNESS/pull/3767#issuecomment-6456510337)・[#3768](https://github.com/RetryYN/HELIX-HARNESS/pull/3768#issuecomment-6456603937)・[#3769](https://github.com/RetryYN/HELIX-HARNESS/pull/3769#issuecomment-6456918326)・[#3770](https://github.com/RetryYN/HELIX-HARNESS/pull/3770#issuecomment-6457224318)）**: 各層の合格条件と機械検査が未定義だったため、pin SHA-256再計算、JSON Pointer解決、L4↔L9↔L8↔L5負例7属性一致、L3義務要素のpointer割付け、公開関数vs private detail区分、L8への材料混入検査、`scfctl stale=0`、unit test実行とmutation KILL確認を統制レーンが毎回手動で回し、1件200行前後の凍結記録を手書きで増やし続けた失敗。

### 2.4 旧HELIXからの保持点・変更点・理由

- **保持点**: 要求・設計・V-pair・traceの双方向整合（`LEGACY-ASSET-DA012A9B04D5BE9419CE`）、未知影響や欠落のfail-close、反例先行と契約からの独立期待導出（`DT-VT-105`）、右側のScoped Reverseが実装説明書ではなく次の変更を拘束する最小契約を作ること（`LEGACY-ASSET-68D46138F1FA40748C52`）。
- **変更点**:
  1. CIの起点を変更diffからの全量/固定段数推測ではなくticketとの関係（Forward小/中/大、対象V-pair、触るconnector）へ移し、`harness-check.yml` のようなmerge直後全件実行・nightly cron補完を廃止する（`HDEC-HARNESS-V-VALLEY-2026-09-26:40-60`）。
  2. L8/L9へ実装前に全返却・seed・COPY・hash・巨大fixtureを持たせることを禁じ、それらをL7（test code）のみに限定する（`#3510 comment 6408252809`）。
  3. 凍結の単位をchild全体から「公開関数1つ（L6の表1行）＋対のL8 case行＋担うL3義務」へ下げ、機械判定項目は手書きせずcheckerの出力から生成する（`#3510 comment 6457411605`）。
- **理由**: 実装前の右側（L8/L9）への材料書込みによる74MB肥大と、手書き凍結記録・手作業reviewによる開発停滞を防ぎ、HARNESS009・BRAIN032・OS002の接続確認と実装を前に進めるため。

---

## 3. L3〜L10 各層の品質保証定義（合格条件・検査手段・持ち物上限検査）

| 層（V-pair） | 持つもの（`6408252809`の上限） | 合格条件 | 検査手段：機械判定（Section 4の検査ID） | 検査手段：人の判断（独立意味review／PO判断）と機械化できない理由（1行） | 持ち物上限を超えたときに止める検査（機械判定） |
|---|---|---|---|---|---|
| **L3 要件**<br>（↔ L10） | 義務のID・文・受入条件 | 親L2（合意済みrevision）の範囲内で義務ID・文・受入条件が定義され、対L10 caseと1対1双方向に結ばれ、`source_pins`のSHA-256とJSON Pointerが全件解決すること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-SCFCTL-FORMAT` | **判断**: 親L2・Concept・七大原則・旧sourceからの意味欠落有無とL2意味変更の識別（委任承認review／L2変更時はPO）。<br>**理由**: 自然言語の上流要求からどの義務節が必要十分でどれが要求意味の変更かを構文一致だけでは判定できないため。 | `CHK-OWNERSHIP-CAP-L3L6`: L3要素内に内部実装手順・関数algorithm・具体test fixture・全返却JSON・実行レシピキーが含まれた場合にFAILとして止める。 |
| **L4 基本設計**<br>（↔ L9） | 流れ、境界と所有者の責務分離、公開の型と返却の形、分岐の順序・決定表 | 上位L3の義務を漏れなく受け、owner境界・公開型・分岐順序・`negative_classifications`が定義され、対L9 `cases`と双方向1対1に結ばれ、全pointerが解決すること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-NEG-4WAY-MATCH`<br>`CHK-SCFCTL-FORMAT` | **判断**: 機構間（CORE/OS/BRAIN/CONNECT/SECURITY）の責務切り分けと分岐決定表のアーキテクチャ妥当性。<br>**理由**: 境界設計が他ownerの責務を侵していないか、未知の境界障害モードを網羅しているかは意味理解を要するため。 | `CHK-OWNERSHIP-CAP-L3L6`: L4内にprivate実装コード、具体test fixture、全返却期待JSON、RFC6902 COPYレシピ、固定source参照以外のhash束が含まれた場合に止める。 |
| **L5 詳細設計**<br>（↔ L8） | 関数ごとの契約（schema、事前・事後・不変条件、失敗とfail-close、端の値、順序） | 公開関数（`L5#/functions/*`）ごとに入出力型・事前/事後/不変条件・algorithm・`failure_rules`（副作用0・axis・state・owner）が定義され、担うL3義務要素（`O1..On`）とL8 `unit_case_refs`／`oracle_ref`へ漏れなく結ばれ、経路上A残件が0であること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-NEG-4WAY-MATCH`<br>`CHK-PUBLIC-FN-FREEZE`<br>`CHK-L3-OBLIGATION-MAP`<br>`CHK-SCFCTL-FORMAT` | **判断**: L3義務文の要素分解（`O1..On`）に自然言語上の論点抜け（例：`#3759 R1-m1`のproject差）がないか、経路外残件のA/B/C仕分けと戻し先が妥当か。<br>**理由**: 自然言語のL3義務文から意味上の論点を漏れなく切り出せているかは、分解宣言後のpointer存在確認だけでは判定できないため。 | `CHK-OWNERSHIP-CAP-L3L6`: L5内にtest用合成fixture本体、全返却期待JSON、RFC6902 COPYレシピ、実行時hash束が含まれた場合、またはprivate詳細を公開関数として凍結した場合に止める。 |
| **L6 機能設計**<br>（↔ L7） | 公開関数の表（関数→契約1行）と、状態・eventの意味 | 凍結済みL5公開関数と1対1に対応する公開関数表（関数symbol→L5契約pointer・L8 oracle pointer・L7 test pointerの1行）と状態・eventの意味のみを持ち、同revisionのL7と双方向に結ばれていること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-PUBLIC-FN-FREEZE`<br>`CHK-SCFCTL-FORMAT` | **判断**: 状態・eventの意味定義がL4/L5の契約境界を逸脱・緩和していないか。<br>**理由**: 状態遷移やeventの意味記述が上流契約の意図を保っているかは文脈照合を要するため。 | `CHK-OWNERSHIP-CAP-L3L6`: L6に1行契約表と状態/event意味を超えるアルゴリズム長文再掲、具体fixture、全返却期待値、実行ログが含まれた場合に止める。 |
| **L7 機能検証**<br>（↔ L6） | test code。fixture・全返却・hash・直列化はここだけ。Redを先に観測し、実装でGreen | 凍結済みL5/L8/L6契約に対し、本体変更前に意図した欠陥を検出するRed実観測と最小実装によるGreen実観測が記録され、全unit testがPASSし、対象変更の最小mutationがKILLEDとなること。 | `CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-L7-TDD-MUTATION`<br>`CHK-SCFCTL-FORMAT` | **判断**: test assertionが実装出力の丸写し（`DT-VT-105`違反の同源化）でなく独立対照で組まれているか、本体差分が設計範囲内か。<br>**理由**: testが実装結果をそのまま貼ったトートロジーか契約の独立検証かは、testのPASS/FAILだけでは区別できないため。 | `CHK-L7-TDD-MUTATION` & `CHK-SCFCTL-FORMAT`: L7が対象外の未凍結関数や上流authority意味を変更した場合、またはRed観測なし／mutation生存（SURVIVED）の場合に止める。 |
| **L8 単体検証設計**<br>（↔ L5） | U-ID表（対象、反例と期待結果、oracle ID、test citation）だけ。全返却・seed・COPY・hashは持たない | L5の各公開関数・`failure_rules`およびL9基本branchに対応するU-ID行（対象、1.5KB未満の最小反例と期待文、oracle ID、test citation）が揃い、L4↔L9↔L8↔L5の負例7属性が完全一致し、L5と独立に期待が導出されていること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-NEG-4WAY-MATCH`<br>`CHK-PUBLIC-FN-FREEZE`<br>`CHK-L3-OBLIGATION-MAP`<br>`CHK-OWNERSHIP-CAP-L8L9` | **判断**: U-ID行の期待結果・反例がL5実装手順の言い換えでなく上位L3/L10・L4/L9から独立導出（`DT-VT-105`）されているか。<br>**理由**: 期待文がL5アルゴリズムの写しか独立導出された検証条件かは、文章の意味比較が要るため。 | `CHK-OWNERSHIP-CAP-L8L9`: L8内に禁止材料key（全返却・`seed`・`fixture_patch`・`same_invocation`・`rfc6902_*`・`literal_materialization_contract`・`typed_execution_trace`・固定source参照以外の`*_sha256`）または1.5KB超の反例オブジェクトが存在する場合に即座にFAILとして止める。 |
| **L9 結合検証設計**<br>（↔ L4） | 実行境界とsystem oracle一覧（番号付きの性質）だけ | L4の各契約・境界・`negative_classifications`および基本branchに対する実行境界と番号付きsystem oracle一覧（性質・反例・期待観測・戻し先）が1対1に揃い、全pointerが解決すること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-NEG-4WAY-MATCH`<br>`CHK-OWNERSHIP-CAP-L8L9` | **判断**: system oracle一覧がL4の結合観点（interface、依存方向、state所有、transaction、失敗伝播、冪等性等、`HARNESS-L3-003-F03`）を実質的に検証できる性質になっているか。<br>**理由**: 番号付き性質の文面が結合境界の欠陥を検出する十分な強度を持つかは意味評価を要するため。 | `CHK-OWNERSHIP-CAP-L8L9`: L9内に全返却・seed・COPY・fixture材料・固定source参照以外のhash束、または1.5KB超の反例payloadが存在する場合に即座にFAILとして止める。 |
| **L10 総合検証設計**<br>（↔ L3） | L3義務ごとのoracle IDと成功条件・反例 | L3の全要件行（`requirements/*`）と1対1に対応する`cases/*`を持ち、各行にoracle ID・`positive_input`・`expected_observation`（成功条件）・`negative_input`（反例）・`failure_observation`が揃っていること。 | `CHK-PIN-SHA256`<br>`CHK-JSON-POINTER`<br>`CHK-PAIR-BIDIR-ID`<br>`CHK-OWNERSHIP-CAP-L3L6`<br>`CHK-SCFCTL-FORMAT` | **判断**: 成功条件と反例がL3義務の抜け道（見かけ上の成功や部分成立による全体合格）を塞いでいるか（委任承認の独立意味review）。<br>**理由**: 反例が要件の本質的な失敗条件を突いているかは自然言語の意味照合を要するため。 | `CHK-OWNERSHIP-CAP-L3L6`: L10内に具体実装手順・内部関数名・合成fixture本体・全返却JSON・固定source参照以外のhash束が含まれた場合に止める。 |

---

## 4. 機械判定項目の詳細仕様（後続checker実装の入力契約）

後続依頼で実装する設計検証checkerは、以下の8検査（`CHK-*`）をそのまま関数・CLI検査項目として実装する。

| 検査ID | 対象path / JSON Pointer（入力） | 判定ロジック（Pass条件） | 失敗時の構造化出力（JSON） |
|---|---|---|---|
| `CHK-PIN-SHA256` | 対象JSON内の `pins`、`source_pins/*`、`source_basis/*`、`basic_design_ref`、`removed_materials`、`docs/governance/audits/tdd/removed-materials-index.json` | 参照される各 `path`（`revision` 指定時は `git show <revision>:<path>`、未指定時は作業ツリーまたは指定base/head commit）のUTF-8 bytes SHA-256（および指定時はcanonical JSON SHA-256）が記録値と完全一致すること。 | `{"check": "CHK-PIN-SHA256", "file": "<path>", "pointer": "<ptr>", "target_path": "<target>", "revision": "<rev>", "expected_sha256": "<hex>", "actual_sha256": "<hex>"}` |
| `CHK-JSON-POINTER` | 対象JSON内の全RFC6901 pointer（`#/...`、alias付き `L3F#/...`、`{"path": "...", "pointer": "/..."}`） | 全pointerが対象JSON（またはpin済み `revision:path`）上で実在nodeへ解決すること（文中の説明用範囲表記 `0..N` は展開して全index解決を確認）。撤去済み副ファイルへの `revision` pinなし参照が0件であること。 | `{"check": "CHK-JSON-POINTER", "file": "<path>", "source_pointer": "<ptr>", "target_file": "<target>", "target_pointer": "<tptr>", "error": "unresolved_pointer_or_unpinned_removed_file"}` |
| `CHK-PAIR-BIDIR-ID` | `L3#/requirements/*`↔`L10#/cases/*`、`L4#/contracts/*`↔`L9#/cases/*`、`L5#/contracts/*`↔`L8#/cases/*`、`L6`↔`L7`、およびL8 `/completion/*` | 対の配列間で `id`・`requirement_ref`・`oracle_ref`・`paired_oracle_ref` が1対1双方向に一致し、孤立・片方向・重複IDが0件であること。かつ `/completion/*` 等の件数メタデータが実配列長と一致すること（`#3759 R1-i2`対策）。 | `{"check": "CHK-PAIR-BIDIR-ID", "left_path": "<p1>", "right_path": "<p2>", "pointer": "<ptr>", "error": "missing_reverse_link|duplicate_id|count_mismatch", "expected": "<v1>", "actual": "<v2>"}` |
| `CHK-NEG-4WAY-MATCH` | 対象childの `L4#/contracts/*/negative_classifications/*`、`L9#/cases/*/negative_cases/*`、`L8#/cases/*/negative_cases/*`、`L5#/failure_rules/*` | 4層間で負例件数が一致し、各負例の7属性（`change`↔`condition`、`expected_classification`↔`code`、`expected_axis`、`expected_state`、`expected`、`expected_preserved`、`backflow_owner`）、`side_effect_count == 0`、および `integration_case_ref`／`rule_ref`／`function_ref` が完全一致すること。 | `{"check": "CHK-NEG-4WAY-MATCH", "case_id": "<id>", "attribute": "<attr>", "L4": "<v4>", "L9": "<v9>", "L8": "<v8>", "L5": "<v5>"}` |
| `CHK-PUBLIC-FN-FREEZE` | 凍結宣言の `public_function` 行・`private_detail_contract_pair` 行、`L5#/functions/*`、L8対応行 | ① `public_function` は必ず `L5#/functions/*` 上の非private関数（`visibility != "private"` かつ `planned_private_symbol` でない）を指し、`unit_case_refs` 全件と `oracle_ref` がL8の実在U-IDへ解決すること。② `L5#/functions` 外の副節や `private`／caller未特定の関数は `private_detail_contract_pair` とし、結線先公開関数または戻し先（`owner`, `reentry_slice`）が必須（`#3763 R1-m1`対策）。 | `{"check": "CHK-PUBLIC-FN-FREEZE", "symbol": "<sym>", "l5_pointer": "<ptr>", "visibility": "<vis>", "error": "private_or_non_function_frozen_as_public|unresolved_unit_case_ref|missing_reentry_owner"}` |
| `CHK-L3-OBLIGATION-MAP` | 凍結宣言の `l3_obligation_decomposition`（`O1..On`）、L9 `branch_oracles`／`independent_branch_expectations`／`unobserved_branches`、L8 U-ID行 | ① 各 `Oi` が空でない実在 `l5_pointers` と `l8_pointers` を持つこと。② 当該関数経路上の未解消A残件数 `blocking_a_count == 0` であること。③ 対象L9の全基本branchがL8のU-ID行（または明示C戻し先）から参照され未収載branchが0件であること。 | `{"check": "CHK-L3-OBLIGATION-MAP", "item_id": "<Oi_or_branch>", "error": "empty_l5_or_l8_pointers|unreferenced_l9_branch|non_zero_blocking_a", "details": "<msg>"}` |
| `CHK-OWNERSHIP-CAP-L8L9`<br>`CHK-OWNERSHIP-CAP-L3L6` | `docs/*/L{3,4,5,6,8,9,10}-*/*.json`（および対baseのgit diff） | ① L8/L9に禁止key（`fixture_patch`, `same_invocation`, `seed`, `rfc6902_copy_ops`, `rfc6902_patch`, `literal_materialization_contract`, `typed_execution_trace`, `typed_return_derivation_history`, `expected_return`, `full_return`, 固定source参照以外の `*_sha256`）が存在しないこと。② L8/L9の反例フィールド（`mutation`, `input_patch`, `raw_input`, `input_delta` 等）のJSON直列化長が1,536 bytes以下であること。③ L3/L4/L5/L6/L10に全返却fixture・COPYレシピ・test実行結果本体が混入していないこと。 | `{"check": "CHK-OWNERSHIP-CAP", "layer": "<L>", "file": "<path>", "pointer": "<ptr>", "violation": "forbidden_key|counterexample_exceeds_1536b", "key_or_bytes": "<val>"}` |
| `CHK-L7-TDD-MUTATION`<br>`CHK-SCFCTL-FORMAT` | L6/L7 JSON、対象 `src/**/*.py`、`tests/**/*.py`、`scaffold/tools/scfctl.py` | ① `python3 scaffold/tools/scfctl.py validate` がexit 0かつ `stale=0`。② 全変更JSONがvalidかつ2-space整形済み、変更PythonがFormatter/Linter合格。③ L6↔L7実装時は対象unit testが全件PASSし、L7にRed→Green観測記録とmutation KILLED証拠が揃い作業ツリーがcleanであること。 | `{"check": "CHK-SCFCTL-OR-TDD", "step": "scfctl|json_format|linter|unittest|mutation", "returncode": 1, "details": "<stderr_or_failed_target>"}` |

---

## 5. 凍結記録の手書き廃止：宣言入力とchecker再計算出力の分離

今後、関数単位L5/L8凍結記録（`docs/governance/audits/tdd/*.json`）を手書きで作成しない（[#3510 comment 6457411605](https://github.com/RetryYN/HELIX-HARNESS/issues/3510#issuecomment-6457411605)）。作成側は最小の**宣言マニフェスト（判断項目のみ）**をcheckerへ渡し、機械照合・集計・hashはすべて**checkerが再計算して出力**する。

| 区分 | 項目 | 作成者 | 内容と制約 |
|---|---|---|---|
| **A. 宣言に残す項目**<br>（人が判断・AIが起草する意味入力） | `slice_id`, `request_id`, `resolves_disposition_ref`, `decision_ref`, `legacy_and_failure_basis` | 作成側（人間／AI） | 対象sliceと解消するDISP項目、起点とした旧HELIX asset ID・失敗事例・保持点と変更点。 |
| 同上 | `l3_obligation_decomposition` (`O1..On`) | 作成側（独立意味review対象） | 上位L3要件の義務文を意味要素 `O1..On` へ分解した文言と、それを担う `l5_pointers`／`l8_pointers` の対応宣言。 |
| 同上 | `target_bindings`（`public_functions` / `private_detail_contract_pairs`） | 作成側（独立意味review対象） | 凍結する公開関数のL5 pointer（`L5#/functions/i`）と、それに束ねるprivate詳細節のpointer・結線先公開関数・残件戻し先（`owner`, `reentry_slice`, `C_downstream`）。 |
| **B. checkerが再計算・生成する項目**<br>（手書き禁止） | `source_main`, `request_base_sha`, `recorded_at_utc`, `pins`（全ファイルのpre/post SHA-256） | checker自動出力 | git base/head commitから全参照ファイルのSHA-256を計算して埋める。手書き・手動貼付けを禁止する。 |
| 同上 | `pointer_resolution_summary`, `negative_case_4way_verification` | checker自動出力 | 宣言された全pointerの解決件数（未解決0件）、L4↔L9↔L8↔L5負例の件数・7属性・副作用0の一致検証結果を自動出力する。 |
| 同上 | `resolved_function_rows`, `branch_coverage_check`, `head_entity_counts`, `verification` | checker自動出力 | L5関数シグネチャ・`unit_case_refs`・`oracle_ref` の解決結果、L9基本branchのL8被覆結果、L5/L8各配列の実要素数、L8材料追加0件（`l8_full_return_or_fixture_or_hash_added: false`）、`scfctl_stale_count: 0` を自動出力する。 |

---

## 6. 承認済みHARNESS検証契約（L3/L10）からの導出元と、workflow化の不足

### 6.1 設計検証checkerの導出元にできる承認済みL3/L10契約（pointer付き）

以下の承認済みL3/L10契約（[2026-10-12限定前提L3/L10監査](audits/prerequisite-l3-l10-definition-audit-2026-10-12.json)収録）は、Section 3〜5の設計検証checkerの直接の意味導出元となる（パス略記：`L3F`＝`docs/helix-harness/L3-requirements/functional-requirements.json`、`L10F`＝`docs/helix-harness/L10-verification/functional-verification.json`、`OS_L3F`＝`docs/helix-os/L3-requirements/functional-requirements.json`、`OS_L10F`＝`docs/helix-os/L10-verification/functional-verification.json`）。

| 導出する検査・仕組み | 承認済みL3要件（pointer） | 対の承認済みL10検証（pointer） | 委任承認記録（PR） | 導出する契約内容 |
|---|---|---|---|---|
| 6 V-pairの双方向対応・欠落局所化（`CHK-PAIR-BIDIR-ID`） | `L3F#/requirements/58` (`HARNESS-L3-001-F01`)<br>`L3F#/requirements/51..52` (`HARNESS-L3-056-F01..F02`) | `L10F#/cases/58` (`HARNESS-L10-001-F01`)<br>`L10F#/cases/51..52` (`HARNESS-L10-056-F01..F02`) | [PR #2946](decisions/helix-harness-layer-acceptance-prerequisite-l3-l10-delegated-decision-2026-10-12.md)<br>[PR #2944](decisions/helix-harness-extraction-naming-pair-prerequisite-l3-l10-delegated-decision-2026-10-12.md) | canonical 6 pairs（`L1↔L12`〜`L6↔L7`）をatomic oracle identityで双方向対応付け、片側欠落・不一致・未実行で該当pairをgreenにしない。 |
| 12層ledger・row identity・snapshot/stale検査（`CHK-PIN-SHA256`, `CHK-JSON-POINTER`） | `L3F#/requirements/54..57` (`HARNESS-L3-040-F01..F04`)<br>`L3F#/requirements/69` (`HARNESS-L3-004-F01`) | `L10F#/cases/54..57` (`HARNESS-L10-040-F01..F04`)<br>`L10F#/cases/69` (`HARNESS-L10-004-F01`) | [PR #2945](decisions/helix-harness-layer040-prerequisite-l3-l10-delegated-decision-2026-10-12.md)<br>[PR #2947](decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md) | 層別必須node/edge、stable row ID・revision・semantic digest・上下双方向traceを照合し、missing/unknown/staleを未完として検出する。 |
| 義務抽出・要素被覆・4層負例照合（`CHK-L3-OBLIGATION-MAP`, `CHK-NEG-4WAY-MATCH`） | `L3F#/requirements/44..46` (`HARNESS-L3-041-F01..F03`)<br>`L3F#/requirements/36,38,39` (`HARNESS-L3-005-F06,F08,F09`) | `L10F#/cases/44..46` (`HARNESS-L10-041-F01..F03`)<br>`L10F#/cases/36,38,39` (`HARNESS-L10-005-F06,F08,F09`) | [PR #2944](decisions/helix-harness-extraction-naming-pair-prerequisite-l3-l10-delegated-decision-2026-10-12.md)<br>[PR #2943](decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md) | 原子的義務要素の全件被覆とgap識別、不変条件・失敗経路と具体的oracleへの束縛（件数一致やlink存在だけで被覆済みにしない）。 |
| 実装前ペア凍結・Red→Green順序・mutation検証（`CHK-PUBLIC-FN-FREEZE`, `CHK-L7-TDD-MUTATION`） | `L3F#/requirements/40..43` (`HARNESS-L3-015-F01..F04`)<br>`L3F#/requirements/37` (`HARNESS-L3-005-F07`)<br>`L3F#/requirements/64,66` (`HARNESS-L3-003-F01,F03`) | `L10F#/cases/40..43` (`HARNESS-L10-015-F01..F04`)<br>`L10F#/cases/37` (`HARNESS-L10-005-F07`)<br>`L10F#/cases/64,66` (`HARNESS-L10-003-F01,F03`) | [PR #2943](decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md)<br>[PR #2947](decisions/helix-harness-process-trace-prerequisite-l3-l10-delegated-decision-2026-10-12.md) | 実装前のL6契約/L5詳細設計と対oracleの凍結、本体変更前のRed実観測→最小Green→局所Refactor/原子CI、mutationによるoracle強度確認、右側Scoped Reverse照合。 |
| ticket起点のPR前CI範囲編成と省略回収 | `L3F#/requirements/31..33` (`HARNESS-L3-005-F01..F03`)<br>`OS_L3F#/requirements/37..39` (`HELIXOS-L3-020-F01..F03`) | `L10F#/cases/31..33` (`HARNESS-L10-005-F01..F03`)<br>`OS_L10F#/cases/37..39` (`HELIXOS-L10-020-F01..F03`) | [PR #2943](decisions/helix-harness-verification-prerequisite-l3-l10-delegated-decision-2026-10-12.md)<br>[PR #2952](decisions/helix-os-workflow-prerequisite-l3-l10-delegated-decision-2026-10-12.md) | ticketとの関係・実差分・承認済み要求/pairからPR前検査profileを導出し、ticket範囲外変更を止め、省略検査は合流先ticketで回収する。 |

### 6.2 `.github/workflows/` へのworkflow化において前提が欠けている点（不足・owner・必要な人の判断）

上記の承認済みL3/L10契約により、`scaffold/` 配下の仮設checker script（Scaffold Binding登録下で実行する設計検証・凍結記録生成・L7検証補助）は直ちに導出・実装できる。一方、[`.github/workflows/README.md`](../../.github/workflows/README.md) が定める **`.github/workflows/` への正式な新世代CI workflow配置** には、以下の前提が欠けている。

| 欠けている前提（不足） | 担当owner | 必要な手続き・人の判断 | 現段階での扱い |
|---|---|---|---|
| **1. CI編成・検証機構自体のL4〜L7設計・実装の未着手**: `HARNESS-L3-005`/`015`/`040`/`056` および `HELIXOS-L3-020` はL3/L10の限定前提承認までであり、L4〜L7の設計・実装が未完了（[10/12 PO判断](decisions/requirements-entry-restart-po-decision-2026-10-12.md)の初回主対象3機構は `BRAIN032`・`HARNESS009`・`OS002`）。 | `HELIX-HARNESS` (CORE)<br>`HELIX-OS` (`OS020`) | 初回主対象3機構の接続・実装を進めた上で、CI編成機構（`HARNESS005`/`OS020`）のL4〜L7へ進む段階解禁（または対象範囲のPO判断）。 | 正式製品CIが成立するまでは、`scaffold/` 名前空間にcheckerを置き、Scaffold Binding（`scfctl validate`）で管理する。 |
| **2. 関連するL2検証・gate候補要求の未採択**: ローカル・CI同一契約の `HARNESS-L2-036`、隣接層trace gateの `HARNESS-L2-055`、closure gateの `HARNESS-L2-057`、文書品質reviewの `HARNESS-L2-061` は [L2要求書](../helix-harness/L2-requirements/product-requirements.md) 上で `未採択候補（registered_proposal / authority_effect: none）` の状態にある。 | `HELIX-HARNESS` (CORE) / **PO** | これら未採択候補の固有項目を正式CI要件に含める場合は、**PO（人）によるL2採否判断**とL3/L10承認が必要。 | 未採択候補から新しいgateや必須要件を生成せず、Section 6.1の採択・承認済みL3/L10契約の範囲内だけで検査を構成する。 |
| **3. GitHub Actions workflow配置・branch protection変更の停止境界**: [新世代作業入口](new-generation-start-here.md)「現在停止する作業」により、新世代CIの正式起動とbranch protection（Required Status Checks）の変更は停止中である。 | `HELIX-OS` (GitHub projection) / **PO** | `.github/workflows/` へのworkflow配置およびbranch protection設定変更には、**対象と作用を明示したPO（人）の許可**が必要。 | POの明示許可までは `.github/workflows/` を変更せず、checkerはローカル実行および独立review／merge admissionの機械検査として使用する。 |
