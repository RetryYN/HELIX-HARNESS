# Candidate4755 marker監査のreceipt記載漏れ4行の訂正

authority_effect: none
対象: #2451のmerge後追補コメント。監査本文の履歴を保持し、この記録で4行の既存receipt関係を補う。

| marker rank | source ID・旧行 | receiptに記載された対象要求 | 処置 |
|---:|---|---|---|
| 4 | `LEGACY-CAND-LINE-004330` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-acceptance.md:25` · line SHA `f974939016b3aabf1e9955c093791fc9e273a3d549c17319a964569ab6c29741` | HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-022 (functional-units + stage-review) | `preserved_pending` |
| 21 | `LEGACY-CAND-LINE-004329` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-acceptance.md:24` · line SHA `fba2965b07500eb0d69aa351f3a4240c4e7e00ce9ccd50d2bf001f7a5d2cd1af` | HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-022 (functional-units + stage-review) | `preserved_pending` |
| 190 | `LEGACY-CAND-LINE-004321` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-acceptance.md:16` · line SHA `2f541fb23eedef5ad9ce7ab1718e9dfee6064a5980d60d3210fd9bcb79521094` | HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-022 (functional-units + stage-review) | `preserved_pending` |
| 191 | `LEGACY-CAND-LINE-004392` · `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/security-engagement-authority-requirements.md:24` · line SHA `010fef51a0fa8a24e13e035d6433813576a54d5dcf2e54f36551d103bdb98433` | HELIXSECURITY-L2-008, HELIXSECURITY-L2-009, HELIXSECURITY-L2-022 (functional-units + stage-review) | `preserved_pending` |

両receiptのatomをsource path・物理行番号・行SHA-256で照合した。functional-units receiptは4行すべてをHELIXSECURITY-L2-008/009/022に記載し、stage-review receiptはHELIXSECURITY-L2-009に記載する。各atomの登録参照は`MPR-SH-CANDIDATE-003`。

元監査、receiptと対象commit `59d661a7840c0ee556a8694fc2d1b1adb8cdda17`の各file SHA-256は対のJSONに固定した。元監査の「個別行のbindingなし」等は、**現行pairへの採択bindingがない**という範囲で保持する。receiptの`preserved_pending`を採択、successor、closureへ読み替えず、それぞれfalse、0、0のままにする。

この訂正は要求・Concept・PO判断や既存監査本文の採否を変更しない。
