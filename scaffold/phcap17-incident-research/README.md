# PHCAP-17 incident research premise candidate

`status: research_premise_candidate`、`authority_effect: none`の静的調査候補である。基準は
`bcd54942763835492478d998ced6c3b56566b89b`。対象はPHCAP-17（incident／recovery／postmortem）で、
Issue #1905はsemantic authorityとして使わない。

## 保持する境界

監査台帳の`product_targets`は候補scopeであり、`current.evidence_products`は直接current refを確認した製品である。
PHCAP-17は候補scopeにHARNESSを含むが、監査上の直接current evidence製品はHELIX-OSとHELIX-Web-OSである。
HARNESSのL1、L2、L11文書には工程・品質・unknown境界に関する隣接refがあるが、PHCAP-17固有の直接refは0件である。
この欠落は`unknown`として保持し、現行ref欠落から未実装を推定しない。

旧assetは代表3件（incident mode、L7 route-token plan、incident runbook）と、L7 planが明示的に生成・依存するreverse planの計4件に限った。
sourceはarchiveからread-onlyで行・digestを照合し、旧runtime・test・CIは実行していない。台帳は4件すべて
`disposition: unresolved`、`implementation_status: unknown`、`consumer_refs: []`で、append-only判断ログの該当行は0件である。
旧文書内の`confirmed`、`approve`、`tests_green_at`などの主張はhistorical claimとして残し、台帳との矛盾を解消しない。

## 製品境界の研究premise

- **HELIX-HARNESS候補**: incidentを含む対象品質をL2で要求化し、L1-L12／L11 acceptance／trace・backflowへ接続する工程契約の候補。PHCAP-17直接ref、severity、authority、recovery、postmortemの現行成立はunknown。
- **HELIX-OS候補**: incident／recoveryの運用、証拠、通知・ack・復旧・改善候補を統制する候補。OS文書の記載はcandidateであり、運用実行・pass・production成立の証拠ではない。
- **HELIX-Web-OS候補**: service runtimeのincident／monitoring／recoveryと、許可されたlog・telemetryのOS exportを担う候補。service authorityはOSへ吸収しない。

この3つはunit／connection候補であり、製品owner・successor・要求採否を確定しない。`inventory.json`のatomごとにactor、旧authority/enforced-by、failure／unresolved、consumer候補、証拠状態を記録した。

## 閉包と残差

計数は旧asset 4、source file 4、source span 14、semantic atom 11、判断ログ行0、ledger consumer ref 0、current ref 11、HARNESS直接current ref 0である。
未選択のincident／recovery／hotfix／postmortem asset、全consumer closure、現行HARNESS固有契約、実装・test・運用成立、旧主張の意味再導出は残差である。

validatorはarchive source bytes、行span、asset／phase ledger、decision-log absence、current ref digest、閉包状態を静的に検査する。
selfcheckはauthority promotion、HARNESS直接refの捏造、consumer closure、old implementation、source digest改変などを陰性例として拒否する。
