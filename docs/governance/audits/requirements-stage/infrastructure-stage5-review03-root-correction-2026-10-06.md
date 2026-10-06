# INFRA Stage 5 review03 Root補正追補

作成側Rootが本文差分・固定親・旧sourceを読解した時点記録。正式review03とreview02持越しを別IDで記録する。独立review・承認・全所見解消は未成立。旧監査は変更していない。

## 対象と固定pin

- 本文commit: `c23358a0144de9f430defdf2168b42cb8f349151`。作業branchは `codex/infrastructure-stage5-main-publication`。最新main `6008fb947c73466c11084474b0e938d76e912fb7` はmerge commit `441b83148997a1f307ac1aee812a5e40d7e5d8ec`で統合済み。
- 正式review 6007473054: raw UTF-8 8614 bytes、SHA-256 `3fbc7208b7bc6f6432611f42d766f6310dee2cdc65e44abec695be4d061691a3`。
- Fable追記 6007498600: raw UTF-8 2740 bytes、SHA-256 `de4dc2e7b5015ad85059ab0e0a10b0371f101a4b8ec21dddec0c7925f02630a0`。
- 6本文のfull SHA、byte数、固定main prefix一致状況はJSONに記録した。固定source revisionは `f6dad2a33e24f000b87d7f09b8d40288257e74cc`。
- 固定参照: L2-001:37、L2-003:55–59、L2-025:294、L2-011:138–147、L11-011:140–150（148独立復旧、149失敗戻し先）。旧source pinは既存review02監査から引き継ぎ、旧監査自体は不変。

## 正式review03の所見

- **M1 — applied_body**: S5-075はS5-022のcapacity観測値一式とdecision_ref=noneを使う。S5-074はS5-072のunit集合からS5-031を除外し、S5-031の正常復旧fixtureを参照してrestore.verificationだけを変異させる。 対象: CASE-INFRA-011-S5-022, CASE-INFRA-011-S5-031, CASE-INFRA-011-S5-072, CASE-INFRA-011-S5-074, CASE-INFRA-011-S5-075。固定参照: L2-003:55, L2-003:59, L2-011:144-147, L11-011:144-150。
- **M2 — applied_body**: 通常topology fixtureにapi-sim/db-simの識別子を使う。S5-005はpurposeだけを空にし、S5-006はdestinationだけをcache-simへ変える。 対象: CASE-INFRA-011-S5-004, CASE-INFRA-011-S5-005, CASE-INFRA-011-S5-006。固定参照: L2-001:37, L2-003:57。
- **m1 — applied_body**: CASE 068–076の前にStage 5の接続/composite見出しと5列headerを復元した。 対象: CASE-INFRA-011-S5-068, CASE-INFRA-011-S5-076。固定参照: なし。
- **m2 — applied_body**: FR 068–071/073の入力を変異前baselineにし、各変異は別に記録した。 対象: CASE-INFRA-011-S5-068, CASE-INFRA-011-S5-069, CASE-INFRA-011-S5-070, CASE-INFRA-011-S5-071, CASE-INFRA-011-S5-073。固定参照: なし。
- **m3 — applied_body**: S5-077はnot_requestedからの変更、S5-086はbaselineに存在しないwrite_attemptの追加として区別した。 対象: CASE-INFRA-011-S5-077, CASE-INFRA-011-S5-086。固定参照: なし。
- **m4 — applied_body**: 資源不足は固定L2-025:294のresource ownerへ戻す。固定親が名指ししないWorker contract ownerはunknownのままとし、S5-047/048の正常資源を資源ownerへ送らない。 対象: INFRA-011-S5-020, INFRA-011-S5-021, INFRA-011-S5-046, INFRA-011-S5-047, INFRA-011-S5-048, CASE-INFRA-011-S5-046, CASE-INFRA-011-S5-047, CASE-INFRA-011-S5-048。固定参照: L2-025:294。
- **m5 — applied_body**: runtime revisionの正常baselineはS5-043/044/045でinfra-runtime-sim@sim-r17を参照し、S5-045はlink.runtime_revisionだけを旧値へ変える。S5-055/072も同じ正常revisionを使う。 対象: CASE-INFRA-011-S5-043, CASE-INFRA-011-S5-044, CASE-INFRA-011-S5-045, CASE-INFRA-011-S5-055, CASE-INFRA-011-S5-072。固定参照: なし。
- **m6 — applied_body**: item 18 rebuild objectの区切りをそろえ、negativeはrebuild.dependency_reconnectだけを変える。 対象: INFRA-011-S5-052, INFRA-011-S5-053, INFRA-011-S5-054, CASE-INFRA-011-S5-052, CASE-INFRA-011-S5-053, CASE-INFRA-011-S5-054。固定参照: なし。
- **m7 — applied_body**: S5-059–061はS5-031、S5-062/065はS5-064、S5-063はS5-052、S5-066はS5-058を正常baselineとして参照する。S5-070はS5-040のsecurity条件を使う。 対象: CASE-INFRA-011-S5-031, CASE-INFRA-011-S5-040, CASE-INFRA-011-S5-052, CASE-INFRA-011-S5-058, CASE-INFRA-011-S5-059, CASE-INFRA-011-S5-060, CASE-INFRA-011-S5-061, CASE-INFRA-011-S5-062, CASE-INFRA-011-S5-063, CASE-INFRA-011-S5-064, CASE-INFRA-011-S5-065, CASE-INFRA-011-S5-066, CASE-INFRA-011-S5-070。固定参照: なし。
- **m8 — applied_body**: composite正常責務をcomposite_resultに一度だけ記載し、S5-085はそのstateだけをpartialへ変える。 対象: CASE-INFRA-011-S5-072, CASE-INFRA-011-S5-085。固定参照: なし。
- **m9 — applied_body**: S5-030ではsource identityのみを変え、revision sim-r2を保持する。 対象: CASE-INFRA-011-S5-030。固定参照: なし。
- **m10 — applied_body**: 正式review03 m10の対象8行（S5-016/017/018/020/021/029/047/048）で、FRの期待oracleとowner戻し先の間に区切り「 / 」を追加した。review02 m10（起動要求条件）とは別所見。 対象: INFRA-011-S5-016, INFRA-011-S5-017, INFRA-011-S5-018, INFRA-011-S5-020, INFRA-011-S5-021, INFRA-011-S5-029, INFRA-011-S5-047, INFRA-011-S5-048。固定参照: formal review03 6007473054 m10。
- **m11 — applied_body**: 正式review03 m11の対象S5-059–066をFR/FVで照合し、baseline literalを同じ値にした。S5-063は稼働revisionとrollback target、S5-064は全正常fieldを含む。S5-065/066のFV入力欄にはbaselineだけを置き、missing変異は別の変異欄に保持した。 対象: CASE-INFRA-011-S5-059, CASE-INFRA-011-S5-060, CASE-INFRA-011-S5-061, CASE-INFRA-011-S5-062, CASE-INFRA-011-S5-063, CASE-INFRA-011-S5-064, CASE-INFRA-011-S5-065, CASE-INFRA-011-S5-066。固定参照: formal review03 6007473054 m11。
- **m12 — applied_body**: 正式review03 m12はreview02残留m5/m10/m11を再掲する。IDを混同しないようreview02残留所見を別一覧にした。 対象: review02-m5, review02-m10, review02-m11。固定参照: formal review03 6007473054 m12。
- **m13 — creator_root_audit_correction**: 上記の過去claim訂正を本記録末尾で追補。旧監査不変、独立解消判定は次reviewへ。 対象: CASE-INFRA-011-S5-058, CASE-INFRA-011-S5-059, CASE-INFRA-011-S5-074, CASE-INFRA-011-S5-085。固定参照: L11-011:140-150, L11-011:148, L11-011:149。
- **m14 — applied_body**: FR item 02はtopologyにL2-001:37、path属性にL2-003:57を対応づけ、その理由を記した。 対象: INFRA-011-S5-004。固定参照: L2-001:37, L2-003:57。

## review02持越し所見（IDはreview03と別）

- **review02-m5 — applied_body**: path/resource ownerを固定親が特定しない箇所にownerを創作せず、source owner=unknownを維持した。資源不足だけは固定L2-025:294のresource ownerへ返す。 対象: CASE-INFRA-011-S5-004, CASE-INFRA-011-S5-005, CASE-INFRA-011-S5-020, CASE-INFRA-011-S5-021, CASE-INFRA-011-S5-047, CASE-INFRA-011-S5-048。根拠: formal review02 residual m5。
- **review02-m10 — applied_body**: FR CASE023/024はfixture自体に起動要求がないことを明示。起動要求を含む場合だけ、L2-003:59に従い未完状態とresource snapshotをOS/INTELLIGENCEへ返す条件を記した。 対象: INFRA-011-S5-023, INFRA-011-S5-024, CASE-INFRA-011-S5-023, CASE-INFRA-011-S5-024, CASE-INFRA-011-S5-075。根拠: L2-003:59, formal review02 residual m10。
- **review02-m11 — applied_body**: FV CASE031–033のOS非適用は、OS操作要求を含まないunit fixtureに限定する導出注記を維持した。 対象: CASE-INFRA-011-S5-031, CASE-INFRA-011-S5-032, CASE-INFRA-011-S5-033。根拠: formal review02 residual m11。

## 旧時点記録の保全

既存 `infrastructure-stage5-review02-root-acceptance-2026-10-06` のMD SHA-256は `bcc98c8436bac1102989b57cbf9e3fb5a36138f7e8d674e53da457e8395f8eec`、JSON SHA-256は `f2d34dbe700eb16f3ebbcfa14a922eb625144b6ed96f6cadb23f1cf6ec0aac9b`。どちらも編集していない。正式review03 m13の過去解消記録とmappingの齟齬は、Rootが当時の本文・固定source・所見状態を照合し、本記録末尾で追補した。L11-011の節範囲は140–150行で、148行が独立復旧、149行が失敗戻し先、152行は次節見出し。

## 静的確認と限界

FV Stage 5 CASE見出しは 86件で、重複なし。FRのm10対象8行に区切りがある。m11のFR/FV baseline literalは8/8件一致。FRは表の入力列内のbacktick literal、FVは入力行の外側backtickを除いたliteralを比較した。内容byte列を比較し、markdownの区切り記号だけを正規化した。FV S5-065/066はbaselineのみを入力欄に置き、missing変異は変異欄に分離した。`git diff --check`は各本文commit前に成功。runtime、test、CIは実行していない。Rootの作成側検収を本記録へ追補した。独立review・承認は次reviewで確認する。

## Rootの過去監査訂正と再照合

旧review02の28件addressedは処置記録であり、意味上の全解消を示さない。review03でm5/m10/m11/m14/m24の残差が確認されたため全解消の前提を撤回する。旧Root m24のheader整理は部分範囲で、068–076のheader欠落を見落とした。現本文で9行のheaderを復元した。旧54 unitの入力一致はその54入力の静的証拠に限り、075/074の合成正常や他範囲の意味整合を証明しない。

058は固定L11:148の独立復旧・OS復帰後operation/result同期、085はL11:149の失敗unit/connectionへの返却・未成立/部分成功/未完義務に対応する。L11-011の節は140–150、L2-011は138–147。旧144–152のhashは当時の範囲のbytesとして保持し、節範囲とは扱わない。正式review03 m13の「L2-011節は140–150」はこのL11を指すラベル誤記として区別する。

Rootが86 CASE block・86 FR行のraw-LF literalとSHA、6本文のfull/main prefix/suffix SHA、旧監査不変を再計算。059–066は外側backtickだけを除く入力literal比較で8/8一致。固定7spanと旧OPS2 full/spanをGit rawで再照合。これらは被覆・承認・実行結果ではない。

詳細pinと正式所見原文は隣接JSON（SHA-256 `60da56b8cfe83a882fb870439c7c7646e3ba6b5042b4fd069c3b49c2092a717c`）に固定する。
