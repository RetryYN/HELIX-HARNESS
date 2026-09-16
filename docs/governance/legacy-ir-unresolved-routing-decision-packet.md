# 旧IR対象未解決18件の判断packet

status: decision_not_requested_yet
source: [IR対象routing queue](legacy-ir-target-routing-queue.jsonl)

## 目的

対象未解決18件を削除・縮退せず、何を判断すれば配置できるかを二つの論点へまとめる。これは今すぐ回答を求めるpacketではない。
要求の原文とIDは保持済みであり、判断後も要求を消さず、製品要求、HARNESS提供契約、HELIX-OS内部要求、L3以降の設計制約へ適切に分ける。

## IR-ROUTE-Q1 runtime・技術制約をどの層で拘束するか

対象17件: `HIL-BR-19, HIL-FR-27, HIL-FR-33, HIL-FR-34, HIL-NFR-09, HIL-NFR-14, HIL-NFR-19, HIL-TR-01, HIL-TR-02, HIL-TR-03, HIL-TR-04, HIL-TR-05, HIL-TR-06, HIL-TR-07, HIL-TR-08, HIL-TR-09, HIL-TR-11`

平易な判断内容は、Node／Python／Bun撤去／Linux／IPC／DB write境界を、利用者に保証するHARNESSの提供条件として固定する部分、HELIX-OS内部runtimeの要求として固定する部分、L3以降の技術選定へ送る部分に分けることである。

判断時に比較するもの:

- HARNESS利用者が観測できる再現性、安全性、移植性、無権限境界。
- HELIX-OSがWorker、state、CI、配布を運転するための内部制約。
- 特定言語、IPC方式、DB、OS優先度をL2で固定する必要性と変更可能性。
- 技術名を外しても維持すべきfailure、回復、security、acceptance。

判断前の状態は全件`preserved_pending_rehome`であり、実装方式との衝突を理由に棄却しない。

## IR-ROUTE-Q2 Domain Object規律の適用範囲

対象1件: `HIL-NFR-25`

平易な判断内容は、identity・invariant・lifecycle・authorityを持つdomain modelを要求する原則をHARNESSの設計契約として提供するか、HELIX-OS自身の設計制約にするか、適用する設計方式をL3で選ぶかである。全consumerへ一律強制する判断とは分ける。

## 判断後に必要な記録

- 原要求IDと原文digest。
- HARNESS、HELIX-OS、両方、またはL3以降のどこへ置くか。
- 分割する場合のsuccessor IDと、各successorが保持する意味atom。
- 未被覆atom。
- 意味を変更・縮退する場合だけ、人間decisionのrevision、理由、影響。

このpacketの存在、PR merge、review結果から配置や意味変更を生成しない。
