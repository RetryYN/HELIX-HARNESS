---
layer: L5
sub_doc: module-decomposition
status: confirmed
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
| epoch claim port         | plan-scoped `O_EXCL` claimでwriterを直列化                                | claim無しのcheck-then-rename               |
| loop epoch transaction   | state、iteration receipt、commit manifestを単一epochへ束縛                | 二つの独立authoritative write              |
| loop recovery            | manifestとdigestからmissing/corrupt/uncommitted/committed/ambiguousを分類 | corruptをmissing扱い、自動delete/move      |

既存のatomic publish実装を共通primitiveへ抽出して再利用し、loop専用copyを増やさない。Windowsではsame-volume
rename + file fsyncをportable境界とし、POSIXではparent directory fsyncも要求する。

## 3. diagnostic redaction contract

cause kindは `error | string | object | primitive | inaccessible` の有限集合とする。digest入力は型tagと有限の
allowlist済み分類だけでcanonical化し、SHA-256を返す。raw message/stack/path/SQL/string値/object scalar値は
hash入力にも含めない。Proxy trap、throwing getter、cycle、巨大値でも
helper自体はthrowせず、raw causeはterminal、JSON、DB、artifactへ渡さない。doctorのcatchは共通mapperを通し、
意図したcleanup fail-openだけをallowlist marker付き例外とする。

## 4. loop epochとcrash recovery

epochはplan ID、monotonic epoch ID、previous committed epoch digest、state digest、iteration receipt digest、
side-effect phase (`not_started | intent_recorded | completed`)を持つ。新epochはtemp payload fsync、payload rename、
commit manifest fsync/renameの順でpublishする。readerがauthoritativeとするのはdigest検証済みcommit manifestが指す
payloadだけである。writerはplan-scoped claimを`O_CREAT|O_EXCL`で取得し、取得後にprevious digestを再検査する。
live claimはblockし、stale claimはowner liveness、bounded lease、manifest digestを検証する明示recoveryなしに奪取しない。

- manifest前のorphan temp/payloadはuncommittedとして実行対象にしない。
- manifestありでpayload欠落・digest不一致・JSON/schema不正はcorruptとしてblockする。
- previous digest不一致または同一previousから複数commit候補があればconcurrent conflictとしてblockする。
- `intent_recorded`後で外部side effect完了証明が無いC0曖昧状態は自動retryせずhuman/escalation routeへ送る。
- iteration historyはwhole-file read/modify/writeを廃止し、epoch payloadまたはappend lock/CASでlost updateを防ぐ。

| window | fault point                           | restart classification                                                                                 |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| C0     | side-effect intent後、結果証明前      | `ambiguous_side_effect`、自動retry禁止                                                                 |
| C1     | claim取得前/直後                      | 旧epoch、またはlive/stale claim診断                                                                    |
| C2     | payload temp write中                  | 旧epoch + `uncommitted`                                                                                |
| C3     | payload fsync後、rename前             | 旧epoch + `uncommitted`                                                                                |
| C4     | payload rename後、manifest前          | 旧epoch + orphan payload                                                                               |
| C5     | manifest rename後、dir durability前   | 全platformで`durability_uncertain`としてblock。capabilityは診断metadataに限りcommitted判定を緩和しない |
| C6     | manifest dir fsync後、claim release前 | C5と識別不能なため`durability_uncertain`でblock                                                        |

claim releaseとparent directory durabilityが完了し残留claimが無い場合だけ新epochをcommittedとして採用する。
readerは推測でC5/C6を分離しない。

quarantineは診断分類であり、readerが自動move/deleteしてはならない。repairは別の明示commandとapproval境界を持つ。

外部side effectは`intent_recorded` epochのmanifestがdurableかつdigest検証済みとなった後だけ開始する。effectを
先行させる実装は禁止し、gate failureはeffect callbackを呼ばない。effect開始後からcompletion commit前までの
停止は常にC0となる。

claim ownerはPID、process start token、boot identity、monotonic lease deadlineを持つ。期限切れでも通常writerは
奪取せず、snapshot-bound recovery packetとrecovery用`O_EXCL` claim、権限・監査が揃った場合だけtombstone化する。
wall clock単独判定とPID再利用を信頼しない。
