---
decision_record_id: HDEC-JSONAUTH-RESOLUTION-2026-10-10
decision_status: recorded
decider_role: PO
decided_at: 2026-10-10
recorded_at: 2026-10-10
authority_effect: effective_when_this_record_is_admitted_to_main
---

# JSON正本の要求・受入整合のPO判断

## 対象と原文

POは、本Codex会話の質問票で、[固定差分案](../crosswalks/requirements-resolution-packet.md)のJSONAUTHについて「JSONAUTHを採用（推奨）」と回答した（原文）。質問は、OS-L2-053と対L11の意味正本をJSONへ訂正し、生成Markdown/HTMLだけの編集では正本更新にならない負例を加え、原子性・CAS・rollback・責務境界を保持する案の採用についてである。

- 提示commit: `d4b439e5c48591749709a8707d0ee319c673f000`
- 提示JSON SHA-256: `64b673cd69579bbbb3a978119ecf3f30fa450cc3cc21420e1457549ec1976d38`
- 判断単位: `JSONAUTH`（4置換、他unitは本書で反映しない）
- 作業base: `9523d7873e991006c3d3af1fc561b7cbea8d4fb4`
- 対象L2: `docs/helix-os/L2-requirements/governance-requirements.md#helixos-l2-053`、節SHA-256 `744601cc3278f1de41347fdf5c847c5aab82d644bf06e8dd10cc13b0a54531b7`
- 対象L11: `docs/helix-os/L11-acceptance/governance-acceptance.md#helixos-l11-053`、節SHA-256 `54ee31b2874185883d026900069443d2b6cd9ca2d5406845c026b2b637901580`
- digest規則: 指定###見出しから次の###見出しの直前まで、末尾空白を除きLF一つで終えるUTF-8 bytes。

## 判断と保持範囲

意味正本をJSONとし、生成Markdown/HTMLを投影として扱う。OSの全artifact原子的確定・部分current拒否・CAS・command再送・成功/失敗receiptと、HARNESS/artifact ownerが意味を持ちOSが運転する責務境界は保持する。053の既採択状態と1.0指定を保ち、052の版は本書で変えない。

[10/10版判断](discipline-requirements-into-1.0-po-decision-2026-10-10.md)が別扱いへ残した053の意味修正を本対象revisionについて確定する。9/29の採択と9/25 JSON正本方針の他の意味は変えない。過去の判断記録は保持する。

旧HIL-FR-52のMarkdown原子更新表現は旧sourceとして保持し、9/25既決方針に沿うJSON正本へ意味を再導出する。旧`design-template-json-authority.md:19–29`のJSON意味と生成viewの分離、旧`infinity-loop-platform-requirements.md:142`の複数artifact単一operation・部分成功拒否・CAS・receiptを保持する。`HOT-HIL-49:76`は境界failureの静的oracle参照であり実行しない。現在の要求とPO判断の食い違いを解くための変更であり、旧sourceの未実装・不在を理由に新しいgateを作らない。

本判断は対象L2/L11の意味修正に限る。旧IR identityのformal successor割当、他要求採否、L3再開、設計・実装・CI・release・配布許可、受入完了、Issue closeを生成しない。
