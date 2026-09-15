# Scrum Reverse旧source全量行inventory

status: source_preserved_target_unapproved
machine_ledger: `scrum-reverse-source-line-carry-forward.jsonl`

## 目的

v1.3 L107–108が参照するScrum Reverseの旧entity要件と宣言oracle、およびentity要件の`parent_design`が指す
confirmed親要件を、後続要求PRの無損失被覆へ投入できる行単位source集合として保持する。これはcurrent authorityへの昇格、要求採用、successor割当、設計承認、検証実施を意味しない。

## 全量

| source | source状態 | 非空行 | file SHA-256 |
|---|---|---:|---|
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/scrum-reverse-entity-model.md` | `draft` | 192 | `d6ac0ebe30737d0534ccb98943b3e277eb9a551236761baaae8e6b77b14b04ac` |
| `archive/legacy-generation-2026-09-14/root/docs/test-design/helix/scrum-reverse-entity-model-acceptance.md` | `draft` | 74 | `bea0f4548fa223a4cceabed25a3bf8da0388d711c9be352122fb8d0b7ecccfe2` |
| `archive/legacy-generation-2026-09-14/root/docs/design/helix/L3-requirements/scrum-reverse-verification-engine.md` | `confirmed` | 34 | `0c5dd33f48710ae692c5ae71b63996f0ba2f8aab1af417cf33d5c02260c76c73` |
| 合計 | 混在状態を維持 | 300 | ledger SHA-256 `72428f6becffa5d931d2ea26f96408dec7e6e04a8b47869220a8c2f66070f1e9` |

300行は各原文、行番号、文書digest、行digestを保持し、全件`preserved_pending_rehome`、successor 0、人間decision 0である。confirmed親要件が対として指す`docs/test-design/helix/scrum-reverse-verification-engine-acceptance.md`の30非空行は本台帳へ未収載であり、[file-blob holding](delegated-requirement-document-source-inventory.md)の`DELEGATED-DOC-019`として原文を保持する。Scrum Reverse要求PRは、この対受入文書を先に行または意味atomへ無損失分解して管理層へ仮登録するまで開始しない。3文書間や既存108件工程索引との重複を単純加算しない。
