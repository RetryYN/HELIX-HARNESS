---
title: "HELIX-INFRASTRUCTURE Stage 1 NFR grade候補"
canonical_vmodel: L1-L12
canonical_layer: L3
canonical_pair: L10
layer: L3
kind: requirement
status: draft_candidate
authority_status: draft_candidate
freeze_blocking: true
pair_artifact: docs/helix-infrastructure/L10-verification/nfr-verification.md
stage: 1
---

# HELIX-INFRASTRUCTURE Stage 1 NFR grade候補

以下の数値・判定値はL3承認前の技術候補で、固定親にない製品値を承認済みと扱わない。候補には根拠、比較案、測定方法を付け、通常のL3承認へまとめる。parameter別PO質問は作らない。業務成功・incident severity・利用可否・費用採否をoracleとして作らず、該当するownerの契約がない場合はunknownとする。

## 固定親・旧NFR処置

基準main `633bf12ea8f948db8ba3d6600179c4a9507377a7`、対象L2/L11固定revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。L2 SHA-256 `569cbf7767be79b07568663026a0ab05e9fe70ea29c3636401a5db1038b8183b`、L11 SHA-256 `7c3d22adef53a8b9c613408a8b8697b2aa40d1e5316776b5305f5a34eb22dada`。

| NFR対象 | 旧source / 再利用区分 |
|---|---|
| gradeを要件/測定/証拠へ結ぶ書式 | `LEGACY-ASSET-8CC5ABFC98C0D00183CA`, `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/nfr-grade.md` L1–73、SHA-256 `ba57990cf5343e9d4ad42ca8c2340d76c80e6e1c23085ba5e496d8014acf3fc3`。gradeとtest evidenceの対応形式を意味再導出する。旧Grade 3/固定閾値は移さない。 |
| INFRA-001 environment identity・resource・credential reference observation | 部分再利用: `LEGACY-ASSET-17C4BF78919578FEBB18`, 旧L3 `product-lifecycle-operations-requirements.md` L68–73、全文SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`、span SHA-256 `90ec4ca119bf860db25efd2126095d80376a2fa1ce3db2159a5da49fc5610f14`; 旧対AC `LEGACY-ASSET-F46AB11BD14F2C0469F4`, `product-lifecycle-operations-acceptance.md` L26、全文SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`、span SHA-256 `f14b760580d8ec6a8b1a01bd0d4ef197a9b9b670fb8201f4ff8c1c8630b20657`。完全なscope率や全property schemaは再導出し、旧provider/credential方式や旧数値は不使用。 |
| environment / health / rollback observation | `LEGACY-ASSET-17C4BF78919578FEBB18`, 旧L3 `product-lifecycle-operations-requirements.md` L74–98,108–119,140–171、SHA-256 `ed4d21bf9a6ec0a922fda9d5906350cfa4c6a35edc4ecc0fd6d30dc3148dacb0`。source/revision/unknown/rollback evidenceの意味のみ再導出し、旧SLOや全体lifecycleは置換する。 |
| verification pair oracle | `LEGACY-ASSET-F46AB11BD14F2C0469F4`, 旧test design `product-lifecycle-operations-acceptance.md` L20–39、SHA-256 `19c75a442154b4d17e645143f4adaaa23791a1043caa73178e5d75cc468b7d58`。正常・negative oracleの形を再導出し、旧受入率/approval/profileを移さない。 |

## 候補値と測定

| ID / parent | 技術候補値 | 根拠と比較 | L10観測・判定材料 |
|---|---|---|---|
| INFRA-NFR-001-01 / L2-001 | 対象scope内resourceの7属性、environment分離8軸（scope/version/authority/source/config/network/credential scope/data）、承認対象CORE設計revision、runtime revisionのうち対象fixtureで宣言された必須項目を全てsource-qualifiedで照合する候補。値未観測はunknownとして保持する。 | L2-001の7属性・8分離軸・CORE設計参照・minimum 13 runtime versionとL11-001のenvironment別resource inventory、source/revision、unknownに基づく。代表抽出やunknown除外案と比較し、declared fixture scope内の必須項目を分母にして可視化する案を候補とする。OS stage release identityは別識別子として保つ。 | L10がdeclared fixture scopeのresource identityと各必須fieldを分母化し、値またはunknown、source/revision、重複・欠落件数を照合する。owner unknownを成功に丸めず、source/CORE設計ownerへ返す。返却先owner識別不能ならunknownと未完の観測範囲を保持し、成功・利用可能にしない。実環境全数をfixtureから主張しない。 |
| INFRA-NFR-001-02 / L2-001 | declared network pathごと8/8軸、storageごと6/6属性+recovery referenceを値またはunknownで記録する。 | 8 network軸と6 storage属性は固定L2に列挙された契約面である。軸の一部だけを記録してcompleteとする案より、全軸可視化する方が境界/owner/復旧参照欠落を検出できる。unknownは適合を意味しない。 | L10は1〜8 network軸の個別欠落/unknown、およびstorage6属性/recovery参照の個別欠落/unknownをmutationし、記録の可視性と誤ってcompleteにしないことを見る。 |
| INFRA-NFR-001-03 / L2-001 | HELIX-CONNECT logical identityとphysical path identityを常に別identityで参照する（混同許容0件）。 | L2-001明示の論理接続/physical path分離が根拠。一本の共用identity案と比較し、通信契約と実経路の変更を区別できる2 identity案を候補にする。 | L10は等しい名前/endpointを持つlogical/physical fixtureと誤併合mutationを使い、参照関係は維持しidentityが独立しているかを確認する。 |
| INFRA-NFR-006-01 / L2-006 | 独立operation eligibility照合で、target/action/revision/scope/別SECURITY authority/expiryの6条件を全て照合する候補（欠落/unknown通過0件）。通常operation用authorityだけでは独立recoveryを通さない。 | L2-006の限定対象・操作と通常authorityとは別のSECURITY authorityを要する明示条件に基づく。action・expiry等の入力細目は、Stage 1対象外の採択済みL2-010 L129/L132を横断参照する。条件の一部だけで通す案と比較し、6条件を個別に照合する案を候補とする。 | L10で各6条件を個別に欠落・不一致・expiredとし、通常operationで有効なauthorityだけを与える変異も別に照合する。正常fixtureは別authorityを含む全条件とoperation開始recordを持つ。 |
| INFRA-NFR-006-02 / L2-006 | operation matrix coverageは5/5種（bootstrap, health check, service stop, rollback, recovery）の個別case候補。OS/control plane停止fixtureで通常planeへの依存経路は0。 | L2-006/L11-006の5操作列挙と「完全自動failoverは含まない」境界に基づく。代表operationだけで一般化する案と比較し、5操作各々を個別確認する。 | L10は5種を別々に照合し、停止plane経由、通常operation authority流用、credential/policy unknown、完全自動failoverを1.0条件化する変異を分離して観測する。failover trigger/countを要件にしない。 |
| INFRA-NFR-006-03 / L2-006 | 1回のhealth observation timeout候補を5秒、同じ操作内のprobe回数を3回とする。結果は各回後に記録し、3回とも未応答ならoperation-health=unavailable candidateとし、service全体/incidentの判定はunknownのままL2-004側の該当owner（本Stage対象外）へ渡す。 | 固定L2はhealth checkを要求するがtimeout/retry値を指定しない。比較候補は1秒×1回、5秒×3回、10秒×5回で、有限時間と一過性遅延観測を比較する。5秒×3回は初期技術候補であり、製品SLOや全体health policyではない。 | L10は遅延0/4/6秒、未応答1/2/3回、途中復帰、完全自動failoverを1.0合格条件に加える変異を別々に照合する。failure/incident ownerが固定親に特定されない場合はL2-004側の該当ownerへunknownを渡し、ownerを推測しない。 |

## owner / scope / version guard

resourceの意味上の設計はCORE、資源と観測stateはINFRASTRUCTURE、作業/change stateはOS、authority/credential/network/isolationはSECURITY、実操作はSECURITY制約下のWorker、配置/容量判断案はINTELLIGENCE、効果評価はLABOが所有する。NFR候補はこれらの境界を移さない。

`HELIXINFRASTRUCTURE-L2-005` は採択済み入力であり、006復旧時に当該操作へ適用される復旧義務を参照する。005のL3未着手を理由に006の親revisionを未採択/未承認扱いしない。逆に、006が005のbackup/restore/rollback L3やL10まで本Stageで完成させたとも扱わない。Fully automatic failover、autoscaling、multi-cloud、L2-012以降のversion holdは1.0要件/受入条件に含めない。
