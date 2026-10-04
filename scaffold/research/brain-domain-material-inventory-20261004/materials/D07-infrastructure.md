# D07 Infrastructure：知識素材の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装、BRAINへの登録の決定ではない）
authority_effect: none
基準：`origin/main` `064a1cf5`（2026-10-04）。旧HELIXのpathは`archive/legacy-generation-2026-09-14/root/`からの相対で書く。
素材の状態：本書の素材はすべて「未評価の候補素材」である。採用済み・評価済みとして扱わない。

## この領域の範囲（本書での読み方）

HELIXBRAIN-L2-001（`brain-requirements.md` 90）の初期領域の一つ。この領域だけは個別の要求が既に採択されている：HELIXBRAIN-L2-INFRA-001〜017（`brain-requirements.md` 53–69の一覧、220–390の本文。対のL11は`brain-acceptance.md` 41–57）。POは2026-09-28に全17件を1.0で採用した（`docs/governance/decisions/helix-brain-requirements-po-decision-2026-09-28.md` 60–76）。本書は採択済みの要求ごとに、旧HELIXの素材がどれだけあるかを照らす。要求の意味は変えない。採択前の候補文書`docs/helix-brain/candidates/infrastructure-domain-requirements.md`は、判断史と素材の由来（旧NIO-L3の引用）を辿るためにだけ参照する。

**状態の区別**：本書の素材は「未評価の候補素材」であり、照らし合わせる先のINFRA要求は「採択済み」である。素材の有無やgapは、要求が未決であることを意味しない。

**Web展開後の内容の扱い**：本番の隔離、canary分析、本番のchaos、本番のSLO監視、公開の基盤運用等は、素材として記録しても1.0の必須にしない（`scaffold/verification-test-template-seed-20261001/README.md`「Web展開後に扱う内容」、`scaffold/research/design-template-seed-sdop-20260929/README.md` 39）。BRAINは実環境の状態・資格情報・providerのaccount・操作権限を持たない（`brain-requirements.md` 29、459）。

## 1. 旧HELIXの素材

| 素材ID | asset ID | path | 行 | 全体SHA-256 | 何の知識か | 知識recordにする場合の候補粒度（案） | 限界・古さ・HELIX固有か汎用か |
|---|---|---|---|---|---|---|---|
| D07-M01 | LEGACY-ASSET-042D2B732DC68AA7EE9A | `.claude/agents/devops-deploy.md` | 26–71 | 373422f0d55255110ce4f751f301b98a9f974c909039f5d35c5a3c4879e87ef1 | containerの作り方（multi-stage、非root、除外file、health check、軽いbase image）、pipelineの段（lint→test→build→security scan→staging→E2E→本番）、環境の分離（dev／staging／本番ごとのdeploy方法とdata：stagingは匿名化した本番copy）、生存確認と依存の準備確認を分ける（`/health`と`/ready`）、rollbackの手順、監視とalertの表、秘密を環境変数で渡す | Pattern候補「環境の分離」、Part候補「生存確認と準備確認の区別」、Design Unit候補「deploy pipelineの段」 | 旧agent設定の一般論。**数値（timeout・間隔・失敗回数の51、error率・latency・CPU・memory・diskの閾値の62–66）は持ち込まない**。Docker、Trivy／Snyk、GitHub Actions等のtool名は技術選定であり素材にしない |
| D07-M02 | LEGACY-ASSET-18BB86CC5625C31430B8 | `docs/skills/ci-deploy-and-rollback.md` | 48–85 | fc185660f4ce7ee517453b9367eb7fc349f23824511e923ef7e9a6eef31e26e9 | 状況ごとのdeploy方式（data移行無しは置換＋即smoke、機能はflag-offで出しflag-offを即時rollbackにする、退行は最後の正常版へ戻しdataが変わっていればDBを先に戻す、hotfixは最小変更＋二者review）、deploy後のsmoke、rollbackの基準をdeployの前に決める、rollbackは解決ではなく原因と退行testを残す | Pattern候補「feature flagによるrollback」、Design Unit候補「rollback基準の事前定義」、Anti-Pattern候補「rollbackを解決とみなす」 | 「約15分監視」（62）は数値なので持ち込まない。pre-deploy gate（32–46）はHELIXのcommand。DB migrationの安全性（87–92）はD06-M04で扱った |
| D07-M03 | LEGACY-ASSET-4618C7243C283228809A | `docs/skills/incident-runbook.md` | 30–69 | f5ba60755a67d7aff8a38eb2fd4212a17fa3c9186a63ce4763843f25a458e402 | runbookを事前に書き、必須の節（alertごとの対応、rollback、役割で書いたescalation）を持つ、閾値は観測設計の正本を参照して重複させない、初動で症状と範囲を確かめseverityを分ける、手順の無い症状に本番で即興しない、事後に手順を反映し原因の修正と退行testを残す | Pattern候補「事前のrunbook」、Anti-Pattern候補「本番での即興対応」 | 「3件以上のalert」（35）「最初の約15分」（55）は数値なので持ち込まない。三者承認（48–49）はHELIXの運用規則。既存DT-SDOP-003と重なる |
| D07-M04 | LEGACY-ASSET-17C4BF78919578FEBB18 | `docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md` | 66–125 | ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0 | 環境の契約（環境ID、class、providerのadapter、現在状態のdigest、資源の制約、権限、資格情報は参照だけ、network、data分類、依存、owner、期限）、deployの計画・適用・受領記録を別の状態にする、rollbackをdeployと別の契約にする（不可逆migration、backup欠落、rollback先不明を拒否）、providerに依存しない計画（local、VPS、container、serverless、各cloudをadapterで接続）、同じartifactを段階的に昇格し方式をrisk・影響半径・rollbackの速さから選ぶ、運用policyの項目、障害記録の項目、保守義務（更新、脆弱性、鍵・証明書の更新、backup・restoreの予行、設定のずれ、退役）、構造の原因を局所修正で閉じない | Pattern候補「provider非依存のdeploy計画」（INFRA-012・013と対応）、Design Unit候補「環境契約」「rollback契約」「保守義務の台帳」 | HELIX自身の「製品ライフサイクル運用」機能の要求（旧L3）で、型名・Issue番号は固有。旧の`status`は本書では確かめていない。本番適用・cloudの破壊的操作は承認の対象とする記述（98）があり、**Web展開後の内容を含むため1.0の必須に前倒ししない** |
| D07-M05 | LEGACY-ASSET-5D41345F55800F23AC38 | `docs/governance/candidates/infrastructure-operations-quality-l3-requirement-candidates.md` | 5–15 | 73a92522cf1dca8a101c8b63d5b53e0f875499d1ddc5f72b7b7b9d549a7765e6 | 要求の形成で集める運用品質のinput（対象、環境、workload、failure mode、dataの重要度、RTO／RPOの候補、観測可能性、運用owner、未知はunknownのまま）、設計義務を全件導出する項目（deploy、設定、secret、容量、telemetry、log、alert、incident、backup、restore、rollback、保守、廃止、費用）、計測証拠の欄、backup／restore・rollback・failoverは実行できる手順を持ち名前や文書の存在を成功にしない、設計済み・実装済み・検証済み・観測済み・運用中を分ける | Design Unit候補「運用品質のinput」「設計義務の一覧」 | 旧の`candidate / unapproved`（3）。**採択前の候補文書infrastructure-domain-requirements.md 71–74が既に旧sourceとして引用し、採択済みのINFRA-004（`brain-requirements.md` 258）が旧NIO-L3-01・02の観点を束ねている**。本書では重ねて意味を起こさない |
| D07-M06 | LEGACY-ASSET-7A6AE033EE171D1CE604 | `docs/skills/harness-observability.md` | 70–84 | 5c29e78ac67741011e7bdad3837935d3cb329319e146c43e8c8bf884b9fcf240 | 観測の層に秘密・PII・promptの本文を保存しない（保存前のredactionと、そのfieldが無いことを確かめるtest）、行が無いときにgateを失敗させる（欠測を健全にしない）、再構築で同じ行が出る（決定性） | Pattern候補「欠測を健全としない観測」、Part候補「観測dataのredaction境界」 | 対象はHELIX自身の`harness.db`とtelemetryで固有。汎用の原理（欠測、redaction、決定性）だけが候補。INFRA-009（観測点）と対応 |
| D07-M07 | LEGACY-ASSET-95E14F385D8C1F71C209 | `docs/skills/deprecation-cutover.md` | 33–59 | cc83066540bb93976343e4d4044b943c77fd1572e9dfe51473b3f223ff6dc089 | 廃止の前に確かめること（動く代替が既にあるか、参照が残っていないか＝参照0を終了条件にする、壊れたときのrollback）、段階的な置換（新経路をflagの後ろに置く→新を既定にし旧は警告→旧を削除→互換shimを削除、1回に1段だけ進める） | Pattern候補「段階的な廃止・切替」 | 対象はHELIX自身のcommand・env名で、`HELIX_*`命名（43–47）は固有。INFRA-007（提供・更新）とD01（構造の変更）の両方に関係する |
| D07-M08 | LEGACY-ASSET-DB669724249A14A665F0 | `docs/design/harness/L3-functional/nfr-grade.md` | 25–57、135–165 | 2197b4d2f4118aae83202f9f886056fd9de360f21667e25fe9c9d906f76c832d | 非機能をIPA非機能要求グレードのlevelで選び、選んだ理由（例：高いlevelは過剰投資）を書き、要件・level・受入閾値・測定方法・pass条件・ACを1行に揃える形 | Design Unit候補「非機能levelの選択と理由」（INFRA-004の非機能→Patternの辿りの材料） | levelと閾値（95%、業務時間等）はHELIX自身の値で**持ち込まない**。形（levelを選ぶ理由を書く）だけが候補。既存DT-SDOP-002がIPAの枠を既に持つ |
| D07-M09 | LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 621–631、690–694、708–714、865–889、1182–1186 | 4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864 | 旧HELIX自身が「ネットワーク設計書」「サーバー・インフラ設計書」「キャパシティ計画・オートスケール設計書」を`na`（local CLIで常設serverを持たない）、「信頼性・DR・BCP設計書」「コスト設計・FinOps設計書」「環境定義書」を`todo`、「CI・CDパイプライン設計書」「リリース・デプロイ戦略設計書」「インシデント管理・ポストモーテム設計書」を`done`と記録していたこと | gapの根拠 | `na`はHELIX自身の製品境界による判断で、製品一般の不要を意味しない |

## 2. 採択済みINFRA要求ごとの素材の有無

採択済みのHELIXBRAIN-L2-INFRA-001〜017（`brain-requirements.md` 53–69、220–390）の各要求に、本書の素材が当たるか。要求の意味は変えず、素材の有無だけを書く。「状況」の列は素材の量であり、要求の採否や成立を表さない。

| INFRA要求 | 観点（要求の要約） | 旧の素材 | 既存scaffold素材 | 状況 |
|---|---|---|---|---|
| INFRA-001 | Compute、Network、Storage等の下位領域 | D07-M09（network・serverは`na`） | DT-SDOP-006（AWS採用時） | 少ない。network・compute・storageの知識は旧にほぼ無い |
| INFRA-002 | 領域→Pattern→Unit→Partの共通構造 | なし | なし | 構造の話で素材は不要 |
| INFRA-003 | Patternの成立条件（workload、負荷、可用性等） | D07-M05（運用品質のinput） | DT-SDOP-002 | 部分的。input項目はあるがPatternごとの条件は無い |
| INFRA-004 | 非機能→Pattern・設計inputの辿り | D07-M08、D01-M11 | DT-SDOP-002 | 分類の形だけ |
| INFRA-005 | failureの構造（単一障害点、分断、枯渇等） | D07-M04（運用policyの項目）が部分的 | DT-SDOP-002 A | 少ない。failureの型の一覧は旧に無い |
| INFRA-006 | Recovery（Retry、Timeout、Circuit Breaker、Failover、Degradation等） | D05-M07（retry・timeout）、D07-M02、D07-M04 | DT-MSG-001 §5、DT-SDOP-002 A | 部分的。Circuit Breakerは旧で語として出るだけ（§5） |
| INFRA-007 | 提供・更新（Rolling、Blue-Green、Canary等）の比較 | D07-M01、D07-M02、D07-M04、D07-M07 | DT-SDOP-003 | 部分的。方式の名前と選び方の一部はあるが、比較表は無い |
| INFRA-008 | Scaling・Capacity | なし（旧は`na`、D07-M09） | DT-SDOP-002 B | ほぼ無い |
| INFRA-009 | 観測点 | D07-M06、D07-M05（NIO-L3-03・09） | DT-SDOP-001、DT-SDOP-003 | 部分的 |
| INFRA-010 | Backup・Restore | D07-M05（NIO-L3-06）、D07-M04（保守義務） | DT-SDOP-002 A | 少ない。原理（restoreを確かめる）だけ |
| INFRA-011 | 費用 | なし（旧で`todo`、D07-M09） | DT-SDOP-006 §4 | ほぼ無い |
| INFRA-012 | provider非依存Patternと実装例の分離 | D07-M04（provider非依存の計画） | DT-SDOP-006はAWS固有の例 | 部分的。採択前の候補文書は旧sourceを「対応なし（新しい案）」としていた（infrastructure-domain-requirements.md 74、判断史）。D07-M04は計画のadapter化であり、Patternと実装例の分離とは同じではない |
| INFRA-013 | local・VPS・cloud・GPUの共通の資源model | D07-M04（local、VPS、container、serverless、cloudをadapterで接続） | なし | 部分的。同上 |
| INFRA-014 | topology（depends_on、replicated_by等） | なし | なし | 無い |
| INFRA-015 | 他領域との関係 | 各D0xの「領域の帰属」 | なし | 構造の話 |
| INFRA-016 | Infrastructure Anti-Pattern | D07-M02、M03、M06の一部 | なし | 少ない |
| INFRA-017 | Patternの成熟度 | なし（横断の素材はREADME「領域横断の素材」） | なし | 無い |

## 3. 既存scaffold素材のうちこの領域に当たるもの（参照のみ）

| 素材 | 当たる箇所 | 扱い |
|---|---|---|
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-002-nonfunctional.md` | 可用性、性能・拡張性、運用・保守性、移行性、system環境（IPAの枠） | 非機能の値の欄は既にある |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-003-maintainability-runbook.md` | 要素ごとの方式、alert、runbook | D07-M03と重なる |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-006-aws-foundation.md` | AWS採用時の初期設計 | provider固有の例。INFRA-012の「providerの実装の例」の側に当たる |
| `scaffold/research/design-template-seed-sdop-20260929/templates/DT-SDOP-001-logging.md` | log設計 | D07-M06と関係する |
| `scaffold/verification-test-template-seed-20261001/materials/reference-repositories.md` A1・A4、E4 | OpenSLO、k6 thresholds、OpenTelemetry | 外部参考として既にある。再掲しない |
| `scaffold/research/design-pattern-inventory-20260925/README.md` | 候補束「運用・復旧・観測」（ZIP 11、20、21、34、35、50、62）、「SaaS・tenant・課金」 | ZIP由来。重ねない |

## 4. 外部の一般的な参考（観点の名前のみ）

採用・技術選定ではない。外部情報をBRAINの知識候補にする経路はHELIXBRAIN-L2-026・027（2.0、LABO経由）である。

| 名前 | 出典の種別 | 埋める観点 | 留意点 |
|---|---|---|---|
| Site Reliability Engineering関連書籍（Google） | 書籍。公開版あり（https://sre.google/books/） | SLO・error budget、障害対応、capacity計画の語彙。旧はINFRA-005・008の素材をほぼ持たない | 公開版の利用条件は要確認。本番SLO監視はWeb展開後の内容で1.0の必須にしない |
| Release It!（Nygard）の安定性pattern | 書籍 | Circuit Breaker、Bulkhead、Timeout等の失敗の封じ込めの型と、その反対の不安定性pattern（INFRA-006・016） | 書籍の本文を写さない |
| 各cloudのarchitecture frameworkや設計pattern集 | provider各社の公開文書 | providerに依存しないPatternの語彙を集める材料。ただしprovider固有の実装例としてINFRA-012の分離に従って扱う | provider名をPatternにしない（INFRA-012）。利用条件はprovider毎に要確認 |

## 5. gap（旧にも既存素材にも無い観点）

| gap | 根拠 |
|---|---|
| network・compute・storageの構成知識 | 旧台帳で`na`（D07-M09）。HELIX自身がlocal CLIで常設serverを持たないため |
| scaling・capacity・負荷平準化（queue、backpressure、read replica、sharding） | 旧台帳で`na`。DBの意味の`sharding`・`read replica`は旧repo全体で0件（D06 §5の補足検索） |
| failureの型の一覧（単一障害点、分断、枯渇、飽和、連鎖） | 旧に一覧は見つからなかった。D07-M04の運用policyが項目名を持つだけ |
| topology（構成要素の関係のgraph） | 旧に該当なし |
| 費用の構造（固定・変動、遊休、冗長・転送の費用） | 旧台帳で`todo` |
| 提供・更新方式（Rolling、Blue-Green、Canary、Immutable等）の比較表 | D07-M01・M02・M04に名前と選び方の断片があるだけ |
| DR・BCP（region・zoneの障害、RTO・RPOに応じた方式） | 旧台帳で`todo`。D07-M05がRTO／RPOをinputの候補として挙げるだけ |

## 6. 検索範囲と結果

- 範囲：`.claude/agents/devops-deploy.md`、`docs/skills/`（ci-deploy-and-rollback、ci-gate-design、incident-runbook、harness-observability、deprecation-cutover）、`docs/design/harness/L3-functional/nfr-grade.md`、`docs/design/harness/L13-post-deploy/`・`L14-operations/`、`docs/design/helix/L3-requirements/product-lifecycle-operations-requirements.md`、`docs/governance/candidates/infrastructure-operations-quality-*.md`、`docs/design/design-catalog.yaml`の`infra`・`ops`区分。
- 語：`deploy`、`rollback`、`canary`、`blue-green`、`scaling`、`capacity`、`backup`、`restore`、`failover`、`circuit breaker`、`bulkhead`、`Kubernetes`、`Terraform`、`IaC`、`SLO`。
- 結果：Infrastructureの知識は少ない。旧HELIX自身がlocal CLIで常設の基盤を持たなかったため、旧台帳はnetwork・server・capacityを`na`とした。範囲内では、`circuit breaker`はD07-M04（105等）に語として出るだけで、設計知識ではなかった。
- 補足検索：旧repo全体（`archive/legacy-generation-2026-09-14/root/`、`.helix/`・src・tests等を含む）を、大文字小文字を区別しない固定文字列で検索し、一致したfile数を数えた（2026-10-04）。`circuit breaker`は9 file（旧L3要求1、test設計2、PLAN 1、旧intake 1、`requirements-ir` 1、src 1、test 2）に出る。見た範囲では、HELIX自身の独立review fallback・enforcement配線・製品運用要求・投資段階の指示の文脈の語で、設計知識ではなかった（全件の精読はしていない）。`bulkhead`は0 fileだった。
- 結果（続き）：`Kubernetes`・`Terraform`はtool名として旧の能力台帳・agent説明・旧concept等に出るだけだった。`docs/skills/ci-gate-design.md`はHELIX自身のCI gateの設計手順で、素材にしなかった。旧L13・L14の境界文書はHELIX自身の証拠の境界で、素材にしなかった。

## 7. BRAIN L2の知識の属性を付けるときの未決事項

状態は全件「未評価の候補素材」とする。INFRA-017の成熟度（experimental、observed、validated、mature、deprecated、retired）は本書では付けない。

| 属性 | 未決事項 |
|---|---|
| 由来 | 旧HELIXは常設の基盤を運用していないため、Infrastructureの素材は「実績」ではなく一般論（agent設定、skill）か、HELIX自身の機能の要求（D07-M04）である。INFRA-017の「内部の製品で一度成功しただけで昇格させない」以前に、成功の実績そのものが無い。由来の書き方が未決 |
| 適用scope | D07-M01は「本番・staging・dev」の3環境を前提にする。local・VPS・GPU node（INFRA-013）へどう当てはまるかを書く根拠が無い |
| 評価根拠 | 実環境での検証が無い。BRAINはRuntimeの実状態を直接学ばず、LABOの評価を経る（`brain-requirements.md` 459、461）。評価の対象と順序が未決 |
| 限界・反例 | D07-M02・M03はAnti-Patternの候補を持つが、条件（どの規模で即興が許されるか等）を持たない |
| 版 | provider・toolの版で変わる知識（INFRA-011の価格、INFRA-012の実装例）と、構造の知識を分けて版を振る方法が未決 |
| 状態 | 全件「未評価の候補素材」 |
| 領域の帰属 | D07-M07はD01、D07-M06はD08（redaction）と関係する。INFRA-015の他領域relationの種類は未決 |
