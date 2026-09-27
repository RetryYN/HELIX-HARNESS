# HELIX-INTELLIGENCE 機構内解消記録

## 対象と変更範囲

- 基準: `origin/main` / `ad3a05276a4d39ef8711dff33381f774d9250b22`。
- 所見: `R2187-01`。1.0受入で、HELIXINTELLIGENCE-L2-001/002、017、030–041、044/045、060–063、066の未見例が能力別の結果oracleになっていない。
- 対応: `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md:258` 以下へ、対象22 identity各々の正常・誤り・未見例と期待結果を追補した。単なるfield/receiptの存在ではなくsource revision、scope、owner、段階状態に応じた内容を判定する。
- L2は変更していない。`docs/helix-intelligence/L2-requirements/intelligence-requirements.md` のSHA-256は基準・追補後とも `40497f22a3ec2aff462b617764df7da6d09b427d95ed91d2ee737535c2e91260`。
- 対象L1 SHA-256: `8042335b8a2b33ea41788be03e286cea73b3251f747b6d0fa85350ea322b6fa8`（不変）。追補前L11 SHA-256: `74d9b3601ba6e65bfc68d3f43039b172eb65306a5615e8875ad6dcb62c0767c7`。追補後L11 SHA-256: `4b96aa9565325a35d3ca10813453434df9ec15f21ea64f5db22740fdb3218e3a`。
- この記録は仕様文書の追補範囲を示す。実装・runtime・testの実行や受入合格は主張しない。

## 原文と旧sourceの照合

能力別fixtureと内容oracleの根拠は、[PO原文](../../../helix-os/sources/body-reinforcement-po-original-2026-09-27.md) 第4項 `:41–49`（SHA-256 `cf45adb7212a35c496e420973be0933ec38d4c00175051811f6a9c0b2c06ac78`）と[判断記録](../../decisions/body-reinforcement-po-decisions-2026-09-27.md) `:57–65`（SHA-256 `c0cf47913b93e462cd609b51f3a8ca634b84bf46dc351aa1debfcb91b919ce8d`）。PO条件は各能力に限定された正常/誤り/未見例と、field存在ではない期待結果を置くこと。未根拠の閾値、全能力の普遍的保証、後続3.0/4.0能力を1.0前提にする条件は追加しない。

機構固有L1の親意味は `docs/helix-intelligence/L1-planning/intelligence-intent.md:43–68`、旧source対応と差分は同書 `:100–112` を確認した。機構固有PO/Worker判断では次を照合した。

- PO原文 `docs/helix-intelligence/sources/intelligence-l1-idea-po-original-2026-09-26.md:532–595`（SHA-256 `70ad00e7df36ad884b4c1dcafd14badf292795ecb698a40aab9172fe5c72968a`）にある限定修復、authority分離、修復後検証/検収境界。
- 判断 `docs/governance/decisions/intelligence-l1-idea-po-decisions-2026-09-26.md:51–57`（SHA-256 `6e62e575b657bbfcd8f1d890307cc48ed407e98504ffed950239f0c888a2b9b8`）。旧Runner/Sandboxを現行の独立実行概念として復活させず、実行主体はWorker、許可/隔離はSECURITYへ配分する。
- 旧Bugbot要求 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md:13–28`（`LEGACY-ASSET-35F5F438E0F8755B1CCE`, SHA-256 `20f549aa879d84e92196976ab2106bacedb393767d7a9946483c4d308576024e`）、要件 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md:21–64`（`LEGACY-ASSET-D881AF6AFD277B1DE934`, SHA-256 `81dc848cde93395e5cf5e49d5545856f482403d41c7eae75cae993a9c4229dbb`）、受入 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-acceptance.md:13–29` (`LEGACY-ASSET-901CD182B52024593E41`)（SHA-256 `cd2fdd3dcfaa98935db0fef6b876d6cdb7133b11b8c8877363c3d0138c4b8cbc`）。保持したのは対象/scope/write-set/budgetの限定、許可と実行の分離、実行後の検証・独立段階、ownerへの戻し。旧段階投入やruntime実行許可は移さない。
- L1-010の旧3 lane根拠: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/three-lane-capacity-profile-requests.md:13–21`（`LEGACY-ASSET-11E8FE0479751F02A4A3`, SHA-256 `a428f2de8652b9508456aed358152865a1f96f6978e5d204b1e2dfd3a1d2e1ba`）。作成/検証/統合能力を区別し、固定provider poolを持ち込まずOSの割当責務を保つ。
- 現行L1-004/012の限定的なRCLS根拠: `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requests.md:29–35`（`LEGACY-ASSET-F2C2755C8809C2C0DEAD`, SHA-256 `c3d9f28a17ac8882f22b5cf86b6d0b16c457a996b3eb0682b6de1010d64ea29c`）、要件 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-requirements.md:34–38`（`LEGACY-ASSET-5841D44AE1255A061667`, SHA-256 `0d395f7ccd81a8c749ef4c3b8c0a660505b6183531992b4678267b5b51c929eb`）、受入 `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/responsibility-centric-learning-acceptance.md:1–30` (`LEGACY-ASSET-B1F192F46FC3AC336094`)（SHA-256 `92331097ac54da9482db806df224b3faeb03b250de33a333089bf9f412caa3e7`）。L1 crosswalk `docs/helix-intelligence/L1-planning/intelligence-intent.md:110` は004/012を対応先とする。L2-041は接続要求であってL1-041ではなく、RCLSの親ではない。保持したのは004/012のsource lineage、unknownの維持、自己評価と独立検証の分離。RCLSの全機構化/後続学習要件は追加しない。

旧記述との相違は、旧資産の役割を保ったうえで、現行L2 scopeに即した明示的な各能力fixtureを追加した点である。L2意味やownerを変える判断ではない。接続identityに特定の一対一旧asset対応がL1 crosswalkにないものは旧根拠がないと一般化せず、現行source/owner契約を照合した。

## 対象identityごとの処置

| Identity | L11に加えた能力固有oracle | 維持したowner/境界 |
|---|---|---|
| HELIXINTELLIGENCE-L2-001 | 既知domainの分割、誤統合、未知domain候補を区別 | domain責務を無根拠に確定しない |
| HELIXINTELLIGENCE-L2-002 | 選択済み能力組、全能力強制の反例、未定義組合せを判定 | Domain×Capabilityの未選択組は未観測 |
| HELIXINTELLIGENCE-L2-017 | 同一scopeのpermission→Worker→HARNESS→OS段階を照合 | SECURITY/Worker/HARNESS/OSを分離 |
| HELIXINTELLIGENCE-L2-030 | HARNESSのrevision/contract receiptのfreshnessと互換性を判定 | HARNESSがsource正本 |
| HELIXINTELLIGENCE-L2-031 | OS state revisionと遅延eventによる巻戻りを照合 | OS stateをINTELLIGENCEから変更しない |
| HELIXINTELLIGENCE-L2-032 | Pattern applicability/counterexample、未知版、重複identityを判定 | BRAIN knowledgeは読み取り、直接更新しない |
| HELIXINTELLIGENCE-L2-033 | Product Core要求とHARNESS義務をsource別に保持 | 各sourceの意味/authorityを統合しない |
| HELIXINTELLIGENCE-L2-034 | LABO評価済みと未評価、scope外根拠を区別 | 過去評価はLABO owner |
| HELIXINTELLIGENCE-L2-035 | 候補handoffとOS ticket化を別段階で判定 | ticket発行/進行はOS |
| HELIXINTELLIGENCE-L2-036 | action/actor/target/scope単位の有効許可とrevokeを照合 | 許可発行/変更はSECURITY |
| HELIXINTELLIGENCE-L2-037 | OS assignmentとWorker resultのticket/scope相関を照合 | INTELLIGENCEはWorkerにならない |
| HELIXINTELLIGENCE-L2-038 | HARNESS obligationの修復前後保持と未知義務を照合 | repairerは検証義務を変更しない |
| HELIXINTELLIGENCE-L2-039 | Worker/HARNESS evidenceの欠落・重複・順序違いを検出 | OS acceptanceは別判断 |
| HELIXINTELLIGENCE-L2-040 | predictionとactualのepisode/revision/window分離 | 効果評価はLABO |
| HELIXINTELLIGENCE-L2-041 | source別connector identityと未選択Web系未観測を判定 | scope/revision/authorityの共有混同なし |
| HELIXINTELLIGENCE-L2-044 | generic candidateとLABO評価、BRAIN正本非更新を照合 | 評価不足でBRAINを更新しない |
| HELIXINTELLIGENCE-L2-045 | Product Core target/revision不明のbackflowを保留 | 製品意味変更はProduct Core owner |
| HELIXINTELLIGENCE-L2-060 | plan依存順、循環/未知依存、OSへの候補handoffを照合 | OS ticket化、4.0前提化なし |
| HELIXINTELLIGENCE-L2-061 | 同一task identityのLABO evidence→INT proposal→OS assignmentを分離 | LABO評価、INT提案、OS割当 |
| HELIXINTELLIGENCE-L2-062 | permission/Worker/HARNESS/OS各stageの同scope対応を照合 | どのstageも別stageを代替しない |
| HELIXINTELLIGENCE-L2-063 | LABO歴史評価、BRAIN一般知識、current INT判断、OS実行、HARNESS工程の時点を分離 | INT自己評価/自動知識更新なし |
| HELIXINTELLIGENCE-L2-066 | 人によるL2-010 schema proposalとOS receipt/assignmentを分離 | 人案をINT出力・評価済み・割当済みにしない |

## 非対象と検証

L2-021–026、042/043、064/065の既存3.0/4.0記述とoracleは変更せず、本追補の必須依存にしない。L2-001/002/017/030–041/044/045/060–063/066以外の既存oracleも変更していない。未fixtureであることのみから未対応/失敗としない。明示された適用範囲と互換契約内なら内容を照合し、欠落・unknown・conflict・stale・宣言範囲外をsuccessへ変換せず、必要なoperationだけ該当ownerへ戻す。

静的確認は `git diff --check` を実施した。旧runtime、旧test、CLI、hook、CIは実行していない。L11-only変更と本記録の作成を確認し、L2/L1は未変更である。同PRで対象22候補のmetadata訂正revisionをappendし、元のsource atomsを保持した被覆receiptと現用参照のSHA追随を行う。L2意味の採択は生成しない。
