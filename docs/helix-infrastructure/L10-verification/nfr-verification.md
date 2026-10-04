---
title: "HELIX-INFRASTRUCTURE Stage 1 NFR総合検証候補"
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
layer: L10
kind: verification
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L3-requirements/nfr-grade.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 NFR総合検証候補

本書は[NFR grade候補](../L3-requirements/nfr-grade.md)の候補値をシステム境界上で測る設計である。L3候補値の承認や現在実装の測定結果ではない。未知の数値は承認値に読み替えない。実測はL10設計を用いた後続工程で行う。

## source pin

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`、PO固定L2/L11 revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11 SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。L2-001 Stage 1 registration `MPR-RC-HELIXINFRASTRUCTURE-L2-001-003`、L2-006 `MPR-RC-HELIXINFRASTRUCTURE-L2-006-002`。005は採択済み依存入力のため、006の5 operation検証で該当する復旧義務を参照するが、本書の直接L3/L10対象に含めない。

## 測定計画

| NFR | 測定母集団と方法 | 正常/negative oracle | 未見正常・差戻し | 記録する材料 |
|---|---|---|---|---|
| INFRA-NFR-001-01 | 各fixtureで宣言された対象resource identityを母集団にする。7属性それぞれの値またはunknown/source/revisionの出現率を算出する。候補合格はidentity coverage 100%。 | 正常は全identity追跡可。negativeはfieldを消す/別revisionを当てる。 | 未見resource roleを母集団へ加え、個別identityを追跡できるか確認。設計とobservation conflictはCORE/source ownerへ戻す。 | 対象件数、field別known/unknown、source/revision、重複件数、未観測率。 |
| INFRA-NFR-001-02 | Pathごと8軸、storageごと6属性+recovery referenceを独立に計数する。 | 正常は全axisにvalue/unknownがある。negativeは各axis一つずつ欠落、unknownをcompleteへ写像する。 | 未見protocol/path typeを追加。契約外attributeはunknownを維持し、path ownerへ返す。 | 8軸ごとの有無/unknown、6属性とrecovery参照、environment/source/revision、完結扱い誤り件数。 |
| INFRA-NFR-001-03 | logical connectionとphysical pathの各identityおよびreference edgeを数え、同一化mutationを検出する。候補許容は誤併合0件。 | 正常は2 identity+reference。negativeはname/endpoint一致を理由に併合する。 | 新規logical/path pairでも同じ関係を保つ。未承認routeはCONNECT/path ownerへ戻す。 | identity数、reference数、併合・fallback件数、owner。 |
| INFRA-NFR-006-01 | 各operation requestについて6条件を個別評価し、照合済みの比率と不正/unknown通過件数を測る。条件通過候補は6/6、invalid pass候補は0。 | 正常は全一致。negativeはtarget/action/revision/scope/authority/expiryを一つずつ欠損・mismatch/expiredにする。 | 新しいresource/revisionをscope内外で各一件追加し、同じ条件検証を行う。SECURITY/path issueは該当ownerへ戻す。 | 6条件結果、開始の有無、判定時間、拒否理由、差戻し先。 |
| INFRA-NFR-006-02 | 5 operation種類のそれぞれでnormal/negative/owner return caseを実行予定表上に持つ。coverage 5/5、OS/control plane停止時に依存するroute 0を候補とする。 | normalは各操作の限定判定。negativeは第6 operation、停止plane経由、authority欠落。自動failover挙動は測定対象外。 | 未見対象で既知の5種のうち一つを検査し、種類増加を要求しない。 | operation coverage matrix、route observation, attempted action count, owner. |
| INFRA-NFR-006-03 | 各probeの開始/終了時刻と結果を測定。5秒/probe・3連続probe候補（最大15秒）に対し、実測遅延0/4/6秒・未応答1/2/3回・途中復帰を与える。 | normalは5秒以内応答の個別probeを記録。negativeは6秒応答を5秒passに丸める、1回欠測からservice-wide failure確定、3回失敗を自動failoverへ接続する変異。 | 新resourceで同一probe contractを照合。既存 health/severity ruleなしはoperation-health classificationのみ記録し、system incident ownerへunknownを返す。 | per-probe elapsed, timeout, count, final operation-health candidate, underlying source/revision, authority; business statusは含めない。 |

## 比較案と候補値の再評価

- 001のcoverageは100% declared-scope inventoryを候補にし、代表抽出、unknown除外、推定補完と比較する。実環境の存在全数は上流scope/sourceが定めるため、fixture上の列挙を実環境全数と主張しない。
- 006のhealth probeは5秒×3回を1秒×1回、10秒×5回と比較する。選定理由は測定可能な上限と一過性遅延観測の両立で、製品SLO/incident policyではない。実際のtimeout retryがHELIX control plane依存の場合は独立性違反として扱う。
- 候補の承認・修正はL3要件承認にまとめ、個別parameterごとにPOへ質問しない。要求の意味、scope、owner、versionが変わる場合だけL2へ戻す。
