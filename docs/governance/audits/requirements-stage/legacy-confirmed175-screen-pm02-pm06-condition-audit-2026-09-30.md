# confirmed175 PM-02〜PM-06 条件照合監査

## 結果

2026-09-30時点のcondition comparison queueで個別照合前だったPM-02〜PM-06の5 identityを、旧screen要求・旧consumer・f6dad2a固定L2/L11 pair・後続57+11 decision screenに対して静的比較した。PM-01は対象外。旧source atomの条件閉鎖、successor割当、要求採択、Step5完了は主張しない。旧runtime、`harness.db`、archive test/CIは実行していない。

| 指標 | 結果 |
|---|---:|
| 条件比較 | 5/5 |
| 57+11判断screen | 68 identity / 57候補 + 11候補 |
| 閉鎖 / successor割当 | 0 / 0 |
| authority effect | none |

詳細なidentity/status一覧、pair digest、全source tupleは[JSON記録](./legacy-confirmed175-screen-pm02-pm06-condition-audit-2026-09-30.json)に含む。

## Sourceと旧consumer

旧sourceは[archive screen-requirements.md](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L1-requirements/screen-requirements.md)、asset `LEGACY-ASSET-3B905BB196962E2BE624`。archiveとholding copyのSHA-256は `e5b6964567242a2440ded28ed99c1783f37a9326624c02283c7a975c3020063b`。PM-02〜06の正確な行 tupleは次の通り。

| Identity | source line | line SHA-256 | source detail lines | fixed targets |
|---|---:|---|---|---|
| PM-02 | 46 | `d739ac6f7df484e2edca9cdc36f785bfd15dfadf6dabb5e55e4451f8996d4b8e` | 63-72 | `HARNESS-L2-002`, `HARNESS-L2-003`, `HELIXOS-L2-017`, `HELIXOS-L2-019`, `HELIXOS-L2-023` |
| PM-03 | 47 | `eda844e75da2d3e1b842515922923c2a1ff8e3d93c250351f5b425c98df87b05` | 74-84 | `HARNESS-L2-005`, `HELIXOS-L2-017`, `HELIXOS-L2-020`, `HELIXOS-L2-023` |
| PM-04 | 48 | `8dbcfc82f342da420474039d574b03074987c4d8418948068f070014106db03e` | 86-95 | `HARNESS-L2-004`, `HARNESS-L2-023` |
| PM-05 | 49 | `6df7fd23018a42acc6f71190a3c75c949e20c29ff8499a0a30dd1ba5838ce99d` | 97-106 | `HELIXOS-L2-019` |
| PM-06 | 50 | `a4542171ef9714419f336bfe8e563dfe559a70d012b0f9f1f4f37c2fbbdc049a` | 108-123 | `HARNESS-L2-001`, `HARNESS-L2-009`, `HELIXBRAIN-L2-002`, `HELIXBRAIN-L2-019` |

旧consumerは[L2 screen-flow](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L2-screen/screen-flow.md)、[L2 ui-element](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L2-screen/ui-element.md)、[L2 business-flow](../../../../archive/legacy-generation-2026-09-14/root/docs/design/harness/L2-screen/business-flow.md)、[operational-test-design](../../../../archive/legacy-generation-2026-09-14/root/docs/test-design/harness/L1-operational-test-design.md)。UI elementの画面別契約はPM-02..06が各1行（57..61）。OT-33/34/35/47はL0-L14/3-axis/PLAN-state alignment、gate trouble/severity/next_action、4-artifact+6旧pair/trace gap、viewer preview/read-only/deep-linkを受入期待にするが、各行はいずれも旧文書上`not-implemented`。PM-05は専用画面OTを確認せず、OT-28のprovider evidenceとDB continuation SSoT分離をconsumer文脈として記録。

## 固定f6比較と残差

対象pairはf6dad2a33e24f000b87d7f09b8d40288257e74ccのHARNESS/OS/BRAIN L2/L11本文（SHAはJSON内）。工程/ticket/validation/handoff/trace/continuation/design-knowledgeの意味が一部近い。ただしscreen UIの表示・遷移・描画NFR・fallback/permissionを同一oracleとして受け入れる条件は見つからない。特に旧PM-04の物理pair `L1↔L14`等を現行canonical pairへ読み替えない。

| Identity | 固定pairで近い意味 | 残るscreen-level条件 |
|---|---|---|
| PM-02 | HARNESS-002は開発方式をticket駆動と区別し、選択・合成されたV/Scrum/hybrid/release-kanban条件とL1-L3共通条件を定める。HARNESS-003は開始・凍結・差戻し・再開・完了、L2.5適用性、成果状態とVの谷後の照合/Backflow条件を定める。OS-017/019/023はticket graph、continuation・未完義務、受渡し/evidenceを扱う。PM-02に関係するworkflow条件と状態非推定は限定的に対応する。 | 画面3軸限定、L0-L14テンプレ表示、各画面のURL/state retention、30秒poll/即時refresh、status色の個別表示、PLAN stateの画面表示一致、およびPoC S0-S4の別軸表示をPM-02として検査するL2/L11 screen oracleはfixed pairsにない。OT-33は旧consumerの未実装期待であり合格証拠ではない。 |
| PM-03 | HARNESS-005はticket/scope/change/riskからoracle・expected failure・evidence・期限・差戻しをもつ必要検証を導出し、PR前CIの構成、省略検査の回収を定める。OS-017/020/023はticket、検証運転、受渡し状態/evidenceの機械側条件を扱う。これらは画面の表示契約と運転契約を区別する根拠になる。 | gate結果画面のpass/fail/bypass/pending描画、signer/bypass auditへの表示、active trouble severityとnext_actionの一覧粒度、30秒pollとB8即時反映、色・raw-data UX、copy-only interrupt/resumeは固定pairで個別画面受入されない。OS/CIの検証実行・evidence条件はPM-03の表示受入を代替しない。 |
| PM-04 | HARNESS-L2-004は要求変更から影響する設計・テストと再検証範囲を導出するため、trace impact/reverification semanticsに限定して関連する。HARNESS-L2-023はfull auditから引き継いだtarget mappingに過ぎない。f6 L2 lines 463-492とL11 lines 219-223は利用条件別dependency declaration/closureを定め、PM-04 trace、V-pair検証、証拠handoffとの意味上の対応はないため、PM-04を支える根拠から除外する。 | 固定pairはPM-04画面、4 artifactの一覧・上下流方向・孤立検出・D-05整合率数値・旧L1↔L14等のpair freeze表、フィルタ/遷移/30秒refreshの受入を定義していない。legacyの物理layer pairと現行canonical L1↔L12/L2↔L11等は別体系であり、旧layer番号は現行pairへ移さない。 |
| PM-05 | OS-019は作業継続、未完義務/状態、停止・再開条件とbudget/期限保持の下位運用を扱うため、continuationのmissing/stale/unfinished stateを推測で完了扱いしない意図に近い。 | fixed OS-019 pairは旧harness.db projection schema、PM-05起動時表示、30秒poll、event digest/carry/final gateを画面で示す情報要素、stale/absent UI stateと操作/deep-linkを定義しない。旧DBを実行・参照して現行projectionの存在や実測結果を主張していない。 |
| PM-06 | HARNESS-001はcanonical L1-L12/V-pairの位置関係とL0を層外anchorとすることを定める。HARNESS-009はversioned Design Templateから設計義務・不足inputを導く。BRAIN-002はDomain→Pattern→Design Unit→Part知識構造、BRAIN-019はrequired inputs/condition/alternative/constraint/negative-case/source/version付き知識候補をHARNESSへ渡し、製品固有選択を決めない。doc tree・知識の構造的背景に限った関連である。 | いずれもPM-06 viewer UIではなく層/pair、template obligation、generic design knowledge contract。Markdown/YAML/Mermaid rendererの画面挙動、TOC/filter/link、read-only enforcement、`:case`閲覧権限、fallback/error/stale states、30秒poll、p95≤2s/50KB、Mermaid≤1s、sandbox/no external fetch/eval、外部共有除外条件のspecific screen acceptanceはfixed pairsにない。 旧L1 sourceはL1-L12+L0 anchor、OT-47はL0-L14を期待しscopeが一致しない。 |

## 後続decision scopeの限定効果

57候補decisionのsource revisionは `318ec4a04abb3c1cc17111b3d939f913facd5fd3`、判断表digestは `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`。全57 identity/status（42 adopted、11 conditional adopted、4 held）をJSONに記録した。後続11候補は `6e10127a65a775b0a7554ccb359abdfc1221d17a2c48fb79321d59369df127c5`（8 adopted、2 adopted_with_dependency、1 not_adopted_current_revision）、全identity/statusをJSONに記録した。dispositionはPM screen atom coverageではない。

| Near pair | decision | relevant section digests (L2 / L11) | 限定効果 |
|---|---|---|---|
| `HARNESS-L2-039` | adopted | `e2a71f7961a3e8c7c241c7d1ef3238382d5d709296db2fb7e57a9dd0cd9215a0` / `63177feef3ec82d4e0a4bb5a56c7cfefdbe3666f0eb18f0a5d2934cfd1211746` | Adopted, same-scope/revision Experience/UI/Frontend contract and risk-based UI verification relation; not a blanket adoption of legacy screen UI requirements. |
| `HELIXOS-L2-050` | conditional_adopted | `fab5fdfae9cfd2211f8c2fd6dfad5ce7b065e007ef11ca62f55420baa5033b6d` / `cf4866f2d8beee83eda5389e3b98100cd37cbd609f7c797617b499c1381bfafb` | Conditionally adopted review-capacity/backpressure and merge-authority boundary; no UI/screen acceptance effect. |

`HARNESS-L2-039`は同scope/revisionにExperience・UI/Frontend関係とoracleを結ぶ後続候補として画面要求に一番近い。ただし同decisionは旧PM-02〜06個別conditionを指しておらず、30秒poll、PM-06のp95≤2秒/50KB、Mermaid≤1秒、旧L0-L14表示、read-only/fallbackなどの旧screen条件を一括採択したことにはならない。`HELIXOS-L2-050`はreview capacity/backpressure限定であり、screen UIの比較効果なし。いずれもsource-to-successor関係は割り当てない。

## Negative oracleと境界

- Operational/ticket/CI/continuation evidenceやBRAIN knowledge receiptだけで、PM screen上の表示、状態色、遷移、render結果を成立扱いしない。
- missing/stale/unknownを正常・N/A・完了へ読み替えない。Copy UIから実行権限を推定しない。
- HARNESS-L2-039またはOS-L2-050の採択状態から旧PM source atomsの採択・後継を推定しない。
- legacy数値・画面条件は旧source/consumerの条件として記録し、現行採択済み数値や実測に変換しない。
- 旧 `harness.db`、CLI、test、CI/runtimeは実行していない。

## 再現情報

Queue base revision: `2bbd889545cff238452701e5901ce56b67208fc8`; full audit SHA-256: `ca08a81d97e39e94aa02151c7cc4e48f621f9d30baccc1cf9b715331fed38f45`; queue SHA-256: `2dbfb06c11ac42a940c0d6b5c188a76e685ea4c00e4d9af10b432198ad17b353`. Audit worktree base: `3567842662f5e0d7a21233b0e83f4fc3900aec0e`. Pair files were read with `git show <revision>:<path>` and hashed as raw bytes. Validation results are reported by the creating agent alongside this artifact.
