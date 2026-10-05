# HELIX-BRAIN L3 業務要件 — Stage 1（007/008/028）

**状態：部分草稿・未承認。** 固定された対象L2/L11から、BRAIN-007/008/028に独立配置できる機構業務成果は確認できなかった。固定親の意味とownerを変えず、動作条件は`functional-requirements.md`のFR/ACへ置く。別business AC、business owner、計測条件は追加しない。

旧HELIXの業務要件起点は `LEGACY-ASSET-A6E2C7F0565E5F804F06`（`archive/legacy-generation-2026-09-14/root/docs/design/harness/L3-functional/business-detail.md:1-21,27-64,108-123,147-177`、全文SHA-256 `99a099d69cae60bd5d55c38221eb9ed814abf15ba59b3ac32f27d69fd0d6ad5d`）。これはHARNESS固有のBR-21/HM-08と集計・計測条件で、BRAIN 007/008/028の独立business outcomeに直接一致しない。区分名だけからBRAIN業務要件やownerを作らず、当該旧業務条件・値を持ち込まない。

| 親L2 | 業務分類 | 機能正本 |
|---|---|---|
| `HELIXBRAIN-L2-007` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-007-FR-01` / `BRAIN-007-AC-01,AC-02` |
| `HELIXBRAIN-L2-008` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-008-FR-01` / `BRAIN-008-AC-01,AC-02` |
| `HELIXBRAIN-L2-028` | 固定L2/L11に独立business outcomeなし。追加・複製なし。 | `BRAIN-028-FR-01` / `BRAIN-028-AC-01,AC-02` |

後続の承認済みL2が独立business outcomeを与えた場合に限り、通常のL3起草内で本書へ配置する。旧HARNESS業務値をBRAINへ移さない。

## Stage 2b追補 — 採択済み001〜006の部分草稿

**状態：候補のみ（独立review／L3承認前）。** Stage 1 prefixは最新main `a7ae47c0bd97cd53298594086923c73dfb2a712b`で承認済みのbytesを保持する。本追補はPO main `633bf12ea8f948db8ba3d6600179c4a9507377a7`の採択registrationと、固定L2/L11 `f6dad2a33e24f000b87d7f09b8d40288257e74cc`の001〜006だけを候補として具体化する。各親のversion targetは1.0、G0配属はStage 2bであり、release収載や全前Stage完了gate、実装・実行許可を生成しない。後続版・Web条件付き・保留/不採択を親にしない。

- `HELIXBRAIN-L2-001`：独立business成果は固定親にない。機能正本 `BRAIN-001-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-002`：独立business成果は固定親にない。機能正本 `BRAIN-002-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-003`：独立business成果は固定親にない。機能正本 `BRAIN-003-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-004`：独立business成果は固定親にない。機能正本 `BRAIN-004-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-005`：独立business成果は固定親にない。機能正本 `BRAIN-005-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

- `HELIXBRAIN-L2-006`：独立business成果は固定親にない。機能正本 `BRAIN-006-FR-01` / AC-01〜04に配置し、別ownerや業務KPIを作らない。

## Stage 2b追補 — 採択済み009/010/011/012/029

固定L2/L11の各親にfunctional behaviorを越える独立business outcome、KPIまたはbusiness ownerはない。旧HARNESS business-detail `LEGACY-ASSET-A6E2C7F0565E5F804F06`（`business-detail.md:21-37`）のBR-21、HM-08、Learning Engine、計測条件をBRAINへ移さない。旧business分離の形式は再導出するが、分類名だけからBRAIN業務義務を作らない。

| 親L2 | business成果 | 正本参照 |
|---|---|---|
| `HELIXBRAIN-L2-009` | 固定親に独立成果なし。 | `BRAIN-009-FR-01`、AC-01〜04と機能L10 C01〜C11 |
| `HELIXBRAIN-L2-010` | 固定親に独立成果なし。 | `BRAIN-010-FR-01`、AC-01〜04と機能L10 C01〜C09 |
| `HELIXBRAIN-L2-011` | 固定親に独立成果なし。 | `BRAIN-011-FR-01`、AC-01〜04と機能L10 C01〜C09 |
| `HELIXBRAIN-L2-012` | 固定親に独立成果なし。 | `BRAIN-012-FR-01`、AC-01〜04と機能L10 C01〜C10 |
| `HELIXBRAIN-L2-029` | 固定親に独立成果なし。 | `BRAIN-029-FR-01`、AC-01〜05と機能L10 C01〜C52 |
