# HARNESS Stage 4 review01補正記録（2026-10-05）

この時点記録はOpusのPR #2606 review01指摘をL3/L10候補へ反映した根拠と照合を保存する。L3承認、独立再review、Ready化、merge、実装、releaseを表さない。旧authoring・review01・root-prepublication記録は変更していない。

本文候補HEAD: `7339ec70586140c4748c8a1f23925b5b93c4e334`。最新main `29e814a92af2aa52afcbcdd60549b32a2448513a` を通常mergeしたcommit `a3c28259e5b609e08bb88b0ea96668ec36d1eb44` の後に、Stage 4本文commitを積んだ。

6文書はそれぞれ最新mainの全bytesを先頭prefixとして保持し、その後ろに当該文書の既存内容とStage 4 suffixが続く。6文書の全体SHA、main prefix SHA、suffix SHA、物理行数はJSONに記録した。本文は4文書、NFR/functionalを含み、独立business ruleがない既存BR/BVは変更していない。

## 根拠と照合

固定L2/L11の要求意味・失敗時境界はmain `633bf12` から直接pinした。該当HARNESS-L2-026〜029とL11-026〜029/共通依存のraw LF spanは、旧固定revision `f6dad2a` の同じ物理spanともbyte-identicalである。全体ファイルのSHAは633bf12とf6dad2aで異なるため、両方のfull hashと各親spanのhashをJSONへ分けて記録した。

PO判断記録main `633bf12` の19行は029をCOREとし、66行は027/028/030/033を確認資料の所属・適用条件どおり採択する。したがって前review01追補監査の「L11-ownership-table-out-of-scope」「unadopted 027–033」という現在 authority の読みは誤りである。履歴recordは不変とし、この補正記録で誤読を明示した。G0配属は `implementation-order-addendum` の58–61行を順序根拠としてpinし、採択authorityには使っていない。

旧L2-029のAAFD起点は `LEGACY-ASSET-EB3700B0088F311C2295`。旧requirements文書の全体SHA、50–78行のraw LF SHA、資産台帳789行をpinした。登録locator補正後の-004は旧-003と同じsemantic digestを持つmetadata-only変更（source atom count 0）としてpinした。

## 指摘と本文trace

| Finding | 固定sourceの要点 | L3 FR/AC | L10 CASE |
|---|---|---|---|
| `M1` PO ownership/adoption and common-component scope; correction of prior audit false out-of-scope statement | PO row19; PO row66; L2-028; L2-029; L11 028/029 ownership-context | FR-HARNESS-L3-028-01; FR-HARNESS-L3-029; AC-HARNESS-L3-028-01; AC-HARNESS-L3-029-01; CASE-HARNESS-L10-028-29; CASE-HARNESS-L10-029-34 | 候補反映・root検収待ち |
| `M2` common dependency boundaries moved to each parent and independent cases | L2-028 lines 582; L2-029 lines 597-598; L11 lines 396-403 | FR-HARNESS-L3-027; FR-HARNESS-L3-028; FR-HARNESS-L3-029; AC-HARNESS-L3-028-07; AC-HARNESS-L3-029-08; CASE-HARNESS-L10-028-30/31; CASE-HARNESS-L10-029-40/44 | 候補反映・root検収待ち |
| `M3` operation-specific and selected-baseline conditions; unselected baseline unobserved | L2-028 lines 582/584; L11 line 399 | AC-HARNESS-L3-028-06; CASE-HARNESS-L10-028-24/25/26/27/32/33/34/35/36/37/38 | 候補反映・root検収待ち |
| `M4` 028 external custom logic, affected design/pair/test set, backflow and three distinct representations | L2-028 line 580; L11 line 377 | AC-HARNESS-L3-028-01; CASE-HARNESS-L10-028-19 | 候補反映・root検収待ち |
| `M5` 028 partial extraction/conflicting design/unknown custom owner/design revision mismatch each separate | L2-028 line 584; L11 line 379 | AC-HARNESS-L3-028-06; CASE-HARNESS-L10-028-20/21/22/23 | 候補反映・root検収待ち |
| `M6` 026 pack is exchange target; 014/025 completion not prerequisite; stale/incompatible hold and unseen contract | L2-026 lines 534-540; L11 lines 350-356 | AC-HARNESS-L3-026-06; CASE-HARNESS-L10-026-33/34/35/36/37/38/39/46 | 候補反映・root検収待ち |
| `M7` 019 intake/result contract is required; completion receipt is not required; tuple fields are separately checked | L2-027 lines 559-572; L11 lines 365-374,397 | AC-HARNESS-L3-027-01/02/05; CASE-HARNESS-L10-027-01/25-35 | 候補反映・root検収待ち |
| `M8` 026 L3 approval/authority unknown and four alternative outcomes separated | L2-026 lines 534-540; L11 lines 336/338 | AC-HARNESS-L3-026-02/05; CASE-HARNESS-L10-026-40-45 | 候補反映・root検収待ち |
| `M9` 027 custom processing observed; static inference not Requirement | L2-027 line 568; L11 line 371 | AC-HARNESS-L3-027-06; CASE-HARNESS-L10-027-28/38 | 候補反映・root検収待ち |
| `M10` unknown/stale authority holds comparison; stale separately represented | L2-028 lines 578/582; L11 line 381 | AC-HARNESS-L3-028-03/06; CASE-HARNESS-L10-028-07/28 | 候補反映・root検収待ち |
| `M11` 029 meaning/authority/source-default/migration-version and no promotion/commit/release cases | L2-029 lines 587-604; L11 lines 383-395 | AC-HARNESS-L3-029-02/04/05/07; CASE-HARNESS-L10-029-20/21/35-39/45-48/52/53 | 候補反映・root検収待ち |
| `M12` five selected-operation dependencies each own AC and separate CASE | L2-029 line 597 | AC-HARNESS-L3-029-06; CASE-HARNESS-L10-029-26-30 | 候補反映・root検収待ち |
| `M13` unit/connection/composite separation; selected-source-only scope; unsupported types and no fallback | L2-029 lines 595/597; L11 line 391 | AC-HARNESS-L3-029-07; CASE-HARNESS-L10-029-31-33/39 | 候補反映・root検収待ち |
| `M14` fixed PO normal example and no-change reason | L11 line 387 | AC-HARNESS-L3-029-01/07; CASE-HARNESS-L10-029-25 | 候補反映・root検収待ち |
| `M15` AAFD legacy asset crosswalk and pinned source | L2-029 line 602; LEGACY-ASSET-EB3700B0088F311C2295 lines 50-78 | 旧HELIX項目別起点 table row AAFD | 候補反映・root検収待ち |
| `M16` type-specific limits, static-only, missing version contract, no requirement/design rewrite | L2-027 lines 568-570; L11 lines 371/373 | AC-HARNESS-L3-027-06; CASE-HARNESS-L10-027-17/24/26/36-38 | 候補反映・root検収待ち |
| `m1` unsupported owner names replaced by fixed owner boundaries | L2 parent failure return clauses | CASE-HARNESS-L10-026-12/13/14; CASE-HARNESS-L10-028-08/15; CASE-HARNESS-L10-029-21 | 候補反映・root検収待ち |
| `m2` CASE-028-18 traced to AC-028-04 | L2-028 failure relation condition | CASE-HARNESS-L10-028-18 | 候補反映・root検収待ち |
| `m3` no-change reason in normal oracle | L2-029 line 597 | CASE-HARNESS-L10-029-02 | 候補反映・root検収待ち |
| `m4` migration proposal constituents explicit | L2-029 line 594 | FR-HARNESS-L3-029; AC-HARNESS-L3-029-06 | 候補反映・root検収待ち |
| `m5` no universal other-product/Version-1/data-migration completion claims | L11 line 401 | CASE-HARNESS-L10-029-49/50/51 | 候補反映・root検収待ち |
| `m6` current -004 registration IDs/digest and prior -003 semantic digest equivalence recorded | r2289-02 correction lines 2125-2152; G0 order records lines 59-61 | registration pins in this audit | 候補反映・root検収待ち |
| `m7` 026 unknown/N-A/impact and unit/connection/composite, BRAIN vs HARNESS/CORE, 010/011 reflected | L2-026 lines 534-540 | AC-HARNESS-L3-026-06/07; CASE-HARNESS-L10-026-33-49 | 候補反映・root検収待ち |
| `m8` case order remains non-semantic; no renumbering churn | finding says optional | existing and new case IDs | 候補反映・root検収待ち |
| `m9` Stage 4 mapping source pinned; order not treated as adoption authority | G0 addendum lines 58-61 | FR Stage4 intro | 候補反映・root検収待ち |

NFR候補とL10計測表も026/028/029の追加fixtureを母集団へ含めた。性能SLO、固定試行回数、期限、PO parameter gateは追加していない。Stage 4候補は既存の候補/未承認状態のままである。

## 静的照合

- Stage 4 functional FR acceptance criteria: 28個。Stage 4 L10 functional case: 178個（全件unique）。
- caseのAC trace欠落0件、Stage 4 functional-verification tableの列数不一致0行。
- 最新main prefixと6文書の先頭bytes一致を全6件で確認。
- `git diff --check` は本文revisionでpass。古いruntime、CLI、hook、CI/test、Bunは起動していない。
- 変更current line literalとLF-inclusive raw line hashはJSONの`current_changed_line_pins`に記録した。

## 未確定

rootによる本文の意味検収、後続の正式独立review、全scopeの追加指摘の有無は未確定である。このWorker記録はそれらの完了やfinding closureを生成しない。
