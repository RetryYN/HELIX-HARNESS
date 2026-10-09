# FT-GOV-AGENTREAD-001

作業種別: エージェント作業規則の入口に参照リンクを追加（規則・要求の意味変更なし）

作業内容: `AGENTS.md`「必須入口」に、作業前に直接読んで適用する正本へのリンクを並べる。対象は次のとおりである。

- [HELIX Concept](../../concept/helix-concept.md)
- [HELIXエージェントの七大原則](../../concept/helix-principles.md)
- [JSONを正本とする方針](../decisions/brain-helix-core-po-intent-2026-09-25.md)
- 設計・検証テンプレートseed（DT-MSG、DT-SDOP、DT-VT）

本文の`status`欄に残る「候補」表記を理由に適用を省かないことも、同じ箇所に書く。各正本の本文、規則、要求は変更しない。

経緯: 2026-10-10、POの指摘で次のことが分かった。

- Claude（lane `review_merge`）とCodexが作ったStage 1の設計・実装・local CI登録は、七大原則「3. DDD設計/TDD開発」に反していた。命名と構成は責務の分からない`helper`・`private`・`stage1`などの名前で、domainの用語から決めていなかった。
- Conceptの「HELIX-HARNESS-COREの意味と設計はHELIX-JSONで管理する」と、2026-09-25のPO判断「JSONを正本とし、Markdown・HTMLを生成する」も守っていなかった。
- 既存の設計・検証テンプレートseedも使っていなかった。
- Concept「6. 証拠で閉じる」と七大原則「7. 確かな証拠と計測改善で品質を守れ」にも反していた。review側（Claude）は、件数とSHA-256の一致だけでmergeしていた。

七大原則（2026-09-16作成、以後改訂）とConceptは、L2要求の合意（2026-09-28）とL3要件の作成（2026-10-05以降）より前からある。したがって違反は下流の設計・実装に限らず、要求の作成段階から原則を適用していなかったことにある。

原因は二つある。第一に、セッションに毎回読み込まれる`AGENTS.md`と`CLAUDE.md`に、Concept・七大原則・JSON方針へのリンクが無かった。第二に、[新世代作業入口](../new-generation-start-here.md)の読込順では七大原則が「候補」と表記され、エージェントが適用を省いていた。

旧HELIXとの対応: 旧`CLAUDE.md`（`archive/legacy-generation-2026-09-14/root/CLAUDE.md` 3–17行、SHA-256 `7bdfc0bc578359e42efae4242ee42b53abd6e2ec23874f1294d3ec0e278c8feb`）は、毎回読み込まれるfile自体に「Claude Code Read Order」として正本の直リンクを並べていた。

- 保持する点：毎回読み込まれる入口から、正本へ直接辿れるようにすること。
- 変更する点：入口を`AGENTS.md`（`CLAUDE.md`は`@AGENTS.md`で読み込む）とし、現行の正本へ差し替えた。
- 理由：現行の入口は作業入口文書を一つ指すだけで、Concept・七大原則が「候補」表記の4番目に埋もれていたため。

本件の規律そのものは文書の規則として足さない。命名・用語・テンプレート適合・JSON正本は、機構として作り、CIの検査で確かめる。これは`HARNESS-L2-048`ほかの規律要求として別に扱う。根拠は前身harnessの弱点ledger（`archive/legacy-generation-2026-09-14/root/docs/governance/predecessor-harness-full-weakness-audit-2026-07-20.md` 65–101行。文書の規則と実運用の乖離UTW-002・UTW-004・UTW-021、Markdown過多UTW-025）と、[失敗から学ぶ原則の判断記録](../decisions/learn-from-failures-principle-po-decision-2026-10-09.md)の「事例のない予防の規則は足さず、機構が成立した運用規則は減らす」である。
