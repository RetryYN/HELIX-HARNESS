# CI Critical-path Scheduler L6設計

## 責務

`CiVerificationPlan`のrequired obligation exact setを不変入力として受け取り、typed telemetry、runner compatibility、
resource budget、exclusive resource、artifact localityから実行配置だけを決定する。verification選定、test生成、workflow実行、
deferred obligation回収は所有しない。

## 入力authority

- candidate/base HEAD、Verification Plan digest、Registry digest
- obligation DAGとobligation class
- source HEAD、lockfile、Node/toolchain、platform、artifact digest
- p50/p95、variance、queue、flake、cache、CPU/memoryのbounded telemetry
- runner quota、最大並列度、exclusive resourceのlease/fence token

telemetryがstale、標本不足、identity不一致の場合は推測値で最適化せず、安全な既定DAGへfallbackする。required obligationを
skipして高速化してはならない。

## 出力契約

- obligation exact setとdependency closureを保存したexecution DAG
- job placement、parallel group、resource class、artifact reuse decision
- critical path予測、runner-minute予測、failure feedback latency予測
- fallback reason、rejected artifact/resource finding、plan digest
- local→boundary→global/releaseのphase順と、先行phase failure時に未開始heavy nodeだけを止めるbounded cancel policy

artifact reuseはsource HEAD、lockfile、Node/toolchain、platform、input/output digestの全一致を要求する。statefulまたはglobal
mutable resourceはactive leaseとfence tokenなしに並列配置しない。
bounded cancelはrequired obligationを削除せず、同一runで未開始のheavy nodeを停止対象としてreceiptへ残し、後続terminal
recovery obligationを#1208へ引き渡す。

## failure境界

wrong HEAD/platform/lockfile/toolchain artifact、dependency逆転、cycle、resource conflict、quota超過、stale telemetry、
lease/fence欠落を別findingでfail-closeする。安全fallbackが成立する場合もfindingとfallback reasonをreceiptへ残す。
