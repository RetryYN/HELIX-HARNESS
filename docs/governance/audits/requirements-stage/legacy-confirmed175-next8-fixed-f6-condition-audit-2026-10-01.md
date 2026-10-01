# confirmed175 次の8件・固定F6条件照合監査（2026-10-01）

基準HEAD `50686b6762788574cb471967e8c24846d3dd56ae`。固定L2/L11比較revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。strict159 overlayの未確認16件からsource orderで先頭8件を照合した。`authority_effect: none`、formal successor 0、source atom closure 0。

## 集計

| 指標 | 件数 |
|---|---:|
| strict159時点の厳格比較済み | 159 |
| 今回のidentity-specific比較 | 8 |
| bounded union | 167 |
| 今回後に残る未確認 | 8 |
| formal successor assignment | 0 |
| source atom closure | 0 |
| `preserved_pending_rehome` | 175 |

各個票は同一recordにarchive source file/line SHA、旧asset ID・carry ledger、固定F6 L2/L11双方のfile SHA、identity局所の比較と残差を持つ。閾値上は比較証拠に数えるが、いずれも部分的な意味接点と未充足条件を記録し、旧条件の全移管・受入を示さない。

## 個票

### FR-L1-40 — `harness/L1-requirements/functional-requirements.md::FR-L1-40`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:71`。file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `7c810f2df4f4dba412bf597e609af7f9bdf874aa7d36065cb9b7acdcd9720d73`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。carry `preserved_pending_rehome`。

**旧条件:** | **FR-L1-40** | drive 別 state 分離管理 (`.helix/drive/<drive>/`、skip_sub_doc 機械強制) | PO directed (2026-05-28) | drive 種別 (PLAN frontmatter)、L 層 | drive 別 state 区画、skip_sub_doc 自動検証結果。FR-L1-06 (state 一元管理) の drive 軸 extension | P1 | HM-04 |

**現行F6の直接証拠:** FR-L1-40のdrive別state分離とskip_sub_docの機械強制に対し、OS-L2-019/L11はsource・revision・scope・provenance・未完義務のcontinuityを、OS-L2-026はsource authorityとscopeを入力とする段階構成導出を、SECURITY-L2-007/L11はWorker実行制約を記録する。

**部分一致・残差:** 状態・scope・実行境界に接点はあるが、drive別state区画、drive/L層によるskip_sub_doc検査、`.helix/drive/<drive>/`配置は固定pairで規定されない。段階構成導出・実行制約はstate partitionの代替ではない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:352` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXOS-L2-026` | `docs/helix-os/L2-requirements/governance-requirements.md:807` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:430` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXSECURITY-L2-007` | `docs/helix-security/L2-requirements/security-requirements.md:130` / `027e6d25c8665e8aca006f23660c4ecfcc0ec0a92946be871e935ec5aa7a774c` | `docs/helix-security/L11-acceptance/security-acceptance.md:31` / `25635649f87c0e805a5d1cf35b5c1201144c851533808770cd4f9ac6ba067c01` |

### FR-L1-41 — `harness/L1-requirements/functional-requirements.md::FR-L1-41`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:72`。file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `6cc9ffe3dce89cd8f7f2be3fab204d3122d2e3bd4df652d40cfc016fa4b5650f`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。carry `preserved_pending_rehome`。

**旧条件:** | **FR-L1-41** | drive 自動判定システム (PLAN/コード/依存から drive を自動分類 → orchestration_mode routing) | PO directed (2026-05-28) | PLAN 内容、コードファイル拡張子・パターン | drive 判定結果、orchestration_mode routing 先。FR-L1-08 (mode 自動 routing) の drive 軸拡張 | P1 | HM-03 |

**現行F6の直接証拠:** INTELLIGENCE-L2-066/L11は同一schemaの人代行配置案とOS受領後の別assignment、OS-L2-018/L11はassignment/attempt/handoff、OS-L2-027/L11は限定初回実行における配置案入力を扱う。

**部分一致・残差:** task属性・proposal/assignment境界は接点だが、PLAN/コード拡張子/依存からdriveを自動分類する規則と分類結果のorchestration_mode routingは固定pairにない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HELIXINTELLIGENCE-L2-066` | `docs/helix-intelligence/L2-requirements/intelligence-requirements.md:454` / `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260` | `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:131` / `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a` |
| `HELIXOS-L2-018` | `docs/helix-os/L2-requirements/governance-requirements.md:672` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:345` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXOS-L2-027` | `docs/helix-os/L2-requirements/governance-requirements.md:824` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:442` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

### FR-L1-42 — `harness/L1-requirements/functional-requirements.md::FR-L1-42`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:73`。file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `0ad4fce3fed9a2435322ddce6dda027d2272ab6652e5d6d3b5f2ecbacb7f4db4`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。carry `preserved_pending_rehome`。

**旧条件:** | **FR-L1-42** | AI プロバイダ間引継ぎ連携 (Claude ↔ Codex のみ、context+PLAN+budget evidence) | PO directed (2026-05-28) | `.helix/handover/provider/CURRENT.json`、mode.yaml、invocation_log、PLAN 位置 | provider evidence package の生成・状態検証、fresh セッション起動確認。session continuation SSoT にはせず FR-L1-31 の DB projection と型・保存先を分離する | P1 | HM-03 / PM-05 |

**現行F6の直接証拠:** OS-L2-019/L11はsession/runtime交代を含むsource/revision/evidence/未完義務のcontinuityを、CONNECT-L2-001/L11は一般connection identity・端点契約・登録状態を扱う。

**部分一致・残差:** provider固有evidence package、Claude/Codex固定、CURRENT.json・mode.yaml・invocation_log・PLAN結合、fresh session起動確認は固定pairにない。一般continuity/connectionはhandover package/state validationの代替でない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HELIXCONNECT-L2-001` | `docs/helix-connect/L2-requirements/connect-requirements.md:56` / `31e3f234172bb5a92b26d41db2de21534cd4301274fc7e2800b4f8a935ce598b` | `docs/helix-connect/L11-acceptance/connect-acceptance.md:32` / `bc0cf2f39f9c368074c546b39f53a6bd350998bb0bbdb056285b305f22cc9dad` |
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:352` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

### FR-L1-44 — `harness/L1-requirements/functional-requirements.md::FR-L1-44`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:75`。file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `6978d5198a63eeae9930e71f6a131dcaf86b7377a75853893a2044f223db9a0f`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。carry `preserved_pending_rehome`。

**旧条件:** | **FR-L1-44** | 途中導入 onboarding workflow (既存プロジェクトへの harness baseline 確立) | PO directed (2026-05-28) | 既存コード/docs/PLAN 資産一覧、`.helix/` 未初期化状態 | `.helix/` 初期 baseline、既存資産 → state import レポート、onboarding 完了 gate 証跡。FR-L1-14 の前段 context、FR-L1-07 初回 import 引継ぎ、FR-L1-26 段階移行と組合せ | P1 | GD-01 (Onboarding) |

**現行F6の直接証拠:** HARNESS-L2-019/L11は既存要件・コード・PoCを持ち込み、どのrelease単位からでもFull Reverseへ入ること、変換結果と変換不能・由来不明一覧を返すこと、unknownを推定で埋めないことを定める。

**部分一致・残差:** 既存資産の持込みは条件接点だが、`.helix/`初期化、state import方式、初回baseline、onboarding完了gateは固定pairで規定されない。Full Reverseはstate生成・導入完了を意味しない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HARNESS-L2-019` | `docs/helix-harness/L2-requirements/product-requirements.md:419` / `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `docs/helix-harness/L11-acceptance/product-acceptance.md:214` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |

### FR-L1-51 — `harness/L1-requirements/functional-requirements.md::FR-L1-51`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/functional-requirements.md:82`。file SHA `a9c1064d359b0d9c7269a2253e416597de77fa91149c162f9a40467be3f1a008`、line SHA `9f83dd9bd0baae0d6fca3e07f11fdc9756249875039a82aa77850a1c2a769e7a`。asset `LEGACY-ASSET-6B6C5CB0E481BE01088B`。carry `preserved_pending_rehome`。

**旧条件:** | **FR-L1-51** | artifact progress color projection (実装中 / 依存未確認 / テスト済みを harness.db で赤黄緑に正規化) | PLAN-L7-56 / PLAN-REVERSE-56 (2026-06-22) | source artifact、covered-by test edge、impact_results、recovery PLAN | `artifact_progress` projection、`helix progress artifacts` rows、linked test/dependency reason | P1 | HM-04 / PM-01 |

**現行F6の直接証拠:** HARNESS-L2-004/L11はrelationからimpactと再検証範囲を導きUnknownをUnaffectedにしない。HARNESS-L2-005/L11は検証義務・oracle・証拠・省略検査の回収を扱い、OS-L2-019/L11はprovenance・evidence・未完状態の記録を扱う。

**部分一致・残差:** artifact単位のprogress state/赤黄緑projection、covered-by test edge/impact result/recovery PLANの具体集計、`helix progress artifacts`と理由列は固定pairに明記されない。trace/CIだけではprojectionを成立させない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HARNESS-L2-004` | `docs/helix-harness/L2-requirements/product-requirements.md:55` / `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `docs/helix-harness/L11-acceptance/product-acceptance.md:24` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| `HARNESS-L2-005` | `docs/helix-harness/L2-requirements/product-requirements.md:56` / `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `docs/helix-harness/L11-acceptance/product-acceptance.md:25` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:352` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

### PM-01 — `harness/L1-requirements/screen-requirements.md::PM-01`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md:45`。file SHA `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`、line SHA `ee853b29e941eb1e61c8d43a0929a03fcceb47080a48357740b0ce4863055e68`。asset `LEGACY-ASSET-3B905BB196962E2BE624`。carry `preserved_pending_rehome`。

**旧条件:** | **PM-01** | プロジェクト俯瞰ダッシュボード | 4 階層プルダウン (俯瞰 / 工程 / 割当 / 詳細) による案件横断可視化 | BR-06 / UX-02 / FR-L1-20 / FR-L1-08 |

**現行F6の直接証拠:** OS-L2-015/016/019/022のL2/L11はauthority管理記録、portfolio trace/status、evidence continuity、改善candidate routingを扱い、LABO-L2-050/L11はfeedbackから再観測までの状態を追う。

**部分一致・残差:** これらは情報状態の接点であり、案件横断dashboard、俯瞰→工程→割当→詳細の4階層UI、担当/詰まり集約と選択動作は固定L2/L11にない。release kanbanやfeedback cycleは画面受入ではない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HELIXLABO-L2-050` | `docs/helix-labo/L2-requirements/labo-requirements.md:298` / `f1c39e5e77d86e287f6f18378b315b67d31fd09862c9b3f626d0301843e537ed` | `docs/helix-labo/L11-acceptance/labo-acceptance.md:100` / `bcd77438bf1afa4d33c31d35fa5138ea6f978f3d241d159bde35f0b0ccf83200` |
| `HELIXOS-L2-015` | `docs/helix-os/L2-requirements/governance-requirements.md:642` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:324` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXOS-L2-016` | `docs/helix-os/L2-requirements/governance-requirements.md:652` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:331` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXOS-L2-019` | `docs/helix-os/L2-requirements/governance-requirements.md:682` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:352` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |
| `HELIXOS-L2-022` | `docs/helix-os/L2-requirements/governance-requirements.md:712` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:373` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

### DAC-FR-001 — `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-001`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:48`。file SHA `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA `68a363a3d973eb25c14a153fc8fbb4937ede547080bb5cd526c6a40314fa5e4e`。asset `LEGACY-ASSET-D201753B1A0CC6EA3980`。carry `preserved_pending_rehome`。

**旧条件:** | `DAC-FR-001` | Git treeのexact HEADから対象artifactを列挙し、working treeや未追跡fileを正本inventoryへ混ぜない。 |

**現行F6の直接証拠:** OS-L2-015/L11は対象source identity/revision/digest、正本とIssue/PR projectionの区別、revision不一致等の未解決保持を扱う。

**部分一致・残差:** exact Git HEADのtree列挙、対象artifact集合の定義、working tree/未追跡fileを除外するcensusとnegative oracleは固定pairにない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HELIXOS-L2-015` | `docs/helix-os/L2-requirements/governance-requirements.md:642` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:324` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

### DAC-FR-002 — `helix/L1-requirements/document-authority-census-requests.md::DAC-FR-002`

旧source `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/document-authority-census-requests.md:49`。file SHA `81ac3006a11a087c069b196c1512b078ad5f19c1cff1da0ff34d8986ff2feb66`、line SHA `af0d437b6007d90e2ccd2e41d2793a5c2187ad6a0ee67aa6906bd63f8eacdc88`。asset `LEGACY-ASSET-D201753B1A0CC6EA3980`。carry `preserved_pending_rehome`。

**旧条件:** | `DAC-FR-002` | artifact classとlifecycle dispositionを別軸で管理し、classごとに必要bindingを変える。 |

**現行F6の直接証拠:** HARNESS-L2-010/L11はpack identity、入出力、依存、検証範囲、version/owner、release unitの収載区分を扱い、HARNESS-L2-011/L11はcall contract・dependency version・scope/authority、OS-L2-015/L11はsource/authority/revisionの正本記録を扱う。

**部分一致・残差:** artifact classとlifecycle dispositionの独立二軸、class別required binding集合、class-specific binding検査は固定pairにない。pack境界やauthority記録はdocument census/binding contractと同一でない。

| target | L2固定anchor | L11固定anchor |
|---|---|---|
| `HARNESS-L2-010` | `docs/helix-harness/L2-requirements/product-requirements.md:340` / `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `docs/helix-harness/L11-acceptance/product-acceptance.md:205` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| `HARNESS-L2-011` | `docs/helix-harness/L2-requirements/product-requirements.md:352` / `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a` | `docs/helix-harness/L11-acceptance/product-acceptance.md:206` / `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4` |
| `HELIXOS-L2-015` | `docs/helix-os/L2-requirements/governance-requirements.md:642` / `c92d3c052884c05fbbba89fc86f6e6e0c576846e87073327fb0917e32a1747cf` | `docs/helix-os/L11-acceptance/governance-acceptance.md:324` / `925e06cd08056d9569dd31703d7f76e5be59b34f85980646c733367af5edd680` |

## 比較基準・範囲

入力artifact SHAとledger SHAはJSONの`comparison_basis`に固定した。historical112、correction155、priority 1–20 audit、strict159 overlayは変更せず、今回の監査自身は前段集計へ遡及混入させない。F6 pair file SHAはJSONの`fixed_pair_file_pins`、個票のline/section anchor hashは各recordへ収録した。旧archive file/lineと保持snapshotのdigestは8件すべて再計算一致した。

product routing ledgerのcandidate targetはsuccessorとして計上しない。全8件でsuccessorなし、closureなし、authority effectなし。archive内source/runtime/test/workflowは実行していない。

## 静的検証

- JSON parse、archive file/line SHA、source holding digest、固定F6 L2/L11 pair file SHAとline anchor SHA: pass
- `python3 scaffold/tools/scfctl.py validate`: `bindings=143 fail=0`
- `python3 scaffold/tools/scfctl.py stale`: `stale=0`
- `python3 scaffold/tools/scfctl.py residuals`: `residuals=0`
- `git diff --check`: pass
- archive内実行物: not run
