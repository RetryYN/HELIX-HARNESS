# FT-CONNECT-L2L11-MIGRATION-INVENTORY-001 — CONNECT要求・受入のJSON移行へ原意味を棚卸しする

作業種別: research / 無損失移行の入力整理
対象: 本体8機構L2/L11の16文書の所在索引と、そのうちHELIX-CONNECTのL2/L11一対
入力: FT-DESIGN-REFACTOR-001「設計から上流への還流とJSON正本の移行点検」、JSON正本のPO方針、CONNECTの固定採択判断

## 作業内容

本体8機構のL2/L11計16文書について、固定main `9fdd43c261722375eb2006c001de6798e8a2b446` のpath・層・raw SHA-256を所在索引にする。初回の意味棚卸しはCONNECT一対に限り、他14文書を棚卸し済みとしない。Web/Web-OSの4文書も対象外の所在として保持し、削除や採択済みへの昇格をしない。

CONNECTのL2/L11について、IDのある要求行だけでなく、前後本文、表注、適用制限、版、N/A、保留、関係、旧sourceと判断根拠を意味単位として棚卸しする。原文literal、原sourceのrevision/path/所在/span、原bytesと意味単位のdigest、L2と対L11の対応を辿れるようにする。抽出したID行だけを全意味としない。分類できない断片は原文と所在を残し、黙って捨てない。sourceの記録範囲を同じ本文の二重引用で膨らませず、原順と全範囲の被覆を照合できる区分を使う。

2026-09-28のCONNECT採択判断はcommit `f6dad2a33e24f000b87d7f09b8d40288257e74cc` のL2/L11 bytesを固定している。判断が固定した旧bytesと調査mainの追補・履歴を分け、同ID又は同形という理由で現bytesに承認を移さない。元の要求一式と適用条件、採択候補集合を、その判断と固定sourceへ戻して確かめる。別の追補判断がある場合も対象revisionと範囲を区別する。

成果は `docs/governance/crosswalks/l2-l11-json-migration-inventory.json` の非権威な棚卸し・対応表とする。この段階では正式な要求JSON、生成view、schema、renderer、登録、承認継承を作らない。要求本文と判断記録は変更しない。将来の意味JSON化では文章を包んだだけのJSONを完成とせず、この棚卸しから構造化する意味と説明を分けて検討する。

## 確かめること

- 16本文書と別枠4文書の所在・層・revision・raw hashが原blobと一致する。
- CONNECT一対の全source範囲を、重複や欠落のない原順の区分で辿れる。意味のある前後条件、IDのない本文、表注、保留を消さない。
- 各原文literalとspan/hashが固定sourceへ一致し、採択旧bytesと現mainの違いが区別される。
- L2と対L11のID集合・対応、適用条件・版・source/decisionを、元本文から独立に照合する。unknownや未分類のままの部分を成功へ変えない。
- 参照consumerと旧sourceを棚卸しし、参照化・正式移行・承認をこの対応表から生成しない。

## 旧sourceと保持・変更

起点は `archive/legacy-generation-2026-09-14/root/docs/design/helix/L4-basic-design/design-template-json-authority.md` §1〜§2（LEGACY-ASSET-4F5A1F0739EC1111D91D）とFT-DESIGN-REFACTOR-001。JSONの構造的意味と生成表示・所在索引の分離、原sourceとconsumerの保全、未知・二重authorityの拒否を保持する。今回は16本文書の所在索引とCONNECT一対の原意味の棚卸しへ限定して具体化する。旧registry/schema/式木/runtime/test/CIは移植・実行しない。

現物の起点はL2/L11の16文書がMarkdownにあり、移行用の意味棚卸しが未着手であることと、#3139で保全した参照更新漏れの事例である。ID行だけの抽出による周辺条件喪失やJSON存在からの完成推定は、この移行で避ける懸念として区別する。要求意味の変更を発見した場合は元要求/対受入と戻し先を記録し、意味保存の形式整理へ混載しない。

作業側は専用worktree/branchのlocal commit proposalまでを担当する。push・PR作成・review・mergeは行わない。採否・公開・独立review・統合と完了条件の確認は現在の運用モデルに従う。ticketの状態・Issue番号・PR番号・merge結果は本書へ書き戻さない。
