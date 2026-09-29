# PHCAP-13／GH-FR-018 旧DB収束条件の現行base照合

基準main: `968e9c517366112093090ba4d874b3ca6b18af6b`（origin/main、2026-09-29）  
監査種別: 読取専用の条件別crosswalk。`authority_effect: none`、`meaning_change_applied: false`、formal successorなし。  
対象: 旧GH-FR-018の同一HEAD review／`harness.db`収束／stale化条件と、基準mainのGitHub merge運用。  
除外: 要求採択、旧sourceのretire、実装許可、L3/L10またはPHCAP-13の完了、旧CI・旧runtime・旧CLI・旧testの実行。

## 判定

旧GH-FR-018のDB収束条件は、現行mainのmerge admissionに存在しない。現行運用は独立reviewのexact base／content HEAD、merge直前の最新baseと`scfctl stale=0`、`gh pr merge --merge`、post-merge read-afterを定める。`scfctl stale=0`が検査するScaffold Bindingの上流一致は、旧sourceが列挙する`harness.db`のevent／projection／checkpoint収束ではない。現行mainに旧DBと同等の正本、DB receipt、rebuild oracleは確認できない。

この差は「旧DB条件が実装済み」または「formal successorが確定済み」を意味しない。現行operation contractの条件差として記録し、旧DB条件の採否・retire・別要件化は本crosswalkから決めない。stage 5/6の旧source条件 closure、PHCAP-13の実行完了、L3への移行を主張しない。

## sourceと基準bytes

旧sourceは`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/github-merge-admission-requirements.md`、asset `LEGACY-ASSET-8686BB8CF396BAF57F2E`。file SHA-256は`cdd4f9fd0ab9b4862ec52c6b6dbcd9fd5f97c5e7bb5440f1b2cda69d37c504f8`。frontmatterは`status: draft`（line 5）。asset台帳（`docs/governance/legacy-asset-disposition.jsonl:452`）は`authority_status: historical`、`disposition: unresolved`、`implementation_status: unknown`、`decision_record_ref: null`、`consumer_refs: []`とする。

| 旧source | line SHA-256（改行を除く） | 条件 |
|---|---|---|
| GH-FR-018 | 23 `f61191a5c365482e760ad343a8bcd673ff315e25322e9621593591c551d878c6`; 24 `4973ab082c58eb341f755cad977759335f757a6d2bb860d43e3aeb0f0afcb099`; 25 `8e396b437f2fe64b02f9b9ab6268cc6915055fe43d5f88d2e665d4efa05ca7da` | reviewer identity／runtime等とfindingをcurrent PR HEADへ束縛したtyped receiptを記録する。 |
| GH-FR-018 | 27 `1c5d65fa5da4048bec10f8bf63c3a3335ea343490cd4312fedc4271a1a92c35e`; 28 `0b764a9d5dc3ac640a6cdf724f4fdbfa7ed4edc9857f7a829a5a87769873abcf`; 29 `284d6bc1fbd8f59fef605a2cf470c1e17b1073aab05b6e5f37f537f27831135c` | 同じHEADから隔離再構築した`harness.db`のsource HEAD、event head、projection／checkpoint digest、schema revision、stale／orphan数、rebuild一致をreceiptへ束縛する。更新漏れ、event/projection不整合、stale checkpoint、rebuild不一致、source HEAD不一致をmerge readiness拒否にする。 |
| GH-FR-018 | 31 `2e82343f9f60ea9765ced0a8c85d35d90a82862ae89a6c752cac10bd3227dd5f`; 32 `8b242ff6b6737c70a9707b1e030fb9c140a07fc1969b885c8235eb53249c4ee9`; 33 `d0e9c7d9f4451413bb7a241dabe7cdc7d28cd78d949bdfb6ab0b87654ef5af34` | push、CI self-heal、base更新、入力正本digest変更でreview／DB receiptをstale化し、AI-B reviewから再実行する。 |

### 現行mainの照合対象

- `docs/governance/github-upstream-operating-model.md`、file SHA-256 `1cb8ed88d4f0e65b37674f692d5fe391c7c5c4b3f482e60c86e160609a8c46a1`。lines 136–142は作成・review責務、exact base／content HEAD、finding記録、reviewとmerge admissionの区別、明示mergeとread-afterを定める。lines 140–141はmerge直前の最新baseと`scfctl stale=0`、`gh pr merge --merge`およびread-afterを要求する。lines 146–158はgovernance／`operation_change` PRのexact pair、blocker 0、merge前再取得、merge commit/read-after条件を示す。
- `AGENTS.md`、file SHA-256 `96e0ae7e0c23d95481133c65103004422806503528628f2057ddd56926076302`。現行境界は新世代CI未構築を明記し、独立review側の明示mergeとread-after、人間の追加approve不要を定める。
- `docs/governance/phase-capability-inventory.json`、file SHA-256 `16deda553e0d5c1d0b8b037c68301bc4f80967305d64b7e4b99f3178b040bfe4`。PHCAP-13は`operating_contract_only`、`degraded_to_manual_operating_contract`、canonical receipt／current CI／DB convergenceの未成立を示す。これはinventory/work projectionであり、要求authorityや実行証拠ではない。

## 条件別対応

| 旧条件 | 現行mainにある証拠 | 判定 |
|---|---|---|
| current PR HEADの独立review | exact base／content HEAD pairをreview依頼・応答に束縛し、findingをPR commentへ記録する（運用モデルlines 136, 139, 148, 154–158）。 | **保持、証拠形は変更。** 独立reviewとHEAD束縛は維持する。現行規則ではPR commentのfindingが共有され、旧sourceのidentity/runtime/model/provider/session等を含むcanonical typed receipt schemaは定めない。旧sourceと同一のreceipt実装を意味しない。 |
| `harness.db`内のevent／projection／checkpoint／schema収束とrebuild一致 | 現行mainにこのDB、旧DB状態を読むcurrent owner、または対応するreceipt／rebuild oracleはない。 | **変更／現行operation gateに不在。** 新世代CIも未構築。旧DB・旧CIの条件を現行の成立条件と推定しない。 |
| DB不一致時にmerge readinessを拒否 | 現行merge条件はexact pair、未解消blocker 0、最新base、`scfctl stale=0`、明示merge、post-merge read-after。 | **DB固有oracleは未解決。** `scfctl stale=0`はScaffold Binding stale確認であり、DB event/projection convergenceや旧rebuild一致を証明しない。現行mainには旧DB failure case相当の条件はない。 |
| push／base／入力revision変化後の再照合 | 修正後HEADは独立に再reviewし、merge直前はbase/content HEADを再取得する（運用モデルlines 137, 139–141, 150, 156–158）。 | **一部保持。** HEAD／base変化後の再照合は現行条件にある。旧DB receiptのstale化と、旧sourceが列挙する全外部入力digest集合のreceipt再生成は、現行DB機構がないため同一条件としては確認できない。 |

## 既存監査との重複と今回の追加範囲

[旧reviewed merge再配置評価](../source-rebaseline/legacy-reviewed-merge-rehost-assessment-2026-09-20.md)は旧GH-FR-018と近接契約を広く既に調査している。特にlines 39、47–57はDB収束の対応物なし、既存CIとの差、HEAD固定merge、read-after、旧receiptの未成立差分を明記する。[PHCAP-02〜18条件回復監査](phcap18-condition-recovery-audit-2026-09-28.md) lines 36–41はPHCAP-12/13のGUI finding delivery／明示mergeへの意味再導出と旧canonical receipt＋DB engineの未採択状態を要約する。[PHCAP-19 semantic recovery audit](phcap19-semantic-recovery-audit-2026-09-28.md) lines 87–88はPHCAP-12/13の代表assetと近接L2 referenceを掲載する。

したがって、GH-FR-018の旧条件全体を新規に再監査したり、旧DB要件を新設したりするものではない。既存再配置評価より後の基準main `968e9c5`で、現在のmerge operation（`scfctl stale=0`とpost-merge read-afterを含む）をGH-FR-018のDB gateと条件単位で比較した追補である。既存の2026-09-20評価は当時の証拠として変更しない。

## 最小結論

本crosswalkで確定できるのは、現行のmerge admissionが旧DB収束条件を証明していないこと、およびHEAD/base再照合など隣接する現行条件が存在することまでである。旧DB gateの保持・再導出・置換・retireの正式なsource disposition、責務owner、successor IDは未解決のまま残す。本記録から新しい要求、DB、CI、receipt schema、追加承認を作らない。

旧source、現行文書、過去監査を静的に読んだ。旧workflow、CLI、hook、runtime、test、CIは実行していない。
