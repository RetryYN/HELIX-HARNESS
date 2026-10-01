# PHCAP-02〜20 処置証拠の所在監査

## 範囲と判定

指定base `360eec2d11dd2b838206b6096c7226aaefb8252c`で、phase inventory の処置対象19件を既存監査・receipt・L2/L11本文・PO decisionへ照合した。旧資産全量の再調査はしていない。JSONは19件のinventory identity、旧代表asset ID/path/行/SHA、既存条件別監査、現行参照ID/位置、未証明条件を記録する。

ここでの「部分回復」は、関連する要求意味が採択済みL2/L11にあるという bounded audit の判定である。phase capability全条件の回復、縮退の包括的PO受容、L3/L10、実装、実行、運用の成立を意味しない。inventory の固定snapshotは `e784fa68702af4b7c57911b866b48fe7df094f88`であり、後続decisionを反映した現authorityの代用にしていない。PO判断は対象revision付き判断記録を根拠とし、draft metadataから採否を推定していない。

## 母集団と既存証拠

PHCAP-02〜18（19を除く）とPHCAP-20の条件別監査は、18件中16件に採択済み要求の部分対応を認め、PHCAP-08と15をunknown primary、phase単位の実装・実行closureを0件としている。PHCAP-19の独立監査はloop高位意味の採択と責務変更を確認する一方、旧UIL-R-01〜15の細部を部分/未解決として残す。

POが固定したHARNESS/OS/LABO/INTELLIGENCE/SECURITYのL2/L11対象revisionはf6dad2aでbaseに入っている。関係する現行文書bytesはこのfixed revisionから追跡可能な追記のみで、既採択部分の削除・書換えは確認しなかった。JSONにはdecision record SHAとbase上のcurrent full-file SHAを別々に固定した。current full-file SHAはauthorityを生成しない。

| PHCAP | 台帳の処置表示 | 現在確認できる処置証拠 | 主な未証明点 |
|---|---|---|---|
| 02 | degraded | OS/HARNESSの原登録・source trace要求を部分回復。後続status-delta監査あり | 旧lifecycle fence、persistent resume、atom/product join、consumer closure |
| 03 | degraded | HARNESS意味処理とOSの分類projection/write境界への責務分割を記録 | 全source atom/consumer対応。旧wire/schema/実装形式は現行要求と同一扱いしない |
| 04 | degraded | 8機構の固定L2/L11で要求採否・authority境界を確認 | 153 IRのcarry-forward、65 split-required、全旧source successorは別途未完 |
| 05 | degraded | 既採択L2に対する固定L11がある | phase-wide受入実行・全旧oracle対応は未証明 |
| 06 | degraded | 採択L2にdesign-obligation/template関連条件の一部がある | 各製品のL3/L10、registry実装、Web/Web-OS対象は未成立/対象外 |
| 07 | not_reimplemented_formally | 採択L2がtrace/oracle/CI責務を持つ | 正式L10・新CI・全対象oracleは未実装。旧test/CIは未実行 |
| 08 | semantic_equivalence_unresolved | 25 source atomsをpreserve-only receiptで保全 | WBSとPLAN/roadmap/current-location/state間の意味同等性・successorなし |
| 09 | degraded | Ticket責務、ticket type、Backflowの要求意味を部分回復 | runtime、GitHub projection、phase単位のproduct/unit split |
| 10 | degraded | Workerのauthority・ticket・要求revisionを要求するOS pairと限定bootstrap判断 | bootstrapはlease/executor/runtimeではない。process persistence等未成立 |
| 11 | degraded | HARNESS/OSにtest/CIの責務・oracle条件がある | new-gen CI/runner/profile/Bindingは未構築。実行closureではない |
| 12 | degraded | 独立review・finding配送の現行運転契約あり。意味差を記録 | 旧canonical receipt/DB convergenceと同一ではない。restart/provider receiptは未証明 |
| 13 | degraded | 現行merge admission・stale/head/review境界がある | 旧canonical receipt/DB gateの同等性、CI・receipt実装は未証明 |
| 14 | degraded | Release Port・version・rollbackの要求境界を部分回復 | artifact manifest、promotion actor、consumer smokeは下流。Web群は対象外 |
| 15 | degraded | HARNESS/OSのローカル製品更新境界とWeb-OSのstage再分類 | Web-OS deployment authority/runtime/tenant/receiptを持つ採択L2/L11 successorなし |
| 16 | degraded | OS project operation/evidence/continuityを部分回復 | Web-OS service運用・SLO/RTO/RPO・operator条件はscope外/unknown |
| 17 | degraded | OS incident/recoveryの一般的証拠条件。candidate 105 receiptは限定subset | 旧RB08-182三役条件は未決。105はincident.md line 43の2 spansのみ |
| 18 | degraded | HARNESS意味保持refactorと上流へ戻す条件、OS ticket/Backflowを部分回復 | 旧shadow trigger・thresholdは未採択。Web/Web-OS route unknown |
| 19 | degraded | 改善loopの高位意味・LABO/OS責務分担をPO記録で確認 | UIL-R詳細の全atom対応は未完。LABO-063は未採択candidate |
| 20 | degraded | OS continuity/memory境界とLABOへのlearning責務移動を記録 | candidate 114は旧HR-BR-07 lines 26–27のみ。4条件の対応/採否未決 |

## 真の未証明条件と次の要求作業

- **PHCAP-08:** 旧WBSの機能と現行PLAN/roadmap/ticket機構を名前で同一視できない。25 atomの保持receiptは意味同等性を証明しない。旧条件ごとの役割・失敗・出力を比較し、同等/差分/未解決を示すcrosswalkが次の必要証拠。
- **PHCAP-15:** OSのRelease PortはWeb-OSのproduction deployment successorではない。Web-OSを現行要求対象に戻すのかVision/1.xで保持するのかをsourceに沿って扱う。deployment authority、tenant/runtime境界、post-deploy evidenceを含む対象scopeが決まった場合も、候補起草と採択判断は分ける。
- **PHCAP-17:** `phcap17-incident-production-write-authority-decision`のA/B/Cは未選択。SECURITY-L2-008やOS incident ticketから旧3役quorumの採択/retireを推定できない。candidate 105はepisode identity/recovery evidenceの2 source spansだけである。三役条件の判断と残りincident条件のsource行き先が必要。
- **PHCAP-20:** 4 predicate (`running`, time window, `lastVerdict!=pass`, iteration bound) は新114 receiptでも未決。source lines 26–27だけを候補化し、40/41の隣接採択をsuccessorにしない。既存receiptのA/B/Cを解決する必要がある。旧数値やglobal schemaは追加しない。
- **残る15 partial行:** bounded auditが列挙する残差を引き継ぐ。ただしruntime/CI/test未構築だけからL2要求不足を立てない。旧固定方式と名称が違うだけでも不足扱いしない。PHCAP-19は高位ループ意味の部分採択と詳細condition mappingを分ける。

## 結論と限界

この範囲で確認できたのは、17件に関連要求意味の部分回復記録があり、2件にprimary successor/equivalenceの未解決があること。17件の台帳上の「縮退」をphase-wideでPOが受容した記録は見つけていない。PHCAP-07/08の台帳ラベルも現在の実装不在や意味差の確定根拠にはならない。旧asset・旧test・旧CI・runtimeを実行しておらず、consumer全閉包や完了を主張しない。authority effectは`none`。

構造化明細: [JSON](phase-capability-treatment-evidence-audit-2026-10-02.json)
