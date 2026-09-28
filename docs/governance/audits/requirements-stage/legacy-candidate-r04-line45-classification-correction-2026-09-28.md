# 旧AAFD-R-04 L45 false negative分類訂正（R2253-01）

本書は旧candidate semantic-routing auditの追加訂正記録であり、#2251時点の[5-atom followup snapshot](legacy-candidate-five-atom-followup-2026-09-28.md)と4,755行のsemantic-routing JSONLを変更しない。旧sourceは参照のみ。旧workflow/runtime/test/CIは実行していない。


既存の4,755行semantic-routing JSONLと本追補表は、その時点の監査snapshotとして保持し、書き換えない。R2253-01の独立reviewで、旧AAFD-R-04は45–46行が連続する一つの規範条件であると確認した。L45は説明文ではなく、Agentic Audit Probeを未知finding探索のsource profileとしつつUIL deterministic detectorを置換しないという要求atomだったため、false negative classificationを**この追補でのみ**`explanation`から`requirement_atom`へ訂正する。L46は既存snapshotの分類どおり要求atomとして保持する。

| source atom | 固定旧source | 訂正内容と現行candidateとの関係 |
|---|---|---|
| `LEGACY-CAND-LINE-000142` | [旧AAFD-R-04](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md):45、file SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`、line SHA-256 `e7d58c59ce05eff5e2807b1a123e36e30d95dd8eddea9b26ae8de88406fa0de3` | ProbeがUIL deterministic detectorを置換しないという要求条件。immutable routing snapshotでは`explanation`だったが、本追補で要求atomへ再分類する。 |
| `LEGACY-CAND-LINE-000143` | [旧AAFD-R-04](../../../../archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md):46、file SHA-256 `685d95abf7218410b807dd9c58efd73a45b0b1937f820fefacf111fb2276bc1a`、line SHA-256 `333d4deb1ee4f9c39d411fb9749a8e3d6c5d397972bf29b5c5d52f03ba696412` | 自由文を直接Issue、Requirement、CI、merge authorityへ投影しない条件。L45と合わせてAAFD-R-04の一組の条件になる。 |

この一行の訂正に伴う分類差分は、旧集計`structure/explanation/requirement_atom = 926/2,959/870`から`926/2,958/871`、requirement atom内の`unknown = 574`から`575`である。これはL45一行のfalse negative補正時点の差分であり、全4,755行の再分類、semantic routingの全面完了、条件routeや採択後継の閉包を主張しない。

[HELIXINTELLIGENCE-L2/L11-073](../../../helix-intelligence/L2-requirements/intelligence-requirements.md#L601)はこのR04二atomだけを入力とし、UIL detector非置換と、自由文のみからのIssue/Requirement/CI/merge authorityへのdirect projection拒否を未採択1.0候補として対にする。r2 [source-lines](../requirement-registration/intelligence-free-text-boundary-source-lines-2026-09-28-r2.jsonl)と[coverage receipt](../requirement-registration/intelligence-free-text-boundary-coverage-receipt-2026-09-28-r2.json)が二atomを固定し、仮登録`MPR-RC-HELIXINTELLIGENCE-L2-073-002`は初版-001を訂正する。候補relationはPO採択や追加coverage claimではなく、AAFD-R-04以外の旧候補条件を閉じない。旧sourceは参照のみで、旧runtime/test/CIは実行していない。
