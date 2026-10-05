# SECURITY Stage 3 承認記録の親ID表記訂正（2026-10-05）

## 訂正対象と理由

main `2e9e9f2267aab50bc1c22e3b3ca9c9d0ce808832` の[既存委任承認記録](../../decisions/helix-security-stage3-l3-l10-po-decision-2026-10-05.md)「承認対象」と[既存pin記録](l3-l10-security-stage3-delegated-decision-pin-2026-10-05.json)の `approved_parents` は、作成者Codexが正規親IDの `HELIX` を落として記載した。本文revision `180e67559bfad4946be9e8e544d9b496cd6d94ce`、6文書SHA、PO出典5行は同じ5親を指すが、この略記は登録IDとして正確ではない。本記録で各表記の対応を訂正する。

| 既存記録の略記 | 正規親ID | 採択済み登録ID | 固定PO出典行 |
|---|---|---|---|
| `SECURITY-L2-029` | `HELIXSECURITY-L2-029` | `MPR-RC-HELIXSECURITY-L2-029-003` | `po-decision-2026-10-03-additions10.md:35` |
| `SECURITY-L2-030` | `HELIXSECURITY-L2-030` | `MPR-RC-HELIXSECURITY-L2-030-001` | `po-decision-2026-09-29-57candidates.md:89` |
| `SECURITY-L2-032` | `HELIXSECURITY-L2-032` | `MPR-RC-HELIXSECURITY-L2-032-001` | `po-decision-2026-09-29-57candidates.md:91` |
| `SECURITY-L2-034` | `HELIXSECURITY-L2-034` | `MPR-RC-HELIXSECURITY-L2-034-001` | `po-decision-2026-09-29-57candidates.md:93` |
| `SECURITY-L2-035` | `HELIXSECURITY-L2-035` | `MPR-RC-HELIXSECURITY-L2-035-001` | `po-decision-2026-10-03-additions10.md:43` |

固定revision `633bf12ea8f948db8ba3d6600179c4a9507377a7` のPO行とL2見出しを実読した。029は登録003のL11 part1/part2、035は適用範囲A・配置Aを保持する。意味・範囲・担当・版や本文は変わらず、新しい承認判断を生成しない。略記を別親や別registrationと解釈せず、既存承認対象の表記は上表の正規IDとの対応で読む。

## 検証と記録の保持

既存decision SHA-256 `2a8b97ac2ceb54578cfcb49c7a7e247a8a139965c06eeb5ee565346ccf1ca6dc` と既存pin SHA-256 `b38352cb50281f478adf6953fe0c56f32e36333954e533a1c2020d7ded996e10` は保持した。時点記録を上書きせず、この追補を加えた。既存承認対象6文書のSHA・bytesは全件一致。固定POのfull SHAとraw-LF行SHA、L2正規見出しのfull SHAとraw-LF行SHA、6本文のSHA・bytesを[照合JSON](l3-l10-security-stage3-parent-identity-correction-2026-10-05.json)へ固定した。

旧HELIXからのL3/L10対応、旧sourceの再利用・再導出・置換は既にreviewされた6本文のcrosswalkに保持され、今回は変更していない。本追補は表記の訂正に限る。独立レビューのfinding closure、追加承認、下流実装開始、Issue closeはこの照合から生成しない。
