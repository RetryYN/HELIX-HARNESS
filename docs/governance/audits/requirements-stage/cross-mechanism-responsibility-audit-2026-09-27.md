# 8機構の責務重複・空白監査 追補

## 対象と判定

- 基準はmain `d308f4080da298172001ef97e9c4b5f66d32ed7d`。Concept、8機構のL1/L2/L11、および下記の旧FRS原文を照合した。要求ID参照数や機構名の出現だけから所有者を推定していない。
- ここでいう「所有」は、その意味・状態・判断の正本を保つ責務。「利用」は入力、証拠、接続、実行、検証、評価の役割。「対象外」は所有をしないことが上流またはL2/L11に書かれている意味である。接続相手が二機構に現れても、入出力の所有が別なら二重所有と数えない。
- **判定：確認範囲内に二者所有または所有者不在の責務は見つからなかった。** 重なって見えるauthority、検証、モデル比較、記録、接続、実資源、Feedbackは、正本、実行、評価の出力を分ける本文がある。各状態の実装が存在しないことやversion_targetが後続であることは、責務空白の根拠にしていない。

## 旧source起点

| 旧source | asset・原文位置・SHA-256 | 保持して比較した点 |
|---|---|---|
| Functional Release Slice requirements | `LEGACY-ASSET-B75E46DBE77592351574`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requirements.md`; R-06 89–92、R-12 129–132、R-13/14 134–142、R-18 186–188、R-20 190–194、R-23/24 209–217; `eb1a7747afacd607217ee9e1905f87e629354a023102c1f32521ff8a9bc54a17` | semantic ownerとsecondary relationを分ける。二重所有、欠落、staleを昇格前に識別し、変更pathからowner/影響/必要検証を結ぶ。局所Sliceの所有、複数Bundleでの利用、構成体固有検証を別にする。 |
| Functional Release Slice requests | `LEGACY-ASSET-201EED9C5D6D2FF4D41B`; `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/functional-release-slice-requests.md`; BR-002 28–31、BR-003 33–36、BR-004 38–41、BR-009 64–67; `bf47d434930bd701d368a49b725d49b00a5af2f385b6e1436b294f7b47796e20` | ownerごとのsource→影響先→必要検証を追う。個別利用に必要な安全閉包は維持しつつ無関係な基盤全体の完成を一律依存にしない。単体の成立と統合・更新・rollbackの組合せ検収を分ける。 |

旧sourceは責務の分離・consumer・依存閉包を比較する根拠とした。旧Module/Slice/Bundle数、実装、registry、runtime、gateは移植・実行していない。

## 責務単位別の所有・利用・対象外

`◎`は意味/状態/判断の主所有者、`△`は入力を使う・受渡す・適用する・検証/評価する役割、`—`はその責務の所有者ではない。機構外の主体（人、Worker）も含む行は明記した。

| 責務単位 | HARNESS / CORE | OS | BRAIN | LABO | INTELLIGENCE | SECURITY | INFRASTRUCTURE | CONNECT | 所有・利用の根拠と判定 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 要求・製品固有設計の意味、意味の人間採択 | ◎ | △ | △ | △ | △ | — | △ | — | HARNESS-L2-008/009/014のHARNESS/COREが製品要求・設計の正本と工程契約を持ち、各機構自身の要求意味は各対象ownerに残る。上流意味の採択は人、OSは判断出所とrevisionを記録、BRAINは汎用patternを提案し、INT/LABOは判断・評価材料を渡す。SECURITYは製品意味を決めない。**重複/空白なし。** Concept: `helix-concept.md:218-220,268`; HARNESS L1 `product-intent.md:23-39,57-61`; BRAIN L1 `brain-intent.md:25-30`; OS L2/L11 `governance-requirements.md:642-651`, `governance-acceptance.md:21-24`。 |
| 工程語彙、設計/検証義務とoracle | ◎ | △ | △ | △ | △ | △ | △ | — | HARNESS-L2-003/005/022は共通の工程・検証契約/義務を定義し、OS-L2-020は適用要件とHARNESS契約から検証計画・CIを組立/運転。各対象要求の意味oracleはその要求ownerが保持する。BRAINは構造知識を、INTは候補を、LABOは評価結果を供給。SECURITY/INFRAは自分の要求の制約・oracleを保持し、HARNESSの共通検証義務・工程契約を独自に書き換えない。**二者所有なし**（security制約とsecurity検証義務は異なる出力）。 Concept `:218,230`; HARNESS L1 `:31-39,47-54`; OS L2 `governance-requirements.md:692-700`; OS L11 `governance-acceptance.md:28,51-54`。 |
| 操作権限、隔離・情報保護方針、失効 | — | △ | — | — | △ | ◎ | △ | △ | SECURITY-L2-007/008/021/022が操作許可の方針・適用scope・制約を所有し、権限の根拠となる人/対象ownerの判断出所を保持する。あらゆる権限をSECURITYが新規発行する意味ではない。OSは割当停止/運転へ適用、Worker実行環境が制約を強制、CONNECTは送信時契約を照合、INFRAは資源側に適用する。INTは必要な許可結果を参照し権限を発行しない。**運転主体との重複なし。** Concept `:223,234`; SECURITY L1 `security-intent.md:24-38,52-54`; SECURITY L2/L11 `security-requirements.md:120-150,272-290`, `security-acceptance.md:32-34`; OS L2 `governance-requirements.md:672-680`。 |
| 汎用設計知識の正本・version/state | △ | △ | ◎ | △ | △ | — | △ | △ | BRAIN-L2-001/003/005/008が汎用Pattern/Unit/Partと適用条件を所有。COREが製品固有設計を持ち、INTは今回の適用案、LABOは一般化の評価、OSは実projectで使ったversion/state登録を担当する。CONNECTはedge、INFRAは実資源を接続する。**知識正本の重複なし。** Concept `:220,229`; BRAIN L1 `brain-intent.md:25-30,28`; BRAIN L2/L11 `brain-requirements.md:150-170,434-442`, `brain-acceptance.md:36,60-61`。 |
| 現在の理解・計画・予測・診断・配置案 | △ | △ | △ | △ | ◎ | △ | △ | △ | INTELLIGENCE-L2-003〜010/012が根拠/不確実性付き判断candidateを作る。BRAINは知識を、OSは現在のticket/stateを、LABOは過去評価を入力する。INTはauthority/正本ではなく、ticket発行・assignmentはOS、長期効果評価はLABO。**各出力の所有者は分離。** Concept `:221-223,229-234`; INT L1 `intelligence-intent.md:25-35,45-53`; INT L2/L11 `intelligence-requirements.md:102-112`, `intelligence-acceptance.md:72,164,198`。 |
| モデル/provider適性、履歴task水準、改善効果の比較 | △ | △ | — | ◎¹ | ◎¹ | △ | △ | △ | ¹責務は別出力に分割：INT-L1/L2-011は同一corpus/responsibility範囲でのモデル/provider適性比較を所有。LABO-L1-011 / LABO-L2-055は履歴からtask/model-class水準を出し、未評価を保持。LABO-L1-005 / LABO-L2-059はquality、総費用、人介入等を含む改善効果を評価し、INT-011比較契約を使う。配置案はINT-010、割当はOS-018。**指標・runを共有しても責務の二重所有なし。** 詳細な同条件反例は後掲「比較責務の照合」に記録する。根拠: PO original `intelligence-l1-idea-po-original-2026-09-26.md:384-417`; INT L1 `intelligence-intent.md:53`, L2 `intelligence-requirements.md:108-112`, L11 `intelligence-acceptance.md:72,164,198`; LABO L1 `labo-intent.md:56,62`, L2 `labo-requirements.md:109-115,150-154,416-431`, L11 `labo-acceptance.md:48,56,164-176,191-196`。 |
| ticket/workflow、割当て、進行と実行 | △ | ◎ | — | △ | △ | △ | △ | — | OS-L2-017/018/019がticket/workflow/assignment/attempt/recoveryを所有。HARNESSが規範の工程語彙・義務、INTは計画/配置案、LABOは水準、SECURITYは許可、INFRAは資源を与える。実作業を行うのは機構外のWorker。**OSとINTは重複せず、executorも明示。** Concept `:219,230-234`; OS L1 `system-intent.md:21-26,30-39`; OS L2/L11 `governance-requirements.md:662-680`, `governance-acceptance.md:24,345-350`。 |
| 論理接続登録・互換・通信・retry・技術receipt/trace | △ | △ | △ | △ | △ | △ | △ | ◎ | CONNECT-L2-001〜006が技術edgeの登録・版照合・送受信・再送・通信traceを所有する。source/receiver各機構は業務payloadと意味receiptを保持する。INFRAは物理/実行network resource、SECURITYはegress/許可、OSはticket/assignmentを保持する。CONNECT ACKは業務受領・採択にならない。**技術層と業務層に二重所有/空白なし。** Concept `:227`; CONNECT L1 `connect-intent.md:25-29,45`; CONNECT L2/L11 `connect-requirements.md:56-142`, `connect-acceptance.md:32-38`。 |
| 承認設計に基づくdeployment target、実resource/runtime state | △ | △ | △ | △ | △ | △ | ◎ | △ | INFRASTRUCTURE-L2-001/008/009が配備目標とactual runtime resource stateを保持。COREは意味設計、BRAINはgeneric infrastructure knowledge、OSはwork/change/deployment progress、SECURITYはauthority、Workerがresource operationを実行する。OS stateとresource stateは別。**所有空白/重複なし。** Concept `:224`; INFRA L1 `infrastructure-intent.md:24-49,58-63`; INFRA L2/L11 `infrastructure-requirements.md:104-122`, `infrastructure-acceptance.md:116`。 |
| source evidence、共通continuity、episode集約と評価 | ◎² | ◎² | ◎² | ◎² | ◎² | ◎² | ◎² | ◎² | ²各機構は自分のsource facts/evidenceを持つ（共有同一事実の複数正本ではない）。OS-L2-019は共通形式のevent/correlation/continuity projectionを管理し、CONNECTは輸送receipt、LABOは許可observationをepisodeとして相関・評価、HARNESSは規範oracleを持つ。受領receipt、検証verdict、評価結論は別出力。**全体責務と局所証拠の責任者を区別でき、空白なし。** Concept `:104-110`; OS L2/L11 `governance-requirements.md:642-690`, `governance-acceptance.md:21-33,40-58`; LABO L1/L2/L11 `labo-intent.md:25-37,52-59`, `labo-requirements.md:69-91`, `labo-acceptance.md:45-53`。 |
| 改善Feedback、登録/routing、意味採否・変更 | △ | ◎ | △ | ◎ | △ | △ | △ | △ | LABO-L2-010/050が過去の証拠から評価/Feedbackを出し、OS-L2-022/024がproposalを記録・routing/ticket化する。対象ownerは自らの正本の変更を担い、意味採択が必要な場合は人が判断する。BRAIN候補もLABO評価→OS登録/routing→BRAIN内検証/採否を通る。OSは評価・意味変更を行わない。**重複/空白なし。** Concept `:220-221,229-230,308-310`; LABO L1 `labo-intent.md:25-32,52-59`; OS L1/L2/L11 `system-intent.md:21-26,35`, `governance-requirements.md:712-721`, `governance-acceptance.md:25,82`。 |

上表は各機構が自分の責務で保持する証拠を同一source正本へ併合する趣旨ではない。人間の意味判断、Worker execution、接続通信等の機構外actor/共通部品の役割を別列の所有として混同しないため、表の利用マークは所有を意味しない。

## 既知の重なりを反例で区別した記録

- **要件・検証と運転**：HARNESSが同一要求revisionのoracle/verification obligationを決め、OSが必要CIを隔離して回収する。CIのgreenだけでHARNESSの上流意味review、人間受入、merge/releaseを成立させる構成は両L2/L11に反する (`product-requirements.md:447-478`; `governance-requirements.md:692-700`; `governance-acceptance.md:28,51-54`)。
- **project authorityとsecurity authority**：OSはproject要求の出所・採否・revisionを登録・統制し、SECURITYはactor/target/operation/scope/期限に拘束した操作許可・制約を照合し、権限の決定出所を保つ。ticketの存在だけでoperation permissionにしたり、permissionからOS ticketを発行したりするのは失敗例 (`governance-requirements.md:642-651`; `security-requirements.md:140-150`; `security-acceptance.md:32`)。
- **BRAINとCORE**：BRAINのPattern identity/version/required inputは候補知識。HARNESS-COREは受取を製品設計義務へ対応付け、採用と製品固有設計を保持する。BRAIN-L2-008とHARNESS-L2-009が「利用版/知識状態」と「project利用記録/設計義務」を分ける (`brain-requirements.md:161-170,434-442`; `product-requirements.md:60,66-68`)。
- **INTELLIGENCEとLABOのモデル比較**：同じmodel A/B・同一corpusでも、INT-011は領域/能力別の適性比較、LABO-055は過去履歴からのtask class水準、LABO-059はquality/総費用/人介入を含む変更効果で出力が異なる。一回のA/Bから未知task水準を評価済みにする、速さだけで改善とする、肯定評価からINT配置案/OS割当を自動生成するのは境界違反。所有重複・空白はなくNOCHANGE。詳細なsource起点/反例は後掲「比較責務の照合」に記録する。
- **接続とpayload**：CONNECTが登録・通信済みでも、LABOの観測、OSのticket受領、BRAINの知識採択等の業務結果にはならない。受信側source/revision/scopeと業務受領を別に保つ (`connect-requirements.md:56-142`; `connect-acceptance.md:32-38`)。
- **設計・work/change・実資源**：COREの設計変更、OSのchange/ticket状態、INFRA actual resource stateは同じ環境を指しても別の対象。resource driftからCORE設計を変更する、またはOS ticketをactual状態の正本にする例をINFRA L1/L2が拒否する (`infrastructure-intent.md:27-49,58-63`; `infrastructure-requirements.md:104-122`)。

## 明示して評価対象外とした点

- 実装されていない機構、runtime未稼働、要求候補の`draft_candidate`、後続version_targetを責務空白と判定しない。ここでは担当意味の存在と境界のみ見る。
- ConceptのWeb/WEB-OSやINFRA後続scope、INTELLIGENCE 3.0学習等を、現行1.0所有単位へ繰り上げない。
- OS L2-005には旧集中責務を含む学習表現の説明が残るが、OS L1 `system-intent.md:44` は現行のOS単独責務と判定しないよう照合中と明記し、L2 tableはLABOが効果評価と学習を担いOSは記録・Feedback登録と書く (`governance-requirements.md:58,294`)。これを第二ownerや空白と数えない。
- 数式・評価metric計算部品の共有実装は下流設計の選択であり、責務所有監査からengine追加や承認手続きを提案しない。

## 結論

d308のConcept/L1に示される8機構の責務割当ては、現行L2/L11で主所有者、利用者、明示的な非所有者に分かれている。旧FRSが要求したowner/consumer分離、source-to-verification trace、個別の安全依存閉包、単体と組合せ検収の保持点も崩れていない。親のINT-011/LABO-055/059比較確認を含め、本範囲で責務を追加・移管する必要のある実矛盾、二者所有、所有者空白は確認しなかった。

### 比較責務の照合：INTELLIGENCE-011とLABO-055/059

「同じ指標を比較する」だけでは二者所有と判定せず、親POの目的、入力、出力の意味、利用先と変更権限を照合した。

| 責務 | 意味を所有する要求 | 入力→出力・利用 | 境界と根拠 |
|---|---|---|---|
| 領域・能力別のmodel/provider適性比較 | INTELLIGENCE-L1-011 / L2-011 | 同一corpus/responsibility scopeのcurrent/candidate結果→findings/FP/miss/再現性/latency/costの適性比較。モデル名で上位扱いせず、比較不能を保持する。 | PO原文 `docs/helix-intelligence/sources/intelligence-l1-idea-po-original-2026-09-26.md:384-417` がINTELLIGENCEへ明示した能力。現行L1 `intelligence-intent.md:53`、L2 `intelligence-requirements.md:108-112`、L11 `intelligence-acceptance.md:72,164,198`。比較は自動差替え・配置・Bench水準生成の許可ではない。 |
| Worker履歴からtask/model class水準を生成 | LABO-L1-011 / L2-055 | 許可されたWorker履歴・作業種別・model class・評価根拠→対応可能性の水準、評価範囲、未評価状態。054がINTELLIGENCEへ渡し010が配置案に使う。 | `docs/helix-labo/L1-planning/labo-intent.md:62,86`、L2 `labo-requirements.md:150-154,289-293`、L11 `labo-acceptance.md:56,191-196`。INT011のcorpus比較だけで未知taskの評価済み水準を生成しない。 |
| HELIXの変更・支援の効果と費用の比較 | LABO-L1-005 / L2-006/059 | 実験/実績、対象quality oracle、scope/revision、既決の優先関係→品質適合・総費用・完了時間・人介入と限界を持つ効果評価。適性比較とは別の目的・出力。 | L2 `labo-requirements.md:109-115,416-431`、L11 `labo-acceptance.md:48,164-176`。059はINT011のcomparison contractを利用し、model capability比較不足をINT011へ戻すと明記（L2:427,429）。同じ能力を複製しない条件も427にある。 |
| 過去評価の受領と現在の判断 | INTELLIGENCE-L2-018/034、LABO-L2-035/052 | LABO評価材料をINTへ渡し、INTが現在の適用scopeで候補判断に使う。長期効果の独立評価・Bench水準はLABOに残る。 | INT L2 `intelligence-requirements.md:144-148,244-252`、LABO L2 `labo-requirements.md:259-261,309-313`。INT018は現在判断と歴史的効果を区別し、後者の独立評価をLABOと明記する。 |

**判定：所有の重複・空白は確認しなかった（NOCHANGE）。** 指標や同一run evidenceの共用はあるが、INT011の領域・能力別適性比較、LABO055の履歴からの作業水準、LABO059の改善効果と総費用は別の出力責務である。LABO059がINT011の比較契約を利用する経路も本文にある。INT011を「LABOの材料を読むだけ」に縮約したり、比較能力全体をLABOへ移したりすれば、上記PO原文の比較能力を落とす。共有できる数式・計測・実装部品の選択は下流の具体化事項で、ここで第二の評価engineや新しい承認手続きを作らない。

同一のmodel A/B、同じcorpusを使った反例で責務を確かめた。INT011の比較はそのcorpus・scopeのFP/miss等を返せる。しかし、その一回だけをLABO055の未知task classの評価済み水準へ一般化できない。また、model Aが速いという比較だけでは、品質・救援・人時間・優先関係を含むLABO059の改善効果を成立させない。逆にLABOの効果評価が肯定でもINT010の配置案とOS018の割当を自動生成しない。現在のL11-011、LABO055/059とINT018がこれらの出力境界を保つ。

旧sourceは `LEGACY-ASSET-8247A056F30FF91E4B8D`、`archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md:35-38`（SHA-256 `d78bbcc0ca184bfb87dc2bbc932291f97a58bf9f0fd703481489f15944be9b76`）。旧AAFD-BR-04の同corpus/責務scopeで比較し過去qualificationを自動継承しない条件を保持する。現行POはこれを領域×能力別の適性へ広げた（INT L1:107）。履歴水準と長期効果の所有をLABOへ分けた点は現在のL1/POに従い、旧AAFDの実行器は移植しない。

## 上位本文のrevision固定

基準commitは `d308f4080da298172001ef97e9c4b5f66d32ed7d`。L2/L11のSHAは[横断監査](cross-mechanism-audit-2026-09-27.md)の8機構表と一致する。以下は今回の責務抽出に使った上位本文であり、現在のbytesを採択済みとはしない。

| path | SHA-256 |
|---|---|
| `docs/concept/helix-concept.md` | `06e210c312fc6a5f18c1fc29248e55ebe9c2eee0c177006e32d7b421af8baa78` |
| `docs/helix-brain/L1-planning/brain-intent.md` | `2674b2e1a770a038b2d53a93ca635a0cbbfca42af463a562f22e1c51d5ebb5f0` |
| `docs/helix-connect/L1-planning/connect-intent.md` | `9c212572afda81405c6d5ab70151f5b35356722204616e85e132162b45907c70` |
| `docs/helix-harness/L1-planning/product-intent.md` | `238ae0590f43c10c0a59a0cea4a9907328752a81388891e1a115d4278db00e1f` |
| `docs/helix-infrastructure/L1-planning/infrastructure-intent.md` | `1673cf1333c762b817e1031cb610de90b6e967f7c2d851ab2a4b71e4959ebc37` |
| `docs/helix-intelligence/L1-planning/intelligence-intent.md` | `8042335b8a2b33ea41788be03e286cea73b3251f747b6d0fa85350ea322b6fa8` |
| `docs/helix-labo/L1-planning/labo-intent.md` | `78b686adcefe6a6867134a17238b59acef19e6c52dc735989f47aa637ed309cc` |
| `docs/helix-os/L1-planning/system-intent.md` | `2bb62571308aa1fde0351ca7242e961ddd25b9c4722196c7bb255cf3ad1cfe0e` |
| `docs/helix-security/L1-planning/security-intent.md` | `b779ae38e077474ee10ee07e1bb50eac1da64a86ee3bf2bc06504c1dd53be61d` |

[上位機能からの空白照合](cross-mechanism-responsibility-coverage-2026-09-27.md)は、相互参照の有無によらずConcept/L1からL2の所有先を確認した表である。この責務監査は作成側の検収であり、Claudeの独立reviewとは別である。
