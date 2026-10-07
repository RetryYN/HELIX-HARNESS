# INTELLIGENCE Stage 5 L2-069 ceiling mutation clarification

- 種別: 時点監査・本文修正根拠。authority effect: `none`。
- 対象base: `5857c0a396cb24a23d765e3079a18a2367b6d078`。専用branch `codex/intelligence-stage5-069-ceiling-oracle-clarification`。
- 対象scope: HELIX-INTELLIGENCE Stage 5、親 `HELIXINTELLIGENCE-L2-069` の `AC-INT-069-04` と `CASE-INT-069-04i` / `CASE-INT-069-04j`。固定L2/L11は変更しない。

## 修正内容

旧 `CASE-INT-069-04i` の「shared DB ceilingだけを削除」では、ceilingが有効入力sourceから欠けたのか、計算だけがsource-bound ceilingを無視したのかが同じfixtureに混在して読めた。固定L2/L11に照らして、この2つを独立変異へ分けた。

- `CASE-INT-069-04i` は、有効な選択済み同revision sourceに `shared DB ceiling=8 jobs/min` を残したまま、計算だけがceiling制約を無視してworker増加を比例速度とする出力変異。oracleは明示上限8を適用し、L11正常oracleどおり4 workersでもthroughputを8 jobs/minとする。
- 新 `CASE-INT-069-04j` は、選択sourceからceiling fieldだけが欠落し、同revisionの代替source/fallbackがない変異。他入力・source identity/revision/owner/scopeは維持する。oracleはceiling/throughput/timeの数値を補わず計算不能/部分unknownを返す。L11の正常fixtureにある8を欠落入力へ移植しない。固定L2が定めない追加ownerも作らない。

FR `AC-INT-069-04` とCASE索引、L10 FV個別表、L3/L10 NFRV補完fixture参照を同期した。既存4a–4hと通常3のoracleは保持し、固定L2の数値、source owner、scope、permission、戻し先は変えていない。新しい閾値、approval、gate、実装条件を追加しない。

## 固定sourceの照合

- 固定L2 commit `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `docs/helix-intelligence/L2-requirements/intelligence-requirements.md` SHA-256は `592c9efe7a5e68c53d56de696080f286e4c926110775f49e46de979fe232537c`。lines 518, 520, 522, 526は、sourceで必要値が定まらなければ係数/線形則を補わず計算不能/部分unknown、入力model外の状態を生成せずunknownを分ける、仮想Worker比較に明示capacity/shared ceilingを要する、通常計算に必要な係数/規則が不足なら計算不能/部分unknownと定める。
- 固定L11 commit `633bf12ea8f948db8ba3d6600179c4a9507377a7` の `docs/helix-intelligence/L11-acceptance/intelligence-acceptance.md` SHA-256は `98413d69444934e047c1bc6626257aeee95f3892c6ea53fa63b7e854878efe33`。lines 223, 225の通常fixtureはceiling 8を明示し、worker rate 3、`throughput=min(worker_count×3,8)`から4 workers=8 jobs/minを期待する。ceilingを無視して2倍速とする計算は不合格、根拠不足値はunknown/unsupported/blockedにする。
- したがって「入力sourceから欠けているceilingを復元する」ことは要求されない。8を出せるのは同revisionの有効sourceが明示し、source-bound入力として残る場合に限る。正常fixtureの固定値をsource欠落時に出力へ持ち込むことを禁止する。

## 旧source・PO原文との境界

- 旧HELIX archive、governance/candidates、旧`root/CLAUDE.md`を含むsource inventoryは `docs/governance/decisions/design-model-calculation-derivation-2026-09-27.md:17–21` に記録されている。今回、archiveのhelix design/candidates/CLAUDEを `simulation|simulate|シミュレーション|what-if|条件.*動か|負荷.*試算|仮想.*worker|shared DB ceiling` で再照合し、有限設計modelの数値算術に同一の旧要求がないことを確認した。直接一致は下記の旧governance simulationだけだった。
- 旧asset `LEGACY-ASSET-50CA1C554747F12266D3`、`archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/resident-lane-orchestration-requirements.md:1114–1124`（SHA-256 `17bc83614d7f5f75b61831eb447a23ee706cb8a6d9e54477736e553ff956dcfd`; disposition `docs/governance/legacy-asset-disposition.jsonl:477`）は、PR差分をmain候補へ仮適用してmerged-plan-status/assignment/branch ownership/projection/doctorを検査するpre-merge governance simulationであり、製品設計modelのcapacity計算ではない。値保持やmissing値補完の根拠として再利用しない。旧runtime/CLI/test/CIは実行していない。
- 現行候補のPO起点は `docs/helix-harness/sources/capability-reinforcement-po-original-2026-09-27.md:28–34`（SHA-256 `ab8bb6ae8cd418053d6baaafccaa80ee8ef2e715caab1576e5a00c306e97d1f8`）と `docs/governance/decisions/design-model-calculation-derivation-2026-09-27.md:11–21,31–34`（SHA-256 `00a26c9f2b1c590dd8442254e62b2a76ea695e19b60cd0d691421c4bfe7314d4`）である。PO原文はWorker 2→4と処理詰まり/時間/費用比較の機能目的を示すが、ceiling 8や欠落時に値を戻す規則は定めない。具体値と欠落挙動のauthorityは固定L2/L11にある。

## 6本文SHA-256

beforeはbase `5857c0a396cb24a23d765e3079a18a2367b6d078` のblob bytes、afterは修正後working tree bytesから計算した。

| 本文 | before | after |
|---|---|---|
| `docs/helix-intelligence/L3-requirements/business-requirements.md` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` | `026d95fbf023ef384834ebd3b215a469f2fea648190d15d45494b5ea4cc91959` |
| `docs/helix-intelligence/L3-requirements/functional-requirements.md` | `01ceffadc184ead3c5a73e4df4f308610394590630c222a53930e4857ee71c5a` | `c4f7b0cc4b85f00e3ebbf20595ac457bcddd9b3855236e7f786a1eba30797cfe` |
| `docs/helix-intelligence/L3-requirements/nfr-grade.md` | `a1113329da1b463968b2a67a19692db77c41b0fcdb6bf028ac969d83921066a2` | `e117fa2b96fc37e8623485b7af4c31d830da4c705deff975fcff3937cbd29895` |
| `docs/helix-intelligence/L10-verification/business-verification.md` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` | `b476b0939b7da50cf75db66d235095f94e591ac929ef046721224b5112d04552` |
| `docs/helix-intelligence/L10-verification/functional-verification.md` | `aa6cb83a2eaeeaf0d4d0fd955698e5071e27c81232ba43a1c3af94918fbccc77` | `361f5a6e40a3c34dc1b231298cae933dbbfe9cba95c3608067c23d660c194078` |
| `docs/helix-intelligence/L10-verification/nfr-verification.md` | `1049e8edef98fd41f1f2c57caff98eebc999e65652e558b42646976e517614a1` | `92b7f8a4825a95398c8b7038b9be8cd77301feeef61bd517dd247669d4c6654d` |

## 検証と未実施

- 6本文のbefore/after SHAと、04i/04jの単独条件、AC/FR/FV/NFR/NFRV参照を静的に照合する。`git diff --check`を実行する。
- L10 fixtureは実行していない。独立review、L3承認、PO事後確認は未実施。本記録はそれらを生成しない。
- Stage5の他親と全consumerの意味再監査は完了扱いにしない。
