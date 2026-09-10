# インフラ・運用品質 L1要求候補

状態: candidate / unapproved。source: #1728。

| ID | 利用者要求候補 |
|---|---|
| NIO-L1-01 | HELIXは要求形成時に、対象systemの可用性・信頼性・性能・容量・費用・security・privacy・運用・保守・回復・observabilityの適用性を導出し、未決を隠さない。 |
| NIO-L1-02 | HELIXは設計から運用まで同じrequirement identityを追跡し、実運用で得たincident・metric・log・recovery evidenceを要求へ戻す。 |
| NIO-L1-03 | HELIXは「設計済み」「実装済み」「検証済み」「観測済み」「運用成立」を別状態として提示し、下位状態を上位状態へ読み替えない。 |
| NIO-L1-04 | HELIXは既存の計測・event・logging・incident・lifecycle機構を統合利用し、同じ責務の第二正本や第二engineを作らない。 |
| NIO-L1-05 | HELIXは承認済みscope内を自走し、範囲外の意味・権限・金銭・公開・法的不可逆差分だけを人間へ戻す。 |

数値SLO、target環境、予算、保持期間、blast radiusは対象RequirementまたはRelease契約で別途承認する。
