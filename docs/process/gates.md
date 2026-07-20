<!-- HELIX:L3-PROGRESSION-AUTHORITY:v1 -->
> **L3進行authority**: 層・pair・runtime判断は docs/governance/l3-progression-authority-rebaseline-2026-07-19.md を正とする。本文の旧layer/runtime表現はdomain contentだけを保持するcompatibility debtであり、L3 freeze条件へ使用しない。

> **正本化済** (PLAN-REVERSE-01 で DISCOVERY-04 dogfood 実績から正本化、2026-06-04)。docs/process は forward/modes/gates の運用正本。規範変更は concept/requirements (上位正本) 先行 → 本 dir へ反映する。

# ゲート体系 (G1-G12) — Forward + mode 横断集約

出典: concept v3.1 §3.1 各層 gate / requirements v1.2 §2.2 Pair freeze + trace freeze / §7.8.3 requires_human_approval 承認者 / §7.8.5 横断検出

---

G8-G12の計画routeはPLAN-L7-130-right-arm-gate-planning /
PLAN-REVERSE-130-right-arm-gate-planning。旧G13/G14 evidenceはcanonical G12の
価値・運用品質検証へ投影し、独立した現行gateとして判定しない。
<!-- doctor marker: G8 has an executable workflow gate; G9-G12 have defined evidence profiles -->
<!-- doctor marker: PLAN-L7-130-right-arm-gate-planning / IMP-052** は implemented -->

G8-WORKFLOW minimum mechanization (PLAN-L8 ascent): G8 は IT-* row の存在だけでは close しない。
passing G8 slice には integration evidence manifest、selected IT-* coverage、executable test procedure、
missing evidence / stale defer / failed mandatory IT case の明示的 exit block が必要である。
必須 gate artifact は integration evidence manifest とする。
workflow granularity の source は
`docs/test-design/harness/L8-integration-test-design.md` §6 G8-WORKFLOW.
<!-- doctor marker: exit blocks -->

右腕検証戦略 (external-grounded): L8-L12 gate は prose completion claim ではなく、
test-basis / test-condition / execution-evidence / defect-routing record を消費する。
right-arm evidence profile は
`docs/process/forward/L08-L14-verification-phase.md` §右腕 evidence profile.
External basis (official source ledger checked 2026-07-03): NIST SSDF SP 800-218 (<https://csrc.nist.gov/pubs/sp/800/218/final>, Rev. 1 IPD tracked at <https://csrc.nist.gov/pubs/sp/800/218/r1/ipd>), Scrum Guide 2020 (<https://scrumguides.org/scrum-guide.html>), ISTQB Glossary (<https://glossary.istqb.org/>), OWASP LLM06:2025 Excessive Agency (<https://genai.owasp.org/llmrisk/llm062025-excessive-agency/>), NASA Systems Engineering Handbook Appendix (<https://www.nasa.gov/reference/system-engineering-handbook-appendix/>), W3C WCAG 2.2 (<https://www.w3.org/TR/WCAG22/>), Playwright Test (<https://playwright.dev/docs/intro>, visual comparisons <https://playwright.dev/docs/test-snapshots>, accessibility testing <https://playwright.dev/docs/accessibility-testing>), GitHub Environments required reviewers (<https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments>), VS Code Webview Security (<https://code.visualstudio.com/api/extension-guides/webview#security>), Google SRE Release Engineering (<https://sre.google/sre-book/release-engineering/>)。ledger は official URL / adopted version/date / latest official status / adoption decision / verification use / gate impact を保持し、right-arm gate design を source name ではなく source meaning に結び付ける。未来日 `checked` または 90 日超過の `checked` を持つ source ledger は stale とし、right-arm / S4 / version-up / cutover / completion decision evidence には使えない。Ledger refresh には `source_ledger_freshness`、`source_status_delta`、`adoption_decision_delta`、`workflow_route_impact` が必要であり、meaning-review evidence は再確認した official source row をすべて名指しする。date-only refresh は gate evidence ではない。
<!-- doctor marker: date-only refresh is not gate evidence -->

## 1. gate 一覧表

| gate | タイミング (L 遷移) | 確認対象 | fail 時動作 |
|------|-------------------|---------|------------|
| **L0 intake** | L0 → L1 | 層外charterがL1事業要求へtraceできるか（軽量な方向性・整合性確認） | block → L0 anchor修正 |
| **G1** | L1 完了 | 事業要求 + L1↔L12 pair + business/value trace | block → G1へ戻る |
| **G2** | L2 完了 | 要求定義 + 人間受入基準 + L2↔L11 pair。physical L1 requirements / L2 mockもここへ投影 | block → L2修正 |
| **G3** | L3 完了 | FR+AC ⇔ 受入テスト設計 ペア凍結 / AC 不在 → fail | block → L3 修正 |
| **G4** | L4 完了 | アーキ/ADR ⇔ 総合テスト設計 ペア凍結 | block → L4 修正 |
| **G5** | L5 完了 | D-API/D-DB/D-CONTRACT ⇔ 結合テスト設計 凍結 (API/Schema Freeze) | block → L5 修正 |
| **G6** | L6 完了 | 関数 signature + WBS ⇔ 単体テスト設計 凍結 | block → L6 修正 |
| **G7** | L7 完了 | 4 artifact trace freeze: ① 4 artifact 揃い / ② 必須 8 directed edge 全充足 / ③ coverage ≥ 80% — **3 条件いずれか欠落 → exit 1** (§2.2 R-C3 fix) | exit 1 → L7 差分修正 |
| **G8** | L8 完了 | 結合テスト品質: `g8-integration-evidence-v1` manifest + selected IT coverage + stale defer 0 | block → L8 修正 |
| **G9** | L9 完了 | 総合テスト品質: ST-* evidence + roadmap span coverage + regression routing | block → L9 修正 |
| **G10** | L10 完了 | L3機能要件に対するUX受入: real-data render/screenshot/a11y evidence + frontend coverage | block → L10修正 |
| **G11** | L11 完了 | L2要求に対する人間受入: UAT decision record + feedback backprop route | block → L11修正 |
| **G12** | L12 完了 | L1事業要求に対する価値・運用品質: acceptance、release approval、smoke/monitoring、operational metric、rollback evidence | block → L12修正 |

G12 / whole-program completion claim は `helix status --json` の
`outstanding.completionReadiness.ok=true` も必要条件に含める。これは doctor health gate とは別の
completion-readiness 判定であり、doctor green を全件完了の代替証跡にしない。

### G1/G2: L1-L2 収束 gate（PLAN-DISCOVERY-11 S4 confirmed / PLAN-REVERSE-329）

G1/G2 の間では、画面が要求を露出する性質を正式に扱うため、L1 要求と L2 mock の反復を許可する。
この反復は G1 exit の事後拡張ではなく、A-40 back-propagation の再検証条件として扱う。

- `l1-l2-consistency` lint が screen-requirements と L2 screen-list / screen-flow / ui-element の双方向被覆を検査し、green を収束の必要条件にする。
- AI の gap-check は read-only で、欠落候補と trace 断絶を列挙するだけである。L1/L2 の自動起草、受入、freeze、scope 分割は行わない。
- 最終 freeze は人が宣言する。3 ラウンド以内に green へ至らない場合は PO へエスカレーションし、scope 分割または要求凍結を判断する。
- 収束後の L1/L2 変更は silent edit ではなく、change-log と A-40 再検証を経由する。G3 以降は PO 承認済み L3 FR+AC を下流判断の SSoT とする。

注: G8 は PLAN-L7-168 / PLAN-REVERSE-168 / PLAN-L7-169 系で executable evidence manifest 化済み。G9/G10 は PLAN-L7-313 で `g9-system-workflow` / `g10-ux-workflow` の executable evidence gate へ接続済み。G11-G12は本表のcanonical evidence profileを正本とする。compatibility file `L08-L14-verification-phase.md` の旧G13/G14項目はG12 evidenceへ投影する。詳細なfail-close実装は **PLAN-L7-130-right-arm-gate-planning / PLAN-REVERSE-130-right-arm-gate-planning** 配下の子PLANで展開する。

> **canonicalモデル**: G1-G12はL1↔L12 / L2↔L11 / L3↔L10 / L4↔L9 / L5↔L8 / L6↔L7を凍結・検証する。L0は層外anchorであり、旧G0.5/G13/G14はcompatibility evidenceとしてcanonical gateへ投影する。

---

## 2. G7 (4 artifact trace freeze) 詳細

G7 は L7 実装完了の唯一の exit gate。以下 3 条件をすべて満たすまで exit 1 で block する (§2.2 段階 B、R-C3 fix)。

| 条件 | 内容 |
|------|------|
| ① 4 artifact 揃い | ① 設計 (docs/design/) / ② 実装コード (src/) / ③ テスト設計 (docs/test-design/) / ④ テストコード (tests/) が対象スコープ分揃っていること |
| ② 必須 8 directed edge | §2.4 で定義された ① ↔ ②、① ↔ ③、② ↔ ④、③ ↔ ④ の 8 方向すべてに孤児が無いこと |
| ③ coverage ≥ 80% | `helix gate G7` が coverage 80% 以上を確認 |

詳細メカニクス: `docs/process/forward/` 各 L 定義 (将来 L07-implementation.md §4) に委譲。G7 は trace freeze の集約 entry point として機能する。

---

## 3. 人間サインオフ必須ゲート (§7.8.3)

以下のゲート/条件は **承認記録なしで当該コマンドを実行すると exit 1** (§7.8.3)。承認記録は `.helix/audit/` に append。

| 引き金 mode/条件 | 承認者 (人間サインオフ) | 備考 |
|-----------------|----------------------|------|
| **Recovery 起動** | `tl` (リオープン確認) + `po` (スコープ承認) | `recovery` mode 開始時 |
| **prod Incident** (`env=prod`) | オンコール + `tl` + `pm` の三者 | `env=prod` または `regression_prod` signal |
| **config_drift Retrofit** | `tl` 単独 (環境影響限定) | `config_drift` signal の Retrofit 起動時 |
| **L0 G0.5** (frontier-reviewer adversarial) | `frontier-reviewer` (別 runtime) | `hybrid` mode 時。`standalone`/`claude-only` 時は subagent self-review で代替 (§7.8.2) |
| **L12 リリース承認** | `po` サインオフ必須 | デプロイ + 受入完了後の本番リリース |

---

## 4. 横断検出ゲート (§7.8.5)

`helix doctor` / `helix plan lint` に束ねる横断検出器の現状と予定。`relation-graph`以外の下表の
期待検出器は未実装であり、実装・doctor配線が完了するまでfail-close稼働中として扱わない。

| 検出器 | fail 条件 | 接続先 mode |
|--------|----------|------------|
| `drift-check` (未実装carry) | 設計↔実装のコントラクト不一致 | **Reverse** (normalization) |
| `connection-deficiency` (未実装carry、§7.8.7 DEP-2) | コンポーネント間接続の欠損 | **Reverse** または **Refactor** (影響範囲による) |
| `relation-graph` (DEP-1) | orphan / cycle / レイヤリング違反 | **Refactor** または **Reverse** |
| `test-perspective-gate` (未実装carry、TST-2) | テスト観点の抜け / レベル間重複 | 当該 L の設計層へ差し戻し (G1-G6 再通過) |
| `doc-drift` (未実装carry) | 設計文書と実装の乖離 (drift) | **Reverse** (R0 起点) |
| `regression_dev` (開発中回帰) | テスト緑が壊れた | **Recovery** (human approval 必須) |
| `regression_prod` (本番回帰) | `env=prod` での回帰 | **Incident** (三者承認必須) |
| `debt_degradation` / `code_smell` | コード劣化検出 | **Refactor** |
| `dependency_outdated` / `upgrade` | 依存陳腐化 | **Retrofit** (upgrade preflight 必須) |

検出は `.helix/` state を参照し、`legacy DB` には依存しない (§7.8.5)。`--static-only` フラグで AI 不要の機械判定のみ実行可能。
