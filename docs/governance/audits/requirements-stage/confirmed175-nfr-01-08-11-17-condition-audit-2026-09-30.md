# confirmed175 NFR-01..08・NFR-11..17 個別条件監査

- 基準main revision: `3a4eaad55cf7f46275f37d5e9650fa87592f4bd7`（#2405〜#2407 merge後）
- 固定PO L2/L11 revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`
- 対象: confirmed175の15 source-qualified identities。source/line hashesとtarget refsはJSONを正本として参照。
- 旧source: [旧source](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md) / asset `LEGACY-ASSET-5429AA05B022E9F49B0A` / file SHA-256 `4853a43c5ea12354dc2dab20dc3a52b15ff6be075e49fdaf1bff26280e992122`
- JSON: [confirmed175-nfr-01-08-11-17-condition-audit-2026-09-30.json](confirmed175-nfr-01-08-11-17-condition-audit-2026-09-30.json)
- 結果: 個別比較15件を記録したが、すべてsource-identity carry-forward残差はopen、successor未割当、authority effect none。

## 対象数・欠番

- 旧source line 19: `> **件数確定**: nfr は **NFR-15 件で確定** (NFR-01〜08 + NFR-11〜17、NFR-09/10 は U-補-3 PO 判断連動の欠番、計 15 件。根拠: 2026-05-28 v2 legacy source-workflows 設計概念参照 A-20 + PO declared GHA audit framework / server-optional + NFR-16 onboarding 互換性追加、`docs/migration/v2-import-ledger.md §5.1 A-20`。**NFR-17 統合セキュリティは A-54 audit 軸1 I-01 back-propagation 追加、2026-05-29**)。`
- 実在する条件行はNFR-01..08とNFR-11..17の合計15件。`harness/L1-requirements/nfr.md::NFR-09`および`::NFR-10`はU-補-3 PO判断連動の欠番で、このsourceに条件行もqueue identityもない。既存監査との重複除外ではない。別sourceのHIL-NFR-09/10とは別identity。

## 判断revisionと後発判断

- 固定比較: 2026-09-28の各機構PO decision、f6 pair。HARNESS L2 SHA `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 SHA `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。OS/CONNECT/SECURITY file SHAもJSONの`fixed_2026_09_28_pair.fixed_file_hashes`に記録。
- 後発screen: 2026-09-29の57候補判断（42採択、11条件付き採択、4保留）と別11候補判断（10採択、HARNESS-L2-049現revision未採択）を全68 identity・処置statusごとにscreenした。screen inventoryはJSONに全件収録。
- 近接pair: HARNESS-034（一般の要求別計測契約）、HARNESS-035（scope/根拠と受入寄与）、HARNESS-036（検証profile・local/CI同一gate・NFR-13の0件条件と≥90%運用目標）、SECURITY-029..034（third-party data / agentic promotion / worker context等）。後発pairは原NFR identityへのsuccessor/closureではない。
- QueueのNFR-06/13 noteは036を未採択candidateとしているが、9/29 decisionでは036採択済み。queue noteは古く、固定f6比較と後発採択pairを別revisionとして扱う。

## 条件一覧

| ID | 旧source line | line SHA-256 | fixed target IDs | queue前status | 結論 |
|---|---:|---|---|---|---|
| NFR-01 | 30 | `e24abf127b2807d8bf6598149080c3a8d03f9bec23ee128dac537af05bd43c67` | HARNESS-L2-006, HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-021 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-02 | 48 | `b730761adfae724a04f8f22fa866bc31da5dcd0cf8d380ecae5f3c1357af8d92` | HARNESS-L2-010, HARNESS-L2-011, HELIXOS-L2-021 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-03 | 64 | `f5ee06811c4bfd991112a118cc34c2239ca6a776c7e3cbcdc29d86533e8e31c9` | HARNESS-L2-010, HARNESS-L2-011, HELIXCONNECT-L2-001, HELIXCONNECT-L2-002, HELIXCONNECT-L2-003, HELIXCONNECT-L2-004, HELIXCONNECT-L2-005, HELIXCONNECT-L2-006, HELIXCONNECT-L2-007, HELIXOS-L2-018 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-04 | 63 | `638c93d710df576d991d950c61ebe5ebe13b4e6785dde5e182339baaf270eb72` | HARNESS-L2-004, HARNESS-L2-005, HARNESS-L2-010, HARNESS-L2-011 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-05 | 49 | `28a0e534f141fd20db0e5e2dcf99b2c04f9e34a1ce17090fe29109b5e693490f` | formal queue refsなし | `not_individually_compared` | identity条件未閉鎖 |
| NFR-06 | 31 | `0e1efa8f6017fd18bc55f46f1c9096c64cf3e0c2d7e73d8abef3bc3ed43c0c80` | HARNESS-L2-005 | `not_individually_compared` | 部分再導出、残差open |
| NFR-07 | 38 | `3783e9683dbe270e5fb8daea15f45f5462d3645f559d1729bef05083660fa8ca` | HARNESS-L2-007 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-08 | 50 | `0d7ed34ba3f31786088b9863c7e340eaf775febab1b6600ccba2a9d263c2d2e6` | HARNESS-L2-004, HARNESS-L2-005 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-11 | 70 | `bdd0889a116ca0456b10abec3b56ae582007a42b7cc1d72aa1734e27da2a4cb9` | HARNESS-L2-005 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-12 | 39 | `1184e84c44f332921d4629d6ad0d53383ecf30045ffdbfaa4c1daa663b027c40` | HARNESS-L2-005 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-13 | 51 | `e1be1261c63355fe7439bad12c1c60df6fc130a91713a7a862169a7e5dbde0a1` | HARNESS-L2-005 | `not_individually_compared` | 部分再導出、残差open |
| NFR-14 | 52 | `aae6461b1f1fd260865dd2ed09bb8dc32e3f6087de8be9489d7187ef0e07b101` | HARNESS-L2-003, HARNESS-L2-005, HELIXOS-L2-015, HELIXOS-L2-018, HELIXSECURITY-L2-008, HELIXSECURITY-L2-009 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-15 | 40 | `0612a5fd5b225905161d040996e0888d2d227819d2096939799668a11cbd84f6` | HARNESS-L2-006, HARNESS-L2-017, HARNESS-L2-022 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-16 | 32 | `9b06132336e8e48706ab01bc044a722ad7e83e89cec12da7aadc870d12e12067` | HARNESS-L2-019 | `not_individually_compared` | identity条件未閉鎖 |
| NFR-17 | 71 | `46a4ad7a5d4b2a1dda38fdbda2d060f8f30d22d41b2fa6cce34e41020496440d` | HARNESS-L2-005, HELIXSECURITY-L2-001, HELIXSECURITY-L2-002, HELIXSECURITY-L2-003, HELIXSECURITY-L2-004, HELIXSECURITY-L2-005, HELIXSECURITY-L2-006, HELIXSECURITY-L2-007, HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-020, HELIXSECURITY-L2-023 | `not_individually_compared` | identity条件未閉鎖 |

## 比較方法と限界

- 旧source行はarchive bytesから直接読み、queueのline SHAと再計算一致を確認。旧source asset record、line 19のA-20/A-54判断史、旧consumer tokens、crosswalk historyをJSONに保持。
- 固定f6は各targetのL2/L11文書SHA-256と、直接identity rowの行SHA/textをJSONへ記録した。`identity_row_set_sha256`は監査locator用の本監査計算digestで、PO登録digestとは別。target ref自体はsource atom被覆を意味しない。
- 各条件で旧consumer/decision/sourceへの言及、保持点、実装差、数値・exception・反例、fixed pair比較、後発pair比較、残差を個別記録。全文の逐語的source/target行証拠はJSONに収録。
- 旧CI/runtime/CLI/hook/testは一切実行していない。新世代CIも起動していない。

### NFR-01

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:30`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L30) / line SHA `e24abf127b2807d8bf6598149080c3a8d03f9bec23ee128dac537af05bd43c67`

> | **NFR-01** | **cross-platform native（HELIX solo narrow）** — Windows / macOS / Linux で動くが、HELIX solo では **「開発者本人の単一プラットフォームが第一級」**（team 全体での多 OS 同時第一級保証は不要）。移植性は goal として維持 | Windows = PowerShell entrypoint / macOS・Linux = bash entrypoint。WSL2 は任意互換環境 (必須外)。Git Bash 依存は局所化。**handover 保持期間 30 日 archive + 90 日削除 (B7=a)** で長期 stability 担保。**solo 改訂 (PLAN-L1-06)**: Windows 第一級の team 前提を「本人環境第一級」へ narrow |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: PLAN-L1-06。既存crosswalk: 個票full auditにidentity単位の現行target要約なし。
- 固定f6比較: 固定HARNESS-006はサービス単位の提供版・導入条件、010/011はpack境界・呼出し可能性、OS-021はproject配布/更新/復旧の対象scope。OS L11でも配布状態を扱うが、旧3 OSのentrypointや90日削除条件の同値oracleはない。旧NFRのteam-wide multi-OS保証は原文自身が不要としている。
- 保持: 本人の単一platformを第一級とし、Windows/macOS/Linux portabilityをgoalとして置く。
- 変更点・非継承: Windows PowerShell/macOS・Linux bash entrypoint、WSL2任意、Git Bash局所化、30日archive＋90日削除は旧実現・保持案で、固定L2/L11で同値なplatform matrixやretention SLAを個別採択したとはしない。
- 数値・例外・反例: 数値: archive 30日、削除90日 (B7=a)。例外: WSL2は任意、本人の一OSを第一級。反例候補: team-wide全OS同時第一級をNFR意味として広げない。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 対応OS matrix、support duration、handover data retention/deletion owner・trigger・failure handling・L11 oracleは個別固定pairで未照合。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-02

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:48`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L48) / line SHA `b730761adfae724a04f8f22fa866bc31da5dcd0cf8d380ecae5f3c1357af8d92`

> | **NFR-02** | **更新性第一 (updatability)** — harness 本体・skill 等の更新 / 保守が容易であること (実現手段 = plugin / skill MCP 化 等は L4 ADR 送り) | 工程別 skill 注入機構 (FR-L1-12) + PLAN 内蔵物原則 (§3.6) で skill 更新を局所化 |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: FR-L1-12。既存crosswalk: 個票full auditにidentity単位の現行target要約なし。
- 固定f6比較: 固定HARNESS-010は共通pack identity/version/依存境界、011は作業環境/画面から切り離した呼出し条件、OS-021は構成版の対象projectへの配布・更新・復旧を扱う。更新容易性という利用価値は部分接続するが、更新対象集合・互換/rollback・更新後の保守容易性oracleを旧意味単位で個別比較していない。
- 保持: harness本体とskillなどの更新/保守容易性を保持する。
- 変更点・非継承: plugin/skill MCP化はL4 ADR送りという旧技術案であり、現行の採択技術・更新機構として継承しない。
- 数値・例外・反例: 数値条件なし。例外: 実現方式を固定せずL4 ADRに送る旧source自身の境界。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: skill/本体更新の局所性、既存利用者互換、保守の評価条件/owner/回復条件のidentity別L2/L11対応。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-03

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:64`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L64) / line SHA `f5ee06811c4bfd991112a118cc34c2239ca6a776c7e3cbcdc29d86533e8e31c9`

> | **NFR-03** | **AI mode 非依存** — standalone / claude-only / codex-only / hybrid で動作。**Claude Code + Codex hybrid を主軸** | mode は `.helix/mode.yaml` で管理。hybrid 不在時は claude-only として動作、Codex 委譲 / team run は要求しない |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: `.helix/mode.yaml`。既存crosswalk: 個票full auditにidentity単位の現行target要約なし。
- 固定f6比較: 固定HARNESS-010/011はpack/call isolation、OS-018はWorker割当・実行統制、CONNECT-001..007は接続identity/contract/revision/communication/partial-failureを扱う。これらはprovider/connectivity boundaryに近いが、4 modeを同一旧条件で成立させるmatrix、hybrid主軸、Codex委譲不要の条件を直接列挙しない。
- 保持: standalone、Claude-only、Codex-only、hybridの利用mode差に左右されない実行価値を保持。
- 変更点・非継承: 旧`.helix/mode.yaml`、旧hybrid優先、Claude-only fallbackという実装形を現行mode契約へコピーしない。
- 数値・例外・反例: 旧sourceで明示されたstandalone/claude-only/codex-only/hybridの4状態。hybridは主軸だが、hybrid不在はclaude-onlyで運転、Codex委譲/team runは要求しない。反例: CONNECT接続が存在するだけでAI mode対応とは言えない。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 許容modeと各modeで成立する機能、provider不在/不整合時の停止・縮退、現行consumer責務のL2/L11条件。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-04

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:63`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L63) / line SHA `638c93d710df576d991d950c61ebe5ebe13b4e6785dde5e182339baaf270eb72`

> | **NFR-04** | 統制対象repoは**言語非依存（全種類）**。harnessはPython semantic core＋TypeScript/Node transactional boundary | harnessの実装境界は統制対象projectの言語を制約しない |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: 行本文の直接記載なし。既存crosswalk: 個票full auditにidentity単位の現行target要約なし。
- 固定f6比較: 固定HARNESS-004/005は変更影響・検証義務を、HARNESS-010/011はpack/call boundaryを定める。採択L2/L11に対象projectの実装言語を制限しない条件はあるが、旧Python/TS構成を移管したものではない。
- 保持: 統制対象projectの言語をharnessが制約しないという製品境界を保持。
- 変更点・非継承: Python semantic core＋TypeScript/Node transactional boundaryは旧内部実装案。現行の固定pairへの実装拘束としては引き継がない。
- 数値・例外・反例: 数値条件なし。反例: 対象project言語非依存を、HARNESS実装自身の言語が非拘束という意味へ拡張しない。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: consumer language coverage/matrixとそのL11反例/受入oracle。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-05

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:49`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L49) / line SHA `28a0e534f141fd20db0e5e2dcf99b2c04f9e34a1ce17090fe29109b5e693490f`

> | **NFR-05** | **CI実行・PR許可・権限証跡をGitHubへ保存**する (具体実現手段は L3/L5 で確定) | GHA workflow、branch protection、PR許可を対象HEAD・実行世代へ結び、監査可能な証拠として保存する。要求の意味・採否・合意は対象別のローカル要求正本を参照する。FR-L1-17 CI/PR連携 |

- 旧consumer／判断史: HARNESS-L2-005とOS-020/019、L11 `governance-acceptance.md:359–364,352–357`。HEAD/oracle/run identityと証拠のprovenanceを保持。旧GHA实现を再利用/実行しない。
- 固定f6比較: Queueはformal fixed_target_refsが空。full-auditの旧crosswalk noteはHARNESS-005とOS-020/019、OS L11 lines 352–364を挙げ、HEAD/oracle/run identityとprovenanceが近接する。HARNESS-005は必要検証義務/証拠とOS検収、OS-020は検収・CI運転、OS-019はevidence/continuityに関係するが、旧CI実行・PR許可・権限証跡の保存要件を1:1で個別固定比較できるtarget tupleをqueueが設定していない。
- 保持: CI run、PR許可、権限証跡を対象HEAD/run generationへ対応づけて監査可能にする利用価値を保持。
- 変更点・非継承: 旧GHA workflow/branch protection/PR permissionsは旧機構案。現行実行・CI・GitHub authorityとして継承せず、実行していない。
- 数値・例外・反例: 数値条件なし。例外: 具体的実現手段をL3/L5で決めると原文自身が留保。反例: GitHub上の記録だけから要求意味・承認を生成しない。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: formal target join自体の根拠、HEAD/run generation・actor/operation authority・evidence retention/provenance・permission outcomeの受入oracle。旧GHA実装は非実行。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-06

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:31`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L31) / line SHA `0e1efa8f6017fd18bc55f46f1c9096c64cf3e0c2d7e73d8abef3bc3ed43c0c80`

> | **NFR-06** | **fail-close** — gate / lint は安全側に倒し、silent pass を許さない。**FE detector 5 軸決定論性適用** (A-52 audit I-03): drive=fe 時は fe-detector-spec.md の 5 軸 (mock-promotion / design-token-drift / a11y-regression / visual-regression / state-transition-drift、axis-15〜19) の pass 証跡を必須化し fail-close 対象とする (FR-L1-22 連動) | subagent guard: blockOnFailure=true / gate-checks.yaml: exit 2 on fail / stdin 読取失敗も block / FE detector 5 軸 fail-close (drive=fe 時、fe-detector-spec.md) |

- 旧consumer／判断史: NFR-06のfail-closeは既存HARNESS-L2-003/005のunknown・検証保留境界にあり、FE 5軸に対する追加条件はHARNESS-L2-036候補が画面あり・合意済screen scope内で具体化する（L2 `product-requirements.md:730,748,757,763`、L11 `product-acceptance.md:493,504,513`）。候補は未採択。従ってFE fail-closeの意味不足ではなくcandidate採択状態が残る。旧`blockOnFailure`、exit code、stdin、hook等の実装方式は移さない。
- 固定f6比較: 固定HARNESS-005はverification obligation/oracle/evidenceと省略分の回収、HARNESS-003はunknown・未検証状態での進行禁止を扱う。固定f6 pairに後発HARNESS-036は含まれない。後発の2026-09-29採択HARNESS-036はscreen scope内のFE 5軸について決定論的判定とpass evidenceを求め、failureまたはevidence欠落時のsilent passを防ぐ。一般的なfail-closeとFE条件の一部を再導出できる。ただし旧block/exit/stdin実装条件は継承しない。
- 保持: gate/lintのfail-closeとsilent pass禁止、FE 5軸の適用scopeにおける証跡必須を保持。
- 変更点・非継承: `blockOnFailure=true`、exit code 2、stdin failure、subagent guard名や旧drive enumを現行runtime指定にしない。旧drive=feではなく現行screen scope/適用判断へ意味再導出。
- 数値・例外・反例: FE 5軸: mock-promotion, design-token-drift, a11y-regression, visual-regression, state-transition-drift。条件: screenあり/合意済scope。反例: non-screenの根拠付き判定にFE5軸を一律要求しない。
- 後発57+11判断: 関連pair `HARNESS-L2-036`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 固定f6個別比較では未記載。後発036でFE意味はscope限定で具体化したが、source atom移管/successorは未割当。sourceの一般gate fail-closeが全適用gateでどう評価されるかはL3/個別contractへ。
- status: `partially_rederived_residual_open`; successor未割当、authority effect none、closureなし.

### NFR-07

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:38`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L38) / line SHA `3783e9683dbe270e5fb8daea15f45f5462d3645f559d1729bef05083660fa8ca`

> | **NFR-07** | **実務で機能する完成度** — 部分 MVP でなく、成功条件 5 つを総合的に満たして初めて価値 (MVP は存在しない) | 成功条件: ① L0-L14 通し実行 / ② **solo+AI roster の gate 回転（worker≠verifier の役割境界が回る）** / ③ AI 委譲で回帰なし / ④ ダッシュボード進捗可視 / ⑤ PoC 契約化合流（**solo 改訂 PLAN-L1-06**: ②「複数人 team」→「solo+AI roster」） |

- 旧consumer／判断史: HARNESS-L2-007、L11 `product-acceptance.md:27`。Version 1の複数project/7サービス/7土台条件を持つ。旧5 success条件との完全同一性は主張しない。
- 固定f6比較: 固定HARNESS-007は選択した複数project/製品とHELIX自身を対象に、7 services単独成立と接続、1.0 platform foundations 7点を確認する。旧sourceの5条件 (L0-L14、solo+AI roster worker≠verifier、delegation regressionなし、dashboard、PoC contract merge) と対象/phase/oracleが異なり、固定targetは旧5項を列挙していない。
- 保持: 部分MVPで完成としない複合的な実務成立条件を保持する。
- 変更点・非継承: 旧L0-L14の通し実行やdashboard、PoC合流をそのまま現行Version1 L11の成功条件へ読み替えない。
- 数値・例外・反例: 旧成功条件は5件。「No MVP」という否定的境界。反例: demo 1件・単体test・doc整合・foundationの一部だけではVersion 1 completeとはならない（現行NFR target側はHARNESS-007のservice/foundation scope）。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 旧5条件の現行対応/非適用理由、Version 1全体completionの関係およびL11 oracleをidentity単位で確定していない。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-08

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:50`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L50) / line SHA `0d7ed34ba3f31786088b9863c7e340eaf775febab1b6600ccba2a9d263c2d2e6`

> | **NFR-08** | **実装宣言の真実性** — 設計 doc が主張する CLI / file / schema field に実装状態列 (installed / partial / not-implemented) を必須化し、机上の「実装済」宣言を禁止する | v2 BR-09 翻案。L3 以降の全設計 doc に `implementation_status` 列を必須化 (forward carry: `docs/migration/v2-import-ledger.md §2 F-6`) |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: FR-L1-17。既存crosswalk: HARNESS-L2-005とOS-020/019、L11 `governance-acceptance.md:359–364,352–357`。HEAD/oracle/run identityと証拠のprovenanceを保持。旧GHA实现を再利用/実行しない。
- 固定f6比較: 固定HARNESS-004/005はtrace・変更影響・必要な検証/evidenceを扱う。固定pairには設計文書全体へinstalled/partial/not-implemented列を付け、実物状態と照合する全件oracleは確認できない。full auditではL3 handoff候補としても記録するが、採択targetではない。
- 保持: 設計文書が主張するCLI/file/schema fieldの実装状態を真実に区別し、机上のinstalled宣言を避ける。
- 変更点・非継承: 全設計docへの`implementation_status`列の強制は旧forward-carry案。現行固定L2/L11の同一列・全文書適用として継承しない。
- 数値・例外・反例: 旧状態値3つ: installed/partial/not-implemented。反例: 設計上の宣言を実装現物や実行証拠と同一視しない。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 対象artifact一覧・status vocabulary・status author/evidence/source revision・未実装表示の採択受入契約。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-11

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:70`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L70) / line SHA `bdd0889a116ca0456b10abec3b56ae582007a42b7cc1d72aa1734e27da2a4cb9`

> | **NFR-11** | **GHA audit framework の役割分離** — GHA workflow と reviewer agent の権限・実行コンテキスト・出力責務を分離し、agent が gate の判定権限を持たない (machine 一次判定、AI/human は補完) | concept §audit-framework §17 / FR-L1-09 AI ガード + NFR-12 連動 |

- 旧consumer／判断史: HARNESS-L2-005、OS-020の計画/実行・meaning review/acceptance分離、OS-018 self-approval防止と各L11。責務分離は保持。GHA固有構成は継承しない。
- 固定f6比較: 固定HARNESS-005は検証義務・oracle・CI組立はOS検収、OS-020は検収・CI運転、OS-018はworkerの割当/実行および自己承認境界と接続する。責任分離は部分再導出可能。ただし旧GHA/reviewer roleを現行laneやworker名へ機械的置換せず、現行の責任・権限行列が旧source atomと同値とは主張しない。
- 保持: machineが一次gate判定を持ち、reviewer agentがgate authorityを持たない役割分離を保持。
- 変更点・非継承: GHA workflow/reviewer agentにおける旧実行context/outputの責務配置は実装形として非継承。
- 数値・例外・反例: 数値なし。反例: agent reviewが一次gate結果を変更/上書きすること、PR/reviewが要求authorityを作ること。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 現行machine/AI/humanの責任、実行context/出力境界、gate result authorityの固定L2/L11 identity別の受入oracle。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-12

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:39`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L39) / line SHA `1184e84c44f332921d4629d6ad0d53383ecf30045ffdbfaa4c1daa663b027c40`

> | **NFR-12** | **machine × AI 2 層補完機構** — Gate 判定・lint・detector は機械 (決定論的 static check) が一次、AI レビューが二次補完。両者の責務境界を明示し silent pass を防ぐ。**課金モード制約** (A-52 audit C-02): subscription / API credit の使い分けを harness が管理し、**サブスク内継続動作を default** とする (continuous-run-context-management.md §課金の制約、2026/6/15 Agent SDK クレジット分離対応)。context 0.70 閾値到達時の handover → fresh 再起動は NFR-15 server-optional と整合 | concept §audit-framework §17 / FR-L1-05 (static gate) + FR-L1-19/20 (Learning Engine + 観測) で 2 層運用 / continuous-run-context-management.md (課金・context 閾値) |

- 旧consumer／判断史: HARNESS-L2-005 / OS-020 L11 `governance-acceptance.md:362–364`が検証契約と運転状態を分離。旧subscription/API credit/context-0.70設定は新L2要件へ移さない。機械一次・AI補完の役割対応はL3で対象別に具体化可能。
- 固定f6比較: 固定HARNESS-005およびOS-020 L11は検証contractと運転statusを分けるが、NFR-12全二段役割条件を個別の同一oracleで列挙しない。後発HARNESS-034はversion管理された要求別計測contract（metric、workload、baseline、target/SLO、window、tool、evidence、oracle、owner/layer/trigger等） を一般枠で採択し、旧subscription/API credit/context値を採択しない。
- 保持: 決定論的machine checkを一次、AI reviewを二次補完に分けsilent passを防ぐ。
- 変更点・非継承: subscription/API credit運用とcontext 0.70 handover閾値は旧consumer/運用設定として保持し、固定L2要件へ移さない。
- 数値・例外・反例: context 0.70という旧閾値、subscription/API creditの選択、subscription内continuous-run default。反例: AI reviewだけpassでmachine gate失敗を覆す、または別課金方式を旧要求違反と決めつけること。
- 後発57+11判断: 関連pair `HARNESS-L2-034`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: machine/AI補完の責務を対象別にするL3条件、0.70やcredit値のauthority有無、fail/unknown処理。034一般計測契約は旧sourceのsuccessor/closureではない。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-13

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:51`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L51) / line SHA `e1be1261c63355fe7439bad12c1c60df6fc130a91713a7a862169a7e5dbde0a1`

> | **NFR-13** | **dev-local + CI 二重実行 (editor return loop)** — 同一 lint/gate を dev-local (editor PreToolUse / pre-commit) と CI (GHA harness-check) の両方で実行し、editor で fail なら commit 前に局所修正 loop に戻す。**機械検出目標** (A-52 audit I-01/I-02): cross-detection 全 axis (依存漏れ / 契約漏れ / 接続欠損 / デグレ) **0 件維持** + test-perspective-gate W字観点 (抜け / 重複) **0 件維持** を gate 通過条件に含む (cross-detection.md / test-perspective-gate.md 由来) | concept §audit-framework §17.3 / FR-L1-17 (CI/PR) + `.claude/hooks/agent-guard.ts` (PreToolUse) の 2 段運用。**gate 通過率 ≥90% (KPI D-02、B5=b)** を運用目標、`.helix/gate_runs` で計測 / cross-detection.md / test-perspective-gate.md |

- 旧consumer／判断史: NFR-13の同一lint/gateのdev-local・CI両面照合、editor fail後commit前の局所修正loop、適用scope内のcross-detection四軸とWの抜け/重複0件はHARNESS-L2-036候補で要求・受入化されている（L2 `product-requirements.md:730–773`、L11 `product-acceptance.md:493–514`）。037相当の候補は未採択でauthority_effectなし。旧0件条件は選択scopeのgate条件、≥90%は運用目標として保持し、母集団/期間/分母はL3照合、個別ticket閾値にしない。旧hook/GHA名は移さない。
- 固定f6比較: 固定HARNESS-005は選択riskに基づく検証義務。後発2026-09-29採択HARNESS-036/L11はscopeで選択した同一gate contractのdev-local/CI二面照合、local repair loop、適用scope内のscreen 5軸とW/cross-detection条件を保持する。≥90%も運用目標として明記され、分母/期間はL3へ委ねられる。固定f6に036はなく、queue noteの「036未採択」は9/29 decision後のmainでは古い。
- 保持: 同一lint/gateのdev-local+CI照合、editor failure後commit前局所修正、scope内の0件条件、≥90%を運用KPIとして原文に保持。
- 変更点・非継承: 旧PreToolUse/pre-commit/GHA harness-check/hook/database locationは現在実装の要求にしない。全ticketへ全検査を強制しない。
- 数値・例外・反例: cross-detectionの4カテゴリ=0、W perspectiveのomission/duplicate=0、gate pass rate ≥90% (D-02/B5=b)。例外: 90%は運用目標であり、ticket単位のgate thresholdではない。適用範囲は選択scopeである。unknownやcoverage不明を0と扱わない。反例: scope外のcross-detectionを0件として数える、または全製品の全ticketにすべてのdetectorを適用する。
- 後発57+11判断: 関連pair `HARNESS-L2-034, HARNESS-L2-036`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: scope/numerator/denominator/window/source eventと計測contractの詳細。現行036の解釈からsource identityのsuccessor/移管やsource atomのclosureは導かない。旧dev-localおよびGHAの具体的実装は継承しない。
- status: `partially_rederived_residual_open`; successor未割当、authority effect none、closureなし.

### NFR-14

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:52`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L52) / line SHA `aae6461b1f1fd260865dd2ed09bb8dc32e3f6087de8be9489d7187ef0e07b101`

> | **NFR-14** | **human-as-residue 原則** — 機械チェック (machine) と AI レビュー (NFR-12) で潰せない判断のみを人間 (PO) に escalate。silent pass を避ける反面、人間の判断負荷も極小化。**Recovery 収束 audit trail** (A-52 audit I-04): Recovery モード発動時、stop-hook が認識訂正履歴を自動 dump し audit trail (`.helix/recovery_log/`) に収める (recovery-workflow.md §基本フロー、収束時間 SLO は L3 NFR-grade で確定) | concept §audit-framework §17.4 / 全 gate で machine → AI → human の優先順、判断要点 + 根拠 + 推奨アクション を構造化提示。**gate fail-close 例外権 = PO のみ + audit 記録 (S-03/B6=b)**、bypass 件数 0 を KPI D-06 で計測 / recovery-workflow.md (認識訂正履歴) |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: A-52、FR-L1-22。既存crosswalk: NFR-06のfail-closeは既存HARNESS-L2-003/005のunknown・検証保留境界にあり、FE 5軸に対する追加条件はHARNESS-L2-036候補が画面あり・合意済screen scope内で具体化する（L2 `product-requirements.md:730,748,757,763`、L11 `product-acceptance.md:493,504,513`）。候補は未採択。従ってFE fail-closeの意味不足ではなくcandidate採択状態が残る。旧`blockOnFailure`、exit code、stdin、hook等の実装方式は移さない。
- 固定f6比較: 固定HARNESS-003/005はunknown/pending時の扱いとriskに基づく検証を扱う。OS-015/018のauthority/execution、SECURITY-008/009のoperation authority/revoke境界も関連する。後発HARNESS-036はscope限定のgate parityを示し、57/11のSECURITY行はauthority/isolation/revoke条件を追加する。D-06 KPI auditは別の旧identityであり、単独でNFR-14を閉じない。対象pairは旧machine→AI→human全workflowやrecovery trailの正確な修正履歴を規定していない。
- 保持: machine→AI→humanの順序を保ち、どちらの層も解決できない判断だけをescalateする。人の負担を抑え、fail-closeの例外にはPO/audit境界を設け、recovery時の修正履歴を監査可能にする。
- 変更点・非継承: 旧stop-hook/.helix/recovery_logの保存/runtime pathやrecovery収束SLOは採択済みの実装/値ではない。SLOは明示的にL3へ委ねる。
- 数値・例外・反例: 例外: fail-closeの迂回はPO判断とaudit記録がある場合のみ (S-03/B6=b)。迂回目標は0件 (KPI D-06)。recovery収束SLOはL3へ委ねる。反例: PO/auditなしの迂回、またはunknownなescalationを人の判断なしでpassとして扱うこと。
- 後発57+11判断: 関連pair `HARNESS-L2-036, HELIXSECURITY-L2-029, HELIXSECURITY-L2-030, HELIXSECURITY-L2-031, HELIXSECURITY-L2-032, HELIXSECURITY-L2-033, HELIXSECURITY-L2-034`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: PO限定のexception grant/evidence lifecycle、recovery correction recordの内容と収束SLO、旧stop-hookとの関係、他NFR/securityとの境界。条件全体のclosureを推定しない。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-15

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:40`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L40) / line SHA `0612a5fd5b225905161d040996e0888d2d227819d2096939799668a11cbd84f6`

> | **NFR-15** | **server-optional 拡張** — Phase A (local DB + local dashboard) は server 不要、Phase B で server sync を opt-in 追加可能。harness core は local-first を維持し server を必須条件にしない | dashboard Phase A 必須 / Phase B 拡張 (BR-20 / FR-L1-20 / L3-L4 carry、PGlite + ElectricSQL ADR-002 候補)。**Claude ↔ Codex provider 間 handover** (FR-L1-42、F5=a) で多 provider 拡張は将来対応 (現状 Claude+Codex のみ) |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: PLAN-L1-06。既存crosswalk: HARNESS-L2-007、L11 `product-acceptance.md:27`。Version 1の複数project/7サービス/7土台条件を持つ。旧5 success条件との完全同一性は主張しない。
- 固定f6比較: 固定HARNESS-006/017/022はproduct release/environment installationと外部verification handoffを扱うが、server optional/local-first architectureやPhase A/B sync contractを明示していない。
- 保持: Phase Aはserver不要のlocal DB+dashboard、Phase Bではcoreをlocal-firstに保ったままopt-inのserver syncを追加できる。
- 変更点・非継承: PGlite/ElectricSQL ADR-002は候補技術である。Claude↔Codex handoverの将来的な拡張性は現行providerやdeployment designを定めない。
- 数値・例外・反例: 2つのphase。Aではserver required=false、Bではopt-in。旧sourceが示すproviderはClaude+Codexのみだが、現行で採択済みとはならない。反例: hosted serverをPhase Aで必須とする、またはNFRから技術DBを推定する。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: offline/local availability contract、sync consistency/authority/failure behavior、phase criteria、data migration、acceptance。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-16

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:32`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L32) / line SHA `9b06132336e8e48706ab01bc044a722ad7e83e89cec12da7aadc870d12e12067`

> | **NFR-16** | **onboarding 互換性** — 既存プロジェクトへの途中導入時、既存 docs / コード / state の不整合を block せず段階移行 | FR-L1-44 連動。既存資産を harness state に段階的に取り込み、初回 import でプロジェクトを止めない |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: BR-09、`implementation_status`、`docs/migration/v2-import-ledger.md §2 F-6`。既存crosswalk: 個票full auditにidentity単位の現行target要約なし。
- 固定f6比較: 固定HARNESS-019のfull-reverse入口は既存docs/requirements/design/implementationを工程へ取り込み、現行artifactやstatusがunknownの場合を扱う。ただし既存のあらゆる不整合をnon-blockingにしたり、旧first-import意味を定めたりするものではない。HARNESS-L2-019/L11 targetは関連するが部分的である。
- 保持: 既存projectを途中から導入するとき、既存docs/code/stateの不整合を理由に処理を止めず、段階的にimportする。
- 変更点・非継承: 旧state/import表現と現行L2-019の詳細は、旧state categoryとmigration failure semanticsを比較するまで同等とは扱わない。
- 数値・例外・反例: 数値条件なし。反例: 初回importで要求を黙って書き換える、またはunknownなauthority/stateを昇格させること。段階的importがnon-blockingとなるのは、現行authority/evidence規則が許す範囲に限る。
- 後発57+11判断: 関連pair `特定identityへの直接対応なし`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 許容する不整合、段階的stateの表示/reconcile方法、unknown/conflict時の停止条件、L11例/oracle。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

### NFR-17

- 旧source: [`archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md:71`](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/nfr.md#L71) / line SHA `46a4ad7a5d4b2a1dda38fdbda2d060f8f30d22d41b2fa6cce34e41020496440d`

> | **NFR-17** | **統合セキュリティグレード (DevSecOps 5 段階 + OWASP Agentic Top 10 + EU AI Act Art.14 human oversight)** — 下記 3 観点を単一トレース ID 配下で機械保証し、G1-trace / KPI 計測 / L4 セキュリティ設計の親 NFR とする (A-54 audit 軸1 I-01: 観点のみで NFR-ID 不在 → trace 対象外だった漏れを解消) | (a) 5 段階: Develop / Commit / Build / Deploy / Operate 各段の統制 (Build = SAST / SCA / Secret Scan、L0 §2.4) / (b) OWASP Agentic Top 10 (Prompt Injection / Insecure Tool Use 等、FR-L1-09) / (c) EU AI Act Art.14 (NFR-06 / NFR-14 / BR-02 で機械保証)。詳細グレードは L3 nfr-grade §5 + L4 セキュリティ設計 |

- 旧consumer／判断史: 原文中のconsumer・関連ID・decision/source参照: concept §audit-framework、FR-L1-09。既存crosswalk: HARNESS-L2-005、OS-020の計画/実行・meaning review/acceptance分離、OS-018 self-approval防止と各L11。責務分離は保持。GHA固有構成は継承しない。
- 固定f6比較: 固定HARNESS-005、SECURITY-001..009/020/023、OS-018等は、外部data authority/injection、project isolation、configuration/credential/egress、worker制約、operation authority、revoke/quarantine、Guard/Bot境界、update promotionを扱う。広範な部分再導出だが、5段階を統合したsecurity gradeやgrade/KPI oracle・Article 14/Top10網羅性testを備える単一trace IDは明示されない。後発で採択された57件のSECURITY-029..034はthird-party data/agentic promotion/追加worker/v1.3 bypass/context/profileを扱う。隣接領域としてscreen対象だが、NFR-17全体のclosureや旧scoreを宣言しない。
- 保持: security責任はdevelopment/commit/build/deploy/operate、agentic risk、人間のoversightにまたがり、相互参照traceを意図する。
- 変更点・非継承: 旧DevSecOps grading/KPI/L4を親とする構造、OWASP Agentic Top 10/EU AI Act Art.14のmappingを現行採択済みstandard/thresholdとは主張しない。旧gate-signoff/agent guard runtimeも再稼働しない。
- 数値・例外・反例: 5 stages、OWASP Top 10、Article 14 human oversight、trace/KPI。source行に数値のgrade thresholdはない。反例: SECURITY機能の一部を網羅してもend-to-endの統合gradeとはならない。10個のlabelや法令への言及だけでは測定可能なpass oracleにならない。
- 後発57+11判断: 関連pair `HELIXSECURITY-L2-029, HELIXSECURITY-L2-030, HELIXSECURITY-L2-031, HELIXSECURITY-L2-032, HELIXSECURITY-L2-033, HELIXSECURITY-L2-034`。これは後発の隣接証拠で、successor/closureを生まない。
- 残差: 統合gradeの定義/version、trace網羅性、対象製品/stage、KPI、人間oversightの基準、例外時の正確なresponse、適用する法令/source revisionはidentity単位で未割当。
- status: `crosswalk_rederived_identity_comparison_open`; successor未割当、authority effect none、closureなし.

## 集計・限界

- source個票15件のexact identity/line digestはconfirmed175 queueと一致。queueの事前statusは全件 `not_individually_compared`、evidence artifactは空。既存full-audit crosswalkはStep5 individual comparison/closureとは区別した。
- NFR-06/13は後発HARNESS-L2-036と意味近接し一部具体化されたが、source identity successorは割り当てず、f6時点にも遡及させない。NFR-12とHARNESS-L2-034も一般計測契約との近接として扱う。
- 本監査は要求意味の変更、採択、retire、successor、設計/実装/受入完了を生成しない。旧sourceの数値・実装例を現行要件へ自動昇格しない。
