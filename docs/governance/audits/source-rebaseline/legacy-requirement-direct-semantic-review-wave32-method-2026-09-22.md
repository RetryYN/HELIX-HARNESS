# Wave32 旧HELIX要求直接semantic review method（schema10）

Wave32は、旧archiveの要求、asset catalog、design、implementation sourceをstatic read-onlyで照合するresearch-premise candidateです。専用worktreeは `/home/tenni/.helix-worktrees/legacy-semantic-review-wave32`、HEADは最新Wave31 exact HEAD `e44a8f0cca1f1147e79753ec91cb404fe37cb772` に固定しています。main baseは `fbeee47920ed8b2992ae123b00c224ff88987c50`、merge parentsは `f122d65e1435b4709fbb7b07fbb8e42b70f0b110` と `81144b44b16064bc864b01bd83830455bb7bada3` です。旧runtime、旧test、旧CIは実行していません。

Wave29〜31のschema10 verifier、ledger/meta、method/status/premise、atom化review contract、semantic line inventoryを先に読みました。Wave31までの既レビューunit／assetを照合し、次の未レビュー要求範囲からFR32・FR33（それぞれ既存Wave6・Wave3でレビュー済み）を再選択せず、FR30、FR31、FR34、FR35、FR36の8 product unitを選びました。source spanの重複とshared atomは候補分解台帳上で空です。

旧Wave31 exact HEADから最新Wave31 exact HEADへrebaselineし、main／親系譜と共有入力を再確認しました。旧main f122d65e1435b4709fbb7b07fbb8e42b70f0b110から今回の指定基準main fbeee47920ed8b2992ae123b00c224ff88987c50への差分はPHCAP04–05 scaffoldの5追加ファイルだけで、Wave32の宣言入力は変わっていません。今回の候補は指定基準mainに固定し、merge admission前に最新mainとの差分を再確認して必要ならrebaselineします。現行main `1d7f9a18dd89745b0ed0b9d6d3ed0f9437e47dff` と指定基準main `fbeee47920ed8b2992ae123b00c224ff88987c50` の差分も静的に再確認しました。追加は `scaffold/bindings/SCF-B-0045.json`、`scaffold/pre-isolation-outside-holding-16-30/README.md`、`scaffold/pre-isolation-outside-holding-16-30/generate.py`、`scaffold/pre-isolation-outside-holding-16-30/inventory.json`、`scaffold/pre-isolation-outside-holding-16-30/selfcheck.py`、`scaffold/pre-isolation-outside-holding-16-30/validate.py` の6 scaffoldファイルだけです。SCF-B-0045はRDP-001 outside-67 rows 16–30のpath／holding物理監査候補で、要件atom化・旧要求意味の再導出・product unit割当・authority・implementation・degradationを生成しません。Wave32のHIL-FR-30／31／34／35／36の要求source、旧要求原文、24 edge、8 product unit、Wave1–31入力には該当差分がなく、Wave32 ledger／meta／verifierの選定・digestを変更しません。 作成側はcommit、push、PR、merge、Issue操作を行いません。

## 選定範囲と保持境界

| unit | product候補 | direct phase候補 | atom数 | 選定理由 |
|---|---|---|---:|---|
| `IRUNIT-HIL-FR-30-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-12 | 3 | Finding dispositionと局所修正／後続Issueの責務候補を分ける |
| `IRUNIT-HIL-FR-30-HELIX-OS` | HELIX-OS | PHCAP-09 / PHCAP-20 | 3 | Issue・Reverse・memory・queueのcausality join候補を分ける |
| `IRUNIT-HIL-FR-31-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-04 / 05 / 06 / 07 / 18 | 2 | 上流再設計によるpair stale化と再entry task候補を保持する |
| `IRUNIT-HIL-FR-31-HELIX-OS` | HELIX-OS | unknown | 2 | 再承認前claim拒否とre-freeze receiptをphase未接続のまま保持する |
| `IRUNIT-HIL-FR-34-HELIX-OS` | HELIX-OS | PHCAP-07 / PHCAP-11 | 1 | cross-platform OS contract fixtureとadapter violationを保持する |
| `IRUNIT-HIL-FR-35-HELIX-HARNESS` | HELIX-HARNESS | PHCAP-07 | 2 | R0〜R4 substance gateの入力schemaとevidence digestを分ける |
| `IRUNIT-HIL-FR-35-HELIX-OS` | HELIX-OS | PHCAP-07 | 2 | reject条件とfailure codeを保持する。implementation pool空はunknownのまま扱う |
| `IRUNIT-HIL-FR-36-HELIX-OS` | HELIX-OS | PHCAP-02 / 04 / 12 | 1 | directive custody、duplicate反証、PO receiptを一つのsource contractとして保持する |

4製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）のcandidate denominatorは維持します。今回の候補でWeb／Web-OS unitを推測追加せず、product boundaryは全unitで `product_boundary_pending_human_decision` とします。phase authority、successor、current implementation、degradation、failure、consumer closure、acceptance receiptは確定しません。unit-level degradationは `not_assessed_at_requirement_unit_level` として保持します。

累積receiptは111 unit／330 asset edges、残り107 unitです。今回の24 edgeは要求8件を `confirmed`（同一要求IDのexact source contractのみ）、design 8件とimplementation_source 8件を `unresolved` として保存しました。authority effectは `none`、consumer closureは `pending`、legacy executionは `not_run`、new buildは `false` です。

## 選定assetと静的な根拠

各unitは要求asset `LEGACY-ASSET-A60CF91DD2AF6693E6F9`、design候補asset、implementation_source候補assetを別edgeで保持します。選定assetはWave1〜31の既レビュー非要求assetと重複させていません。

| unit | design候補 | implementation_source候補 |
|---|---|---|
| FR30-HARNESS | `LEGACY-ASSET-0116DF099CCD34612738` — `docs/design/helix/L6-function-design/projection-finding-observability.md` | `LEGACY-ASSET-9C61492DBFD9ED23564C` — `src/runtime/review-feedback-session-intake.ts` |
| FR30-OS | `LEGACY-ASSET-B8E26435839A72B1A0D9` — `docs/design/helix/L5-detail/pillar-detail-design.md` | `LEGACY-ASSET-2224C11CCDA22CAAFF23` — `src/setup/templates.ts` |
| FR31-HARNESS | `LEGACY-ASSET-873BE1F8C64356A2FA0F` — `docs/design/helix/L3-requirements/scrum-reverse-entity-model.md` | `LEGACY-ASSET-987EAA91F9655757E875` — `src/workflow/contracts-policy.ts` |
| FR31-OS | `LEGACY-ASSET-59D53F43643631D13E64` — `docs/design/helix/L6-function-design/github-workflow-identity-admission.md` | `LEGACY-ASSET-1D6DB6DC80D2AC0703DF` — `src/runtime/forward-plan-authoring-transaction.ts` |
| FR34-OS | `LEGACY-ASSET-3EA58A84F0A944151B36` — `docs/design/helix/L6-function-design/three-stage-ci-quarantine.md` | `LEGACY-ASSET-A43E4EED237DC0BB123A` — `src/doctor/l3-g3-logical-db-receipt.ts` |
| FR35-HARNESS | `LEGACY-ASSET-CFC6E5B9D9CC5CF38804` — `docs/design/harness/L9-system/system-evidence-boundary.md` | `LEGACY-ASSET-E6B0919504EF52342FCB` — `src/runtime/document-semantic-diff.ts` |
| FR35-OS | `LEGACY-ASSET-9C5E1F6BB2F573DA524F` — `docs/design/helix/L6-function-design/upstream-substance-gap.md` | `LEGACY-ASSET-C6570CC25A043BB2B417` — `src/requirements/requirement-definition-trace-census.ts` |
| FR36-OS | `LEGACY-ASSET-A9F790CCC45B69B0D0F6` — `docs/design/helix/L6-function-design/review-evidence-reviewer-session-model-history.md` | `LEGACY-ASSET-D5CA34B460B6B01E0913` — `src/state-db/closure-authority-convergence-epoch.ts` |

asset catalogの候補membershipはbounded search receiptにのみ使い、意味一致、採用、現行実装の証拠にはしません。implementation source候補はすべて `implementation_source_present_unexecuted`、意味リンク `unresolved`、consumer refs空、legacy execution `not_run` です。FR31-OSのphase poolは0、FR35-OSのimplementation phase poolも0であり、global bounded candidateとして保存したうえでphase／implementation unknownを維持しています。

## 検証境界

Wave32 schema10 verifierはrow/meta schema、main／stacked parent lineage、source SHA、exact excerpt、atom provenance、bounded search ID/count/digest、candidate集合に対するselected部分集合、selected／remainingの順序・重複・分割件数、metaの`reviewed_edges`とledgerの完全一致、phase pool、Wave1〜31 prior lineage、edge／asset重複、shared atom hold、stale-anchor／candidate外選択のnegative caseを静的に確認します。authority、product boundary、phase採否、failure／consumer closure、acceptance receipt、旧asset実行はこの候補から生成しません。
