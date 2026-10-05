# LABO Stage 2b 002–010 Opus review01 repair — audit summary

- Base: `fa642cddc3c4446e3635f1c6badd90209862cfac`
- Body revision: `d25f8cf615c93148b536727a016cfc7a8e7bd08e`
- 対象: Stage 2b HELIXLABO-L2-002〜010。本文6ファイルのStage1 approved prefixは6/6 exact bytes一致。
- 照合: unique functional CASE 140、親別 002:14, 003:10, 004:11, 005:12, 006:16, 007:18, 008:15, 009:16, 010:28。参照未解決0。NFR ID 12、参照未解決0。
- Static: scfctl validate 147/0 fail、stale=0、residuals=0、govcheck ok 7622 atoms/57 requirements/58 files、diff-check pass。
- Reviewer comment: [#2585 Opus review01](https://github.com/RetryYN/HELIX-HARNESS/pull/2585#issuecomment-5986327405), UTF-8 body SHA-256 `83c2029cca16334f505e24ad70cd643813b7d4631d1c5555dc1c60a9768c4f3a`.
- Historical 12 audit records are byte-identical to source Git blobs; their provenance is local-only where indicated. Legacy spans `[22,24]` and `[25,34]` are explicitly labelled as paired acceptance asset spans.
- This is creator repair evidence only. Root full review, independent review, and PO decision are pending. No push/PR/Ready/merge.

## Findings addressed in candidate

- `X1` (Major) — Add/add collision with Stage1: #2580 merge後のmainから6文書を再構成し、承認済prefix6/6をbyte完全一致で保持。別Stage本文は混入なし。
- `X2` (Major) — 旧source起点とbounded search: 002へ旧UIL-R-02の意味再導出と正確なsource pinを追加。003/004は旧Bench・paired acceptance・旧L3範囲の検索結果と不在の限界を記録。
- `X3` (Major) — Bench R-08誤pin: 旧Bench全体pinにR-08 143-147を追加し、別raw-span pinを記録。
- `M002-1` (Major) — L11 §24 #3 七状態とfalse-success反例: FR/CASE/NFRで7状態を列挙し、unknown/not_observed→successとfailure/rejected脱落を独立変異として拒否。
- `M002-2` (Major) — 相関あり因果未確定正常と近接反例: 正常CASE-13と、時刻のみ/pathのみを分けたCASE-14を追加。
- `M002-3` (Major) — L2依存拡張/個別入力契約: 単独成立依存をL2-001/L2-011に限定。L2-021..030は追加依存にせず、L2-001のsource選択の下で入力元選択とevent absenceを区別。
- `M002-4` (Major) — contract defect対event absence: 必須契約fieldの欠落/stale/wrong-revisionは不成立でownerへ返却、実event不在はpartial正常として区別。
- `M006-1` (Major) — one-run-is-improvement: 一回の成功だけによる改善認定negative CASE-15追加。
- `M006-2` (Major) — failure/counterexample/scope/cost/limits保持: 5出力を別fieldで照合するCASE-16を追加。
- `M007-1` (Major) — systemization率・反例・L11:120: FRの目的関数禁止とNFR/CASE trace、shadow/contradicted正常状態とsystemization率最大化を拒否するnegative CASE-18を追加。
- `M007-2` (Major) — 6個別continuation exclusion conditions: 6条件を独立変異とするCASE-16へ追加、operation candidate保持oracle。
- `M007-3` (Major) — comparability/oracle/interrupt/identity: 比較不能、中断・判定不能、counterexample欠落、experiment/revision staleを独立変異化し既存owner返却。
- `M008-1` (Major) — 永続固定/operation fallbackの誤分類: CASE-13/14でsystem固定とfallback failure/retire誤表示を独立に拒否。
- `M008-2` (Major) — 欠落時の戻し先: CASE-03..10の各fieldでsource/current responsibility ownerへのidentity付き返却をoracleに明記。
- `M010-1` (Major) — 必須根拠の戻し先: CASE-03..18にfield別source/evidence owner、identity/revision、reason返却を明記。
- `m002-scope` (Minor) — event列挙を閉じない: 固定L2の「等」を例示として扱い、追加許可source/eventを同じstatus/scope規則で扱う。
- `m002-registration` (Minor) — 現行registration: 初回-001とmetadata-only correction -002（digest不変）を列示。
- `m003-004-duty` (Minor) — common unfinished duties: 003/004のACとnormal/negative CASEでunfinished duty identityと未完状態を保持。
- `m004-read-first` (Minor) — 元意味を読む前の変換: 変換前に原sourceを読む独立negative CASE-10を追加。
- `m006-quality` (Minor) — 必要品質の根拠範囲: oracleまたはdeclared comparison conditionと表記。
- `m007-state` (Minor) — stage/contradicted状態: shadow stage正常例とcontradicted-condition正常例を明記。
- `m007-owner` (Minor) — CASE03-08の戻し先: 不足conditionごとの既存evidence owner returnをCASE-17に明記。
- `m007-repeat` (Minor) — 反復episode fixture: 複数episode identityを保つCASE-15を追加。
- `m007-unfinished` (Minor) — 未完成systemを除外しない: systemization-onlyへの限定を各criterion別変異で拒否。
- `m008-dependency` (Minor) — L2-007単独依存: FRとCASE/NFRでL2-007/017を参照。
- `m008-separate` (Minor) — continue/modify fixture分離: CASE-01 continue、CASE-15 modify、CASE-02 fallbackを別normal fixtureに分離。
- `m009-scope-return` (Minor) — 反例scope縮小・owner差戻し: counterexampleによるscope縮小をCASE-15、case08/09/10/13の具体owner returnを明記。
- `m009-stale-trace` (Minor) — stale case/NFR trace: revisionだけstaleにするCASE-16を追加しNFR traceを整合。
- `m010-placement` (Minor) — 配置境界: CASE-23 routing、25 ticket、26 registration、27 authority、28 placementに分割。
- `m010-authority` (Minor) — LABOへのtarget authority移転: CASE-27で独立拒否。
- `m010-multitarget` (Minor) — 同一experiment複数target正常: CASE-24でexperiment sourceを共有してtarget別proposal行を保持。
- `m-common` (Minor) — NFR IDs/timing proposal disclosure: L3 gradeにStage2b NFR IDsを定義。timing/volume profileは固定根拠のない新測定設計案として明示。
- `m-audit-local` (Minor) — local-only audit/source commit: 旧commitとf712 source revisionの非remote provenanceを新監査に記録し、12時点記録blobを不変収載。
- `m-audit-spans` (Minor) — span label: [22,24]/[25,34]をpaired acceptance source assetと対象区分でラベル付け。

JSON includes exact current suffix line pins, all 88 prior source pins recalculated plus 3 added bounded spans, body hashes, prefix hashes, and historical record blob provenance.


repair01監査は不変に保ち、M007-1に対する独立negative fixtureを加えた最新body revisionの追補監査である。
