# LABO data所有・停止・物理配置の条件比較

基準main `61af4f2736582709e286b7c56c7916c225080da6`、authority_effect: none。[JSON証拠](labo-data-ownership-stop-topology-comparison-2026-10-10.json) SHA-256 `a2d544e53f0cc810becfd3581ac0ed65325706b8835eea676b5800867095f299`。

C03〜C07の判断材料を補う限定文書比較。14 data object、14正常/反例/停止候補、repository/hostの4組合せと5判断観点。正式要求・schema・runtime・物理配置は選定しない。

## data所有と利用

| ID | object | source/派生owner境界 | 用途 | authority/採否境界 | 版 | 根拠 |
|---|---|---|---|---|---|---|
| RAW | 作業原ログ・検証原証拠 | 生成元owner；OSは作業記録/参照管理 | LABOは許可観測だけを受領 | 原証拠をLABO/INT/BRAINの正本へ移さない | 1.0 | N01,N04,CONSENT,OLDW |
| CONT | 運転memory・checkpoint・予算・未完義務 | OS継続/復旧責務 | LABOは過去観測として利用、進行stateは書換えない | 知識promotionや委譲receiptを継続正本にしない | 1.0 | RESUME,OLDMEM,N04 |
| OBS | 許可されたLABO observation | LABO派生観測；元source ownerは変わらない | episode/実験/比較への入力 | 取込成功は評価成功/原source変更ではない | 1.0 | N04,LABOCON |
| EP | episode・相関結果 | LABO；元source revision/eventを保持 | 独立比較/失敗/反例/適用範囲 | 時刻/path一致だけの因果や欠けた義務を生成しない | 1.0 | N04,N05,N06,CAUSAL |
| EXP | experiment・baseline・oracle・実行結果 | LABOが評価設計/結果、実行結果はOS割当Worker | 同条件評価/中断/unknownを別表示 | LABOはWorker assignment/実行を所有しない | 1.0 | N05,RECEIPT |
| EVAL | 効果・退行・Bench水準/scorecard | LABO評価owner | INTの配置/判断候補とtarget owner検討へ | scoreだけで採択/資格/割当/長期改善を確定しない | 1.0 | N05,N10,RECEIPT,BENCH |
| FB | target-specific Feedback candidate | LABO提案；登録/routingはOS | 対象ownerが既存変更手続きへ戻す | 提案と採否/実行/再観測を分ける | 1.0 | N06,N01 |
| KNOW | 汎用設計知識・Pattern/Unit/Part | BRAIN知識owner | CORE/INT等へ版/scope付き材料 | LABO評価、OS登録、BRAIN独立検証/採否を分ける | 1.0内部/2.0外部 | BRAIN,N11 |
| JUDGE | current判断/予測/review/配置のproposal | INTELLIGENCE候補owner | OS/CORE等が適用、過去効果はLABO | proposalで要求/状態/権限の正本を書換えない | 1.0 | N10,LABOCON,CLASSRECORD |
| DATASET | training/validation/evaluation/holdout/prohibited dataset | INTの3.0材料；source正本は各owner、classはLABO出所 | 許可scope/revision/classを保つ学習/評価 | holdout/prohibited混入、class不明、training fitだけの改善を拒否 | 3.0 | TRAIN,CONSENT,OLDW |
| MODEL | tuned model candidate・lineage/rollback target | INTELLIGENCE 3.0候補owner | LABO独立評価/対象owner採否/OS実行経路 | 学習済みだけで稼働modelへ昇格しない | 3.0 | TRAIN,N10 |
| TRANSPORT | connection/operation/attempt/ACKのtrace・receipt | CONNECT通信証拠；業務正本はendpoint owner | 不一致/partial/expiry/重複の追跡 | raw payloadを通常traceへ複製せずACKを業務完了にしない | 対象connection scope | CONNECT,RETRY,COMPOSITE |
| TENANT | WEB-OS tenant/job/service原状態・export | WEB-OS境界；具体運転要求はVision/未採択 | 許可/最小化した観測exportだけLABO/OSへ | 本体OSとevent store/credential/writerを暗黙共有しない | Web上流採択後 | BOUNDARY,WEB,WEBCAND |
| CRED | credential/secretと値を含まないcapability/receipt | SECURITYは利用境界；物理store/enforcerは対応資源owner | actor/operation/target/environment/scope/expiryの識別子 | raw値をAI/log/artifactへ出さずBRAIN知識化しない | 1.0 | SEC,BRAIN,OLDW,INFRA |

各objectの具体保存期間・削除receipt・取消後の派生物処置は未確認。表はruntime writerを割り当てず、元source/consumer・SECURITY契約とINFRASTRUCTUREのstore属性へ照合を戻す。無期限保存や一律削除を新設しない。

## 接続の正常・反例・双方停止比較

- **NORMAL**（existing_contract_comparison）：許可scope/revisionのOS resultをLABOが受領 → 両receiptのidentity/状態/未完義務一致。観測済み未評価を保持。 根拠 RECEIPT,N04。
- **ACKLOST**（existing_contract_comparison）：受領効果後ACK欠落 → 業務未完。再送可能な同operation/digestだけ、効果一回。 根拠 RETRY,CONNECT。
- **DUP**（existing_contract_comparison）：同operation同digestを再送 → 同identityを新実績や新母数へ加算しない。 根拠 RETRY,RECEIPT。
- **COLLISION**（existing_contract_comparison）：同operationで異digest → 衝突拒否、追加効果0、ownerへ未完を戻す。 根拠 RETRY,OLDRETRY。
- **STALE**（existing_contract_comparison）：送信後に契約/endpoint revision変更 → 該当接続stale、再照合前送信なし。旧/新revision混在なし。 根拠 CONNECT,SWAP。
- **EXPIRED**（existing_contract_comparison）：期限/上限到達 → 追加attemptなし、期限/累積数/未完義務を引継ぐ。新sessionでresetしない。 根拠 CONNECT,RETRY,RESUME。
- **CANCEL**（existing_internal_contract_with_unadopted_web_comparison）：取消/許可失効後、待機または再接続 → 成功に丸めず送信停止、未完/理由保持。旧許可で再開しない。 根拠 CONNECT,RETRY,WEBCAND。
- **MISSING**（existing_contract_comparison）：欠測/遅延/観測不能 → not_observed/unknown、未観測範囲を保持。0違反/成功/healthyで補完しない。 根拠 N04,CONSENT,INFRA。
- **CLASS**（existing_contract_comparison）：class/consent/scope不明またはretention超過 → 拒否/隔離、学習/要求化/別project転用なし。後の許可で過去違反を成功にしない。 根拠 CONSENT,TRAIN,SEC。
- **HOLDOUT**（existing_contract_comparison）：evaluation/holdout/prohibitedをtrainingへ混入 → 区分/revision保持、混入を学習に利用しない。 根拠 TRAIN。
- **TENANT**（existing_boundary_with_vision_condition）：別tenant/projectのlog/credential export → 許可接続/目的scope不成立なら越境なし。Web条件を本体の採択へ変換しない。 根拠 SEC,BOUNDARY,WEB。
- **LABOSTOP**（unresolved_stop_acceptance_candidate）：LABO停止中のOS監査保全/採択済作業 → 候補比較：OS原記録/未完義務をOS側へ保持しLABO評価を生成しない。LABOを必要としない有効な既存作業はその依存で判定し、LABO結果が必要な操作は保留。送信待ちdurability/overflow/後の欠測照合は具体契約未確認。 根拠 N01,N04,RESUME,CONNECT,OLDLOCAL。
- **OSSTOP**（unresolved_stop_acceptance_candidate）：OS停止中のLABO比較 → 候補比較：既に許可された固定snapshotへの参照/分析と、新assignment/ticket/current state変更を分ける。前者も許可/freshnessを確認不能なら保留。OS停止を根拠にLABOへassignment/採否を移さない。offline許可確認/保存済receiptの有効期間/戻り待ち保全は未確認。 根拠 N05,N06,CONSENT,CONNECT。
- **RESTART**（partial_contract_comparison_with_unresolved_bilateral_recovery）：停止後の交換/再開 → 単一契約revisionへ再照合、expiry/attempt/未完引継ぎを確認。停止中revokeの再接続反映とOS/LABO両側reconcileの全scope証明は未完。 根拠 SWAP,RETRY,RESUME,OLDRETRY。

全14caseは文書比較で、未実行・受入pass未主張。特にLABOSTOP/OSSTOPは既存接続の合格で保証されると推定しない。

## repositoryとhostを独立に比較

| 案 | repo | host | 比較すること |
|---|---|---|---|
| SAME_REPO_SAME_HOST | same | same | 同一repo/hostでも意味owner・writer・data scope・接続identityを分離できるかを調べる。shared failure/resource saturationの影響は未測定。 |
| SAME_REPO_SEPARATE_HOST | same | separate | 同一source管理と独立運転を組み合わせる案。release/config版・接続・再送・権限・復旧を別に確認する。 |
| SEPARATE_REPO_SAME_HOST | separate | same | source/release管理分離だけでは障害/資源/credential境界を保証しない。cross-repo版追跡と共有host影響を調べる。 |
| SEPARATE_REPO_SEPARATE_HOST | separate | separate | 両方を分離する案。通信/版互換/ops/復旧/費用の追加条件を調べる。別hostだけでdata-use許可や独立reviewは成立しない。 |

- P1 意味正本・単一writer・projectionの区別：旧Node/DB/Git構成をcopyせず、各現ownerとtransaction境界を設計時に確定。 根拠 OLDW,OLDCORE,BOUNDARY,CONNECT。
- P2 配布/更新の同一性・版pin・consumer追随：旧GitHub-pull/tag-pinは旧選択。現repo配置/配布方式を選んだ証拠ではない。 根拠 OLDADR,SWAP。
- P3 停止/資源負荷の影響・回復：停止独立性と負荷影響の実証、予算/容量/復旧条件が未確認。server不要の旧PhaseAと中央UIの旧scopeを統合しない。 根拠 OLDLOCAL,INFRA,RESUME。
- P4 scope/許可/credential/retention分離：物理分離と利用同意を混同せず、対象environmentとdata class契約を結ぶ。 根拠 SEC,CONSENT,WEB。
- P5 接続版・再送・取消・監査/再構築：旧direction-only syncを採用済み設計にせず、接続scopeと双方停止/reconcileを確かめる。 根拠 OLDRETRY,OLDDIR,RETRY,SWAP。

旧ADR005のtool-neutral/更新同一性/中央UIと旧NFR15 local-onlyを用途ごとに保持する。旧配布repo、VPS、DB/CLI/runtimeを採用しない。LABO固有の物理分離を旧sourceで決定済みとはしない。

## source対応

| ID | path | 行 | 比較対象 |
|---|---|---|---|
| N01 | `docs/helix-os/L2-requirements/governance-requirements.md` | 58–60 | OS005登録/振分け、007原証拠/ログ |
| N03 | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–41 | 未計測/誤推薦/旧版、同意/data class/retention/scope不足の拒否 |
| N04 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 71–79 | LABO001許可観測、sourceauthority非移管、欠測保留 |
| N05 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 110–125 | LABO006実験/007system化候補、Worker割当はOS |
| N06 | `docs/helix-labo/L2-requirements/labo-requirements.md` | 132–149 | LABO009一般化/010Feedback、登録はOS/変更targetowner |
| N10 | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 145–165 | 現在判断と長期効果/BRAIN/製品meaning/3.0学習の境界 |
| N11 | `docs/helix-brain/L2-requirements/brain-requirements.md` | 150–160 | BRAIN知識promotionはLABO評価/OS登録/独立検証/採否別 |
| OLDW | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` | 33–57 | 旧source registry/原観測/proposal/commit/retention/quarantine責務 |
| OLDRETRY | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L5-detail/product-data-connector.md` | 86–109 | 旧取消/再送/異digest停止/全transaction一体 |
| OLDF | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L6-function-design/product-data-connector.md` | 27–57 | 旧tombstone/redaction/期限/単一write/reconcileの未実行oracle |
| OLDMEM | `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/orchestration-memory.md` | 23–44 | 旧継続/停止/履歴非破壊/2層memory |
| OLDADR | `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-005-distribution-model-and-central-ui.md` | 18–38 | 旧GitHub-pull/tag-pin、中央team UI、tool-neutral、配置の根拠 |
| OLDDIR | `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-005-distribution-model-and-central-ui.md` | 71–76 | 旧PhaseB direction-only/未freeze、projection正本分離、PII非複製 |
| OLDCORE | `archive/legacy-generation-2026-09-14/root/docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md` | 20–49 | 旧Python意味コア/Node単一外部作用境界、2writerの競合理由 |
| OLDLOCAL | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/nfr-grade.md` | 63–64 | 旧PhaseA local-only/PhaseB server carry、UI中央とのscope差 |
| CONNECT | `docs/helix-connect/L2-requirements/connect-requirements.md` | 44–53 | 接続scope/revision/取消/ACK/失効/未完引継ぎ/raw非複製 |
| RETRY | `docs/helix-connect/L11-acceptance/connect-acceptance.md` | 58–64 | 同operation/digest一効果、異digest拒否、取消/expiry/revoke/ACKなし |
| SWAP | `docs/helix-connect/L11-acceptance/connect-acceptance.md` | 68–70 | 片側交換4ケース/未完義務/再照合/単一revision |
| COMPOSITE | `docs/helix-connect/L11-acceptance/connect-acceptance.md` | 74–80 | 部分失敗/終端/一辺成功≠全体、未実行≠pass |
| TRAIN | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 162–184 | 3.0 training/dataset classes/lineage/rollback/candidate比較 |
| BRAIN | `docs/helix-brain/L2-requirements/brain-requirements.md` | 27–33 | 汎用知識とproject/credential/raw metrics分離、promotion状態別 |
| BOUNDARY | `docs/concept/product-boundary.md` | 61–71 | WEBOS独立authority/state/credential/writer、許可exportと改善 |
| WEB | `docs/helix-web-os/L2-requirements/service-governance-requirements.md` | 15–39 | Visionのみ。tenant/job/同意/保持/export、採択済要求ではない |
| WEBCAND | `docs/helix-web-os/candidates/service-governance-requirements.md` | 43–53 | Web未採択原案015〜021取消/観測/停止時表示/負荷分離 |
| SEC | `docs/helix-security/L2-requirements/security-requirements.md` | 90–117 | project/tenant/実環境/設定/credential境界 |
| CONSENT | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 39–41 | 未計測/因果/許可scope/同意/class/retention拒否 |
| RESUME | `docs/helix-os/L11-acceptance/governance-acceptance.md` | 29–29 | 継続/累積制約/二重実行/無許可復旧拒否 |
| INFRA | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` | 43–69 | desired/actual/容量/負荷/retention/resource ownership/観測不能 |
| LABOCON | `docs/helix-labo/L2-requirements/labo-requirements.md` | 208–222 | OS/BRAIN/INT/SECURITY観測接続と正本保持 |
| RECEIPT | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 148–154 | OS result receipt一致/同identity再送/重複/未成立保持 |
| DEC | `docs/governance/decisions/helix-connect-requirements-po-decision-2026-09-28.md` | 19–23 | 明示固定集合/適用条件採択、Web前倒し/未完継承禁止 |
| CAUSAL | `docs/helix-labo/L11-acceptance/labo-acceptance.md` | 46–46 | 相関と因果、孤立event/元event/未完義務の区別 |
| BENCH | `docs/helix-labo/L2-requirements/labo-requirements.md` | 150–154 | Bench水準生成/未評価、配置・割当・権限の非所有 |
| CLASSRECORD | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` | 120–124 | 1.0区分記録と3.0 training許可の区別 |

## 確認した差

- #2089の9/24本文「INTELLIGENCEは3.0から」は現行1.0判断支援と3.0学習の区分に照合し、旧Issue語彙で現在の1.0能力を落とさない。
- 接続再送/失効条件の存在は、双方停止時の運転継続/送信待ちdurability/取消後派生物処置の成立証明ではない。
- 旧ADR005の中央UIと旧NFR15のlocal-onlyは対象scopeが異なる。中央UI配置や未freeze VPS方向をLABO物理分離の採択へ流用しない。
- 同一repoと同一serverは独立軸。別repo/別hostだけでwriter/authority/data scopeや独立reviewが成立しない。
- data-use classを記録することはtraining許可ではなく、3.0 dataset/model候補の生成も稼働採用ではない。

## 未完

- 14objectは本scopeの分類表で、全関連data object/consumer/retention処置の全量閉包ではない。各保存期間/削除/派生物取消/再利用scopeの具体sourceが未確認。
- 双方停止の許可・送信待ち保全・overflow・catch-up・revoke伝播・再構築の全受入条件は未固定/未実行。
- 物理4案と5判断観点は旧/現source比較からの検討案。既定配置・推奨threshold・新承認gateは採択しない。
- OS005/007/012/013詳細atom、原33入力の全consumer/failure被覆、対象revision付き全判断packetは残る。

#2089/#1861はOPENを保持する。要求意味の採択、実装、配備、全criteria閉鎖は本比較から生成しない。
