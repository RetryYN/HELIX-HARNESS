# v1.3 条件行 focused residual positions 41–60 比較監査

- 監査基点: `50686b6762788574cb471967e8c24846d3dd56ae`。first40入力bundle: `0c08cffe4d47f499214d952b1e6b055dba22bcf6`。固定F6比較revision: `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- pinned queue: `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json`、SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`。queue artifact file commit `71659afc4`、lineage basis commit `2bf484b1a84af346feaf8cf7b72e59f3889e6333`を区別した。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。asset `LEGACY-ASSET-02319C2481B9E01698D5`、ledger `docs/governance/legacy-asset-disposition.jsonl:956` entry SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`。

## 母集団と選定

- 固定queueは303条件行、`primary_residual`かつ`unresolved_for_closure_work`は255行。32 focused audit artifactのSHAを確認し、exact identity hitは全303行中154、primary/unresolved中136。未hit候補119行のうちfirst40を除外し、残79行のpositions41–60を選定した。
- 119/79は限定したidentity filterの候補算術であり、全意味未review・closure総数ではない。candidate4755の`LEGACY-CAND-LINE-*` overlayは別母集団として除外した。

## 固定F6 pair

- L2 `docs/helix-harness/L2-requirements/product-requirements.md` SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`。L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`（revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`）。
- 一般条件のrelationは旧source rowの採択・後継・閉包を意味しない。F6比較は固定revisionの実在する行だけを参照し、後続revisionに追加されたcandidate textを持ち込まない。

## 行単位比較

|候補位置|旧source ID / 行|結果|F6 relation (採択pairとは別)|未解消残差|
|---:|---|---|---|---|
|41|`REQSRC-SUP-00338` / 438|partial|固定F6のL2/L11には、旧worker用途別benchmarkの要件と同一性を示す行別pairを確認できない。現行L2/L11の一般条件から旧REQSRCとの対応を推定しない。（参照: 対象記載なし。selected-row adopted bindingなし）|fixed fixture/rubricと重大failureの平均相殺禁止を含む用途別blind benchmark、workerごとのadmit/retire oracle、旧REQSRC行のadopted binding。|
|42|`REQSRC-SUP-00339` / 439|partial|固定F6 L2-002の具体条件はDiscovery/PoCを別ticketにし、Decide裁定前のproduction昇格を禁じ、L11-002も方式phaseへの混入を拒む。旧行のS4 receipt・PLAN-DISCOVERY-12/13固有のstate/consumerまではこのpairから確定しない。（参照: HARNESS-L2-002 [adopted_requirement_text]。selected-row adopted bindingなし）|S4 decision receiptとPLAN-DISCOVERY-12/13の個別条件・oracle・consumer、旧REQSRC行のrow-specific採択pair binding。|
|43|`REQSRC-SUP-00340` / 440|partial|固定F6 L2/L11でWCC-FR-01〜09/HIL-22/23を特定する採択済み要求pairを確認できない。（参照: 対象記載なし。selected-row adopted bindingなし）|WCC-FR-01〜09/HIL-22/23のexact adopted target、行別trace/oracle、source materializationとadoption状態。|
|44|`REQSRC-SUP-00435` / 561|partial|固定F6 L2-003/L11-003は工程完了・未検証状態を推定しない。scope分母・双方向join・obligation 100%未達条件を旧source行へ結ぶpairは確認できない。（参照: HARNESS-L2-003 [adopted_requirement_text]。selected-row adopted bindingなし）|全requirement/AC/edge/V-pair/gate evidence/finding dispositionをDB closureへ結ぶ旧分母の exact ownershipと、採択済みpairでの同一oracle。|
|45|`REQSRC-SUP-00441` / 571|unknown|固定F6 HARNESS pairで旧Python worker固有のauthority/runtime boundaryを確定する採択済み条件は確認できない。（参照: 対象記載なし。selected-row adopted bindingなし）|旧Python/Node ADR epochと実行主体境界の現行owner、Python workerの権限欠如 oracle、adopted pair。|
|46|`REQSRC-SUP-00442` / 572|unknown|固定F6 L2/L11に旧Python出力のcommand/SQL/path/code非実行とNode側schema/digest/policy再検証を示す採択済みpairを確認できない。（参照: 対象記載なし。selected-row adopted bindingなし）|Python proposal bytesの安全な受け渡し、Node revalidation実施者/oracle、旧command/SQL/code非実行条件のpair adoption。|
|47|`REQSRC-SUP-00443` / 573|unknown|固定F6 L2/L11にPython worker制約をdoctor gate/test ACへ接続し、不在時fail-close・gap非黙認とする採択済み要件pairを確認できない。（参照: 対象記載なし。selected-row adopted bindingなし）|Python worker専用machine-checkable ACとgate/test oracle、検査不在のfailure behavior。|
|48|`REQSRC-SUP-00444` / 575|partial|固定L2-005/L11-005は対象riskに応じた検証義務・evidence・CI組立規則を扱う。（参照: HARNESS-L2-005 [adopted_requirement_text]。selected-row adopted bindingなし）|Linux canonicalとNative Windows/macOS compatibility gateのOS profile・same-fixture条件はこのpairに明示されない。|
|49|`REQSRC-SUP-00445` / 576|gap|固定L2/L11 pairで旧v1.2由来Windows smoke要求の正本citationを同じpathに固定・更新する条件を特定できない。（参照: HARNESS-L2-005 [adopted_requirement_text]。selected-row adopted bindingなし）|Windows smoke authority path・job nameとsource citationの同時更新責務。|
|50|`REQSRC-SUP-00446` / 577|gap|固定L2/L11 pairに`.github/workflows/harness-check.yml`の`windows-durability-smoke` jobを現行必須物として特定するpair requirementはない。（参照: HARNESS-L2-005 [adopted_requirement_text]。selected-row adopted bindingなし）|job existence/runs-on windows-latestのadopted requirement/acceptance oracleと固定source cite。|
|51|`REQSRC-SUP-00447` / 578|partial|L2-005/L11-005は必要CIと証拠条件を組み立てる一般境界を記載する。（参照: HARNESS-L2-005 [adopted_requirement_text]。selected-row adopted bindingなし）|特定job存在と`harness-check`からの`needs`参照をdoctor/test ACにする条件、および削除/rename時の同時doc更新。|
|52|`REQSRC-SUP-00451` / 584|partial|固定L2-001/L11-001はcurrent L1–L12成果とpairおよびL0 charterの層外境界を定める。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|旧L0→current L1のcompatibility mappingを、対象ごとのlegacy_layer/canonical_layer fieldで変換する採択済みrow mappingは確認できない。|
|53|`REQSRC-SUP-00452` / 585|partial|L2-001/L11-001はcurrent canonical pair、L2-019/L11-019は既存artifact持込・変換結果・unknown保持を定める。（参照: HARNESS-L2-001 [adopted_requirement_text]; HARNESS-L2-019 [adopted_requirement_text]。selected-row adopted bindingなし）|旧L1要求＋L2画面からcurrent L2要求＋L2.5へのexact layer mappingとそのscope/version oracle。|
|54|`REQSRC-SUP-00453` / 586|partial|L2-001/L11-001はcurrent L3↔L10とL2↔L11の対を混同せず扱う。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|old L3 requirement→current L3 freezeのcompatibility conversion contractと旧layer identityの受渡し。|
|55|`REQSRC-SUP-00454` / 587|partial|L2-001/L11-001はcurrent L4↔L9 pairを定める。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|legacy L4 basic→current L4 basic designの型付きcompatibility map。|
|56|`REQSRC-SUP-00455` / 588|partial|L2-001/L11-001はcurrent L5↔L8 pairを定める。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|old L5 detail + old L6 function→current L5 detail + test contract mapping、legacy L6を独立現行layerと誤認しないinput/output oracle。|
|57|`REQSRC-SUP-00456` / 589|partial|L2-001/L11-001はcurrent L6↔L7 pairとcanonical layer sequenceを定める。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|legacy L7 implementation→current L6 implementationの個別compatibility field mapping。|
|58|`REQSRC-SUP-00457` / 590|partial|L2-001/L11-001はcurrent L7–L11成果/pairsを保持する。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|legacy L8–L12 validation→current L7–L11の個々の成果種別、TDD/acceptance boundaryのexact mapping。|
|59|`REQSRC-SUP-00458` / 591|partial|L2-001/L11-001はcurrent L12 operations/feedbackをcanonical sequenceに保持する。（参照: HARNESS-L2-001 [adopted_requirement_text]。selected-row adopted bindingなし）|legacy L13/L14→current L12 operation test/improvementのexact field mappingと旧identity保持。|
|60|`REQSRC-SUP-00459` / 593|partial|L2-019/L11-019はlegacy artifactsの入力・変換結果・unknownを保持し、推測で承認済み要求/設計へしない。（参照: HARNESS-L2-019 [adopted_requirement_text]。selected-row adopted bindingなし）|`legacy_layer` inputと`canonical_layer` outputのtyped field contract、旧path/authority非昇格をこのselected source rowへ結ぶadopted pair binding。|

## 非主張

- 選定20件は残余として保持。source-row crosswalk 0、採択済みpair binding 0、successor 0、closure 0、authority effectなし。
- 固定文書の静的比較のみであり、受入実行・実装・旧source全体no-lossを主張しない。旧runtime/CLI/hook/test/CIは実行していない。
