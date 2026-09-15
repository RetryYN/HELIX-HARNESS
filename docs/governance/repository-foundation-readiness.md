# Repository foundation readiness

status: blocked_by_review_findings_and_human_confirmation
pr: 1797
pr_class: repository_foundation
generation: new-generation-2026-09-14

## 判定

PR #1797は、repository構造と静的証拠に関するmerge条件1〜4を再検証中である。HEAD `c4b6b17fca8f2c7e7305fa286fc341b6209b40d7` のGitHub Claude意味reviewでBlocker 0件、Major 1件、Minor 4件が報告された。指摘を反映した後続HEADは未レビューであり、条件5と条件6は未成立である。したがってDraftを維持し、Ready化・mergeしない。

GitHub checkの状態はこの判定に算入しない。CodeQL、旧`harness-check`、旧test、旧runtimeは新世代上流の意味、要求保持、責務分離を検証するoracleではない。

## 条件別の証拠

| 条件 | 判定 | 現在の証拠 | 未成立または限界 |
|---:|---|---|---|
| 1. 旧資産を完全に固定し、現行pathから旧実行面を起動できない | 成立 | archive manifest 4,020件のSHA-256が4,020/4,020一致。現行`.github/workflows/`のYAMLは0件 | archive内assetの意味移管・最終退役は後続であり、本条件の成立に含めない |
| 2. active文書を対象別に物理分離する | 成立 | `docs/concept/`、`docs/helix-harness/`、`docs/helix-os/`、`docs/helix-web/`、`docs/helix-web-os/`、`docs/governance/`が存在し、四対象のL1／L2／L11が各対象directoryにある | 個別要求の承認や再配置完了を意味しない |
| 3. 運用モデル、authority入口、資産統制、GitHub操作記録を相互参照できる | 成立 | [新世代入口](new-generation-start-here.md)から[上流authority台帳](upstream-authority-register-2026-09-14.md)、[GitHub上流運用](github-upstream-operating-model.md)、[管理層の要求仮登録契約](management-provisional-requirement-registration.md)、[PR投影packet](github-upstream-pr-packet.md)、[archive記録](archive-first-transition-record-2026-09-14.md)、[資産再利用統制](legacy-asset-reuse-control.md)へ到達できる。管理層registerは全量照合済みの旧source集合7件を`registered_source_holding`として保持する | 仮登録はrepo-owned JSONL bootstrap。自動登録・分類・ticket生成・GitHub同期は要求整理後に設計するため未実装 |
| 4. 静的整合が成立する | 成立 | L2↔L11 ID集合はHARNESS 9、HELIX-OS 13、HELIX-Web 9、HELIX-Web-OS 6で一致。保持要求source 29件は29/29 SHA-256一致する。asset現行revision 3の29件は訂正判断29件へ一対一でjoinし、append-onlyで残す元判断29件とrevision 2 read-after 29件も一対一で追跡できる。IR 153件は全件pending、successor 0、decision 0。W1〜W4の人間可読queueで153/153件の原文・digestが台帳と一致する。補助sourceはv1.3 521行＋IR 134 item＝655件、見出しは未接続317行＋identity接続済み21行＝338件を保持する。旧candidateは92文書・4,755行を保持する。旧要求文書22件のsemantic line 2,386件は原文・行digestが一致し、未接続2,058件を721 review unitへ重複なく割り当てる | byte保持した旧文書copy内の旧相対リンクは原文を改変しないため対象外。未分類行は過包含候補であり要求確定数ではない。29 snapshotの物理保全は完了しているが、配置判断は`pending_human_confirmation` |
| 5. GitHub Claudeの最新HEAD意味reviewで未解消Blocker／Majorが0 | 未成立 | 最新exact HEADを指定したreview依頼をGitHub PR commentへ送付済み | 最新HEADを対象とするreview結果が未着 |
| 6. 人間がrepository構成と運用上流を確認する | 未成立 | 確認対象と条件1〜5を本表へ集約 | 人間decision recordがない |

## 再現用の静的確認

旧runtimeやCIを起動せず、次の範囲だけを読む。

```text
archive manifest       entries=4020, sha256 ok=4020, non_ok=0
active workflow YAML   0
requirements source    sha256 ok=29, non_ok=0
snapshot ledger joins  assets current revision=3:29, original decisions revision=2:29, correction decisions pending revision=3:29, read-after pass revision=2:29
L2/L11 IDs             HARNESS=9, HELIX-OS=13, HELIX-Web=9, HELIX-Web-OS=6; all equal
IR carry-forward       total=153, pending=153, successor=0, decision=0
active relative links  total=444, broken=0
human-readable queues  W1-W4 total=153, source text/digest exact=153
human-decision packets total=23, source text/digest exact=23, applied=0
semantic line inventory documents=22, total=2386, exact=2386, linked identities=328, pending atomization=2058
atomization review queue units=721, pending line coverage=2058/2058, duplicate=0, max lines=29; A1 source-confirmed=462 units/1529 lines, A2 nonpromoted-source=259 units/529 lines
legacy candidate sources documents=92, nonempty lines=4755, exact=4755, target approved=0, decisions=0
supplementary sources  v1.3 lines=521, IR auxiliary items=134, total=655
structural headings    pending headings=317, identity-linked headings=21, total=338
```

archive manifestはpathが旧repository root相対なので、`archive/legacy-generation-2026-09-14/root/`を検証起点にして`../MANIFEST.sha256`を読む。archive直下を起点にすると`root/`を欠いた誤ったmissing判定になる。

## 次の状態遷移

1. final HEADをGitHub Claudeがread-onlyで意味reviewする。
2. Blocker／Majorがあれば、要求削減や旧CIへの回帰をせずrepository foundationの範囲で修正する。
3. 未解消Blocker／Majorが0になったexact HEADについて、人間が物理構成と上流運用を確認する。
4. そのdecision recordを束縛して初めてReady／merge候補にする。

merge後も旧要求153件と文書要求identityはpendingから自動遷移しない。後続PRは一要求identityずつ、保持を既定として再配置する。
