---
title: "Gate証跡の実体照合 機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-09-06
updated: 2026-09-06
owner: Codex / TL
plan: docs/plans/PLAN-RECOVERY-1430-evidence-substance.md
pair_artifact: docs/test-design/helix/L8-gate-evidence-substance.md
---

# Gate証跡の実体照合

Issue #1430の既存証跡契約を修復する。manifestの自己申告digestを実測扱いせず、repo内部の
通常ファイルから取得したbytesのSHA-256へ照合する。G8/G9/G10は同じreaderを利用する。

readerは相対pathだけを受け入れ、物理pathがrepo外、directory、不在、読取り不能ならtyped failureを返す。
Linuxではopened descriptorの`/proc/self/fd`実体をrepo境界へ再照合し、複数hardlinkも拒否する。
読取り前後のファイルidentity・size・変更時刻が変わった場合も拒否する。digest一致はbytes一致の証拠に限定し、
コマンドを実行した証拠や必須項目の充足とは区別する。空出力自体は偽装と断定しない。

共通manifestのcommand IDとcoverage item IDはそれぞれ一意とする。coverageの失敗行を
同じIDの成功行で後勝ち上書きしてはならない。coverageが参照するcommandは当該項目を対象に含む。

終了要約の全成功フラグは、空でない必須集合の全coverageがpassedの場合だけ成立する。
失敗数は必須IDを重複排除し、statusがfailedの件数から再計算する。欠落・未知statusは全成功にならず、
既存の必須coverage検査でも拒否する。自己申告の値と計算結果が異なる場合は矛盾として拒否する。
command証跡は各gate専用`.helix/evidence/`配下の`.vitest.log`に限定し、commandの`--outputFile`、
成功したVitest JSON report、実行対象test path、実bytes digestを同時に照合する。任意の`src/`や`tests/`
ファイルhashをcommand出力として代用しない。ただしprovider実行主体の署名やcandidate HEADまでを
このreport単体が証明するとは扱わない。
成功したVitest JSON report内のtest名は検証対象の識別子を引用するため、旧制御surfaceの文字列を含み得る。
これは新しい実行authorityではない。legacy orchestration ratchetは`.helix/evidence/**/*.vitest.log`のうち、
JSONをparseでき、`success=true`、失敗suite/testが0、全test resultがpassedの記録だけを非実行証跡として
走査対象から除外する。拡張子違い、壊れたJSON、失敗report、空reportは除外せず、path名だけで免除しない。
stale defer数の実測導出とmandatory集合のtest-design正本からの取得は後続接合に残る。
過去証跡のhash付替えで修復済みにしない。

## 既存証跡の移行条件

2026-09-06、基準HEAD `548440db8b11287ff344b154b16c76a8878e6bcb` と本修復の未コミット差分で、
G8/G9/G10の保存済み4manifest・5commandを照合した。4commandはdigest不一致、全5commandが実行出力ではなく
テストソースを参照していた。残る1件のhash一致も実行証明ではない。過去記録のcommand・時刻・digestは改作しない。

G9境界文書の選定表とG10選定表を基に、次の13テストをvitestで実行し195件成功、exit 0を確認した。
これは接合調査の実測であり、exact-HEADの保存済み実行receiptや独立レビュー、各ST/UXVの充足認定ではない。

| 対応確認先 | 実行したテスト（`tests/`配下、拡張子`.test.ts`） | 残る確認 |
|---|---|---|
| ST-DATA | impl-plan-trace、oracle-test-trace | 対応oracleと現行要求の同一性 |
| ST-ARCH | dependency-drift、module-drift | 循環import等の正本ACとの対応 |
| ST-FUNC | workflow-contracts、semantic-frontier-consistency | 旧9-mode記述と現行typed identityの置換関係 |
| ST-EXT | runtime-adapter | codex-wrapper-parityの現行検証先。指定名のtestファイルは未発見 |
| ST-UI / UXV-RENDER | frontend-design-coverage、screen-impl-pair-freeze | 実renderを証明する範囲と未実装拒否の範囲を分離 |
| ST-ASSET | asset-drift、skill-assignment | roster等の元ACとの対応 |
| UXV-A11Y | verification-profile | profile保持と実ブラウザa11y検証を区別 |
| UXV-BLOCKER | completion-decision-packet | blocker可視化の具体的oracle |

移行時は上記対応を確認した実行結果を保存し、source HEAD・実行対象・exit code・出力bytesへ束縛する。
その後にcurrent manifestを更新する。過去manifestの隔離だけでgateをgreen化せず、必須coverageの後継証明を先に成立させる。

本RecoveryではNode 24でG8三系統、G9、G10の対象testを実行し、vitest JSON出力を`.vitest.log`として保存した。
個人absolute pathは`repo://`へ正規化し、正規化後bytesのdigestをcurrent manifestへ束縛した。
旧4manifestは内容を変更せず`docs/archive/gate-evidence-manifests/`へ移した。current loaderは新manifestだけを読み、
G8/G9の違反0を確認する。G10はPlaywright Chromiumで実HTMLをrenderし、keyboard focus、target size、
ARIA marker、未完了状態表示を検査してscreenshotとJSON reportを採取する。receipt digestはcoverageが
参照する当該bytesへ束縛する。ただし下記ID authority差は未解消であり、この移行だけを右腕全体の
完了証拠にはしない。

## G8移行前の受入差分

`docs/test-design/harness/L8-integration-test-design.md` のIT-MODULE-02は、loaderにI/Oを限定し、
analyzerの同一入力・同一結果と副作用不在を求めている。一方、旧manifestが参照する
`tests/lint-wiring.test.ts`は主にimportとcallの到達可能性を検査し、analyzer全体のI/O不在を証明しない。
現行G8 validatorには従来の存在確認に加え、本修復でも実bytesの読取りがあるため、
このテスト群の成功をそのままIT-MODULE-02の充足証跡へ昇格しない。

後継証跡の成立前に、ファイル観測をloader境界へ寄せた入力契約と、読取り後にファイルを変えても
固定入力に対するanalyzer結果が変わらない反例を設計・検証する。観測のfreshnessは別途実行時の
HEAD・出力digestへ束縛し、純粋性のために実体照合を省略しない。

現修復ではG8 loaderがcommandとcoverageの全参照pathを一度採取し、固定した
`evidenceObservations`をanalyzerへ渡す。analyzerはファイルを再読取りせず、未観測pathを拒否する。
U-GES-008で固定入力の不変性・再観測による改変検出・観測欠落の拒否を確認する。
doctorの呼出しは既存のloader経由であり、この入力を受け取る。G9/G10も各loaderから同じ観測値を
共通validatorへ渡す。U-GES-009/010で各経路の固定入力・再採取・観測欠落を直接検証する。
この観測値は内部入力であり、外部からの自己申告を実測として受け入れる公開APIではない。
コマンドの実行真正性・正本からの必須集合導出・保存済み証跡の移行は別の未完了義務である。

## S4 locatorの実体境界

S4の`verified_evidence`と`external_source_basis`にあるlocal pathは、loaderが同じ物理境界readerで
採取した通常ファイルに限る。URLとPLAN IDはlocal pathとして扱わない。sha256を記載する場合は、
直前に構造化されたpathと一対一で引用したlocal fileの実bytesと一致しなければならない。root-level pathや
`key=path`も検査対象とする。存在しないpath、directory、
repo外参照、裸のdigestはS4をreadyにしない。これはlocatorの実在・bytes一致だけを証明し、
テスト実行、レビュー、外部URL内容の真正性を代替しない。

## ID照合の前提となるauthority移行

現在G9 loaderが読む`docs/test-design/harness/L9-system-test-design.md`は本文でmigration sourceと
宣言している。後継として挙げる`L9-integration-test-design.md`もlayer migration stagedであり、
STからITへの意味の置換を単純なpath変更として扱えない。例えば旧IT-MODULE-01は依存方向と循環禁止、
後継表の同IDはmoduleの公開挙動と設計契約の一致を記述する。同じIDだけでは意味同一性を証明しない。

従って新しいID照合の意味正本として旧shim全体を昇格させない。現行L1–L12の適用範囲、
旧gate名と現在の検証責務、選定行のrevisionおよび置換関係を確認してからmandatory集合を束縛する。
現修復のbytes照合・重複拒否・空集合拒否はこの移行完了を主張しない。

## Objective evidenceの代表artifact接合

G1〜G9はversioned binding manifestからexact requirement ID、代表artifact path、digest、最低size、
行内observation markerを取得する。loaderが代表artifactを一度観測し、analyzerは固定観測だけを使う。
statusだけの空行、markerを別行へ移した文書、別artifact digest、観測欠落は進捗証拠をuntrustedにする。
これは各objectiveの代表artifact実体と監査行の結合であり、各objective配下の全成果物や実行receiptを
一つのhashだけで代替するものではない。
