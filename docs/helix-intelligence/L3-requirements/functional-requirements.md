# HELIX-INTELLIGENCE L3 機能要件（部分草稿）

status: draft_for_l3_review
approval: not_approved
scope: Stage 2a + Stage 2c / version_target 1.0 explicit items only
owner: HELIX-INTELLIGENCE
paired_l10: ../L10-verification/functional-verification.md

本稿は固定L2/L11に根拠を置くStage 2a・2c部分範囲であり、機構全体のL3、実装、実行、採択・承認を意味しない。Stage 2cはPOの案B「支援・テスト生成を前倒し」に従い、作業前の指示・テスト候補と作業中の診断・相談を分ける。候補生成はassignment、相談実行、test実行、受入状態を作らない。親L2ごとにFR IDを分け、ACはL3正本に一度だけ定義し、L10は同じACを参照する。


### `FR-INTELLIGENCE-L3-010` — `HELIXINTELLIGENCE-L2-010`

task type/domain/complexity/context/tool requirement、ticket identity、およびtask class・Worker/model/version・source revision/scopeに結束したsuccess/failure/rework/latency/cost/reliability実績を入力し、根拠・除外理由・不確実性・未評価を含むticket別配置proposalを返す。価格、model名、aggregate benchmark単独で結論せず、割当・実行・進行はOS、実績の評価scopeはLABOに残す。

**責務／依存境界**：proposal作成はHELIX-INTELLIGENCE、task属性/ticketはOS、task-class実績と適用scopeはLABO、実契約/依存版はHARNESS-L2-010/011が所有する。単独成立依存はticket/task identity、全task属性、LABO HELIX-Bench evidenceまたは明示的未評価とWorker実績である。

**受入条件**

- **`AC-INTELLIGENCE-L3-010-01` 入力属性と戻し先**：全属性・ticket identityのそろった入力からproposalを生成し、各必須属性を一つずつ欠いた場合は推測で補わず未確定としてOSへ戻す。
- **`AC-INTELLIGENCE-L3-010-02` 実績scopeと未評価**：各実績軸をWorker/model/version、task class、source revision/scopeへ結び、stale・scope mismatch・未評価をqualifiedと表示しない。価格／model名だけのfixtureも根拠不十分として未確定にする。
- **`AC-INTELLIGENCE-L3-010-03` proposalとassignment分離**：proposalは推奨と根拠を示すだけで、OS assignment/authority receiptがない状態ではWorker起動・割当を起こさない。OS判断後もINTELLIGENCEが進行責務を取得しない。

### `FR-INTELLIGENCE-L3-066` — `HELIXINTELLIGENCE-L2-066`

INTELLIGENCE実装を使えない場合、人がL2-010と同じproposal contract/version・入力属性・evidence/未評価・scopeで配置候補を作り、human-authored provenance、根拠、除外理由、不確実性を付ける。OSはsource/contract revision・task/scope・作成actor/time・受領actor/timeをreceiptへ記録する。人代行入力はINTELLIGENCE生成結果、LABO評価、OS assignment、権限のいずれも生成しない。

**責務／依存境界**：同一proposal contractはINTELLIGENCE-L2-010、LABO evidenceまたは未評価はLABO-L2-054/055、ticketとreceipt/assignmentはOS、contract versionはHARNESS-L2-010/011が所有する。INTELLIGENCE runtime自体は依存にしない。task属性不足はOS、evidence不足はLABO、schema/version不明はINTELLIGENCEへ戻す。

**受入条件**

- **`AC-INTELLIGENCE-L3-066-01` 同一proposal契約**：人手案とINTELLIGENCE案を同じL2-010 schema/versionおよびtask/scope/evidence fixtureへ通し、必須fieldの意味・範囲が一致する。human provenanceはINTELLIGENCE provenanceと区別して保持する。
- **`AC-INTELLIGENCE-L3-066-02` 受領receiptと欠損**：receiptにsource/contract revision、task/scope、根拠・除外理由・不確実性/未評価、作成/受領actorと時点を結び、field欠落・wrong receiver・revision/scope mismatchでは受領済み扱いにしない。
- **`AC-INTELLIGENCE-L3-066-03` authority状態の分離**：人手案のみではLABO qualified state、INTELLIGENCE出力状態、OS assignment/実行開始を生成しない。各々の別recordがあるときもactor・scopeと状態を混同しない。


### `FR-INTELLIGENCE-L3-068` — `HELIXINTELLIGENCE-L2-068`

元Workerの有効なticket、作業開始前には元Workerの有効または予定assignment identity、task scopeとrequirement/design revision、既存HARNESS-L2-022 pair/oracle/受入契約、選択した設計/code/failure/BRAIN sourceのprovenance・適用性、入力済みbudget/期限/停止条件を受ける。作業開始前の候補準備は予定assignmentで成立し、診断・相談など実操作では有効なOS assignment/attemptを照合する。packet/contextを使う場合はAIDOCのsource/revision/authorityと要約の非authority条件、OS CLR-R06の最小restart packet完全性を保ち、必要情報の欠落を隠さない。これらの条件に従い、元Workerを支える診断・設計/テスト支援candidateを返す。作業前のtest/指示準備は失敗証拠なしで行える。作業中の診断/相談candidateだけは詰まり/失敗sourceと再現材料を要する。出力は候補であり、既存oracleの追加提案はできるが、HARNESSの権限なくoracleを確定・変更せず、HARNESSが持つ検証authorityとOSのassignment/test実行authorityを移さない。

**責務／依存境界**：INTELLIGENCEはsourceを選択し根拠付きcandidateを返す。元Workerは作業・修正の責任を保つ。OSはticket/assignment/停止と実相談/実行を、HARNESSはpair/oracle/受入を、SECURITYはauthority/data-useを、BRAINは知識の適用性を、LABOは長期効果評価を所有する。consultを実行する場合のみOS-L2-028、作業から検証・必要な再作業まで束ねる場合はOS-L2-029に接続する。packetを使わないoperationへAIDOC/CLR-R06を常時runtime依存として追加しない。

**受入条件**

- **`AC-INTELLIGENCE-L3-068-01` 作業前の支援candidate**：有効な元ticketとHARNESS-L2-022既存契約から、予定assignment identityを含むsource revision・scope結合済みtest/instruction candidateを作れる。failure evidenceや相談receipt、有効な実行assignmentを条件にせず、実操作を選んだ場合はその時点でOSの有効assignment/attemptを照合する。
- **`AC-INTELLIGENCE-L3-068-02` 作業中診断とsource適用性**：診断/consultを選んだときは詰まり・失敗evidence、選択sourceのidentity/revision・利用許可・適用性を保持する。sourceがmissing/stale/conflict/restricted、または必要evidenceが不足なら当該operationを閉じず、unknownとowner/不足を返す。
- **`AC-INTELLIGENCE-L3-068-03` oracle・authority境界**：各test/oracle提案は承認済み要求とHARNESS-L2-022既存oracleのscopeへtraceする。oracle追加提案はcandidateにできるが、HARNESS authorityなしに確定・変更しない。candidateのみでticket/assignment/OS handoff/test実行/CI/受入/mergeを起こさず、助言者を独立reviewerとしない。

### `FR-INTELLIGENCE-L3-075` — `HELIXINTELLIGENCE-L2-075`

後発35件PO判断で承認された固定L2-075 revisionを対象に、AAFD-R-01〜03由来の`AgenticAuditProbeProposalV1` identity候補とqualification境界を具体化する。proposal ID、audit episode、producer provider/runtime/model/version/session、repository、candidate HEAD、resolved worktree identity、authority revision/digest、責務/不変条件ID、観測、evidence、再現手順、反証、confidence、expiry、finding advisory、remediation advisory、proposal digestを同じidentityへ結ぶ。PR review findingとsystem audit proposalは別identity/schemaとし、採択済みL2-073のdetector/direct-projection境界を置換しない。

**責務／依存境界**：提案のidentity/evidenceは候補、qualification・duplicate照合・独立再現・owner/route判断は既存UIL-01〜04と各owner、要求の意味・状態は上流authority ownerが持つ。AI自己評価だけではverified、P0/P1、owner、route、remediation adoptionを確定しない。旧L2本文の候補metadataは固定時記録として保持し、承認状態はPO判断recordから読む。

**受入条件**

- **`AC-INTELLIGENCE-L3-075-01` proposal identity結束**：正常fixtureで必須fieldが同一audit episode/producer/current対象とdigestへ結び、finding/remediation advisoryが別identityで保持される。
- **`AC-INTELLIGENCE-L3-075-02` identityごとのfail-close**：exact HEAD、resolved worktree、authority digest、producer session、responsibility owner、evidenceの各々を単独に欠落/不一致化し、どの対象fieldの欠落/不一致か追跡できるreasonを残してincompleteにする。reason語彙やenumを固定せず、対象と異常の対応が失われる包括reasonへの集約はしない。未評価fieldやhistorical evidenceで補わず、current/compatibility/historical authorityを混同しない。
- **`AC-INTELLIGENCE-L3-075-03` qualificationのhandoff**：AI自己評価、独立再現なし、duplicate/owner不明、反証、expiry、supersessionの未解決例をverifiedやP0/P1へ昇格させず、findingとremediationを分離して既存UIL/ownerへ返す。L2-073の範囲外、Issue/Requirement/CI/mergeの新動作は作らない。

## 親・旧source crosswalk（item単位）

Stage 2a・L2-068の固定親は `f6dad2a33e24f000b87d7f09b8d40288257e74cc`、L2-075の固定L2/L11は `125908004787d949a60c5eb373c93819b0a1ceea` 時点。L2-075の承認根拠は後発35件PO判断のexact revision記録である。旧status/metadataは履歴として保持し、現行authorityは該当decisionから読む。test-designはoracle/failure consumerとして読んだ資料で、旧test/runtime/CLI/CIは実行していない。

| identity／管理行 | PO判断・登録（path/行/SHA） | 固定L2（行・全文SHA-256・正規化節SHA-256） | 固定L11（行・raw節SHA-256・全文SHA-256） | 旧L3（asset/path/行/SHA） | 旧test-design（asset/path/行/SHA） | 判断 |
|---|---|---|---|---|---|---|
| `HELIXINTELLIGENCE-L2-010` / `MPR-RC-HELIXINTELLIGENCE-L2-010-004` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:57`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `397` SHA `89bdc3bcaaee36a2c5632e3d784c176776bf32521e10621ac837ed22a47235fc`; candidate digest `sha256:29b05afbff84475d17b9b1f0698762dab2a1be92480313833d9c8fef87d410c1` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:102-107`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `bb5239d4bcd59c2d9c125704c26ba3dad3ce45d4d9acd55eb662f060e25924dd` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 71-71 / `fb8e588559cf58c54fd45b991e4b60f27929e0c8bd2f96bf8b57c7eed161c712`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-C6ADB99F1353965C5449` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md` 行 18-37, 39-64; SHA `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／negative mutation/failure oracle、fallback拒否、receipt mismatch候補。旧sandbox/provider admission値は再導出対象外。 |
| `HELIXINTELLIGENCE-L2-066` / `MPR-RC-HELIXINTELLIGENCE-L2-066-003` (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:96`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; register row `474` SHA `41e40d750c55abaec6fd55d3ce49feab66d1bb1bed68481466cdd665c636600e`; candidate digest `sha256:4085daba7873d4cddefe498b04e59ff5b4e44ba3ec80a307537b51af601cfa69` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454-465`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; span `e7b52b1bd92d6ff3fb47acbfd13e119c590cc7d6dc472e6eb96d32864f3d23c4` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` 131-139 / `7969c17ed59308cc1c052b7a2ffb246e5cf92d8cdcad5bc12f4ad2545d9fc0f1`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行 26-45, 47-110, 123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-437A6A68F9A9E0AE1B9E` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/resident-lane-orchestration-acceptance.md` 行 17-55; SHA `63ac3d0fbc36f014977998f9073846bfc01e5d352e07c1e10d408f0eab0ad707` | worker委譲面・隔離・receipt・失敗境界を候補根拠へ再導出。provider一覧、sandbox/receipt schema、benchmark/admissionの既定値を移植しない。／scope、wrong actor, stale receipt, lost handoff等のnegative oracle候補。old event/lease/assignment valuesを移植しない。 |
| `HELIXINTELLIGENCE-L2-068` / fixed `MPR-RC-HELIXINTELLIGENCE-L2-068-002`, current metadata successor `-003` (rows 415/906, semantic digest unchanged `sha256:d5145aae05dffd5bc61d795748060fca95f446be0b100b786a178bcf503452bf`, `authority_effect:none`) (adopted, `version_target: 1.0`) | PO `docs/governance/decisions/helix-intelligence-requirements-po-decision-2026-09-28.md:98`, SHA `8362ecb58921593b473ac85d277f0db36a7cbe0952268531913191e4eab260ad`; registration `MPR-RC-HELIXINTELLIGENCE-L2-068-002` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:491-506`; SHA `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`; normalized section SHA-256 `sha256:d5145aae05dffd5bc61d795748060fca95f446be0b100b786a178bcf503452bf` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:201-210`; SHA `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`; raw section SHA-256 `8f1743cc49b8b48ee61e2755e5561d6424615d299a1f5473d7ad3c174dbec105` | `LEGACY-ASSET-9114D4E463E95B67DD0C` `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/worker-common-contract.md` 行26-45,47-110,123-137; SHA `773280fa06cfb06989c4d2d66b15499635d14cd024b77401c18715c9d0588290` | `LEGACY-ASSET-C6ADB99F1353965C5449` `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/worker-common-contract-acceptance.md` 行18-64; SHA `c8dff734891a6a7350feb9b698c40e1616946cdd424433d662f1da49d8ac800d` | worker委譲/隔離/receipt/失敗境界とpositive/negative oracle構造を意味起点として再導出。旧provider/CLI/sandbox schema/benchmark閾値は置換し、現行HARNESS/OS ownerへ割当・oracle・実行authorityを残す。 |
| `HELIXINTELLIGENCE-L2-075` / `MPR-RC-HELIXINTELLIGENCE-L2-075-002` (row 657; supersedes -001; semantic digest `sha256:c302d45ef008b8d73f71c9484c1c9e2432c8e195f23c559b513d36309cdb80f6`) (PO承認: later35 #L33, `version_target: 1.0`) | `docs/governance/decisions/po-decision-2026-10-03-later35.md:33`, SHA `e3ea2cc8d79c2568985bc086fbc4d08d25e162fcc546858d6db47bba768ac3d3`; L2/L11 digestはdecision record参照 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:618-626`; SHA `1aef1804b6b4e6ffde085a22cc2a66de97bcf90a29a19c7c79001a387c292c39`; normalized section SHA-256 `sha256:c302d45ef008b8d73f71c9484c1c9e2432c8e195f23c559b513d36309cdb80f6` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:337-344`; SHA `28d1f4bff131bc2bdd1c0b4f96b44509e397c0ce1e2c9350c6714b9721f55749`; raw section SHA-256 `73eb9389ebb936dcac76e332cfd4e374e4120588b2e0199e7718334acba3b595` | `LEGACY-ASSET-EB3700B0088F311C2295` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md` 行23-41; SHA `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a` | `LEGACY-ASSET-CAC0C64EB7540180B1FE` `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md` 行16; SHA `09d07e224518c0e14f946c8aaaf20128da422e0b554a7446c1d019d8263c0d5a`, line SHA `8936ee3c03122a898b13a701aedf077e3ce5e65360a45f80cd9e7be0d86bda78` | AAFD-R-01〜03のproposal identity・authority evidence・qualification handoffを限定再導出。L2-073のR-04境界とAAFD他条件を拡張せず、旧runtime/UIL/TERを持ち込まない。固定時候補metadataとPO exact decisionを区別する。 |

## PO向け要約（承認未取得）

この部分草稿は、Stage 2aの010/066とStage 2cの068/075を、各固定L2/L11の範囲で具体化する。068はPO案Bに沿う作業前の支援・test candidateと作業中診断を区別し、元Worker、OS、HARNESS、BRAIN、LABOの責務境界を保つ。075はPOが承認したexact revisionを親とし、Agentic Audit Probe proposalのidentity/evidenceと既存UIL qualificationへのhandoffを具体化する。候補と草稿は割当・test実行・verified/qualified・受入等のauthority stateを生成しない。各caseは正常、field欠落/不一致、scope外、stale/unknownを具体fixtureで照合する。
