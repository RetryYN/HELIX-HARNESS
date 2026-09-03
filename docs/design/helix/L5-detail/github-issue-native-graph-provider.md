# GitHub Issue native graph provider 詳細設計

## 1. 目的

GitHub nativeのparent、sub-issue、blocked-by、blockingをprovider adapter境界で取得し、
`IssueNativeGraphSnapshot`へ正規化する。本文authorityとの比較や判断はproviderへ持ち込まない。

## 2. Query契約

repositoryとIssue番号はGraphQL query本文へ埋め込まず、owner、name、numberのtyped variableとして渡す。
Issue stable node IDと4面graphを同じreadで取得する。repository identityとIssue番号は入口で検証する。

## 3. Pagination境界

各connectionは最大100件の最初のpageと`hasNextPage`を取得する。`hasNextPage=true`を空集合や
取得完了へ変換せず、対応する`*Complete=false`としてprojection auditへ渡す。後続bounded pagination
sliceが全pageを収集するまでconvergedにはできない。

## 4. Fail-close

runner非0、JSON不正、repository／Issue欠落、stable ID欠落、Issue番号不一致、connection／node／pageInfo
不正を個別errorとして拒否する。stderrやresponse本文をreceiptへ転記しない。

