# HARNESS-044 review01 M1処置・物理統合監査

- PR #2641。reviewed HEAD `ba96c226ed504907b0b0fd921a5b477acd22fd2d`、M1訂正commit `d6877a9033a7c500bdc244b5372f514cb7c91383`、現worktree HEAD `3eed3f00022790ce3fe458560f2fea6ac6cb195c`。現main parent `3c3c512c09320c0494904602b23e544a81206eed`。branch `l3-harness-stage3-parent044`。
- `/tmp`のみの読取監査。canonical変更なし。M1修正後HEADの独立review、Fable再判断、fixture/test/CI、L3承認は未実施。

## 確認結果

- M1の既知誤り4例（CASE-05、CASE-08、r09-001、N/A根拠欠落）は、訂正本文で明示的に「不合格」となった。AC-03も境界・理由欠落、無説明重複、根拠なしN/A、孤立normative contractを不合格とし、初見のsource/applicability/oracle unknownと区別する。各変更の旧行・新行はJSONへraw保存。
- unknownを不合格に一括変換していないことを、source atom missingとoracle missingの既存CASEで照合した。
- current CASEは51 unique。old checkpointの39 IDは全件維持、新規12件。
- 修正bodyをmain042統合後の現HEADで照合。6文書はすべて`3c3c512c` main042版の物理byte prefixに、checkpointのexact suffix bytesを連結した実体。各prefix/full/suffixのbyte数とSHAはJSONに記録。

## M1修正差分

```diff
diff --git a/docs/helix-harness/L10-verification/functional-verification.md b/docs/helix-harness/L10-verification/functional-verification.md
index a0d5f67037a036a282a1daa3bbccaa29f5ddf070..c8ba904fba05967460ee25ae42cf6596da55a54b 100644
--- a/docs/helix-harness/L10-verification/functional-verification.md
+++ b/docs/helix-harness/L10-verification/functional-verification.md
@@ -1602,11 +1602,11 @@ AC-018-01の入力条件はR001〜R034に加えR056/R057で個別欠落、R058
 | `CASE-HARNESS-L10-044-02` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-02` | 意味重複、根拠なしN/A、隣接025/043出力だけでの代替を検査する索引。 | 索引のみ。`CASE-HARNESS-L10-044-r04-025-output-substitution`, `CASE-HARNESS-L10-044-r04-043-output-substitution`, `CASE-HARNESS-L10-044-r04-semantic-duplicate`はAC-02のfixtureとして個別参照する。`CASE-HARNESS-L10-044-r04-na-rationale-missing`はAC-01/02に定義された直接fixtureとして一度だけ参照する。既存の`unsupported-na`互換別名行は削除せず維持し、この索引からは経由しない。入力fieldの欠落/stale/conflictはAC-01の044-01索引に分ける。 | 各fixtureの定義ACに従って個別照合し、互換別名と索引を独立negative件数に数えない。 | 索引／互換IDとして保持し、参照先fixtureを個別評価する。本行をnegative件数へ重複計上しない。 |
 | `CASE-HARNESS-L10-044-03` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-03` | 意味上独立した契約と同義重複文書を比較するmatrix。 | 索引のみ。義務削減とcandidate承認昇格は`CASE-HARNESS-L10-044-r05-minimum-portfolio-drops-obligation`、`CASE-HARNESS-L10-044-r05-candidate-promoted-to-approval`で個別に検査する。 | 義務を維持しauthorityを作らない。indexを独立negativeに数えない。 | 索引／互換IDとして保持し、参照先fixtureを個別評価する。本行をnegative件数へ重複計上しない。 |
 | `CASE-HARNESS-L10-044-04` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | 選択classのcontract/oracle traceを閉じる別名索引。 | 索引のみ。直接fixture `CASE-HARNESS-L10-044-r04-class-oracle-absent`（oracle欠落）と`CASE-HARNESS-L10-044-r14-class-contract-relation-missing`（relation欠落）を別々に参照し、他の索引を経由しない。 | 独立変異として数えず、二つの直接fixtureを別々に評価する。`CASE-HARNESS-L10-044-r04-class-oracle-absent`はoracle欠落による不合格・未被覆oracleを、`CASE-HARNESS-L10-044-r14-class-contract-relation-missing`はclass identity・contract・oracleを保ったrelation欠落による未被覆classを照合する。 | 索引／互換IDとして保持し、参照先fixtureを個別評価する。本行をnegative件数へ重複計上しない。 |
-| `CASE-HARNESS-L10-044-05` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-02` | 適用classと各contractの境界・oracleを固定する。 | 必要な複数contract間の境界または理由だけを欠く。 | 判定をunknown/未完に保つ。設計要素不足はHARNESS-L2-026、対oracle不足はHARNESS-L2-022の既存ownerへ別々に戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
+| `CASE-HARNESS-L10-044-05` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-02` | 適用classと各contractの境界・oracleを固定する。 | 必要な複数contract間の境界または理由だけを欠く。 | 既知の境界・理由欠落を不合格とし、portfolioを未完に保つ。設計要素不足はHARNESS-L2-026、対oracle不足はHARNESS-L2-022の既存ownerへ別々に戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-06` | `FR-HARNESS-L3-044-03` / `AC-HARNESS-L3-044-03` | 採択済み025/026のscopeと他portfolio fieldはcurrent。 | 固定scopeへ新しい義務を承認・採択receiptなしに一件だけ追加する。 | 追加義務を受理せず未採択として保持する。意味判断の戻し先は固定sourceが示す既存要求ownerに限り、identityが示されなければunknownを維持する。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-07` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | 別名索引。hidden classの直接fixture=`CASE-HARNESS-L10-044-r09-004`、旧receipt流用の直接fixture=`CASE-HARNESS-L10-044-r10-old-denominator-receipt`を参照する。 | 索引のみ。 | 各参照先の単独oracleを評価し、本行を独立fixtureに数えない。 | 索引／互換IDとして保持し、参照先fixtureを個別評価する。本行をnegative件数へ重複計上しない。 |
-| `CASE-HARNESS-L10-044-08` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-02` | 適用義務class、normative contract、対oracleをportfolio内で対応づける。 | 適用contractを義務classとの関係からだけ孤立させる。 | 未完findingを返す。設計要素不足はHARNESS-L2-026、対oracle不足はHARNESS-L2-022、要求意味不足は固定sourceが特定する既存要求ownerへ原因別に戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
-| `CASE-HARNESS-L10-044-r04-na-rationale-missing` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` / `AC-HARNESS-L3-044-02` | 適用classとsource atom根拠を提示する。 | N/A根拠だけを除去。 | N/Aを拒否しclass未完、根拠なしN/Aの適用判断はHARNESS-L2-009/対象template ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
+| `CASE-HARNESS-L10-044-08` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-02` | 適用義務class、normative contract、対oracleをportfolio内で対応づける。 | 適用contractを義務classとの関係からだけ孤立させる。 | 既知の孤立contractを不合格とし、未完findingを返す。設計要素不足はHARNESS-L2-026、対oracle不足はHARNESS-L2-022、要求意味不足は固定sourceが特定する既存要求ownerへ原因別に戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
+| `CASE-HARNESS-L10-044-r04-na-rationale-missing` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` / `AC-HARNESS-L3-044-02` | 適用classとsource atom根拠を提示する。 | N/A根拠だけを除去。 | 根拠なしN/Aを不合格として拒否しclass未完、根拠なしN/Aの適用判断はHARNESS-L2-009/対象template ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r04-source-atom-missing` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | selected class/contract/scope/revisionと、source atomのsource type/identityを正常入力として固定する。他bindingはcurrent。 | source atomだけをmissingにする。 | unknown/未完を保持する。template applicability由来ならHARNESS-L2-009、atom抽出/対応由来ならHARNESS-L2-041、要求meaning由来なら既存要求ownerへ戻す。source type/identityが特定できなければunknownを維持し、template ownerを推定しない。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r04-active-template-missing` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | class/contract traceの他条件がcurrent。 | active-templateだけmissingにする。 | unknown/未完とし、HARNESS-L2-009の既存template ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r04-applicability-missing` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | class/contract traceの他条件がcurrent。 | applicabilityだけmissingにする。 | unknown/未完とし、HARNESS-L2-009の既存template ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
@@ -1632,7 +1632,7 @@ AC-018-01の入力条件はR001〜R034に加えR056/R057で個別欠落、R058
 | `CASE-HARNESS-L10-044-r05-oracle-conflict` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | class/contract traceの他条件がcurrent。 | oracleだけをconflictへ変異する。 | unknown/未完を保持し、HARNESS-L2-022の既存oracle ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r05-contract-version-stale` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | class/contract traceの他条件がcurrent。 | contract-versionだけをstaleへ変異する。 | unknown/未完を保持し、HARNESS-L2-026の既存contract design ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r06-semantic-map-unverifiable` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | fieldとmatrixが存在し、適用義務class・contract・oracleを同scope/revisionへ結ぶ。 | 義務内容と契約の意味対応だけoracleで照合不能にする。 | 受入を拒否し、classを未被覆/未評価で保持する。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
-| `CASE-HARNESS-L10-044-r09-001` | `FR-HARNESS-L3-044-01` / `AC-HARNESS-L3-044-01` | 同一portfolio/scopeでobligation class、contract revision、applicability branchを固定する。 | 同じ義務classを説明なしに複数contractへ重複割当する。 | 重複割当findingを返しportfolioを未完とする。境界設計はHARNESS-L2-026、対oracleはHARNESS-L2-022の各既存ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
+| `CASE-HARNESS-L10-044-r09-001` | `FR-HARNESS-L3-044-01` / `AC-HARNESS-L3-044-01` | 同一portfolio/scopeでobligation class、contract revision、applicability branchを固定する。 | 同じ義務classを説明なしに複数contractへ重複割当する。 | 無説明の重複割当を不合格とし、findingを返してportfolioを未完とする。境界設計はHARNESS-L2-026、対oracleはHARNESS-L2-022の各既存ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r09-002` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | 同一portfolio/scopeでobligation class、contract revision、applicability branchを固定する。 | contract revisionだけを隠す。 | unknown revisionとしてcoverageを未完にする。contract revision不足は固定L2:1010のHARNESS-L2-026既存設計契約ownerへ戻し、template適用性の欠落と混同しない。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r09-003` | `FR-HARNESS-L3-044-02` / `AC-HARNESS-L3-044-01` | 同一portfolio/scopeでobligation class、contract revision、applicability branchを固定する。 | applicability branchだけを隠す。 | 未観測branchを分母から除外しない。 applicability branchはHARNESS-L2-009の既存template ownerへ戻す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
 | `CASE-HARNESS-L10-044-r09-004` | `FR-HARNESS-L3-044-01` / `AC-HARNESS-L3-044-01` | 同一portfolio/scopeでobligation class、contract revision、applicability branchを固定する。 | applicable obligation class identityだけを一件隠す。 | 隠れたclassをuncovered findingとして列挙し、closureを未完にする。この行自身で個別oracleを判定し、044-07のindex連結だけにしない。戻し先: 固定L2:1010の既存要求ownerへ返す。 | 旧raw literalは監査JSONに完全保持。独立fixtureならこの単一mutationだけを実施。 |
diff --git a/docs/helix-harness/L3-requirements/functional-requirements.md b/docs/helix-harness/L3-requirements/functional-requirements.md
index bda5210a439e5e78f4338a9de4d17fc1151d4f5c..ae5f7ebd5bfa82d42a1dc89ad0fcb597b71a2a15 100644
--- a/docs/helix-harness/L3-requirements/functional-requirements.md
+++ b/docs/helix-harness/L3-requirements/functional-requirements.md
@@ -716,7 +716,7 @@ AC-035-05はS5-027/028/042および035〜038（旧revision計測、機能数だ
 
 **AC-HARNESS-L3-044-02 — 単一欠落・誤対応**：source atom、active template、applicability、oracle、contract version、class identityまたはrelationを一度に一つ欠落／矛盾／staleにしたとき、未完・未被覆・unknownを維持し、適用範囲からclassを落とさない。根拠のないN/A、意味重複、旧denominator receipt再利用、025/043による代替、意味対応oracleの欠落を拒否する。
 
-**AC-HARNESS-L3-044-03 — portfolio閉包と候補状態**：義務最小化を理由に独立classを落とさず、複数contractの必要な境界を示す。候補は候補のままとし、portfolio出力だけで承認・採択を生成しない。
+**AC-HARNESS-L3-044-03 — portfolio閉包と候補状態**：義務最小化を理由に独立classを落とさず、複数contractの必要な境界と理由を示す。既知の境界・理由欠落、無説明の重複割当、根拠なしN/A、規範contractの孤立は不合格とし、portfolioを未完に保つ。初見でsource・適用性・oracleが不明な場合のunknown/未評価とは区別する。候補は候補のままとし、portfolio出力だけで承認・採択を生成しない。
 
 **AC-HARNESS-L3-044-04 — authority出力を個別に拒否**：合成入力中の他fieldを固定し、要求合意、L3承認、設計承認、採択、実装成立、OS実行、利用者受入の各outputを一つずつ独立に生成させる変異を拒否する。各拒否fixtureは対象output field一つだけを変える。
```

## 固定親・PO pin

- L2 exact PO adopted span: `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L2-requirements/product-requirements.md:1002–1011` full `111cc0285e94bf0a1569627653ba1c578d5dcdf9dbedbbf168bb9acca3ae8d09`, span `690f2bfa866c778be47459baa99139905260d3ca569739a4d4707c61096212f2` (4307 bytes).
- L11 fixed parent span: `318ec4a04abb3c1cc17111b3d939f913facd5fd3` `docs/helix-harness/L11-acceptance/product-acceptance.md:735–745` full `3c8831fc3e843791d9fa1901cf0060b90d1e41ad6a3a5ff4c33022fe9a9958c5`, span `9c79b73100f4afa63abba7f79d47b8931a1c29983ac08a3e4ded95e56107bfc8` (3224 bytes).
- PO decision MPR-044-002: `17a2f310358ee7fe209b9d37cddf4a927c740248` `docs/governance/decisions/po-decision-2026-09-29-57candidates.md:49–49` full `c3904aafa75de85e986dd973daa288bd9bc070a53b10b4c2f7676fc1184552ad`, span `212948ea669ed647a3a3b188b0efb39a9e2d2fdf020e7be5cd8f088fac79807b` (730 bytes).

L2のPO対象spanは1002–1011（SHA `690f2bfa…`）。前回authoring auditの共有read span 1002–1014は隣接045の見出しまで含むため、この記録では採択対象と区別した。L11 spanは735–745（SHA `9c79b731…`）。PO MPR-044-002 line49を実bytesで再確認した。

## 6本文物理pin

- `docs/helix-harness/L10-verification/business-verification.md`: main042 prefix `2faacacf78b835b5127e990b805adb97b079439c887a1ef2bd6d69f2478d53c9` / 8819 B; full `a119ddbe629f03b4adbad00d2fff91ab8dcb77cbe0e3b554fbc7ce019585c543` / 12931 B; suffix `9e3eebf82c16e72d8fc71d2675e965ad808f146ed17f738a8536c8640e474410` / 4112 B.
- `docs/helix-harness/L10-verification/functional-verification.md`: main042 prefix `bc63c3abbabd727dbb2cfa37a5c3741985181308ad93378ebf2e5846907770f0` / 636566 B; full `adedbf5b0c3e9031fc115d7c9525dcd4c73a8c25059d0af881f864a670296edb` / 667900 B; suffix `ec6b031f0c5c995821c5e24e23eeecff8a0bc62ddf7026e9f3d1bc05f999caf1` / 31334 B.
- `docs/helix-harness/L10-verification/nfr-verification.md`: main042 prefix `bb319529b2c2e2af75067c36bf204d386816fb7e78d48f18043973be6290ccd1` / 36464 B; full `87846d426ae890be69944a49a03ea7b2a22bc1f690679320cafad1c009ad5fec` / 40607 B; suffix `55451863b2686da8555150ce3f791a6d02044407b0b2cd52f07697f8ca77aa05` / 4143 B.
- `docs/helix-harness/L3-requirements/business-requirements.md`: main042 prefix `c51f0bc2b98ae5c6a77bfa354050ec70ee87a70641b5f0161b14d5a3afd33e8f` / 13240 B; full `7c1d8c454867d5f87e356a5b1c3388a965d60678097a1aec5bea3bb9b07f3b6b` / 16811 B; suffix `73e6a1a20bd5cc91f4e09e0c425f25a99484016c2574efc9f39f4a39acdaab4f` / 3571 B.
- `docs/helix-harness/L3-requirements/functional-requirements.md`: main042 prefix `4fce6bb6cd3af5938a11719866050bd729234adbebf70c4210398aa90cad5dff` / 204919 B; full `0b8521a18172a49e87e8f3372ec6c207d25ccda292b0e9f155cd96e4bb82be66` / 211548 B; suffix `7e0ae71f26ccff0779eb28fe92733455139af1d9086568e020e7b535db859535` / 6629 B.
- `docs/helix-harness/L3-requirements/nfr-grade.md`: main042 prefix `b364e8c6dc92f4548df34638488fefec1533d13941a991de685a74bb64471fc9` / 42916 B; full `fb83e509953cd880780e2c7efc18ea863ab2264a778bea0e89c8ad3b4ff1ec0d` / 46424 B; suffix `6c53a95997343de698afd625a7ba82fa79d09cae5095762029d0c38361277908` / 3508 B.

旧HIL起点のsource/consumer pin 9件も、旧source revisionのactual bytesと既存audit hashを再照合した。全原文とfile/span SHAはJSONに保存。

## 形式review原文と残余

- formal review comment 6022860141 raw JSON SHA-256 `6f7d2ecd3c4ac4f74b4429c8843bdb34d783606a71bc7de152390054600ebc6a`、本文 UTF-8 SHA-256 `4a1714acce25b1ae74b00989881cd6cc6c286f2481d82d23ddaefe76e4ff3954`。JSONにcomment object全体、M1節、R1–R7節を原文保存。
- R1–R7は元reviewが「承認を止めない残余」とした原文のまま保存し、このM1訂正で解消したとは扱わない。
- 旧authoring audit JSON `09ecd9acd9f403c395f0663baa75478d215fd3e547b588a59b4286b66229a7fc`、MD `30f30b3d35cca99afb093728acbe6a2f0786e775ad641e20d3a24fe4ed4b4bdd`。reviewed HEAD、訂正body commit、現HEADの3点で各bytes一致を確認。新時点記録は別ファイル。

## 未実施

- 修正後HEADでの独立reviewとFable再判断。
- corrected/integrated HEADでのgovcheck、`git diff --check`、fixture/test/CI。formal旧commentに記録された静的検査結果は当時の旧review HEADに対するもので、現HEADへ流用しない。
- L3承認、readiness、merge admission。

詳細JSON: `/tmp/harness044-review01-disposition-audit-2026-10-07.json`
