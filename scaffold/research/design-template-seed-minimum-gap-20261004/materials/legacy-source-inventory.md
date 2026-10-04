# 最小seedの未被覆領域：旧source・参照資料・現行要求の棚卸し

status: scaffold（調査材料。採否、要求、設計、実装の決定ではない）
authority_effect: none
作成日：2026-10-04
対象commit：origin/main `d7dcb1a`

旧HELIXの資産は`archive/legacy-generation-2026-09-14/root/`配下を読むだけにした。旧CLI・旧hook・旧runtime・旧test・旧CIは実行していない。SHA-256は各fileの全体に対する値で、`docs/governance/legacy-asset-disposition.jsonl`の`source_sha256`と一致することを確かめた（全件一致）。

## 1. 使った旧source

| asset ID | path（`archive/legacy-generation-2026-09-14/root/`から） | 使った行 | 全体SHA-256 | 使ったtemplate |
|---|---|---|---|---|
| LEGACY-ASSET-429C82941E059B0F3D12 | `docs/skills/api-and-interface-design.md` | 39–51 | `721b1067ec8cafa5e5063eac2b573077b0da3c6c67fdfef48c8610432509e50b` | 001 |
| LEGACY-ASSET-E2D57A016FBD3D312CFA | `docs/skills/api-contract.md` | 33–48、59–66、75 | `b839109625d6744a72570bd54c681b04bf63b3daf6e71877e6cd1cacb13f9ab4` | 001、003 |
| LEGACY-ASSET-1748EB65920E9CD3056C | `docs/skills/api.md` | 32–46、48–56 | `8cd7e609a65e1cbd8ccec7d243535862668157915059f2ffef89e5f4f652d9e6` | 003 |
| LEGACY-ASSET-BF64B4AE03DD092532C2 | `docs/skills/data-migration.md` | 33–39、41–52、54–60、68–70、76–80 | `740036c144d992c031ea7563b75356ade5cf7ac17b137b612c8110ea782f2398` | 002 |
| LEGACY-ASSET-BDEA31FD6C091F282674 | `docs/skills/db.md` | 48–61、63–70 | `29ec2eab85790aa36c1b4f370b3da209b2f13983270dc3d45a2a88a8084e3f37` | 002 |
| LEGACY-ASSET-18BB86CC5625C31430B8 | `docs/skills/ci-deploy-and-rollback.md` | 66–70、72–78、87–92 | `fc185660f4ce7ee517453b9367eb7fc349f23824511e923ef7e9a6eef31e26e9` | 002 |
| LEGACY-ASSET-95E14F385D8C1F71C209 | `docs/skills/deprecation-cutover.md` | 33–41 | `cc83066540bb93976343e4d4044b943c77fd1572e9dfe51473b3f223ff6dc089` | 002 |
| LEGACY-ASSET-2489EB465FD99C6961DB | `docs/skills/security.md` | 40–49 | `0ceae9a477ff610c41e80c01ce4bd7f180dc318b52e7273614e9a3d350bb902e` | 003 |
| LEGACY-ASSET-EAE3071CBB838B8FB1E3 | `docs/skills/threat-model.md` | 49–62、92–99 | `e510618606aca9d65c6f9cc8bdf48bc6f520ceceb683736c28b756a85af77158` | 003 |
| LEGACY-ASSET-679FD45E5E541F11BC62 | `docs/skills/security-and-hardening.md` | 81–87 | `ab370c7eda5b7d14af1d730191d4866f6e012ab89a63444a05ccb0afe24dec74` | 003 |
| LEGACY-ASSET-7A6AE033EE171D1CE604 | `docs/skills/harness-observability.md` | 70–74、76–81 | `5c29e78ac67741011e7bdad3837935d3cb329319e146c43e8c8bf884b9fcf240` | 003、006 |
| LEGACY-ASSET-12A39A2481B480E18FE2 | `docs/skills/test-thinking.md` | 50–65（うち55–57） | `853f22744fe2cad42f5cb586d84e7198daaf01c00acbcfac56c383c220a8d545` | 003、006 |
| LEGACY-ASSET-E5858DF0B85B6C5CEB64 | `docs/skills/system-design-sizing.md` | 46–57 | `f4061259c9314ed74e9ab6eff07c12fceb8b0445856f0d52e556688e7ceb46bf` | 005 |
| LEGACY-ASSET-DDEE27A6A7686A490CA5 | `docs/skills/design-doc.md` | 37–43、85 | `3a5950cce34b22f14df9deb738e8d3f0a51369dd9ae090be99bfaaeb4a43c9c1` | 005 |
| LEGACY-ASSET-2EFC00A82748E40D2568 | `docs/design/harness/L4-basic-design/external-if.md` | 23–37、42–55、57–70、74–87、125–134 | `52c9ec954373b1fe6c540379cb10f8af7670e0df8072598c4761eafba5732763` | 001、005 |
| LEGACY-ASSET-99C939E249CAF40935CB | `docs/design/harness/L4-basic-design/architecture.md` | 22–33、45、52–60、159–174、186–188 | `f4b9fcb98b4250879955f6eca0f2916dc1a27046820a8ad687e8f816b856bea2` | 005、006 |
| LEGACY-ASSET-A440E0F5465A4EBF9855 | `docs/design/harness/L5-detailed-design/if-detail.md` | 47–63 | `e0eb73c02383e1151e72558e4eb0caf436d19105465dd739de3390216a931d96` | 001 |
| LEGACY-ASSET-7873E44594456A8F925A | `docs/design/harness/L5-detailed-design/internal-processing.md` | 95–124 | `048755e3729a7deaaedc8259f3334859d408f0d99487e7459f9d1ed93b4e8072` | 004 |
| LEGACY-ASSET-656F75AF81EE933415D9 | `docs/design/harness/L5-detailed-design/durability-boundaries.md` | 11–16、40–70 | `b6c4c6f58259b6c09f6cd52a64ab1fb7b04114a41d2b1089fdc5b9730f8666d5` | 004 |
| LEGACY-ASSET-0327D0DF98618D3066FD | `docs/design/harness/L6-function-design/source-boundary-contracts.md` | 28–42、60–70 | `81ec7bb938d659e17ce59ddd7071f527511c585e71b89123be1c8bd505facd8a` | 001、004 |
| LEGACY-ASSET-BB08D70A42B6445B2D1E | `docs/design/helix/L4-basic-design/event-projection-checkpoint-replay.md` | 34–43、45–64、66–89 | `9e18d68b5e463192fb30b839eb164d79f7202a15374482f65181b238df8e513d` | 001、005 |
| LEGACY-ASSET-C3DE79BA9451172F3E43 | `docs/design/helix/L5-detail/product-data-connector.md` | 128–140、142–154、156–173 | `2b42c26f7e4d387a6e2b178de05c2c27ac946646f266faee95aa08a65e803b04` | 002、003 |
| LEGACY-ASSET-4CAC3EB72DAD353A64D7 | `docs/templates/design/L6-function-spec-template.md` | 13–22、24–39、41–48、60–65 | `85559d2cb659bd8c1ebf89eb9da5f1d8a9efa965a8b82ce2db84303a524ef733` | 004 |
| LEGACY-ASSET-D492D527A60A660722FF | `.claude/agents/be-logic.md` | 36–39、46–58、60–62 | `b1d9a75378b40fd6d7fea643654f1a9a8d04471824e08c27c07c3ead86f834a9` | 004、006 |
| LEGACY-ASSET-959AA9A446E3F1F16B7A | `.claude/agents/db-schema.md` | 15–17、47–54 | `86b699829325d80489fdd369efd06d40907f23c5542a31ac6e29a23a9c64e41a` | 002 |
| LEGACY-ASSET-EF44FCF2D722F986E609 | `.claude/agents/be-api.md` | 47–50、68–73 | `f4f9c9645c248a3e998ee5b92307ce0b04edc6421dc1eb4779820c867e489cbd` | 003 |
| LEGACY-ASSET-5E22432B0A5A8F7CC8B3 | `docs/governance/ddd-tdd-rules.md` | 142–152 | `9eac2cc9e5fa8f1177b39f86681fa928cb22070666a5306dce7ae6943597d7af` | 006 |
| LEGACY-ASSET-70DA9B8C03E54A629039 | `docs/design/helix/L5-detail/design-reality-binding.md` | 26–36 | `57ddeea689e1c695ced8eca8469aa43930018967e8bb832521217128b2220ce4` | 006 |
| LEGACY-ASSET-EC07511FF3E241F15359 | `docs/design/design-catalog.yaml` | 1–6、528–535、602–620、696–700、716–720、737–741 | `4cf182ed5e983bb36cf0f61d69f2749c19b6612e5311aafbe2cb73dee6321864` | 001、002、003（旧で未充足だった設計文書種の根拠） |
| LEGACY-ASSET-4F5A1F0739EC1111D91D | `docs/design/helix/L4-basic-design/design-template-json-authority.md` | 83–91 | `e254d995d1d9fbbcc74bb53b3356b4499ac20cca2280eeafde1412d08630c4cb` | 全件（契約の欄・完了条件の形。README） |
| LEGACY-ASSET-98372FEE8A3AC8F9C299 | `docs/design/helix/L5-detail/design-template-json-authority.md` | 33–77、103–108 | `3015d4f3d65cd1f8205f88f29dd59c4f1f7ef42c729d8144f2319e49fe20d830` | 全件（同上） |

## 2. 検索範囲と結果

### 2.1 検索範囲

- `archive/legacy-generation-2026-09-14/root/`の`docs/`（`skills/`、`design/harness/`、`design/helix/`、`templates/`、`governance/`）、`.claude/`（`agents/`）、`CLAUDE.md`。
- 語：`idempoten|冪等`（207 file）、`partial failure|部分失敗|途中まで成功`（5 file）、`timeout|タイムアウト`（356 file）、`ordering|順序`（403 file）、`rollback|巻き戻|切り戻`（398 file）、`migration`（536 file）、`backfill`（424 file）、`privacy|プライバシ`（22 file）、`data minimi|最小化`（21 file）、`testab|テスト容易`（17 file）。数は`grep -rliE`のfile数で、`docs`・`.claude`・`CLAUDE.md`が対象。
- 設計templateの置き場所：`docs/templates/`（`design/`は`L6-function-spec-template.md`の1件だけ。他は`adapter`・`github`・`plan`・`prompts`・`state`で設計templateではない）。
- 設計文書種の台帳：`docs/design/design-catalog.yaml`（旧HELIXがPO提供ZIPの文書種ごとに充足状態を記録した物）。

### 2.2 結果

| 領域 | 旧HELIXに有った物 | 無かった物（新規案として扱った点） |
|---|---|---|
| 接続契約 | 境界ごとのdirection・ownership（api-and-interface-design）、境界のDbCと失敗時の振る舞い（external-if）、retry・timeout・冪等性（if-detail）、因果順序と同一ID異digestの拒否（event-projection） | これらを辺ごとの一枚のtemplateに束ねた物。旧の台帳も入出力設計書・イベントスキーマ設計書・外部連携設計書を`todo`としていた（design-catalog 609–613・716–720・737–741） |
| data・migration・rollback | migrationの4区分と段階（data-migration）、schema変更の層別の義務（db）、deploy前の巻戻し基準（ci-deploy-and-rollback）、tombstone（product-data-connector） | dataの意味と所有・削除を移行と同じtemplateで扱う形 |
| 権限・privacy・外部interface | 外部interfaceの契約と版（api-contract、api）、上へ上げる境界（security）、STRIDE-lite（threat-model）、分類とallowlist（product-data-connector） | 製品設計のdata minimizationの欄。旧の台帳もプライバシー設計書を`todo`としていた（design-catalog 696–700） |
| 単体の振る舞い | 機能仕様template（L6-function-spec-template）、DbCと4観点（internal-processing）、crash後の区間の分類（durability-boundaries） | 無し（既存の旧sourceで欄が揃う）。状態・規則・冪等性は既存DT-SDOP-004にある |
| 構成体 | 構成要素・制御flow・依存隔離の表（architecture）、sizing（system-design-sizing） | 製品の構成体に固有の義務（段ごとの全体の状態、構成体の不変条件）の欄。旧の構成文書は旧HELIX自身の構成を書いた物 |
| testability | 品質目標の1行（architecture 45）、agent定義の節（be-logic 60–62）、検証側の規則（ddd-tdd-rules、design-reality-binding、test-thinking） | 設計の段の独立した確認の欄（観測・制御・oracleの出所・失敗に届く） |

## 3. 参照資料（旧HELIXの資産ではない）

| 参照 | 内容 | 扱い |
|---|---|---|
| `archive/reference-sources/ハイブリッド設計ドキュメントv1-fixed.zip`（SHA-256 `9c547ba8bc9eaf3a12f27254fd3eb6d04b37fb8c899f13d56ceb0d2cff179fb3`） | `hybrid-docgen/templates/`の`13_移行設計・計画書.yaml`（entry SHA-256 `e8f3b1f7cd8f575635d5b81e804705a0100b8d3dc18c140747263275fa48aa3b`）、`23_入出力設計書.yaml`（`752a5dd570c6d865c4f60cf93726011c81d114f379c7bcdedb3f9d2e74ddfea1`、読んだが使った点なし）、`36_プライバシー設計書.yaml`（`925a90f9ea7db642b19a42c7d760e8c6a8e54d397037af4981c507ea5229c0de`）、`39_イベント・メッセージスキーマ設計書.yaml`（`0f7f8a839f461614dcb0ac6c093bd936444171bbcdeb5ad751b00c9c48ec5f3c`）、`42_外部連携設計書.yaml`（`7ea1c2d189fab2498b15af90443295e7a0529ce1ff30c16fc705023b167c68cb`） | Pythonの`zipfile`でentryを読み出しただけ。ZIP内の`tools/`は実行していない。章立てと欄の名前だけを参照し、見本の値は写していない（`scaffold/research/design-pattern-inventory-20260925/README.md` 101–103 HVM-REJECT-01〜03） |

外部の一般知識として名前を出した物（出典名のみ。採用・技術選定・規格への適合を意味しない）：STRIDE（Microsoftの脅威分類。旧`threat-model.md`も使用）、arc42（architecture文書の枠。旧`architecture.md`も参照）、ISO/IEC 25010（品質特性。試験性。旧`architecture.md` 35–45と既存DT-SDOP-002も参照）、expand／contract（既存DT-SDOP-003にも記載）。

## 4. 現行の関連要求（意味を変えず参照のみ）

| 要求 | 文書と行 | 参照した点 | 使ったtemplate |
|---|---|---|---|
| DST-HARNESS-002／003／004／005／006 | `docs/helix-brain/candidates/design-template-system-requirements.md` 57–61 | 契約の欄、区分ごとの義務、欠落の上流への戻し、seed、適用判定 | 全件 |
| 最小seedの4領域 | 同 74–82 | 本seedの対象領域 | 全件 |
| HARNESS-L2-009、Design Template節 | `docs/helix-harness/L2-requirements/product-requirements.md` 60、62–68 | templateから要求の意味を決めない、欠落はBackflow | 全件 |
| HELIXCONNECT-L2-001〜007・009、共通契約 | `docs/helix-connect/L2-requirements/connect-requirements.md` 43–52、56–137、285 | HELIX自身の接続の要求。DT-MSG-001の観点が食い違わないことの確認 | 001、005 |
| HELIXSECURITY-L2-006・008・016 | `docs/helix-security/L2-requirements/security-requirements.md` 120–128、140–148、220–226 | HELIX自身のegressとdata minimization、操作ごとのauthority、公開区分の1.0／1.xの分け方。DT-MSG-003はこれを再定義しない | 003 |
| HELIXINFRASTRUCTURE-L2-005、022〜024 | `docs/helix-infrastructure/L2-requirements/infrastructure-requirements.md` 72–80、148–284 | HELIX自身のbackup・restore・rollback（1.0）、autoscaling・multi-cloud・自動failoverは1.0より後 | 002、005 |
| HARNESS-L2-037 | `docs/helix-harness/L2-requirements/product-requirements.md` 777 | W字二段設計は037が扱う。DT-MSG-005は持ち込まない | 005 |

## 5. 持ち込まなかったもの（共通）

- 旧CLI・runtime名（`helix doctor`、`helix vmodel lint`、`helix plan lint`、`helix guardrail`、`helix db rebuild`、`npm run`系）、旧状態置き場（`.helix/`、`harness.db`）、旧PLAN frontmatter（`review_evidence`、`generates`、`requires`）。
- 実装技術の指定（TypeScript、Node、zod、Vitest、`O_EXCL`、fsync・rename、JWT、REST、`/v<N>/`）。
- 数値（「最大N回」「30s」「約15分」等）。値はL3以降で導く。
- 旧HELIX自身の具体の境界・service名（Claude、Codex、GitHub、Sentry等）と旧の境界分類。
