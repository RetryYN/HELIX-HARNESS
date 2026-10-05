# HELIX-OS L3 業務要件（Stage 2b）

状態: L3未承認の候補／L10未実行の検証設計。対象は `HELIXOS-L2-014` のみ。

## Stage 2b — HELIXOS-L2-014 business境界

固定親 `HELIXOS-L2-014` は段階構成の管理・検証・配布・切戻しを扱うが、既存の業務成果に独立したbusiness outcome、business owner、KPIを追加しない。新しい `BR-OS-014` は作らず、親の各成果・担当・境界は `functional-requirements.md` の `FR-OS-014` と `business-verification.md` の照合表から固定L2/L11へ参照する。OSの段階成立記録は1.0到達、対象製品release、外部公開、L3承認を生成しない。意味・scope・owner・versionを変える必要がある場合のみ、既存authority手順でL2へ戻す。技術候補値ごとのPO確認や新gateは設けない。

## Stage 2c追補 — HELIXOS-L2-028 / HELIXOS-L2-029

固定L2-028/029には、既存FR/ACの外に独立したbusiness outcome、business owner、業務KPIは定義されていない。このため新しいBR-OS-028/029を作らず、L2-028/029の成果とowner境界は `../L3-requirements/functional-requirements.md` の FR-OS-028/029 と固定L11へ参照する。意味・scope・owner・versionを変えなければならない場合だけL2へ戻す。技術値ごとのPO確認、新approval、Stage gateを作らない。

## Stage 3：business分類（15件、部分草稿）

この対象15件については、運用上の効果を別のbusiness acceptanceへ二重定義しない。採択済みL2の機能境界をfunctional FR/ACへtraceし、独立の事業owner・KPI・金額閾値を追加しない。実績評価はLABO、OSはregistration/state/handoffを担う。

| 親L2 | 分類とbusiness扱い | owner境界・参照する機能AC |
|---|---|---|
| HELIXOS-L2-032 | 機能要件のみ。quarantineは受入価値や全体greenの指標ではない。 | HARNESS oracle / SECURITY policy authority。FR-OS-L3-032 AC-01..05。 |
| HELIXOS-L2-033 | 機能要件のみ。再現receiptを品質合格KPIにしない。 | capability ownerが結果意味、OSがregistry/provenance。FR-OS-L3-033 AC-01..05。 |
| HELIXOS-L2-034 | 機能要件のみ。disposition正当性やリスク受容をOSが評価しない。 | 元source/PO authority。FR-OS-L3-034 AC-01..05。 |
| HELIXOS-L2-035 | 機能要件のみ。job登録数を監査完了率に読み替えない。 | OS-L2-010 ticket owner、HARNESS接続は別scope。FR-OS-L3-035 AC-01..05。 |
| HELIXOS-L2-036 | 機能要件のみ。Retrofit成否の技術判定は各owner。 | OSはpreflight-plan/apply trace。FR-OS-L3-036 AC-01..04。 |
| HELIXOS-L2-037 | 機能要件のみ。負債の価値・優先度はLABO/source owner。 | ticket登録はOS-L2-010。FR-OS-L3-037 AC-01..05。 |
| HELIXOS-L2-038 | 機能要件のみ。snapshot/proposal appendは採択・coverage完了でない。 | HARNESS semantic contract owner。FR-OS-L3-038 AC-01..04。 |
| HELIXOS-L2-040 | 機能要件のみ。retryを回復成功と数えない。 | 既存typed return owner。FR-OS-L3-040 AC-01..06。 |
| HELIXOS-L2-041 | 機能要件のみ。resumeを未完義務解消と数えない。 | OS-L2-009、正本/authority owner。FR-OS-L3-041 AC-01..04。 |
| HELIXOS-L2-042 | 機能要件のみ。output validationは独立acceptanceでない。 | Worker output contract owner、authorityはSECURITY。FR-OS-L3-042 AC-01..06。 |
| HELIXOS-L2-043 | 機能要件のみ。request/call/result件数を承認・成功KPIにしない。 | operation authority owner。FR-OS-L3-043 AC-01..05。 |
| HELIXOS-L2-044 | 機能要件のみ。prose handoverをresolution率へ算入しない。 | feedback/finding source owner。FR-OS-L3-044 AC-01..03。 |
| HELIXOS-L2-049 | 機能要件のみ。configured pool・利用率をproductivity/throughputと同一視しない。 | INFRASTRUCTURE resource、LABO/INTELLIGENCE入力。FR-OS-L3-049 AC-01..05。 |
| HELIXOS-L2-050 | 機能要件のみ。review capacity増枠はquality/merge acceptanceを意味しない。 | HARNESS independence/admission、OS queue/assignment。FR-OS-L3-050 AC-01..05。 |
| HELIXOS-L2-051 | 機能要件のみ。配車適性候補は新しいperformance評価ではない。 | LABO evidence、INTELLIGENCE proposal、SECURITY authority。FR-OS-L3-051 AC-01..06。 |

独立business criterionを必要とする上流意味はここで補作せず対応するL2/L1 ownerへ戻す。HELIXOS-L2-039はH045とのhold scopeとして対象外のままである。
