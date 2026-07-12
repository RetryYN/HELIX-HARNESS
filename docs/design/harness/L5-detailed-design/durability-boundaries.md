---
layer: L5
sub_doc: module-decomposition
status: draft
pair_artifact: docs/test-design/harness/L9-durability-boundaries-integration.md
plan: docs/plans/PLAN-L6-78-durability-boundary-design.md
---

# diagnostic redaction / autonomous-loop durability 詳細設計

## 1. 目的と脅威境界

doctorの診断可能性を保ったまま例外由来のsecret、credential、PII、個人absolute path、SQLを漏らさない。
またautonomous loopのprocess crash、partial write、同時writer、state corruptionをmissingへ縮退させず、外部
side effectの二重実行を防ぐ。filesystemの完全復旧や外部side effectのexactly-once保証は主張せず、曖昧な
状態はblock/escalateする。

## 2. module境界

| module                   | 責務                                                                      | 禁止事項                                   |
| ------------------------ | ------------------------------------------------------------------------- | ------------------------------------------ |
| stable cause digest      | arbitrary thrown valueを有限kindとtyped SHA-256へ変換                     | raw message/stack/path/SQLの返却、例外送出 |
| doctor failure mapper    | check ID、safe reason code、cause digestを構成                            | catchごとの独自redaction                   |
| durable atomic file port | same-directory temp、file fsync、rename、可能なplatformでdir fsync        | direct target write、共有temp名            |
| loop epoch transaction   | state、iteration receipt、commit manifestを単一epochへ束縛                | 二つの独立authoritative write              |
| loop recovery            | manifestとdigestからmissing/corrupt/uncommitted/committed/ambiguousを分類 | corruptをmissing扱い、自動delete/move      |

既存のatomic publish実装を共通primitiveへ抽出して再利用し、loop専用copyを増やさない。Windowsではsame-volume
rename + file fsyncをportable境界とし、POSIXではparent directory fsyncも要求する。

## 3. diagnostic redaction contract

cause kindは `error | string | object | primitive | inaccessible` の有限集合とする。digest入力は型tagと安全に
取得できたbounded scalarだけでcanonical化し、SHA-256を返す。Proxy trap、throwing getter、cycle、巨大値でも
helper自体はthrowせず、raw causeはterminal、JSON、DB、artifactへ渡さない。doctorのcatchは共通mapperを通し、
意図したcleanup fail-openだけをallowlist marker付き例外とする。

## 4. loop epochとcrash recovery

epochはplan ID、monotonic epoch ID、previous committed epoch digest、state digest、iteration receipt digest、
side-effect phase (`not_started | intent_recorded | completed`)を持つ。新epochはtemp payload fsync、payload rename、
commit manifest fsync/renameの順でpublishする。readerがauthoritativeとするのはdigest検証済みcommit manifestが指す
payloadだけである。

- manifest前のorphan temp/payloadはuncommittedとして実行対象にしない。
- manifestありでpayload欠落・digest不一致・JSON/schema不正はcorruptとしてblockする。
- previous digest不一致または同一previousから複数commit候補があればconcurrent conflictとしてblockする。
- `intent_recorded`後で外部side effect完了証明が無いC0曖昧状態は自動retryせずhuman/escalation routeへ送る。
- iteration historyはwhole-file read/modify/writeを廃止し、epoch payloadまたはappend lock/CASでlost updateを防ぐ。

quarantineは診断分類であり、readerが自動move/deleteしてはならない。repairは別の明示commandとapproval境界を持つ。
