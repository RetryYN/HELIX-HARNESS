# v1.3 corrected131 pool rank46–49 条件比較監査

> 静的な旧source／固定F6比較記録。採択、source-ID binding、successor、閉鎖、authorityを生成しない。

## 対象と固定pin

- 対象: rank46–49の `REQSRC-SUP-00192`, `REQSRC-SUP-00193`, `REQSRC-SUP-00194`, `REQSRC-SUP-00198`。順位はcrosswalk `docs/governance/audits/requirements-stage/v13-effective-legacy40-rank-reuse-crosswalk-2026-10-01.json` @ `0b23c76bdb7b1d1d478e5699b50e7b2392a95d79` のsource-qualified 131 poolに従う。
- Queue: `docs/governance/audits/requirements-stage/v13-condition-closure-work-queue-2026-09-30.json` @ `50686b6762788574cb471967e8c24846d3dd56ae` SHA-256 `a61ec098a6bd714fcbbb706d0d9afb4e7f2777b114bf23c8056fc130e30f60d9`。join proofは124 qualified identity hits、effective no-hit poolは131。
- Current crosswalk: `docs/governance/audits/requirements-stage/v13-effective-legacy40-rank-reuse-crosswalk-2026-10-01.json` @ `0b23c76bdb7b1d1d478e5699b50e7b2392a95d79` SHA-256 `1b9669ee715a6b5f2d1a82c77285a56451fd25ec249236f1d12ef2f78d65c01e`。既存reviewed 81件／unreviewed 50件のbounded poolであり、意味上の未レビュー総数ではない。
- 旧source: `archive/legacy-generation-2026-09-14/root/docs/governance/helix-harness-requirements_v1.3.md` SHA-256 `788636a30b5950b8d8d5f663018786e7071e4a06c4bb77688c5c9100e80a7406`。snapshot `docs/governance/requirements-source/helix-requirements_v1.3.md` は同じbytes。Asset `LEGACY-ASSET-02319C2481B9E01698D5`、ledger line 956 SHA-256 `a6d52de16ee4aa8ecb37ed092fb4c2beda22ec89d1d036b3028414a753375dde`。
- 固定F6 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 `docs/helix-harness/L2-requirements/product-requirements.md` SHA-256 `aed75cb4bdd644eedd9d3eb408cf522af2c4fbf4272db7b775edc62fc383100a`、L11 `docs/helix-harness/L11-acceptance/product-acceptance.md` SHA-256 `09b2963187f9aaddbb1ad189d77e517e91914bd5ccdf2499dd9c11855139bcd4`。PO判断record `docs/governance/decisions/helix-harness-requirements-po-decision-2026-09-28.md` は監査baseでSHA-256 `c7a6d39ceb853fe6c00ccc336ffa7bbbd6c7e87a0aaba172f43f490dd0a7fd23`。
旧misrank artifactで記録された40 ID、およびfirst20/current positions21–40を含むcurrent reviewed 81 IDとの重複は0件。今回の4件はparent crosswalkのcurrent unreviewed 50件に記録されたrank46–49に一致する。固定L2/L11の存在は旧source rowの個別採択・identity bindingではない。

## 後続PO採択の時点整合（固定F6比較とは分離）

旧queue/REG-03の記録文はHARNESS-L2-034/035とHELIXOS-L2-031を「未採択候補」としていた。この語句は元の観測記録としてJSON `baseline_unresolved_residual_as_recorded` に保存し、現在の採択状態を表す文言には使わない。2026-09-29のPO判断は、次の行に記載された候補identityとその行が固定するL2/L11 file SHA・section digestについて採択を記録している。判断recordはsource revision `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、basis revision `c18969c73306f6ed4cc4b93249583cd7e5d9ff68`を示し、一般的な後続file revisionへ採択を自動拡張しない。

Decision record: `docs/governance/decisions/po-decision-2026-09-29-57candidates.md` @ `50686b6762788574cb471967e8c24846d3dd56ae`; whole-file SHA-256 `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`.

|line|candidate|PO処置|decision row SHA-256|固定対象（L2 section / L11 section）|
|---:|---|---|---|---|
|39|`HARNESS-L2-034`|採択|`c006f41bb2b046673e74644d866dd309b3a0cfcb5d06b3ca6eb193d67b7d59e1`|`dee3a5ca82c62195e1ae7322e05c1dc624c9633a2abb77aa0ff1e943ae8c6156` / `391f640508944ba2f32b5751a2a9a17fbc9f89ef76f46953c1af68ba907a9fdf`|
|40|`HARNESS-L2-035`|採択|`db95fb03a091cd2d74a7bef953d37aacc6308de5363e157e760a07d1715c2e77`|`4e37d81ee53b22319a316aa7090b30ccb94688d23ed6547551e914b2903a29c2` / `65328061d5933e205a1ce1bf8689f19b1ab820623a2c637f13bb475477100670`|
|54|`HELIXOS-L2-031`|採択|`534f6f3a0179d8c4b8d6fe2f301c55bd9f8468c341c1fb0ab38410cda2b35b9d`|`a78fb330ca244dd067b1f13376d1c9245d0e96a43b716f0d53c3e4c2b7f36462` / `9e0caa1d717cf3f71a74ee1d829ed9625406fe9fd3f85a917ae6945e7918abcb`|

このPO決定は候補の採択状態を訂正する。rank46–49監査の固定F6比較revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc` は変更せず、後続採択revisionを固定F6 evidenceへ混ぜない。HARNESS-L2-034/035とHELIXOS-L2-031の採択だけから、旧source row単位のsuccessor、全条件の閉鎖、実行済み受入は導かない。したがってREQSRC-SUP-00192/00193/00194のcondition statusはこの監査では未解消のまま保持する。

## source rowと比較結果

|rank|Source ID / source line|Baseline|Finding|固定F6の限定的関係|残差|
|---:|---|---|---|---|---|
|46|`REQSRC-SUP-00192` / L247|unresolved|partial|HARNESS-L2-022 / L11-022: stageごとの検証・受入境界。14品質領域からmetric contractを生成するfield規則までは示さない。|固定F6未照合: 14品質領域ごとに各requirement/NFRからmetric/evidence contractを生成する規則、適用対象とsource identityのline-level対応、領域別の受入範囲・例外が固定採択pairから特定できない。 後続PO採択revisionの欠落を主張しない。source-row閉鎖はこの監査で判定しない。|
|47|`REQSRC-SUP-00193` / L249|unresolved|partial|HARNESS-L2-022 / L11-022: stage proofとsystem固有義務差分。全measurement fieldとstale/nonrepresentative/target未達の規則までは示さない。|固定F6未照合: metric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、tolerance、sampling/window、tool/probe、evidence schema、oracle、owner、実行layer、再測定triggerを持つfield contractと、未測定・stale・非代表環境・閾値未達のcompletion拒否を旧行単位に結ぶadopted pair bindingがない。 後続PO採択revisionの欠落を主張しない。source-row閉鎖はこの監査で判定しない。|
|48|`REQSRC-SUP-00194` / L251|unresolved|partial|HARNESS-L2-001 / 022とL11-001 / 022: layer/pairと受入段階。L5→L7→L8–10→L11→L12の計測運用・安全な測定条件までは示さない。|固定F6未照合: 測定stageとsource atomの対応、L7 probe/fixtureの受入、利用実態と時系列SLO評価のmetric/oracle、production secret/PIIを露出しない測定data handling、measurement overhead・再現性の記録をこのsource rowへ結ぶ固定L2/L11 pairは確認できない。 後続PO採択revisionの欠落を主張しない。source-row閉鎖はこの監査で判定しない。|
|49|`REQSRC-SUP-00198` / L259|partial|partial|HARNESS-L2-002 / 003とL11-002 / 003:方式、工程、SR4前release-ready禁止の一部。Full V全体と列挙されたworkflow全状態・例外の閉包までは示さない。|Full Vのsystem-wide L1–L5 workflow modelの段階freezeと右腕による全transition/loop/terminal/exception/permission/timeout/notification/audit/data/switching/routing/resource allocation検証、Production Scrumのslice deltaとsprint review/release前backfillの全要素を旧line identityごとに結ぶ固定L2/L11 pairはない。|

### 固定F6で未照合の具体条件（後続採択revisionの欠落を意味しない）

次の残差は元監査が固定F6 revisionに限定して記録した具体条件である。後続PO決定row 39/40/54の採択対象revisionは別時点としてpinし、この比較から欠落を主張しない。

- `REQSRC-SUP-00192`: 14品質領域ごとに各requirement/NFRからmetric/evidence contractを生成する規則、適用対象とsource identityのline-level対応、領域別の受入範囲・例外が固定採択pairから特定できない。 後続採択revisionの欠落を主張しない。source rowは本監査で閉鎖判定しない。
- `REQSRC-SUP-00193`: metric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、tolerance、sampling/window、tool/probe、evidence schema、oracle、owner、実行layer、再測定triggerを持つfield contractと、未測定・stale・非代表環境・閾値未達のcompletion拒否を旧行単位に結ぶadopted pair bindingがない。 後続採択revisionの欠落を主張しない。source rowは本監査で閉鎖判定しない。
- `REQSRC-SUP-00194`: 測定stageとsource atomの対応、L7 probe/fixtureの受入、利用実態と時系列SLO評価のmetric/oracle、production secret/PIIを露出しない測定data handling、measurement overhead・再現性の記録をこのsource rowへ結ぶ固定L2/L11 pairは確認できない。 後続採択revisionの欠落を主張しない。source rowは本監査で閉鎖判定しない。

### source identityと旧原文

- `REQSRC-SUP-00192` line 247 SHA-256 `833f700a7f273b9533d0dc3714f1df116c0b88a12fec4a66641d26bd5b9dd703`: 設計エンジンはtest caseだけでなく、system完成度を実証する`verification_measurement_contract`を各requirement/NFRから生成する。最低限、性能、信頼性、可用性、回復性、security、privacy、accessibility、互換性、運用性、保守性、cost/resource、data quality、observabilityを対象にする。
- `REQSRC-SUP-00193` line 249 SHA-256 `c7c8fdcdba444b6fb68eaae83a193f1a6cd7cd9700dbb50d5cdeeb57c8edc284`: 各contractはmetric ID、対象requirement/NFR、測定対象、workload/environment/data、baseline、target/SLO、許容差、sampling/window、tool/probe、evidence schema、判定oracle、owner、実行layer、再測定triggerを持つ。code/doc/testがgreenでも必須metricが未測定、stale、非代表環境、閾値未達ならsystem completionを拒否する。
- `REQSRC-SUP-00194` line 251 SHA-256 `30e0e461b391caa2cd948ab0d9cbaa2a8221054f5d1daa8ec608d5ddda131cd9`: 計測はL5で設計し、L7でprobe/fixtureを実装、L8〜L10で局所からsystemへ拡張、L11で利用実態、L12で時間軸/SLO/改善効果を検証する。計測のために本番secret/PIIを露出せず、測定自体のoverheadと再現性も記録する。
- `REQSRC-SUP-00198` line 259 SHA-256 `e4c0f143df26e2777e66ada84e1903a154519b42e9732eaa6f06f9d09c849db6`: Full Vではsystem全体のworkflow modelをL1〜L5で段階的に凍結し、右腕で全transition、loop、terminal、exception、permission、timeout、notification、audit、data、switching、routing、resource allocationを検証する。Production Scrumではslice deltaだけを先行利用できるが、sprint reviewまたはrelease合流前にScrum Reverseでsystem workflowとL1〜L5設計資産へbackfillし、SR4 pair-freezeなしにrelease-readyとしない。

### 固定F6の直接参照行pin

各行のsource path、file SHA、physical line SHA、textはJSON `fixed_f6_revision.pair_evidence_line_pins` と各recordの `fixed_f6_pair_line_pins` に収録。固定L2-022/L11-022はverification/acceptance stage contractに関する現在の対であり、旧REQSRC単位の採択bindingではない。固定L2-002/003とL11-002/003は開発方式／stage／Scrum Reverseに限った関連証拠。後続PO採択のHARNESS-L2-034/035およびHELIXOS-L2-031の固定対象revisionは別contextとして記録し、固定F6比較証拠へ含めない。

## 非主張と検証

各4条件は固定F6 revisionに対する比較結果として `partial` とした。REG-03に残る未解消source conditionと後続candidate採択stateは別時点の証拠として併記し、後続採択は固定F6比較に混ぜない。比較記録には旧source rowごとの未解消残差を残し、formal successor assigned=false、source condition closed=false、authority_effect=noneを維持する。L11記載は受入契約の固定文書証拠であり、受入を実行した主張ではない。
Queue/proof/current crosswalkのpin、131順位、source/ledger/F6 line SHA、reviewed 81件との非重複をassertした。JSON/MD syntax・ID一致・`git diff --check`を確認し、旧runtime/CLI/test/CIは実行しない。
