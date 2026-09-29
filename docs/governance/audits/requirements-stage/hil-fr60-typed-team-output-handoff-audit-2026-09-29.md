# HIL-FR-60 typed team output／OS handoff 条件監査

基準HEAD: `f3a081a32e551d3532b1073c0af46d0e502935a8`（2026-09-29）  
記録種別: Stage 5の読取専用source監査。`authority_effect: none`。この記録は要求候補、PO判断、L3承認、実装・実行・受入、旧source closureを生成しない。

## 対象sourceと範囲

直接sourceは `archive/legacy-generation-2026-09-14/root/docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md:150`、`HIL-FR-60`。source file SHA-256は `db31f424cc89cc4cc31058b2d03059e794ab2d63fa0b1f431dd38eced8f4c8fb`、該当行SHA-256は `646140e1b0193743f2d10874a4b4dc234299f69b8580473b98914923d4016c35`。asset台帳上のidentityは `LEGACY-ASSET-719D5EC9C06FC4AAD0FF`、現行dispositionはread-only source snapshotで、carry-forward stateは `preserved_pending_rehome` である。

同じsource file内のHIL-FR-60全文は、(1)専門知識・独立context・並列性・blind verificationのいずれかに測定可能な便益があるときだけmusterする、(2)単一agentで十分なら既存roleへ送る、(3)生成agentをallowlist済みruntime型へ射影する、(4)worker/verifierのprovider/model/authorityを分離する、(5)lease・fencing・retireを検査する、という条件を持つ。要求出力欄は `specialization decision`、`TeamDefinition`、`runtime projection`、`worker/verifier separation`、`lifecycle receipt` を列挙する。

この監査は、これら5条件を、現行HARNESS-L2/L11-047・054、OS-L2/L11-004・042・043、およびSECURITY-L2/L11-007〜009の既存責務境界と照合する。旧runtime、CLI、test、CIは参照・実行していない。固定TeamDefinition schemaや旧Claude/Codex runtime形式は導出しない。

## 現行authorityと先行記録

HARNESS-L2-047は `MPR-RC-HARNESS-L2-047-001` として登録済みで、2026-09-29 PO判断recordの行52は「条件付き採択：A配置（HARNESSが契約生成規範を所有）」とする。L2/L11の本文metadataには未採択と記す箇所があるため、対象revisionの状態はPO判断recordに従う。ただし条件付き採択は、旧HIL-FR-60全体のclosure、L3承認、実行実績を意味しない。

HARNESS-L2-054はこのhandoff範囲の未採択connection候補として登録され、source facetを5 subatomに限るcoverage receiptは `condition_closure: not_asserted`、`authority_effect: none` と明記する。receiptはTeamDefinitionの具体schemaと旧runtime projectionをcandidate scope外に保ち、「TeamDefinition相当の集約が要求意味として必要か」を未決としている。HARNESS-L2-054/L11-054本文は同じ制約を明記する。したがって以下は現行条件の静的な読解であり、候補receiptを閉鎖証拠へ格上げしない。

## 条件別crosswalk

| HIL-FR-60条件 | 現行で確認できる意味・責務 | 現時点の欠落または限界 | 判定／PO境界 |
|---|---|---|---|
| 測定可能な便益がある場合だけmuster | HARNESS-L2-047は適用task/scope/revision、verification、single-worker比較条件、適用可能なLABO evidenceを入力にし、専門知識・独立context・並列性・blind verification等のtask関連便益を比較根拠に結ぶ。HARNESS-L11-047は比較根拠のある場合のみ`muster`候補、根拠不明なら保留をoracle案として明記する。HARNESS-L2/L11-054はその結果と理由/evidenceを同一revisionでOSへ渡す候補接続を持つ。 | 文書上の入力と期待結果であり、測定やmuster実績ではない。HARNESS-L2-054の候補登録は実行receiptではない。 | **意味は候補条件として明記済み、実証なし。** 既存条件の接続記録自体には別PO判断を要しない。採択済み047の意味を変える新しい必須muster ruleや数値基準を追加するなら対象revisionをPOへ戻す。 |
| 単一Workerで十分なら既存role | HARNESS-L2-047は`existing_role_sufficient`、対象role、比較根拠を出力し、追加specialist contractを作らない。HARNESS-L11-047はこの反例を明記する。HARNESS-L2/L11-054は既存role参照と比較根拠をOSへhandoffし、新たな専門assignmentを作らない期待を置く。 | これは条件別oracle案であり、実際のtask判定・OS assignment結果ではない。 | **意味は明記済み、実証なし。** 追加のPO判断を要する意味差は確認できない。 |
| 欠落・unknown・staleなhandoff | HARNESS-L2-047は入力不足、適用外/stale evidence、未確定oracle/task boundary等を`unknown_or_defer`として扱い、contract生成・起動候補へ進めない。HARNESS-L2/L11-054は軸、scope、revision、比較条件、contract digest、profile/lifecycleの欠落・不一致を補完せず保留し、同一task/scope/revisionへのOS応答またはassignmentが欠ける場合handoff完了としない。OS-L2-042の採択対象はassignmentに紐づくschema/digest/oracleが欠落・stale・不一致・未検証なら成果をaccepted/completed/verifiedにしない。OS-L2-043の採択対象はeventの型・相関・assignment/source/revision対応が不明・staleなら該当delegation chainを未完に保つ。 | 047/054のhandoff oracleは未実行。OS-042/043はsourceや成果/event適格性を補助するが、TeamDefinitionまたはmuster decisionの存在を証明しない。 | **不完了の扱いは分担して明記済み。** これらの適用が実際に働くことは未検証。新しい拒否条件を追加しない限り、条件接続の静的監査にPO判断は不要。 |
| worker/verifier分離 | HARNESS-L2-047/L11-047はidentity・context・authorityの分離を条件とし、provider/modelを記録する一方、同一provider/modelだけでは非独立としない。OS-L2-004/L11-004は自己またはそのSubagentによるreviewをindependent reviewに数えない。SECURITY-L2-007はOS assignmentとSECURITY制約をWorker実行環境へ渡し、適用/観測状態を確認する接続を持つ。 | provider/model/authorityの値を新しい分離schemaへ型定義する根拠はない。静的記述は実際のreviewer identity/context/authorityの分離証拠ではない。 | **意味・拒否oracleは明記済み、実証なし。** provider/model軸だけで独立性を決める差分は既存PO判断と衝突する。 |
| Team outputからOSのprojection／assignment／lifecycle evidenceへのhandoff | HARNESS-L2-054の型付き出力は`muster_candidate`、`existing_role_sufficient`、`unknown_or_defer`であり、muster時は047のcontract参照（複数なら集合とdigest）、generation revision、理由、比較対象/evidence、guard結果を結ぶ。OSは同一task/scope/revisionのassignment、profile適格性または保留理由を既存state/evidenceで追跡する。採択済みOS-L2-004は割当・実行・回収と自己承認/二重割当抑止を持つ。OS-L2-042/-043の対象revisionはPO判断record行65–66で採択されている。SECURITY-L2-007/-008/-009は制約適用、operation authority、該当Workerのrevoke/quarantine伝播を分担し、SECURITY L11は未適用・unknown・authority driftを成功扱いしない。 | 現行候補はTeamDefinitionという型付き集約artifact、member schema、複数contractの構成規則を定義しない。OS側既存assignment/projection/lifecycle/evidenceとHARNESS outcomeの実接続も未実行。OS-042はschema/digest適格性、OS-043は委譲eventの相関が中心で、team aggregateの代替ではない。SECURITYはauthority・制約を所有し、team出力やOS assignmentを所有しない。 | **責務の分担とtyped handoff案は記述されているが、TeamDefinition相当artifactと実接続は未確定・未実証。** 固定schemaの創作やTeamDefinition必須化は本監査では行わない。 |
| allowlist runtime projection、lease/fencing/retire | HARNESS-L2-047はOSが既存allowlist runtimeへprojectionし、lease/fencing/失効/retireと結果証拠を持つ境界を記す。HARNESS-L2/L11-054もOSの既存runtime profile、assignment、lifecycle条件の不足/不一致を保留する。OS-L2-004/L11-004はassignment、進行統制、lease/budget不足時の二重実行抑止を扱う。SECURITY-L2-009は該当Workerの停止と途中成果の隔離をOS/Worker実行環境へ伝播する。 | 現在読んだ採択OS-004/SECURITY-007〜009に個々のlease/fencing/retire artifactや全fieldの型は示されていない。054は既存OS正本を参照するのみで、lifecycle receipt実績はない。 | **責務境界は確認、具体artifact/実行証拠は未確認。** 新しいlifecycle要求や固定runtime typeは導出しない。 |

## 証拠状態とdecision要否

### 文書から確認できること

- 既存条件上、専門化判断はHARNESS、assignment・runtime profile・lifecycleはOS、能力evidenceの適用性はLABO、配置案はINTELLIGENCE、operation authority・制約はSECURITYに分かれている。
- Handoff候補は、muster／既存role十分／unknown-deferを区別し、複数contractを集合として参照できる意味を記述する。
- OSの既存assignmentと成果/event追跡、SECURITYの制約・authority・revoke境界により、隣接責務の接続先は特定されている。

### 未確認のこと

- 実行可能なHARNESS→OSのtyped handoff、OS runtime profileへのallowlist projection、assignment/lifecycleのread-after evidence、worker/verifierの実identity/context/authority分離、lease/fencing/retire receipt。
- TeamDefinition相当の集約artifactが現行要求意味に必要か、必要なら複数contractをどう束ねるか。
- 旧FR-60全体のcondition closure、HIL-BR-09/30・FR-59など関連sourceやIR identities全体のclosure。

### PO判断の境界

本静的照合で、現在の条件分担を明らかにするための追加PO判断は不要と判定する。HARNESS-L2-047の条件付き採択、OS/SECURITYの既存owner境界を保ったまま、L3で具体artifactやevent/state表現を設計する余地がある。もしTeamDefinition相当の独立した必須成果物、固定member構成、複数workerを要求する規則を追加するなら、それは表現の詳細に留まるとは限らないため、要求意味の変更かを判定し、変更となる場合は対象revision付きPO判断へ戻す。L2-054の現行receiptがこの境界を同様に未決としているため、本監査もどちらの選択も行わない。

## 参照した現行文書

- HARNESS: `docs/helix-harness/L2-requirements/product-requirements.md:1039-1060,1154-1162`、`docs/helix-harness/L11-acceptance/product-acceptance.md:778-790,866-876`。基準HEADのfile SHA-256: L2 `ece844e9c26797035d9ce7e5e5a7b3f7653fadaa8b333b0f56269bd1f2d23aee`、L11 `ab94b4cec9535c70b5fd1a8553b41bdce51411fd59f65e64c5ddedc4fbacf878`。
- OS: `docs/helix-os/L2-requirements/governance-requirements.md:57,1144-1160`、`docs/helix-os/L11-acceptance/governance-acceptance.md:24,37-50,79-80`。基準HEADのfile SHA-256: L2 `bde0dcc4640e7afcf73fbc431d01ee3082fe6fda79c8d1b93b9572507037e3bf`、L11 `cd0e750cab9e694eed060a619d50527239e1b1291b9550cc0c95dbbd486c7112`。OS-042/-043のrevision状態は[2026-09-29 PO判断record](../../decisions/po-decision-2026-09-29-57candidates.md#L65)を優先する。
- SECURITY: `docs/helix-security/L2-requirements/security-requirements.md:130-157`、`docs/helix-security/L11-acceptance/security-acceptance.md:31-33,69-79`。基準HEADのfile SHA-256: L2 `d3103f909e540e35a95310e6741cfd038a87789150577ea182a941d58a5f2bd5`、L11 `e30e63771d58dae2ca69cb9cfff5d2ab6eb71311144aa263b068cb4ae4fbf556`。
- 先行記録: `specialist-worker-contract-condition-audit-2026-09-29.md`、`harness-specialist-handoff-source-lines-2026-09-29.jsonl`、`harness-specialist-handoff-coverage-receipt-2026-09-29.json`、`docs/governance/legacy-asset-disposition.jsonl`の`LEGACY-ASSET-719D5EC9C06FC4AAD0FF`。

本監査は文書・revision・責務境界の静的読解のみである。受入oracle、旧test/runtime、現行runtime projection、assignment、Worker起動、SECURITY制約適用は実行しておらず、これらを完了証拠として扱わない。
