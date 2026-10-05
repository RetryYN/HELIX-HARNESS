# HELIX-BRAIN L3 業務要件 — Stage 1（007/008/028）

**状態：部分草稿・未承認。** 固定された対象L2/L11から、BRAIN-007/008/028に独立配置できる機構業務成果は確認できなかった。固定親の意味とownerを変えず、動作条件は`functional-requirements.md`のFR/ACへ置く。別business AC、business owner、計測条件は追加しない。

旧HELIXの業務要件起点は `LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:1-21,27-64,108-123,147-177`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）。これはHARNESS固有のBR-21/HM-08と集計・計測条件で、BRAIN 007/008/028の独立business outcomeに直接一致しない。区分名だけからBRAIN業務要件やownerを作らず、当該旧業務条件・値を持ち込まない。

| 親L2 | 業務分類 | 機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-007` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-007-FR-01` / `BRAIN-007-AC-01,AC-02` |
| `HELIXBRAIN-L2-008` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-008-FR-01` / `BRAIN-008-AC-01,AC-02` |
| `HELIXBRAIN-L2-028` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-028-FR-01` / `BRAIN-028-AC-01,AC-02` |

後続の承認済みL2が独立business outcomeを与えた場合に限り、通常のL3起草内で本書へ配置する。旧HARNESS業務値をBRAINへ移さない。


## Stage 2b — 業務分類の確認（INFRA-001〜017）

固定L2/L11のINFRA-001〜017は設計知識、分類、relation、根拠、owner境界を要求し、functional/system conditionと独立したbusiness outcome・指標・ownerを定義していない。旧HELIXのHARNESS業務detailはこの機構の意味根拠ではない。旧区分の保持点は「business項目を独立に確認する」構造のみとし、BRAINのbusiness内容は固定親から再導出した結果なしに追加しない。

| 親L2 | 業務分類 | 機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-INFRA-001` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-001-FR-01` / `BRAIN-INFRA-001-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-002` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-002-FR-01` / `BRAIN-INFRA-002-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-003` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-003-FR-01` / `BRAIN-INFRA-003-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-004` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-004-FR-01` / `BRAIN-INFRA-004-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-005` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-005-FR-01` / `BRAIN-INFRA-005-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-006` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-006-FR-01` / `BRAIN-INFRA-006-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-007` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-007-FR-01` / `BRAIN-INFRA-007-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-008` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-008-FR-01` / `BRAIN-INFRA-008-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-009` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-009-FR-01` / `BRAIN-INFRA-009-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-010` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-010-FR-01` / `BRAIN-INFRA-010-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-011` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-011-FR-01` / `BRAIN-INFRA-011-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-012` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-012-FR-01` / `BRAIN-INFRA-012-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-013` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-013-FR-01` / `BRAIN-INFRA-013-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-014` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-014-FR-01` / `BRAIN-INFRA-014-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-015` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-015-FR-01` / `BRAIN-INFRA-015-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-016` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-016-FR-01` / `BRAIN-INFRA-016-AC-01, AC-02` |
| `HELIXBRAIN-L2-INFRA-017` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-INFRA-017-FR-01` / `BRAIN-INFRA-017-AC-01, AC-02` |

旧business起点は`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39,84–104`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`、該当span SHA-256 `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e` / `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f`）。これはHARNESS固有のBR-21/HM-08である。旧business分類の分離だけを比較し、旧HARNESS BR-21、HM-08、Learning Engine評価、screen/mode/drive条件は移植しない。businessの独立成果が現行固定親に現れないため、通常のL3承認対象はfunctional ACで示す親条件に限る。

## Stage 2b追補 — 採択済み001〜006の部分草稿

旧業務分類の形式比較元：`LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39,84–104`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`、span SHA-256 `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e` / `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f`）。分類の分離形式だけを再導出し、BR-21/HM-08/学習・計測条件をBRAINへ移さない。

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixはPO承認済みのbytesを保持し、既存INFRA Stage2b 17親suffixは最新main `4729c34ec29c2c72f345993958bbc94e1ed6f131`のbytesをそのまま保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

- `HELIXBRAIN-L2-001`：独立business成果は固定親にない。機能正本 `BRAIN-001-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-002`：独立business成果は固定親にない。機能正本 `BRAIN-002-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-003`：独立business成果は固定親にない。機能正本 `BRAIN-003-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-004`：独立business成果は固定親にない。機能正本 `BRAIN-004-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-005`：独立business成果は固定親にない。機能正本 `BRAIN-005-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-006`：独立business成果は固定親にない。機能正本 `BRAIN-006-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

## Stage 2b追補 — 採択済み009/010/011/012/029

固定L2/L11の各親にfunctional behaviorを越える独立business outcome、KPIまたはbusiness ownerはない。旧HARNESS business-detail `LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:21–39,84–104`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`、span SHA-256 `ade5075e3df236216603e1e0d3fb83c8cdae007f7f319e49bd4af1c5d4efca5e` / `f79e52ce0ac3797d30c46573a61f8115656ece2f8485461c728cdcf50fa4b38f`）のBR-21、HM-08、Learning Engine、計測条件をBRAINへ移さない。旧business分離の形式は再導出するが、分類名だけからBRAIN業務義務を作らない。

| 親L2 | business成果 | 正本参照 |
|---|---|---|
| `HELIXBRAIN-L2-009` | 固定親に独立成果なし。 | `BRAIN-009-FR-01`、AC-01〜04と機能L10 C01〜C13 |
| `HELIXBRAIN-L2-010` | 固定親に独立成果なし。 | `BRAIN-010-FR-01`、AC-01〜04と機能L10 C01〜C11 |
| `HELIXBRAIN-L2-011` | 固定親に独立成果なし。 | `BRAIN-011-FR-01`、AC-01〜04と機能L10 C01〜C12 |
| `HELIXBRAIN-L2-012` | 固定親に独立成果なし。 | `BRAIN-012-FR-01`、AC-01〜04と機能L10 C01〜C13 |
| `HELIXBRAIN-L2-029` | 固定親に独立成果なし。 | `BRAIN-029-FR-01`、AC-01〜05と機能L10 C01〜C53 |

## Stage 4 — 採択済み親018/019/020/021/022/023/030の業務分類

固定L2/L11はconnection、知識候補、evaluation/resultの責務・field・戻し先を定義するが、functional behaviorから独立したbusiness outcome、KPI、business ownerを追加していない。旧business分類の分離形式だけ再導出し、旧HARNESS業務値をBRAINへ移さない。各親の業務欄は空の根拠を記録し、通常のL3対象は以下のFR/ACに限る。

| 親L2 | 業務分類 | 機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-018` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-018-FR-01` / AC-01〜03 |
| `HELIXBRAIN-L2-019` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-019-FR-01` / AC-01〜03 |
| `HELIXBRAIN-L2-020` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-020-FR-01` / AC-01〜03 |
| `HELIXBRAIN-L2-021` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-021-FR-01` / AC-01〜04 |
| `HELIXBRAIN-L2-022` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-022-FR-01` / AC-01〜04 |
| `HELIXBRAIN-L2-023` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-023-FR-01` / AC-01〜04 |
| `HELIXBRAIN-L2-030` | 固定親に独立business outcomeなし。別business AC/KPI/ownerを追加しない。 | `BRAIN-030-FR-01` / AC-01〜06 |

旧business起点`LEGACY-ASSET-A6E2C7F0565E5F804F06`（旧HARNESS `business-detail.md`、source span 21–39/84–104等）はHARNESS固有のBR-21/HM-08・集計条件である。旧区分構造を再導出し、当該値や条件は本対象へ適用しない。独立business outcomeを持つ後続固定親が起草対象になった場合だけ、同じ通常L3内で本書へ記録する。


## Stage 5 — HELIXBRAIN-L2-024/025 業務分類

固定L2/L11はowner、data-flow、candidate/evaluation/registration/verification/adoption状態を定義するが、functional behaviorから独立したbusiness outcome、KPI、別business ownerは定めていない。旧business区分の分離形式だけを再導出し、旧RCLSのshadow/cross-project運用値をbusiness条件へ持ち込まない。

| 親L2 | 独立business outcome | 機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-024` | 固定親に独立outcome/KPIなし。Runtime/Core/LABO/OS ownerをbusiness ownerへ再分類しない。 | `BRAIN-024-FR-01` / `BRAIN-024-AC-01/02`。functional L10は `L10-BRAIN-024-C01`–`C35` に正常routeと個別責務反例を定義。 |
| `HELIXBRAIN-L2-025` | 固定親に独立outcome/KPIなし。新しいcross-project成果指標やhuman approval business gateを設けない。 | `BRAIN-025-FR-01` / `BRAIN-025-AC-01`〜`BRAIN-025-AC-05`。functional L10は `L10-BRAIN-025-C01`–`C49` に状態別正常・単独欠落・順序・owner/state・maturity条件を定義。 |

旧sourceではlearning promotionの責務境界はあるが、現行親を越えるbusiness outcomeはない。対象外KPIを暗黙条件にせず、固定L2/L11の責務・状態をfunctional ACで照合する。
