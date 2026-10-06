# LABO Stage5 review03 Root検収用記録

- 対象PR: #2620
- 正式コメント: 6009106466
- 正式本文SHA-256: `3801e6a735548125d2ac4c6ff847789cd2045824039d2e64b32d259436d8c93c` (19810 bytes)
- 本文revision: `41413bb51a9ea2af05a4338b7f09453d6f084300`
- 状態: 作成側Root検収済・独立再レビュー待ち。
- この記録は作成側補正の証拠であり、独立review・承認・完了・下流権限を生成しない。

## 所見

| ID | 重大度 | 作成側の処置 | 現行証拠行 | 未解決selector |
|---|---|---|---|---|
| M1 | Major | 059 CASE-30 oracleを総費用・既決priorityによる判定へ直し、存在する総費用を欠落扱いする戻し文を除去。 | docs/helix-labo/L10-verification/functional-verification.md:2611 `L10-LABO-059-CASE-30` | なし |
| M2 | Major | 061 CASE-111をleakage無効runの低費用相殺、CASE-112をversion不一致無効runの短時間相殺へ分離し、いずれも無効状態を保持。 | docs/helix-labo/L10-verification/functional-verification.md:3349 `L10-LABO-061-CASE-111`<br>docs/helix-labo/L10-verification/functional-verification.md:3350 `L10-LABO-061-CASE-112` | なし |
| M3 | Major | CASE-01は原文のまま復元。CASE-107/111/112各行にのみCASE-01からの準備条件と、取消/失敗・漏洩無効・版不一致無効の1変異を明記。 | docs/helix-labo/L10-verification/functional-verification.md:2665 `L10-LABO-061-CASE-01`<br>docs/helix-labo/L10-verification/functional-verification.md:3346 `L10-LABO-061-CASE-107`<br>docs/helix-labo/L10-verification/functional-verification.md:3349 `L10-LABO-061-CASE-111`<br>docs/helix-labo/L10-verification/functional-verification.md:3350 `L10-LABO-061-CASE-112` | なし |
| M4 | Major | 漏洩時SECURITYへの戻しを常時、識別可能な漏洩元sourceへの戻しを追加条件とし、不明source identityのみunknown。 | docs/helix-labo/L10-verification/functional-verification.md:2672 `L10-LABO-061-CASE-03c`<br>docs/helix-labo/L10-verification/functional-verification.md:3089 `L10-LABO-061-CASE-05`<br>docs/helix-labo/L10-verification/functional-verification.md:3090 `L10-LABO-061-CASE-06`<br>docs/helix-labo/L10-verification/functional-verification.md:3091 `L10-LABO-061-CASE-07`<br>docs/helix-labo/L10-verification/functional-verification.md:3092 `L10-LABO-061-CASE-08`<br>docs/helix-labo/L10-verification/functional-verification.md:3093 `L10-LABO-061-CASE-09`<br>docs/helix-labo/L10-verification/functional-verification.md:3094 `L10-LABO-061-CASE-10` | なし |
| M5 | Major | CASE-17/89の戻し先を固定親の原因区分に戻し、独立した「fixture source owner」区分を削除。 | docs/helix-labo/L10-verification/functional-verification.md:3101 `L10-LABO-061-CASE-17`<br>docs/helix-labo/L10-verification/functional-verification.md:3313 `L10-LABO-061-CASE-89` | なし |
| M6 | Major | CASE-27をCASE-16/28への「索引（独立fixtureではない）」へ変更し、CASE-16のINTELLIGENCE proposal/use receipt欠落とCASE-28のOS registration/use receipt欠落を直接参照。2種類の欠落をCASE-27で独立変異として重複計上しない。 | docs/helix-labo/L10-verification/functional-verification.md:3082 `L10-LABO-060-CASE-27`<br>docs/helix-labo/L10-verification/functional-verification.md:3071 `L10-LABO-060-CASE-16`<br>docs/helix-labo/L10-verification/functional-verification.md:3081 `L10-LABO-060-CASE-26`<br>docs/helix-labo/L10-verification/functional-verification.md:3082 `L10-LABO-060-CASE-27`<br>docs/helix-labo/L10-verification/functional-verification.md:3082 `L10-LABO-060-CASE-27`<br>docs/helix-labo/L10-verification/functional-verification.md:3083 `L10-LABO-060-CASE-28` | なし |
| M7 | Major | CASE-17の比較scope/evaluation capability不成立をLABOへ限定。SECURITY等の未根拠routeは追加しない。 | docs/helix-labo/L10-verification/functional-verification.md:3072 `L10-LABO-060-CASE-17` | なし |
| M8 | Major | CASE-35/36を他の同条件runがある状態で不成立runを相殺する向きへ修正し、1条件変異にする。 | docs/helix-labo/L10-verification/functional-verification.md:3355 `L10-LABO-064-CASE-35`<br>docs/helix-labo/L10-verification/functional-verification.md:3356 `L10-LABO-064-CASE-36` | なし |
| M9 | Major | CASE-34を判定を持たない基準入力に限定し、独立judge/context条件を新しい合否条件として課さない。 | docs/helix-labo/L10-verification/functional-verification.md:3354 `L10-LABO-064-CASE-34` | なし |
| M10 | Major | operation後観測receipt欠落の単独fixture CASE-13を戻し、既存INDEXとは別の実fixtureとしてAC03へ結ぶ。 | docs/helix-labo/L10-verification/functional-verification.md:3161 `L10-LABO-063-CASE-13` | なし |
| M11 | Major | 070 AC-03へ、4値合算による059 wall-clock再定義と重複待ち按分の禁止、rollback/Recovery結果receipt欠落を「発生なし」と扱わないこと、threshold・rollback許可・ageからauthorityを生成しないことを追補。既存CASE-09/03f/03g/04a/15/51/52/53がAC-03をtraceする。 | docs/helix-labo/L3-requirements/functional-requirements.md:1705 `LABO-070-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1708 `L10-LABO-070-CASE-04a/04b`<br>docs/helix-labo/L10-verification/functional-verification.md:3242 `L10-LABO-070-CASE-09`<br>docs/helix-labo/L10-verification/functional-verification.md:2982 `L10-LABO-070-CASE-03f`<br>docs/helix-labo/L10-verification/functional-verification.md:2983 `L10-LABO-070-CASE-03g`<br>docs/helix-labo/L10-verification/functional-verification.md:2988 `L10-LABO-070-CASE-04a`<br>docs/helix-labo/L10-verification/functional-verification.md:3255 `L10-LABO-070-CASE-22`<br>docs/helix-labo/L10-verification/functional-verification.md:3248 `L10-LABO-070-CASE-15`<br>docs/helix-labo/L10-verification/functional-verification.md:2989 `L10-LABO-070-CASE-04b`<br>docs/helix-labo/L10-verification/functional-verification.md:3284 `L10-LABO-070-CASE-51`<br>docs/helix-labo/L10-verification/functional-verification.md:3242 `L10-LABO-070-CASE-09`<br>docs/helix-labo/L10-verification/functional-verification.md:3288 `L10-LABO-070-CASE-52`<br>docs/helix-labo/L10-verification/functional-verification.md:3242 `L10-LABO-070-CASE-09`<br>docs/helix-labo/L10-verification/functional-verification.md:3289 `L10-LABO-070-CASE-53`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1699 `LABO-070-FR-01` | なし |
| M12 | Major | CASE-16の優先行動欠落を固定親にないownerへ送らず、対象fieldの不確定性と既存境界を保持。 | docs/helix-labo/L10-verification/functional-verification.md:3235 `L10-LABO-069-CASE-16` | なし |
| M13 | Major | 070に分散した欠落変異をCASE-16/17/66/67の別行へ分け、OS result/assignment、task predicate/oracle、LABO集計を原因別に返す。 | docs/helix-labo/L10-verification/functional-verification.md:3249 `L10-LABO-070-CASE-16`<br>docs/helix-labo/L10-verification/functional-verification.md:3250 `L10-LABO-070-CASE-17`<br>docs/helix-labo/L10-verification/functional-verification.md:3344 `L10-LABO-070-CASE-66`<br>docs/helix-labo/L10-verification/functional-verification.md:3345 `L10-LABO-070-CASE-67` | なし |
| M14 | Major | CASE-03bをsource-capture completeness unknownの主fixtureとして総Attempt identity数をunknownにし、観測sourceまたはOS record ownerへ戻す。CASE-16とCASE-08はCASE-03bを直接参照する索引（独立fixtureではない）として保持し、索引の連鎖・二重計上をしない。CASE-18のresult receipt欠落とidentity数保持は別所見m20に分離する。 | docs/helix-labo/L10-verification/functional-verification.md:2922 `L10-LABO-068-CASE-03b`<br>docs/helix-labo/L10-verification/functional-verification.md:2936 `L10-LABO-068-CASE-16`<br>docs/helix-labo/L10-verification/functional-verification.md:3219 `L10-LABO-068-CASE-08` | なし |
| M15 | Major | 050 AC03へCI successのみでは循環完了しない禁止を復元し、CASE-16へ単独fixtureを対応。 | docs/helix-labo/L3-requirements/functional-requirements.md:1584 `LABO-050-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1587 `L10-LABO-050-CASE-05`<br>docs/helix-labo/L10-verification/functional-verification.md:2583 `L10-LABO-050-CASE-16` | なし |
| m1 | Minor | 059の価格/費用/実行receiptの原因区分を保持し、識別可能な既存sourceまたはLABO-055へ戻す。OSは実run receipt欠落時に限る。 | docs/helix-labo/L10-verification/functional-verification.md:2603 `L10-LABO-059-CASE-03j`<br>docs/helix-labo/L10-verification/functional-verification.md:2623 `L10-LABO-059-CASE-39`<br>docs/helix-labo/L10-verification/functional-verification.md:2625 `L10-LABO-059-CASE-41`<br>docs/helix-labo/L10-verification/functional-verification.md:2630 `L10-LABO-059-CASE-46`<br>docs/helix-labo/L10-verification/functional-verification.md:2631 `L10-LABO-059-CASE-47` | なし |
| m2 | Minor | CASE-110欠番を明記し、061のFR/NFR/NV/BV traceでCASE-102非適用対照と負例分母を区別。 | docs/helix-labo/L3-requirements/functional-requirements.md:1620 `L10-LABO-061-CASE-05`<br>docs/helix-labo/L3-requirements/nfr-grade.md:168 `NFR-LABO-061-01`<br>docs/helix-labo/L10-verification/nfr-verification.md:126 `CASE-NFR-LABO-061-01`<br>docs/helix-labo/L10-verification/business-verification.md:65 `HELIXLABO-L2-061` | なし |
| m3 | Minor | 全Stage5 negativeを単独fixtureまたは明示indexとして扱い、CASE-102非適用とCASE-109合成canaryを区別。CASE-01は未変更へ復元。 | docs/helix-labo/L10-verification/functional-verification.md:3022 `CASE-102`<br>docs/helix-labo/L10-verification/functional-verification.md:3338 `L10-LABO-061-CASE-102`<br>docs/helix-labo/L10-verification/functional-verification.md:3348 `L10-LABO-061-CASE-109`<br>docs/helix-labo/L10-verification/functional-verification.md:3346 `L10-LABO-061-CASE-107`<br>docs/helix-labo/L10-verification/functional-verification.md:3349 `L10-LABO-061-CASE-111`<br>docs/helix-labo/L10-verification/functional-verification.md:3350 `L10-LABO-061-CASE-112` | なし |
| m4 | Minor | historical authority/permission欠落はCASE-108でOS receiptとSECURITY許可証拠の戻し先を分離。CASE-109は合成canaryとして生secret/PIIを含めない。 | docs/helix-labo/L10-verification/functional-verification.md:3347 `L10-LABO-061-CASE-108`<br>docs/helix-labo/L10-verification/functional-verification.md:3348 `L10-LABO-061-CASE-109` | なし |
| m5 | Minor | 旧review02の誤差・欠落をこの時点の処置記録に明記し、過去監査を変更しない。旧CASE-107/111/112等の記録との差も開示。 | docs/helix-labo/L10-verification/functional-verification.md:3346 `L10-LABO-061-CASE-107`<br>docs/helix-labo/L10-verification/functional-verification.md:3349 `L10-LABO-061-CASE-111`<br>docs/helix-labo/L10-verification/functional-verification.md:3350 `L10-LABO-061-CASE-112` | なし |
| m6 | Minor | 050 CASE-17で登録済みを明記し、CASE-18等の登録前条件と区別。 | docs/helix-labo/L10-verification/functional-verification.md:2584 `L10-LABO-050-CASE-17`<br>docs/helix-labo/L10-verification/functional-verification.md:3308 `L10-LABO-050-CASE-18`<br>docs/helix-labo/L10-verification/functional-verification.md:3309 `L10-LABO-050-CASE-19` | なし |
| m7 | Minor | 061の107–113を連続配置し、CASE-102を通常履歴非適用対照と一貫表記。 | docs/helix-labo/L3-requirements/functional-requirements.md:1620 `L10-LABO-061-CASE-05`<br>docs/helix-labo/L10-verification/functional-verification.md:3338 `L10-LABO-061-CASE-102`<br>docs/helix-labo/L10-verification/functional-verification.md:3346 `L10-LABO-061-CASE-107`<br>docs/helix-labo/L10-verification/functional-verification.md:3351 `L10-LABO-061-CASE-113`<br>docs/helix-labo/L3-requirements/nfr-grade.md:168 `NFR-LABO-061-01` | なし |
| m8 | Minor | 063 CASE-21/40はsource identityを特定できない場合unknownを保持し、識別可能な観測providerへ返す。CASE-28/29は原因/適用条件providerへ返し、LABO効果評価未完を併記。 | docs/helix-labo/L10-verification/functional-verification.md:2738 `L10-LABO-063-CASE-21`<br>docs/helix-labo/L10-verification/functional-verification.md:2748 `L10-LABO-063-CASE-28`<br>docs/helix-labo/L10-verification/functional-verification.md:2749 `L10-LABO-063-CASE-29`<br>docs/helix-labo/L10-verification/functional-verification.md:2760 `L10-LABO-063-CASE-40` | なし |
| m9 | Minor | 065 fixture/rubric/assignment等のowner境界をHARNESS/要求owner、OS、SECURITY、既存decision ownerへ分け、cost sourceは特定時のみOS。 | docs/helix-labo/L10-verification/functional-verification.md:2834 `L10-LABO-065-CASE-31`<br>docs/helix-labo/L10-verification/functional-verification.md:2835 `L10-LABO-065-CASE-32`<br>docs/helix-labo/L10-verification/functional-verification.md:2843 `L10-LABO-065-CASE-40` | なし |
| m10 | Minor | 旧auditとの本文対応の齟齬は新時点記録で訂正。CASE-34は基準入力、CASE-35/36は逆方向相殺、CASE-13はoperation後観測欠落。 | docs/helix-labo/L10-verification/functional-verification.md:3354 `L10-LABO-064-CASE-34`<br>docs/helix-labo/L10-verification/functional-verification.md:3355 `L10-LABO-064-CASE-35`<br>docs/helix-labo/L10-verification/functional-verification.md:3356 `L10-LABO-064-CASE-36`<br>docs/helix-labo/L10-verification/functional-verification.md:3161 `L10-LABO-063-CASE-13` | なし |
| m11 | Minor | NVの063 indexから既存negative記載が落ちていたため、NVとNG（nfr-verificationとnfr-grade）の該当行を照合し、両方でnormal CASEとnegative rangeを区別。 | docs/helix-labo/L10-verification/nfr-verification.md:127 `CASE-NFR-LABO-063-01`<br>docs/helix-labo/L3-requirements/nfr-grade.md:169 `NFR-LABO-063-01` | なし |
| m12 | Minor | 063 CASE-05正常baselineからbacklog欠落時の戻し文を除去し、CASE-06単独変異と重複させない。 | docs/helix-labo/L10-verification/functional-verification.md:3153 `L10-LABO-063-CASE-05`<br>docs/helix-labo/L10-verification/functional-verification.md:3154 `L10-LABO-063-CASE-06` | なし |
| m13 | Minor | 065 AC03を「対象外根拠を示さずmetricを0として扱う」へ揃える。 | docs/helix-labo/L3-requirements/functional-requirements.md:1650 `LABO-065-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1653 `L10-LABO-065-CASE-05` | なし |
| m14 | Minor | 063-53はrecipeとevidenceを別fieldとして示し、065/066欠落は既存HARNESS/要求owner等へ戻し、識別不能のみunknown。 | docs/helix-labo/L10-verification/functional-verification.md:3353 `L10-LABO-063-CASE-53`<br>docs/helix-labo/L10-verification/functional-verification.md:2839 `L10-LABO-065-CASE-36`<br>docs/helix-labo/L10-verification/functional-verification.md:3357 `L10-LABO-066-CASE-34`<br>docs/helix-labo/L10-verification/functional-verification.md:3359 `L10-LABO-066-CASE-35`<br>docs/helix-labo/L10-verification/functional-verification.md:3365 `L10-LABO-066-CASE-41` | なし |
| m15 | Minor | 064 CASE-24/33の準備条件を明記し、runtime/output baselineとexposure mutationを分離。 | docs/helix-labo/L10-verification/functional-verification.md:2794 `L10-LABO-064-CASE-24`<br>docs/helix-labo/L10-verification/functional-verification.md:3329 `L10-LABO-064-CASE-33` | なし |
| m16 | Minor | 指定063-03a/33/36/39と064-03dのみ、互換別名/主索引を「索引（独立fixtureではない）」へ統一し、参照fixtureを直接指す。060-29は正式m16対象外のため変更しない。 | docs/helix-labo/L10-verification/functional-verification.md:2726 `L10-LABO-063-CASE-03a`<br>docs/helix-labo/L10-verification/functional-verification.md:2753 `L10-LABO-063-CASE-33`<br>docs/helix-labo/L10-verification/functional-verification.md:2756 `L10-LABO-063-CASE-36`<br>docs/helix-labo/L10-verification/functional-verification.md:2759 `L10-LABO-063-CASE-39`<br>docs/helix-labo/L10-verification/functional-verification.md:2782 `L10-LABO-064-CASE-03d` | なし |
| m17 | Minor | 070の単位差は別fieldのまま、換算せず比較不能にする。CASE-03b/c/dとCASE-63に原因別戻し先/unknownを同期。 | docs/helix-labo/L10-verification/functional-verification.md:2978 `L10-LABO-070-CASE-03b`<br>docs/helix-labo/L10-verification/functional-verification.md:2979 `L10-LABO-070-CASE-03c`<br>docs/helix-labo/L10-verification/functional-verification.md:2980 `L10-LABO-070-CASE-03d`<br>docs/helix-labo/L10-verification/functional-verification.md:3002 `L10-LABO-070-CASE-63` | なし |
| m18 | Minor | 071 CASE-18をCASE-16の索引として修正し、CASE-03cのrevision失効と混同しない。 | docs/helix-labo/L10-verification/functional-verification.md:3306 `L10-LABO-071-CASE-18`<br>docs/helix-labo/L10-verification/functional-verification.md:3304 `L10-LABO-071-CASE-16`<br>docs/helix-labo/L10-verification/functional-verification.md:3014 `L10-LABO-071-CASE-03c` | なし |
| m19 | Minor | 069 CASE-17の戻し先をOSまたは識別可能source owner、特定不能時unknownとし、無関係な後半routeを除く。 | docs/helix-labo/L10-verification/functional-verification.md:3236 `L10-LABO-069-CASE-17` | なし |
| m20 | Minor | 068 AC03へ完全identity集合と欠落result stateを分ける条件を追加し、CASE-18に対応。 | docs/helix-labo/L3-requirements/functional-requirements.md:1683 `LABO-068-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1686 `L10-LABO-068-CASE-04b`<br>docs/helix-labo/L10-verification/functional-verification.md:3335 `L10-LABO-068-CASE-18` | なし |
| m21 | Minor | 069 CASE-29/30の既存OS/source returnを復元し、reason missingとunclassified reasonを分離。 | docs/helix-labo/L10-verification/functional-verification.md:3337 `L10-LABO-069-CASE-29`<br>docs/helix-labo/L10-verification/functional-verification.md:3358 `L10-LABO-069-CASE-30` | なし |
| m22 | Minor | CASE-19を04aの直接索引、CASE-15を04a直接参照へ変更し、索引連鎖を除去。 | docs/helix-labo/L10-verification/functional-verification.md:3287 `L10-LABO-069-CASE-19`<br>docs/helix-labo/L10-verification/functional-verification.md:3234 `L10-LABO-069-CASE-15`<br>docs/helix-labo/L10-verification/functional-verification.md:2954 `L10-LABO-069-CASE-04a` | なし |
| m23 | Minor | NG-067 CASE範囲を23まで同期。 | docs/helix-labo/L10-verification/nfr-verification.md:131 `CASE-NFR-LABO-067-01`<br>docs/helix-labo/L3-requirements/nfr-grade.md:173 `NFR-LABO-067-01` | なし |
| m24 | Minor | FR-069 trace文から余分な空白を除去。 | docs/helix-labo/L3-requirements/functional-requirements.md:1694 `LABO-069-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1697 `L10-LABO-069-CASE-05` | なし |
| m25 | Minor | 過去review02処置と実本文の相違は新時点記録へ追記。固定履歴は変更しない。 | docs/helix-labo/L3-requirements/functional-requirements.md:1705 `LABO-070-AC-03`<br>docs/helix-labo/L3-requirements/functional-requirements.md:1708 `L10-LABO-070-CASE-04a/04b`<br>docs/helix-labo/L10-verification/functional-verification.md:3344 `L10-LABO-070-CASE-66`<br>docs/helix-labo/L10-verification/functional-verification.md:3345 `L10-LABO-070-CASE-67` | なし |
| m26 | Minor | 公開dispositionからローカル絶対worktree pathを除き、対象/branch識別は相対repository pathとrevisionで行う。 | docs/helix-labo/L10-verification/functional-verification.md:2665 `L10-LABO-061-CASE-01` | なし |

## 固定source・旧記録

旧review02 Root監査はrevision `829478c8da32d00056b0ee09008be3dea5c4f441`、SHA-256 `af0c291947a309ae64a559423c523a0eb5b0649736ee7beacbfb4e3a0d4f674e`。この記録では変更しない。
固定親source pin数: 4。旧source再計算: `PASS`、固定source pin 9、旧監査pointer pin 17。
正式findingは41件。raw literal/hashは各行へ固定し、現行証拠は本文revisionのGit blobから行番号・末尾LF込みliteral・SHA-256を再計算した。

## 六文書

| 文書 | 全文SHA-256 | bytes | main prefix一致 |
|---|---|---:|---|
| `docs/helix-labo/L3-requirements/business-requirements.md` | `09de8649434c822478a431a00c94c279246f08dad9712fc262040437bd17c14b` | 11431 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |
| `docs/helix-labo/L3-requirements/functional-requirements.md` | `5670cf39d7db8fca73e1207761a4967d1b0e1fa4ca45eb5c3a23792bcdfcd801` | 290167 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |
| `docs/helix-labo/L3-requirements/nfr-grade.md` | `b1d3a8a4742a5a9cd717fbd50387a7803a016530deada3d6248624f30dcc3753` | 62220 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |
| `docs/helix-labo/L10-verification/business-verification.md` | `0afa055498d81461162ab85e9048f00a7e684b31df8205683aca5f823240e142` | 9770 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |
| `docs/helix-labo/L10-verification/functional-verification.md` | `499ccca675b861e7e0627651f7f2b6923f68d8b3537e670d8ecb06b9585b943f` | 437179 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |
| `docs/helix-labo/L10-verification/nfr-verification.md` | `52c4692e0b0662ca952b6837cab99da62a79baf3399848d9d7b56298e1660c8f` | 50603 | `55760269a69e6e740e47bb99d550b618af3361ce` exact bytes |

## CASE-01・旧review02参照訂正

CASE-01の正常baselineは固定source `74ed996830eed20459edabd84cd4df0df07581ad` のline 2665。末尾LF込みliteral SHA-256 `7978b276207987f6aae5817b0c3e91595e1b743782466c0c972bb3646242c315` は期待値 `7978b276207987f6aae5817b0c3e91595e1b743782466c0c972bb3646242c315` と一致した。取消/失敗run追加はCASE-01から除き、CASE-107/111/112の各準備条件に限る。
旧review02 M11の対象はCASE-34 eligible-set差分。CASE-40はrevision stale。M15はCASE-28 source identity missing、CASE-30 reason missing。CASE-29は既存reasonを持つunclassified正常例として保持する。

## 検証状態・限界

Rootからcurrent-helper/static結果が引数で渡された場合のみ、ここにその原JSONを取り込む。未指定なら監査draftのままで、最終検証済みとは記さない。
旧runtime/test/CIやBunは実行しない。repo編集・commit・pushはこの組み立て処理の範囲外。

## main統合・CASE-01再照合

統合照合: body `41413bb51a9ea2af05a4338b7f09453d6f084300`、main `55760269a69e6e740e47bb99d550b618af3361ce`。6文書は統合前後で不変と記録されている。CASE-01 raw-LF pin一致: `True`。

## 表定義・AC参照の静的照合

Stage5表行 628、全表行 738、列不一致 0、未解決AC参照 0。旧ID削除 0。
表定義ID・AC参照実在・列数・旧ID保持を静的確認。正常箇条書きfixtureや独立被覆件数の全量検証を意味しない。

## 現行証拠pinの再照合

正式所見 41、現行LF pin 135、失敗 0。

## Rootの追加差分読取記録

- ROOT-R03-01（作成側Root検収済・独立再レビュー待ち）: a23eの061CASE10がSEC常時返却の補正から漏れ。6315で常時SEC/sourceownerのみunknownへ修正。
- ROOT-R03-02（作成側Root検収済・独立再レビュー待ち）: a23eの063CASE40にsource識別不能unknownが欠落。6315で保持を明記。
- ROOT-R03-03（作成側Root検収済・独立再レビュー待ち）: 06333/36/39が規定indexlabelに一致せず主索引表現も残存。6315で直接実fixture参照と規定labelへ修正。06029は正式対象外で維持。
- ROOT-R03-04（作成側Root検収済・独立再レビュー待ち）: 061CASE102 normalbaseline名称がFR/NGと不統一。25933で通常履歴の非適用対照と明記。誤分類変異は維持。
- ROOT-R03-05（作成側Root検収済・独立再レビュー待ち）: Worker evidenceのCASE10部分一致が102等を混入。exacttoken化、定義行と索引参照行を区別。
- ROOT-R03-06（作成側Root検収済・独立再レビュー待ち）: Workercanonical_pathsがNGを重複しBR欠落。6正本BR/FR/NFR/BV/FV/NVへmetadata訂正。
- ROOT-R03-07（作成側Root検収済・独立再レビュー待ち）: WorkerM6/M11/M14 narrativeが索引化/非合算等禁止句/捕捉完全性sourceの処置と不一致。正式所見に戻して記録訂正、本文変更不要。

Rootは旧監査bytes/hashを対象git revisionから再計算して一致を確認した。静的検証はgovcheck ok（atoms7622 requirements57 files58）、validate147/0・stale0・residuals0・git diff --check成功。
