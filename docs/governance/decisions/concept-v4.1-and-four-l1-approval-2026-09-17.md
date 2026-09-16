---
title: "Concept v4.1・4対象L1 承認decision record"
decision_record_id: HDEC-CONCEPT-V4.1-AND-FOUR-L1-2026-09-17
decision_status: approved
recorded_at: 2026-09-17
source_repository_revision: c5d3e8a73ee932bab3af140dfbe39dbe15c4fad1
authority_effect: effective_when_this_record_is_admitted_to_main
---

# Concept v4.1・4対象L1 承認decision record

## 人間判断

POは2026-09-17（Asia/Tokyo）の要求整理sessionで、次の順序と結果を明示した。

> readiness auditの7→9を同期 → exact SHAを再確認 → Concept v4.1＋4対象L1を承認

この指示を、下記5文書のexact bytesに対する承認として記録する。会話要約、GitHub状態、PR merge、CI結果から
承認を推定したものではない。

## 承認対象

| Decision ID | 対象 | 承認したSHA-256 | 結果 |
|---|---|---|---|
| `HDEC-CONCEPT-4.1` | `docs/concept/helix-concept-v4.1.md` | `181b0c555f4e27f83a1f92d315aee0e66a9f3f645e3cebe0a1b8d487878efaad` | approve |
| `HDEC-HARNESS-L1-01` | `docs/helix-harness/L1-planning/product-intent.md` | `a49da594e9593557eb42cbfe54edc7e9751ce40fea95d1fe9367f5780184ee04` | approve |
| `HDEC-HELIXOS-L1-01` | `docs/helix-os/L1-planning/system-intent.md` | `0f7f30d9d6984578f09c31ed1ef4e826d7c360bf752297982bde5201e7e99ca8` | approve |
| `HDEC-HELIXWEB-L1-01` | `docs/helix-web/L1-planning/product-intent.md` | `26815032e130d63fa3cef273847c029cbfc959a4d1a7c74e648a7044fc6d9756` | approve |
| `HDEC-HELIXWEBOS-L1-01` | `docs/helix-web-os/L1-planning/system-intent.md` | `600caa1388278abe43c06f01c53f565146c2f2ddd2165f6a8c9e63cbb174a34c` | approve |

親依存はConcept、HARNESS L1、HELIX-OS L1、HELIX-Web L1、HELIX-Web-OS L1の順に評価し、Concept承認後に
4対象L1の承認を成立させる。5件を一つの曖昧なrevisionへまとめず、各Decision IDとfile SHA-256を維持する。

## exact revision再確認

承認前に`source_repository_revision`のGit treeとworktreeの双方から5文書を読み、SHA-256が上表および
`concept-v4.1-human-decision-packet.md`と一致することを確認した。併せて対象別L1 IDとL2逆参照を集合照合した。

| 対象 | L1 ID | L2逆参照 | 結果 |
|---|---:|---:|---|
| HELIX-HARNESS | 9 | 9 | exact set一致 |
| HELIX-OS | 12 | 12 | exact set一致 |
| HELIX-Web | 6 | 6 | exact set一致 |
| HELIX-Web-OS | 5 | 5 | exact set一致 |

readiness auditのHARNESS 7/7は9/9へ訂正した。これは要求追加ではなく、既に対象本文へ存在する
`HARNESS-L1-008`／`009`を古い監査値へ同期した訂正である。

## 承認した意味

- HELIX-HARNESSを外部提供製品とし、V-model、工程、要求形成、Design Template、検証・受入契約を所有させる。
- HELIX-OSをHELIX project群の管理・統制・Worker・学習・log・CI・継続改善機構とし、HARNESS自身の改善を担わせる。
- HELIX-WebをHELIX-OSが開発・改善管理するConnector型Web製品とする。
- HELIX-Web-OSをHELIX-OS外のservice runtimeとし、許可された観測だけをHELIX-OSの改善入口へ返す。
- HARNESS Version 1完成をHELIX-Web展開の必須前提とする。
- GitHubをprojectionに限定し、repo-owned上流文書の承認revisionを意味authorityとする。
- 旧要求を落とさず、旧CIを使わず、新世代を上流から降ろし直す。

## この承認で成立しないもの

- 対象別L2／L11の採否・合意、要求atomのsuccessor割当、意味変更、縮退、retire。
- L3／L10、prototype、Requirement IR更新、DB、runtime、CLI、hook、adapter、Worker、新世代CIの設計・実装。
- archive sourceの移管完了、物理削除、release、deployment、公開、不可逆操作の許可。
- 5大目標または七大原則の独立authority承認。Conceptへの入力接続だけが承認対象に含まれる。

次は、承認済み4対象L1を根拠に全要求へ対象製品候補を登録し、旧要求を一件も落とさずL2／L11の個別判断へ進む。

## revision変更時の扱い

5対象文書のいずれかでbytesが変わった場合、その文書の承認を新revisionへ自動継承しない。誤記訂正を含め、
semantic diff、影響範囲、既存decisionとの関係を示した新しい判断を要求する。本record自体の追記やPR mergeによる
commit SHA変更は、上表の対象file SHA-256が不変である限り対象bytesを変えない。
