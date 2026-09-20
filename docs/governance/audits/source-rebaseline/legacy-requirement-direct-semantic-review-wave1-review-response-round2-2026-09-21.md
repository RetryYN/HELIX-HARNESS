---
title: "旧要求・旧asset直接semantic review wave 1 review応答 round 2"
status: review_response
authority_effect: none
review_request_id: RH-1913-GUI-02
reviewed_content_sha: 847bf2f15a4a6c007642ffb4f025f9faeecc4244
---

# 旧要求・旧asset直接semantic review wave 1 review応答 round 2

## 対象

Claude GUI review laneから受領した`GUI-1913-RESPONSE-02`を、PR #1913のcontent SHA `847bf2f15a4a6c007642ffb4f025f9faeecc4244`に対するreviewとして処理した。結果は`incomplete`、指摘はMajor 2件、Minor 2件、Info 1件であった。

## 指摘処分

| finding | 処分 | 修正 |
|---|---|---|
| `MAJOR-1913-02-01` | 対応 | atom receiptを契約被覆と実装被覆へ分離した。`semantic_edge_coverage_complete`はimplementation sourceのconfirmed edgeだけから計算し、`unknown_*`の旧実装状態ではtrueを拒否する。HARNESS要求原文による2 atom一致は契約被覆だけに残した。 |
| `MAJOR-1913-02-02` | 対応 | FR-12へ責務主体`Agent Sync/Guard` atomを追加し、全atomのsource fragment unionが要求spanの意味文字を無損失に覆う検査を追加した。総atom数は11となった。 |
| `MINOR-1913-02-01` | 対応 | status docのHARNESS旧実装状態をmetadata正本の`unknown_pending_direct_implementation_and_consumer_review`へ一致させ、verifierで旧値の残留を拒否する。 |
| `MINOR-1913-02-02` | 対応 | match modeの適用規則を方法書へ定義し、`confirmed`でpartialを、`unresolved`で確定modeを使う入力をverifierで拒否する。 |
| `INFO-1913-02-01` | 対応 | BR-01の引用範囲を表周辺の51–54行から要求原文の53行だけへ絞った。 |

## 結果境界

契約被覆は実装被覆を完成させない。HARNESSは契約2 atomが一致する一方、実装confirmed 0、実装unresolved 1、実装未被覆1であり、旧実装状態はunknownのままである。OSは責務主体を含む9 atomのうち、実装confirmed 2、実装unresolved 2、実装未被覆5である。

archive内のsource、runtime、hook、test、CI、adapterは実行していない。consumer closure、旧実行可能性、現行replacement、要求やphaseの採否は未確認のままである。
