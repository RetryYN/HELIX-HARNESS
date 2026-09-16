---
title: "Execution Ticket全項目移管・検証束縛"
status: draft_candidate
related_issue: 1534
---

# 全項目移管表

原稿SHA-256: `b84cc126f0946302e90ad9d00f6c031690e2b3eca6474882f9699613e53f8db3`。
原稿750行、19章＋ヘッダ。原稿は未追跡だったため、各章をeta-source marker内へ全文移管し、連結一致を検証してから削除する。
英語のみの見出し・項目へ「取込補足」の日本語説明を付けた。原稿の再構成検証ではこの補足だけを除去し、原稿SHA-256との一致を確認する。
取込は要求候補の保存であり、canonical freeze・runtime実装・稼働・性能改善は未完了。

## 上位要求からFRへの束縛

| L2要求 | L3への展開 |
|---|---|
| HXT-RQ-01 | HXT-FR-001..019,021 |
| HXT-RQ-02 | HXT-FR-013,018,020; HXB-FR-001..007,014,016,019,020 |
| HXT-RQ-03 | HXT-FR-020; HXB-FR-008..011 |
| HXT-RQ-04 | HXT-FR-010,022; HXB-FR-011..013,016,017 |
| HXT-RQ-05 | HXT-FR-014,023,024; HXB-FR-007,012,015,020 |
| HXT-RQ-06 | HXT-FR-019,025; HXB-FR-018 |
| HXT-RQ-07 | HXT-FR-004,008..010,022..024; HXB-FR-013,015 |

## 原稿章の移管先

| 原稿章 | 移管先 |
|---|---|
| ヘッダ、0、1、13〜18 | [取込・衝突台帳](execution-ticket-intake.md) |
| 2 | [L2要求](execution-ticket-requests.md) |
| 3〜11 | [L3要件](execution-ticket-requirements.md) |
| 12 | [L10受入](execution-ticket-acceptance.md) |

## 全IDの配置

| ID | 移管先 | 状態 |
|---|---|---|
| HXT-RQ-01 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-02 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-03 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-04 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-05 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-06 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-RQ-07 | [requests](execution-ticket-requests.md) | 候補・未実装 |
| HXT-FR-001 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-002 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-003 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-004 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-005 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-006 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-007 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-008 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-009 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-010 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-011 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-012 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-013 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-014 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-015 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-016 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-017 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-018 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-019 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-020 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-021 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-022 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-023 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-024 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-FR-025 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-001 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-002 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-003 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-004 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-005 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-006 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-007 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-008 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-009 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-010 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-011 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-012 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-013 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-014 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-015 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-016 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-017 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-018 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-019 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXB-FR-020 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-001 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-002 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-003 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-004 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-005 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-006 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-007 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-008 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-009 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-010 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-011 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-012 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-013 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-NFR-014 | [requirements](execution-ticket-requirements.md) | 候補・未実装 |
| HXT-AC-001 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-002 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-003 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-004 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-005 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-006 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-007 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-008 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-009 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-010 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-011 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-012 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-013 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-014 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-015 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-016 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-017 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-018 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-019 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-020 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-021 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-022 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-023 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-024 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-025 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-026 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-027 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-028 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-029 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-030 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-031 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-032 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-033 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-034 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-035 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-036 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-037 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-038 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-039 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-040 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-041 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-042 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-043 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-044 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-045 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-046 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-047 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-048 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-049 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXT-AC-050 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-001 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-002 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-003 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-004 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-005 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-006 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-007 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-008 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-009 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-010 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-011 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-012 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-013 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-014 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-015 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-016 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-017 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-018 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-019 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-020 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-021 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-022 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-023 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-024 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-025 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-026 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-027 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-028 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-029 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-030 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-031 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-032 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-033 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-034 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-035 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-036 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-037 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-038 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-039 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |
| HXB-AC-040 | [acceptance](execution-ticket-acceptance.md) | 候補・未実装 |

## NFRの受入束縛

| NFR | 既存ACへの束縛 | 必須追加観点 |
|---|---|---|
| HXT-NFR-001 | HXT-AC-003, HXT-AC-024, HXT-AC-049 | Ticket決定性と入力条件 |
| HXT-NFR-002 | HXT-AC-001, HXT-AC-034, HXT-AC-035 | 影響scope限定拒否 |
| HXT-NFR-003 | HXT-AC-009, HXT-AC-036 | CAS・再送 |
| HXT-NFR-004 | HXT-AC-023, HXT-AC-027, HXT-AC-028 | replay （取込補足：再生検証）|
| HXT-NFR-005 | HXT-AC-050 | 同一artifactでLinux/Windows |
| HXT-NFR-006 | HXT-AC-025, HXT-AC-043, HXT-AC-047 | 秘密と独立性 |
| HXT-NFR-007 | HXT-AC-019 | 状態・欠損可視性 |
| HXT-NFR-008 | HXT-AC-029, HXT-AC-030, HXT-AC-031 | 移行と履歴 |
| HXT-NFR-009 | HXT-AC-049 | baselineと測定条件 |
| HXT-NFR-010 | HXT-AC-017, HXT-AC-037, HXT-AC-045 | 正本非重複 |
| HXT-NFR-011 | HXT-AC-032 | 反復・欠測・統計 |
| HXT-NFR-012 | HXT-AC-033, HXT-AC-035 | 有限費用 |
| HXT-NFR-013 | HXT-AC-013, HXT-AC-016, HXT-AC-042 | 出所・digest |
| HXT-NFR-014 | HXT-AC-025, HXT-AC-027 | retentionと再生範囲 |

NFR-007はHXB-AC-001..008/039、NFR-009はHXB-AC-037/038、NFR-011はHXB-AC-015/016/019/020、
NFR-012はHXB-AC-025/026、NFR-013はHXB-AC-003/004/028、NFR-014はHXB-AC-033/034も必須とする。
NFR-014のretention後replay境界、NFR-009の数値SLO、NFR-005のWindows実測は既存AC文言だけで充足としない。
各sliceの詳細テスト設計で独立fixtureを置き、未確定値はfreeze前に解決する。

## 原子的な後続責務と既存owner

| slice | 対応範囲 | 既存ownerへの接続 |
|---|---|---|
| A | 全source authorityと衝突解消 | #1534、#397 |
| B | HXT-FR-001..012,016 | #860/#819/#213/#1098、schema versionとshadow_compile |
| C | HXT-FR-013..015,018..020; HXB-FR-001..007,014,016,019 | #215/#499/#1295、live observerとbinding canary |
| D | HXT-FR-020; HXB-FR-008..010,018 | #1295/#250/#225、既存runner bridge |
| E | HXB-FR-008..010,017 | #1295/#225、反復と公平性 |
| F | HXB-FR-011..013,017 | #214/#188/#679、scope認可付きshadow |
| G | HXT-FR-023/024; HXB-FR-015/020 | #861/#188/#1500/#659、advisoryと配置 |
| H | HXT-FR-017,019,021,022,025; HXB-FR-018 | #865/#819/#659、段階切替・consumer |

NFRは全sliceに適用し、ACは上記L3のFR対応から導出する。既存IssueをTicket全面完成待ちにする
blanket dependencyは作らない。version target／Release Sliceは#1500で解決するまで未配置。

## 取込検証記録

2026-09-05、Codexによるローカル文書検証。独立reviewではない。
19章＋ヘッダの再構成SHA-256一致、7 RQ／45 FR／14 NFR／90 ACのexact set、
90 AC行からFRへの全参照、候補間リンクの存在を確認した。
PLAN lintはexit 0、日本語文書検査は9文書／違反0。DB rebuildはexit 0、79247 rows。
ここでgreenなのは文書整合であり、90件のruntime oracleを実行したという意味ではない。

初回CIは必須agent_slots欠落で停止した。個別PLAN lintとCI governance gateの検査範囲が異なっていたため、
PLANへ役割枠を追加した。役割枠は作業設計であり、独立review実施の証拠ではない。
修正後はCIと同じ `helix plan lint --gate governance`（1173 PLAN）と
`helix plan lint --gate post-merge-status` がともにexit 0。関連123テストも成功している。

元原稿の再構成は次で再検証できる。日本語の取込補足を除去し、ヘッダのMarkdown改行記法を原稿へ戻す。

```javascript
import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const dir = 'docs/governance/candidates';
const parts = new Map();
for (const file of readdirSync(dir).filter(x => x.startsWith('execution-ticket-'))) {
  const text = readFileSync(`${dir}/${file}`, 'utf8');
  for (const m of text.matchAll(/<!-- eta-source:(header|\d+):start -->\n([\s\S]*?)<!-- eta-source:\1:end -->/g)) {
    assert(!parts.has(m[1]));
    let body = m[2].replace(/（取込補足：[^）]+）/g, '');
    if (m[1] === 'header') body = body.replace(/\\\n/g, '  \n');
    parts.set(m[1], body);
  }
}
assert.equal(parts.size, 20);
const restored = parts.get('header') + Array.from({ length: 19 }, (_, i) => parts.get(String(i))).join('');
assert.equal(createHash('sha256').update(restored).digest('hex'),
  'b84cc126f0946302e90ad9d00f6c031690e2b3eca6474882f9699613e53f8db3');
```
