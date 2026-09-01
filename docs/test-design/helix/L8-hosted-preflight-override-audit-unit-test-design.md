# Hosted Preflight Override Audit Unit Test Design

## Oracle

- reasonなしoverrideをexit 2で拒否する。
- hook非強制ackなしのpreflightを拒否する。
- 理由付きoverrideをDBへ一度だけ記録する。
- 同一session／reason／targetのnonce再利用を拒否する。
- 通常preflightはgit status digestをaudit evidenceとして出力する。
