# confirmed175 BR-21／BR-22 固定f6条件照合監査（2026-10-01）

基準HEAD `64cdf20b320846eeef88cb9e5882d8cd7232bf15`。固定比較対象はPOが対象revisionとして確定・合意したL2/L11 commit `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。read-onlyの旧条件比較で、`authority_effect: none`、formal successor 0、closure false。

## 対象identity・範囲

対象はconfirmed175のsource-qualified identity 2件。旧sourceはconfirmed／preserved_pending_rehomeで、個票の先行比較状態はどちらも`not_individually_compared`。旧sourceの対応箇所、条件分析、固定L2/L11 exact section、decision/MPR row pinsは[JSON証拠](legacy-confirmed175-br21-22-fixed-f6-condition-audit-2026-10-01.json)に収録した。

| identity | archive source | line | source line SHA-256 | 固定対象 |
|---|---|---:|---|---|
| `harness/L1-requirements/business-requirements.md::BR-21` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` | 368 | `77b65423feb226462b9ba9f9a94411da7113819085ea50fe3bacd4b9f264f21a` | HELIXOS-L2-022, HELIXLABO-L2-050 |
| `harness/L1-requirements/business-requirements.md::BR-22` | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md` | 49 | `f12e9c75d5647397c310c51486c0cc0ca2f0bd8482ca191b00ac468ed608d74d` | HELIXOS-L2-018, HELIXOS-L2-019, HARNESS-L2-031, HELIXBRAIN-L2-008 |

### HIL-BR identityとの区別

旧`infinity-loop-platform-requirements.md`の`HIL-BR-21`（line 73）／`HIL-BR-22`（line 74）は別source-qualified identity。BR-21/22の短縮IDとして扱っていない。各行・file SHAはJSONの`scope.excluded_identity_disambiguation`に固定し、今回の2 identityへ混ぜない。

## 個票比較

### BR-21 — `harness/L1-requirements/business-requirements.md::BR-21`

旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:368`、file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `77b65423feb226462b9ba9f9a94411da7113819085ea50fe3bacd4b9f264f21a`。

**原条件:** ## §11 BR-21 AI 実行成果の継続評価と改善サイクル

**条件atom:** AI実行品質を継続評価する；委譲/skill/model/PoC成果を蓄積・分析する；skill推奨精度・model選択基準・PoC成功率の継続改善；反復実行が基盤の学習へつながるという価値主張

**正常条件:** 観測・実験結果を由来/対象revision/適用scope付きで評価し、候補、既存の採否主体、OS登録/routing、target ownerによる変更と検証、LABO再観測を状態別に結び、効果と退行が再観測できる状態を保持する。

**拒否条件:** candidate登録、成功件数、CI成功、実行結果だけから採択・要求変更・改善完了を生成しない。旧skill/model/PoC projection/databaseや「自律学習」auto-applyを現行authorityへ移さない。

**失敗条件:** 評価owner・適用範囲・判断先・対象revision・変更後の検証/再観測が欠落またはstaleなら循環未完として候補/未完義務を保持し、評価・判断・target ownerへ返す。

**数値照合:** BR-21本文はP2起点、FR-L1-36/38/43の旧実装状態、D-07の旧70%を業務的根拠に記すが、BR identity自身の達成閾値としてAI品質改善値を定めない。旧FR由来のrating/rate/30日unused/cold-start等は別identityの詳細であり、BR-21へ自動移管しない。

**固定f6比較:** 意味再導出の一部と部分接点。OS-L2-022/L11は観測→候補→既存判断主体→ticket→変更/検証→再観測のrouting/traceを1.0土台とし、評価ownerをLABOへ置き、知識取込・ローカルLLM学習の後続能力を除外する。LABO-L2-050/L11は内部改善循環をObservedから再観測まで明示し、登録/変更/CI成功だけを完了としない。一方、旧skill/model/PoC評価対象自体、各旧metric定義、数値・DB projectionと「繰返すほど賢くなる」の出力保証は同値再現されず、L3承認対象でもない。

**残差:** BR-21 source identityはpreserved_pending_rehome。successor割当0、closureなし。循環の部分接点は旧identityの全condition transfer/acceptance/runtime実装を意味しない。

| target | L2 fixed section (path:lines; section SHA) | L11 fixed section (path:lines; section SHA) | PO decision file/line | MPR line / SHA |
|---|---|---|---|---|
| `HELIXOS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:712–721` / `0420ffc076b080ceba91b3344d149d1316c745bf36c2ea3a97e2cc07f9359aea` | `docs/helix-os/L11-acceptance/governance-acceptance.md:373–379` / `844a21ece8560bc7fd0cad5b1982d96027847ac07a44518a85e5eab29539c7a8` | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48` / `3dfc3b0fc76ac744c97ae07cbeec090ad45722027b058f1867c395432018d053` | `MPR-RC-HELIXOS-L2-022-001` at 56 / `3fcf774d9998f12e767755c16dd030aa0f35b0adf4a6ae5575f076e82aacf291` |
| `HELIXLABO-L2-050` | `docs/helix-labo/L2-requirements/labo-requirements.md:298–303` / `e41ea805b72f36d34e326b11488f07d2f0a3e030b795442f47370e6869aecbce` | `docs/helix-labo/L11-acceptance/labo-acceptance.md:100–137` / `6ee4fdac781603e41bcc4269c08fcb3a8efe562009f3a0e84ec9befa30c7ab73` | `docs/governance/decisions/helix-labo-requirements-po-decision-2026-09-28.md:92` / `44ffeb5a3f827c2e774a356ef53d2a33af188104c4abce202bd7cdbaa7871d7d` | `MPR-RC-HELIXLABO-L2-050-001` at 278 / `d680e2e0b20506f9675c536701fca3fa60653af76e74cc4013fd248553f01764` |

### BR-22 — `harness/L1-requirements/business-requirements.md::BR-22`

旧source: `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/business-requirements.md:49`、file SHA-256 `09ad9a27afe25bd730f57319865d1f342e6b31729da2dd27f22ecd6cb753ac61`、line SHA-256 `f12e9c75d5647397c310c51486c0cc0ca2f0bd8482ca191b00ac468ed608d74d`。

**原条件:** | **BR-22** | **自前 runtime 内部資産体系を持つ** — HELIX は自身が使う/対象に提供する **subagent roster / skill pack / command** を HELIX 用の正本資産として持ち、source-derived資産を「そのまま使う」のでなく **HELIX 用に再構築**する。guard (呼出統制) だけでなく資産そのものを統制対象とする (再構築の HOW = FR-L1-46〜49) | A-77 PO 指摘 (前提抜け) / Recovery PLAN-RECOVERY-01 |

**条件atom:** HELIX用の正本内部資産体系を持つ；subagent rosterをsource-derivedのまま使わずHELIX向けに再構築する；skill packをsource-derivedのまま使わずHELIX向けに再構築する；commandをHELIX用正本資産として持つ；guardだけでなく資産自体を統制対象にする；FR-L1-46〜49が示すhowとの関係

**正常条件:** HELIX自身が使う/対象に提供する内部資産について、HELIX固有の正本、sourceからの選別/再構築、資産自体の版・状態・provenanceと運用責務を定め、呼出guardのみの統制に縮めない。

**拒否条件:** source資産のそのまま使用、実行guardだけを内部資産体系全体の置換とみなすこと、旧agent/skill/command/helix CLIの具体実装や数値件数を現行採用済みとみなすことを避ける。

**失敗条件:** 資産の由来・identity・版・状態・責務owner・利用範囲が不明/不一致のまま、正本資産または実行可能資産として扱わない。固定対象に明記がない具体catalog lifecycleを追加条件として推定しない。

**数値照合:** BR-22 identity自体に件数/率/期間の数値oracleなし。FR-L1-46〜49のlegacy residue 0等の条件は関連する別旧FR identityで、BR-22単独のoracleではない。

**固定f6比較:** 意味再導出の分割と部分接点。OS-L2-018/L11はWorker割当・attempt・handoff、L2-019/L11はevent/provenance/evidence continuityを扱うが、asset catalog自体のHELIX roster/skill/command再構築を明示しない。HARNESS-L2-031/L11はHELIX用engineering styles/requirementsをsource-derived knowledgeから分けて持つが、旧内部資産3分類すべてのlifecycleではない。BRAIN-L2-008/L11はknowledge identity/version/stateを扱う一方、roster/command資産管理と同値ではない。Worker共通execution contractをOS、engineering styles/requirementsをHARNESS、汎用design knowledgeをBRAINへ分けるが、完全なcatalog/lifecycle successorではない。

**残差:** subagent roster/skill pack/commandのHELIX asset catalog・source-derived再構築・全資産lifecycle/guard整合の後継は確定していない。source identityはpreserved_pending_rehome、successor割当0、closureなし.

| target | L2 fixed section (path:lines; section SHA) | L11 fixed section (path:lines; section SHA) | PO decision file/line | MPR line / SHA |
|---|---|---|---|---|
| `HELIXOS-L2-018` | `docs/helix-os/L2-requirements/governance-requirements.md:672–681` / `4ca189ed491490e2ed1ee75095b64d2e294319e6132d4595d631fcd4ba8bc408` | `docs/helix-os/L11-acceptance/governance-acceptance.md:345–351` / `77e8ef58e9774503379bb3a84a0218fa29dbad536e142122c7bee8e8bc0b1d53` | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48` / `3dfc3b0fc76ac744c97ae07cbeec090ad45722027b058f1867c395432018d053` | `MPR-RC-HELIXOS-L2-018-001` at 52 / `b3e034893cfe8e45d0d4ca3f033c06cda80af6557c61c21d28b2a083473e70d5` |
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682–691` / `9362a64eef0f04968a8b1e89fde0027a145d5ab5c6aa9a6423d6e05e19ed447a` | `docs/helix-os/L11-acceptance/governance-acceptance.md:352–358` / `9e17211bf2f7f54a58e2be30e23335954d94e184573912ed4f3ac92246838351` | `docs/governance/decisions/helix-os-requirements-po-decision-2026-09-28.md:48` / `3dfc3b0fc76ac744c97ae07cbeec090ad45722027b058f1867c395432018d053` | `MPR-RC-HELIXOS-L2-019-001` at 53 / `432271809d1ab4ae40fd50b888cfced90ea4091a774200da793c1039cd1734a4` |
| `HARNESS-L2-031` | `docs/helix-harness/L2-requirements/product-requirements.md:627–646` / `ca1e113a5980df023bdb27bb461e1fc57137d14da060d26180e4d70abdf90611` | `docs/helix-harness/L11-acceptance/product-acceptance.md:416–423` / `94aa12f4a5b03b14f2827db8f024cc3ac8aeae563730013127af83aff862f005` | `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md:60` / `6e3374fdd8912ca008528e5f6c7671382cb9162bc79d13f8c78dafc1507b809d` | `MPR-RC-HARNESS-L2-031-001` at 430 / `7a524b2f2fdcda5b58ea0d2126c6ca8b84505b430781a90b0079c9b1d7195d93` |
| `HELIXBRAIN-L2-008` | `docs/helix-brain/L2-requirements/brain-requirements.md:161–171` / `90cc1f814eda48b0da887912b3a0862b94291e3264cd6c84225d14e19bc0900e` | `docs/helix-brain/L11-acceptance/brain-acceptance.md:36–86` / `14fb3aa8cf7a3e951964059af01669e2132af320167ed11770ee0095d1439d31` | `docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md:55` / `552f51a268f1a3deef1c9246dd00484417fdb7904fdbfa6d11163a087dbd8f82` | `MPR-RC-HELIXBRAIN-L2-008-001` at 154 / `d35d75465d2e14fdb2517c774ef70c5b5c8b60c70706f4ede85d59c04c6659e8` |

## 旧consumer/detail条件の保持と残差

以下は各BR identityが結ぶconsumer sourceを読み、path・line range・file SHA・line/range SHAをJSONへpinした結果。BR-21 §11は旧business-detailへ評価単位・metric・人の境界を展開する。BR-22はFR-L1-46〜49を再構築HOWとして参照し、L3 carry row 745へ計画配置する。これら下位詳細や別FR identityの条件をBR identity自身の新閾値・現行採択条件へ昇格しない。

| BR identity | 旧consumer source | exact lines |
|---|---|---|
| BR-21 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md` | 27–70、179–230 |
| BR-22 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md` | 77–80 |
| BR-22 | `archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/functional-requirements.md` | 745 |

File SHA、range SHA、全行SHA/textはJSONの各record `legacy_consumer_pins`に記録した。

### BR-21

**現行側で保持する意味:** AI実行品質を継続評価し、委譲成果から改善候補へ戻す目的。固定L2/L11はOSの候補routing、LABOの評価と再観測、target ownerの採否・変更責務に分けた循環を記述する。

**旧下位consumerの未移管条件:** BR-21 §11（旧business-requirements.md:368）はbusiness-detail.md:27–70および179–230へ評価HOWを接続する。そこではPLANを既定評価単位、skill/modelを補助単位とする分解、頻度を示す。5 metric/条件は、実行成功率80%以上、token cost計測（閾値なし）、実行時間中央値1 sprint以下推奨、retry回数3未満、fail-close発火率5%未満。model利用はopt-in。30日unusedのflaggingとskill削除は人間判断の境界を持ち、PoC pivotは成功から除外するだけでなく分母に含める。これらはbusiness-detailのBR-21 consumer残差として保持し、現行L2/L11の閾値やacceptanceにしない。

BR-21本文自身は§11.3にD-07「AI委譲時間率 ≥70%」を業務的根拠として記す。これはbusiness-detailの5評価指標閾値とは別で、今回の比較から新しい採択目標を作らない。

### BR-22

**現行側で保持する意味:** HELIX用の正本内部資産を持ち、source-derived資産をそのまま使わずHELIX向けに再構築し、guardだけでなく資産自体を統制する。固定f6ではOSのWorker/evidence、HARNESSのengineering pack、BRAINのknowledge identityへ責務が分かれる。

**旧下位HOWの未移管条件:** BR-22 source line 49はFR-L1-46〜49を「再構築のHOW」として参照する。functional-requirements.md:77–80はrosterのcapability/model/guard再構築、skill packのHELIX版SKILL_MAPと区分・trigger、commandのCLI化、roster/guard等のdrift lintを示す。L3 functional-requirements.md:745はW6/W7・W10・W11/W12/W16・IMP-033へのcarry計画を示す。これらFR identity別のHOWをBR-22の独立した閾値として扱わず、現行BR条件へ全件移管したとは扱わない。sourceにある「70 binaries」「19 docs/commands」は旧FRの棚卸入力で、BR-22の目標件数ではない。各HOWの現行対応、資産catalog全体、drift oracle/lifecycleは未確認のまま残す。

## 後発採択decision／neighbor screen

採択状態の見落としを避けるため、decision cohorts 57/11/live26の**全94 decision rows**をdecision line SHA付きでindex化し、registrationがある93行は対応MPR line SHAも併記し、そのうち**88 adopted registration-decision rows**と**6 held rows**を区別した。88はcohort別に53/10/25。保留を採択扱いせず、registrationのないHARNESS-L2-049 narrative holdもdecision lineだけをpinする。CN1-6監査のdirect-match結論はBR-21/22へ流用しない。全94のindexと各statusはJSONの`adopted_identity_status_index`に記録する。

neighbor screenは旧identityごとの条件近接に限定し、8 unique adopted neighbors（BRとのassociationは9件、072は双方へ別association）を確認した。採択状態とexact decision/MPR/L2/L11 pinsはJSONの`selected_neighbor_pair_pins`にある。L2/L11 adopted-revision file/section pin、current HEADとの同一性、およびPO row/MPR candidate semantic digestは個別字段で保持し、semantic digestをraw section SHAと同一視しない。

| neighbor | BRとの関係 | adopted scope / pin | BR条件との bounded relation |
|---|---|---|---|
| `HELIXOS-L2-048` | BR-21 | 57 row 71 / MPR 576 | 返却・検証不成立feedbackの評価・還流接続。BR-21全体や全metricsのsuccessorではない。 |
| `HELIXLABO-L2-063` | BR-21 | 57 row 78 / MPR 486 | 修復再発評価から予防候補への還流。旧skill/model/PoC projectionを閉じない。 |
| `HARNESS-L2-053` | BR-22 | 11 row 33 / MPR 608 | canonical command identity/再送判定。command資産全体のlifecycleではなく、L11はadoption前snapshot metadataを保持。 |
| `HARNESS-L2-047` | BR-22 | conditional A; 57 row 52 / MPR 572 | specialist Workerを必要とした場合のcontract generationをHARNESSが所有。roster rebuild/catalog全体ではない。 |
| `HELIXINTELLIGENCE-L2-072` | BR-22 | conditional B; 57 row 85 / MPR 535 | skill component identity/version/applicabilityが隣接。1.0はcandidate generation/shadowまで。skill efficacyからのpack improvement loopは1.0外。 |
| `HELIXINTELLIGENCE-L2-072` | BR-21 | conditional B; 57 row 85 / MPR 535 | feedback/evaluationへの近さに限る。skill efficacy loop、active enforcement、model/skill基準の自動更新は含まない。 |
| `HELIXINTELLIGENCE-L2-074` | BR-21 | adopted; 57 row 87 / MPR 587 | evaluated returned feedbackを次のplacement proposalへ同scope evidenceとして引用。proposalのみでqualification・順位・model updateを決定しない。MPR atom setは空。 |
| `HELIXLABO-L2-065` | BR-21 | conditional D1; 57 row 80 / MPR 537 | “first Attempt result”は067と別指標。 qualification evidenceに限り、BR-21全体のoutcome projectionでない。 |
| `HELIXLABO-L2-071` | BR-21 | adopted in live26; row 50 / MPR 637 | task-class GitHub audit Worker/model qualification接点。全task model ranking、継続projection、自動基準更新でない。 |

以上はBR-21/22へ近い採択neighborのscreenであり、正式successor割当は0、closure falseを維持する。特にINTELLIGENCE-072/074・LABO-065/071はBR-21の評価単位・metric・PoC結果やBR-22の資産再構築のcompletionを代替しない。

## 結果・限界

BR-21ではOS改善候補のroutingとLABO内部改善循環に意味接点があるが、旧skill/model/PoC評価対象やmetric projectionは同値移管されていない。BR-22ではOSのWorker/evidence、HARNESSのengineering pack、BRAINのknowledge identityへ責務を分けて再導出しているが、旧roster/skill/command全件のHELIX資産catalogとlifecycleは未確定。旧sourceはpendingのまま保持し、後続版や同名HIL identityから採択・閉鎖を推定しない。

旧workflow／CLI／hook／test／CI／runtimeは実行していない。

## 静的検証

- source file/line SHA、consumer file/range pins、固定f6の6 L2/L11 target section、94 decision/MPR index（88 adopted／6 held）、neighbor decision/MPR/adopted-revision L2/L11/current HEAD pins照合: pass
- JSON parse: pass
- `python3 scaffold/tools/scfctl.py validate`: `bindings=143 fail=0`
- `git diff --check`: pass
- archive内実行物: not run
