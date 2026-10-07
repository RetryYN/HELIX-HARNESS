# review01 source locator訂正追補

対象は#2697の79親追補と、159親の機構別scope報告に記載されたlocatorである。既存snapshotは不変のまま、source実体に対する範囲外行とJSON pointer不成立だけを訂正する。意味評価、finding、対象scopeは変更しない。

## 誤locatorの訂正

| 親ID | 誤ったlocator | source実体に合うlocator | source SHA-256 | 根拠 |
|---|---|---|---|---|
| HARNESS-L2-010 | A003 source lines 28–36 | A003 source lines 9, 15, 25 | 7493cf41eb097b615979b20265da417a9137c70c0301828ed7d0f7d4d5265b91 | A003 snapshotは25行。9行がHARNESS010/011/023の限定所見、15行が対応する旧source範囲、25行が未確認範囲を示す。 |
| HARNESS-L2-011 | A003 source lines 28–36 | A003 source lines 9, 15, 25 | 7493cf41eb097b615979b20265da417a9137c70c0301828ed7d0f7d4d5265b91 | A003 snapshotは25行。9行がHARNESS010/011/023の限定所見、15行が対応する旧source範囲、25行が未確認範囲を示す。 |
| HARNESS-L2-023 | A003 source lines 28–36 | A003 source lines 9, 15, 25 | 7493cf41eb097b615979b20265da417a9137c70c0301828ed7d0f7d4d5265b91 | A003 snapshotは25行。9行がHARNESS010/011/023の限定所見、15行が対応する旧source範囲、25行が未確認範囲を示す。 |
| HARNESS-L2-022 | A005/A058 source lines 1–45 (parent scope table and conclusion) | A005/A058 source lines 1–43 (scope/conclusion/limits) | cbe46426f36c41289bcc975235dc70363ca2401da3a2e322290d7f69ca3748fc | A005/A058は同一snapshot SHA。実ファイルは43行で、親別scope tableは14–18行、限定結論は10行、未確認範囲は38行。 |
| HARNESS-L2-030 | A005/A058 source lines 1–45 (parent scope table and conclusion) | A005/A058 source lines 1–43 (scope/conclusion/limits) | cbe46426f36c41289bcc975235dc70363ca2401da3a2e322290d7f69ca3748fc | A005/A058は同一snapshot SHA。実ファイルは43行で、親別scope tableは14–18行、限定結論は10行、未確認範囲は38行。 |
| HARNESS-L2-031 | A005/A058 source lines 1–45 (parent scope table and conclusion) | A005/A058 source lines 1–43 (scope/conclusion/limits) | cbe46426f36c41289bcc975235dc70363ca2401da3a2e322290d7f69ca3748fc | A005/A058は同一snapshot SHA。実ファイルは43行で、親別scope tableは14–18行、限定結論は10行、未確認範囲は38行。 |
| HARNESS-L2-032 | A005/A058 source lines 1–45 (parent scope table and conclusion) | A005/A058 source lines 1–43 (scope/conclusion/limits) | cbe46426f36c41289bcc975235dc70363ca2401da3a2e322290d7f69ca3748fc | A005/A058は同一snapshot SHA。実ファイルは43行で、親別scope tableは14–18行、限定結論は10行、未確認範囲は38行。 |
| HELIXCONNECT-L2-006 | A005/A006 source lines 1–45 (CONNECT-006 row and conclusion) | A005/A006 source lines 1–43 (CONNECT-006 row and conclusion) | cbe46426f36c41289bcc975235dc70363ca2401da3a2e322290d7f69ca3748fc | A005/A006は同一snapshot SHA。実ファイルは43行で、CONNECT-006は18行、結論は34行。 |
| HELIXCONNECT-L2-008 | A076 source lines 1–6 | A076 source lines 1–5 | ab93083424067478c80f5ba3f233dddd5aa31ca9f226b33c859b44e00f70cf49 | A076 snapshotは5行。1–5行が表題、読了範囲、結論、限界を含む。 |
| HELIXCONNECT-L2-009 | A076 source lines 1–6 | A076 source lines 1–5 | ab93083424067478c80f5ba3f233dddd5aa31ca9f226b33c859b44e00f70cf49 | A076 snapshotは5行。1–5行が表題、読了範囲、結論、限界を含む。 |
| HELIXOS-L2-015 | A047 $/no_finding_observations[parents includes 015] | A047 $/no_finding_observations/0 | b1ac54c686d6f5ee2d19256d5517752b07bc0837120743a2799ef90e620693d5 | A047のno_finding_observations配列index 0 のparents配列にsuffix 015 が記録される。 |
| HELIXOS-L2-016 | A047 $/no_finding_observations[parents includes 016] | A047 $/no_finding_observations/1 | b1ac54c686d6f5ee2d19256d5517752b07bc0837120743a2799ef90e620693d5 | A047のno_finding_observations配列index 1 のparents配列にsuffix 016 が記録される。 |
| HELIXOS-L2-017 | A047 $/no_finding_observations[parents includes 017] | A047 $/no_finding_observations/2 | b1ac54c686d6f5ee2d19256d5517752b07bc0837120743a2799ef90e620693d5 | A047のno_finding_observations配列index 2 のparents配列にsuffix 017 が記録される。 |
| HELIXOS-L2-018 | A047 $/no_finding_observations[parents includes 018] | A047 $/no_finding_observations/3 | b1ac54c686d6f5ee2d19256d5517752b07bc0837120743a2799ef90e620693d5 | A047のno_finding_observations配列index 3 のparents配列にsuffix 018 が記録される。 |
| HELIXOS-L2-021 | A056 $/parent_rows[021] | A056 $/parent_rows/0 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 0 のidがHELIXOS-L2-021。 |
| HELIXOS-L2-022 | A056 $/parent_rows[022] | A056 $/parent_rows/1 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 1 のidがHELIXOS-L2-022。 |
| HELIXOS-L2-024 | A056 $/parent_rows[024] | A056 $/parent_rows/2 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 2 のidがHELIXOS-L2-024。 |
| HELIXOS-L2-046 | A056 $/parent_rows[046] | A056 $/parent_rows/3 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 3 のidがHELIXOS-L2-046。 |
| HELIXOS-L2-048 | A056 $/parent_rows[048] | A056 $/parent_rows/4 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 4 のidがHELIXOS-L2-048。 |
| HELIXOS-L2-052 | A056 $/parent_rows[052] | A056 $/parent_rows/5 | 2672a9f5276e3f0aeb6cea4e5f7fb19fbef4122d75712971f6ee73a9c6d47fc1 | A056のparent_rows配列index 5 のidがHELIXOS-L2-052。 |
| HELIXOS-L2-049 | A055 $/observations[parent=HELIXOS-L2-049] | A055 $/observations/0; $/observations/1 | c09bc75b448d53847f9395a7c35a1b49b92611bcff89db6da83a21dbe0d0ea85 | A055 observations配列index 0と1のparentはいずれもHELIXOS-L2-049（異なるobservation type）。 |
| HELIXOS-L2-050 | A055 $/observations[parent=HELIXOS-L2-050] | A055 $/observations/2 | c09bc75b448d53847f9395a7c35a1b49b92611bcff89db6da83a21dbe0d0ea85 | A055 observations配列index 2のparentがHELIXOS-L2-050。 |
| HELIXOS-L2-051 | A055 $/observations[parent=HELIXOS-L2-051] | A055 $/observations/3 | c09bc75b448d53847f9395a7c35a1b49b92611bcff89db6da83a21dbe0d0ea85 | A055 observations配列index 3のparentがHELIXOS-L2-051。 |

## 159親reportのstructured pointer確認

159親reportの39 source refsについて、親別に明示されたJSON pointer 65件（59種類、61親）をsource JSONへ解決した。成立しないpointerは0件。group-level scopeとされた行は親別pointerとして扱っていない。

## 照合根拠と限界

79親追補の既存snapshotおよび159親scope reportは変更していない。A003は25行、A005/A006/A058は同一SHAの43行source、A076は5行である。A002、A047、A055、A056はJSON配列要素を親IDの内容と突合してpointerを決めた。source full SHAと行数、親ごとの旧→正locatorはJSONに記録した。

これはlocator検証のみであり、79親追補全体や159親scopeの意味を再監査していない。旧runtime、test、CIは実行していない。

## 入力
- /tmp/root-274-unknown-HARNESS-OS-SECURITY-CONNECT-followup-2026-10-08.json — 676796 bytes, SHA-256 f09a89f23a67de891868d54e64fec48b3a0892155dae7ec6aef74e57c4d79949
- /tmp/root-274-unknown-HARNESS-OS-SECURITY-CONNECT-followup-2026-10-08.md — 30434 bytes, SHA-256 c58992ab79daddfa3ad88094597f5030a6fcaabe6846ae8c04d30471997b3483
- /tmp/root-4mechanism-semantic-audit-scope-d629e2525.json — 527262 bytes, SHA-256 8f820d2ac8b3e85ca2b9e2aeb03901cd5b240de7cbbdea3fe4bc27e0bd8564b7
- /home/tenni/.helix-worktrees/requirements-stage-274-semantic-audit-index/docs/governance/audits/requirements-stage/l3-stage-274-semantic-audit-index-d629e2525-2026-10-08.json — 1060032 bytes, SHA-256 95447df5f9f63e07e19cd884744a48328031f5cdc1dea2d22602871314b9458f
