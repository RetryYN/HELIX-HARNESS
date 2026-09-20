---
title: "旧要求・旧asset直接semantic review wave 1 premise packet"
status: candidate_incomplete
authority_effect: none
captured_at: 2026-09-21
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 1 premise packet

## 判断論点

HELIX-HARNESSの工程契約とHELIX-OSの管理・Worker統制を混在させず、旧assetのsource本文から要求atomへの直接対応を記録したとき、旧実装、縮退、未実装相当の`not_established`、残る未解決をどこまで安全に区別できるか。

## 親revision、取得時点、scope

- parent revision: `8e570941f6fabcfc4c60877b493c6fe7fd9fc1f3`。
- Concept v4.1 SHA-256: `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad`。
- HARNESS L1 SHA-256: `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04`。
- HELIX-OS L1 SHA-256: `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8`。
- legacy source revision: `legacy-generation-2026-09-14`。
- 取得時点: 2026-09-21（Asia/Tokyo）。
- scope: `IRUNIT-HIL-BR-01-HELIX-HARNESS`と`IRUNIT-HIL-FR-12-HELIX-OS`、旧asset 6件。

archiveはread-onlyで照合し、旧runtime、hook、test、CI、adapterは実行しない。

## premise状態

| 種別 | 内容 | source／時点 |
|---|---|---|
| `known` | HARNESSはV-model、工程、要求・設計・検証契約、進行・完了条件を所有し、Worker運転は対象外である | 承認済みHARNESS L1と`product-boundary.md`、2026-09-21再読 |
| `known` | HELIX-OSはWorker、実行制御、authority、状態、証拠、CI、継続・復旧を管理する | 承認済みHELIX-OS L1と`product-boundary.md`、2026-09-21再読 |
| `known` | BR-01 HARNESS unitは「人のL3承認後」「不可逆境界以外を無人完走する」を保持する | implementation crosswalk入力、parent revision |
| `known` | FR-12 OS unitはagent定義生成、drift、未登録agent、model/effort、context/pathをfail-closeする義務を保持する | implementation crosswalk入力、parent revision |
| `known` | 旧要求文書はL3／人間承認と可逆authoring自動完走／不可逆操作境界を明記するが、実装sourceではない | `helix-harness-requirements_v1.3.md:83-85,353-358` |
| `known` | OS unitの旧sourceにはdrift reportとagent/model/effort guardの直接部分証拠があり、worker context/path packetはaccess enforcement未確認の部分候補として存在する | 対象archive sourceの引用行、未実行 |
| `assumption` | 6 edgeの小さいwaveで判定schemaと過大主張防止を先に固めると、残る216 unitへ同じreview単位を適用できる | wave拡張前にexact HEAD reviewで反例を確認する |
| `unknown` | BR-01を満たす旧HARNESS実装source、consumer、verification、実行可能性 | 残る55 phase候補edgeとpool外検索へ返す |
| `unknown` | OS 3 sourceの実consumer、hook／provider接続、receipt persistence、旧test結果 | 残る468 phase候補edgeとconsumer closureへ返す |
| `unknown` | 2 unitのphase候補の最終採否、successor、L11、旧asset再利用可否 | PHCAP、RDP-001、RDP-003、人間decisionへ返す |
| `conflict` | `requirement-discovery.ts`はhuman L3 gateへ部分一致するが、catalog製品候補はOS／Web-OSでHARNESSではない | 製品owner判断まで`unresolved` |
| `conflict` | `requirement-authority.ts`はPHCAP-04候補だが、BR-01のhuman L3 gateや不可逆境界、自動完走を実装しない | `rejected` edgeとして保持 |
| `stale` | archive sourceの存在は2026-09-21の稼働、依存解決、test pass、現行適合を示さない | 全実装sourceを`not_run`、consumer pendingに固定 |
| `stale` | parent revision、crosswalk、asset catalog、manifest、製品境界が変われば本waveの集合と判定前提は現行性を失う | 入力digest不一致で再調査 |

## 適用条件と限界

本packetは6 edgeの直接semantic reviewと次waveの探索順にだけ適用する。確認したedgeを要求採否、正式L2／L11、設計freeze、旧asset再利用、実装開始へ使わない。`confirmed`は引用した要求atomへの直接対応であり、unit全体またはasset全体の採用ではない。

未review候補集合は対象phase poolから機械算出する。候補pool外にも対応assetがあり得るため、この集合を完全な旧実装集合または不存在証拠にしない。

## 反例

- PHCAP-04候補の`requirement-authority.ts`は、review済みshadowのcanonical変換を扱っても、BR-01の人間L3承認と自動完走を満たさない。
- human agreementを検査する`requirement-discovery.ts`はBR-01の一atomへ近くても、HARNESS ownerと無人完走責務が確定しない。
- 旧要求文書がBR-01を逐語的に支えても、非実行source snapshotなので実装済みではない。
- `agent-ssot-runtime-projection.ts`の`action: write`はread-only report内の値であり、実書込consumerの成立を示さない。
- agent guardがfail-closeしても、context path enforcementやadapter生成まで同じassetが満たすとは限らない。
- 旧sourceがFR-12のatomへ部分対応しても、consumer、verification、運用成立が無ければ要求全体をimplementedにできない。

## 再調査条件と返却先

次の場合に再調査する。

1. 親Concept／L1、製品境界、crosswalk、asset catalog、archive manifestのdigestが変わる。
2. 対象phaseまたはproduct routingの人間decisionが記録される。
3. consumer call chain、verification、旧実行可能性、current replacementが確認される。
4. pool外asset、重複実装、反証、rights／secret／external effectが見つかる。
5. semantic statusまたはaggregate statusを変更するreview findingが出る。

結果は親Issue #1888へ返す。phase状態は対応`PHCAP-*` Issue、要求処分はRDP-001、技術代替・再利用比較はRDP-003へ分離する。個別要求の採否は対象revision付き人間decisionへ送る。
