#!/usr/bin/env python3
"""Dry-run first last-touch worktree reclaim helper.

Only clean, merged, stale worktrees are removed by ``git worktree remove`` (never
``--force``). Dirty or unmerged worktrees are preserved in a verified backup and
reported instead of being destructively cleaned.
"""
import argparse, datetime as dt, fcntl, hashlib, json, os, shutil, stat, subprocess, sys, tarfile, tempfile, time
from pathlib import Path

DAY = 86400.0


def sh(cmd, cwd=None, check=True, out=None):
    p = subprocess.run([str(x) for x in cmd], cwd=cwd, stdout=out or subprocess.PIPE, stderr=subprocess.PIPE)
    if check and p.returncode:
        raise RuntimeError("failed %s: %s" % (" ".join(map(str, cmd)), p.stderr.decode("utf-8", "replace").strip()))
    return p


def git(repo, *args, check=True):
    return sh(["git", "-C", repo, *args], check=check)


def main_root(repo):
    p = Path(git(repo, "rev-parse", "--git-common-dir").stdout.decode().strip())
    return (p if p.is_absolute() else Path(repo) / p).resolve().parent


def entries(repo):
    items, cur = [], None
    for rec in git(repo, "worktree", "list", "--porcelain", "-z").stdout.decode("utf-8", "surrogateescape").split("\0"):
        if rec.startswith("worktree "):
            if cur: items.append(cur)
            cur = {"path": rec[9:]}
        elif cur:
            if rec.startswith("HEAD "): cur["head"] = rec[5:]
            elif rec.startswith("branch "): cur["branch"] = rec[7:]
            elif rec in ("detached", "bare"): cur[rec] = True
            elif rec.startswith("locked"): cur["locked"] = True
            elif rec.startswith("prunable"): cur["prunable"] = True
    if cur: items.append(cur)
    return items


def realdir(path):
    try:
        a, r = os.path.abspath(path), os.path.realpath(path)
    except OSError:
        return None
    return r if a == r and os.path.isdir(r) and not os.path.islink(path) else None


def latest_mtime(path):
    latest = os.lstat(path).st_mtime
    for base, dirs, files in os.walk(path, followlinks=False):
        for name in dirs + files:
            try: latest = max(latest, os.lstat(os.path.join(base, name)).st_mtime)
            except OSError: pass
    return latest


def git_dir(wt):
    p = Path(git(wt, "rev-parse", "--git-dir").stdout.decode().strip())
    return (p if p.is_absolute() else wt / p).resolve()


def last_touch(wt):
    latest = latest_mtime(wt)
    gd = git_dir(wt)
    for name in ("HEAD", os.path.join("logs", "HEAD")):
        try: latest = max(latest, os.lstat(gd / name).st_mtime)
        except OSError: pass
    return latest


def isjunction(path):
    f = getattr(os.path, "isjunction", None)
    try: return bool(f and f(path))
    except OSError: return True


def risky_links(root):
    found = []
    for base, dirs, files in os.walk(root, followlinks=False):
        for name in dirs + files:
            p = os.path.join(base, name)
            try:
                if (os.path.islink(p) or isjunction(p)) and os.path.isdir(p):
                    found.append({"path": os.path.relpath(p, root), "target": os.path.realpath(p)})
            except OSError:
                found.append({"path": os.path.relpath(p, root), "target": None})
    return found


def process_using(path):
    if not os.path.isdir("/proc"): return "unavailable"
    target, uid, unreadable = os.path.realpath(path), os.getuid(), False
    for pid in filter(str.isdigit, os.listdir("/proc")):
        proc_dir = os.path.join("/proc", pid)
        try:
            if os.stat(proc_dir).st_uid != uid: continue
        except OSError: continue
        links = [os.path.join(proc_dir, x) for x in ("cwd", "root")]
        try: links += [os.path.join(proc_dir, "fd", x) for x in os.listdir(os.path.join(proc_dir, "fd"))]
        except FileNotFoundError: pass
        except OSError: unreadable = True
        for link in links:
            try: resolved = os.path.realpath(os.readlink(link))
            except FileNotFoundError: continue
            except OSError:
                unreadable = True; continue
            if resolved == target or resolved.startswith(target + os.sep):
                return {"pid": int(pid), "path": resolved}
    return "unavailable" if unreadable else None


def open_prs(repo, file):
    if file:
        data = json.loads(Path(file).read_text(encoding="utf-8"))
        if isinstance(data, dict): data = data.get("branches", data.get("open_prs", []))
        return {x.get("headRefName", x.get("branch")) if isinstance(x, dict) else x: (x.get("headRefOid") if isinstance(x, dict) else None) for x in data}
    if not shutil.which("gh"): return None
    p = sh(["gh", "pr", "list", "--state", "open", "--limit", "200", "--json", "headRefName,headRefOid"], cwd=repo, check=False)
    if p.returncode: return None
    try:
        rows = json.loads(p.stdout.decode())
        if len(rows) >= 200: return None
        return {x["headRefName"]: x.get("headRefOid") for x in rows if x.get("headRefName")}
    except (KeyError, TypeError, json.JSONDecodeError): return None


def status_rows(wt):
    out = git(wt, "status", "--porcelain=v1", "-uall", "--ignored=matching", "-z").stdout.decode("utf-8", "surrogateescape")
    return [r for r in out.split("\0") if r]


def status_paths(wt, codes):
    return [r[3:] for r in status_rows(wt) if r[:2] in codes]


def git_busy(wt):
    gd = git_dir(wt)
    names = ["MERGE_HEAD", "CHERRY_PICK_HEAD", "REBASE_HEAD", "index.lock"]
    dirs = ["rebase-merge", "rebase-apply"]
    return any((gd / x).exists() for x in names + dirs)


def branch(ref):
    return ref[11:] if ref and ref.startswith("refs/heads/") else ref


def merged(repo, head):
    base = "origin/main" if git(repo, "rev-parse", "--verify", "origin/main", check=False).returncode == 0 else "main"
    return git(repo, "merge-base", "--is-ancestor", head, base, check=False).returncode == 0


def inside(child, parent):
    try: return os.path.commonpath((os.path.realpath(child), os.path.realpath(parent))) == os.path.realpath(parent)
    except (OSError, ValueError): return True


def backup(main, wt, dest, result):
    patch = dest / "worktree.patch"
    patch.write_bytes(git(wt, "diff", "--binary", "HEAD").stdout)
    untracked = status_paths(wt, ("??",))
    copied, omitted, total = [], [], 0
    with tarfile.open(dest / "untracked.tar.gz", "w:gz") as tar:
        for rel in untracked:
            p = wt / rel
            if not os.path.lexists(p): continue
            size = os.lstat(p).st_size
            if total + size > 64 * 1024 * 1024:
                omitted.append(rel); continue
            tar.add(p, arcname=rel, recursive=True); copied.append(rel); total += size
    if not merged(main, git(wt, "rev-parse", "--verify", "HEAD").stdout.decode().strip()):
        git(wt, "bundle", "create", str(dest / "unique-commits.bundle"), "HEAD", "--not", "origin/main" if git(main, "rev-parse", "--verify", "origin/main", check=False).returncode == 0 else "main")
        git(wt, "bundle", "verify", str(dest / "unique-commits.bundle"))
    with tarfile.open(dest / "untracked.tar.gz", "r:gz") as tar: tar.getnames()
    meta = {"worktree": str(wt), "head": git(wt, "rev-parse", "--verify", "HEAD").stdout.decode().strip(), "untracked": copied, "untracked_omitted": omitted, "ignored": status_paths(wt, ("!!",))}
    (dest / "metadata.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    result["backup"] = {**meta, "dir": str(dest), "patch": str(patch), "untracked_tar": str(dest / "untracked.tar.gz")}


def evaluate(repo, main, entry, now, days, prs, backup_root, report_path):
    path, r = entry["path"], {"worktree": entry["path"], "branch": branch(entry.get("branch")), "detached": bool(entry.get("detached")), "removed": False}
    resolved = realdir(path)
    if resolved is None or os.path.ismount(resolved): return {**r, "reason": "unsafe_or_missing_path"}
    r["realpath"] = resolved
    if resolved == str(main): return {**r, "reason": "main_checkout"}
    if entry.get("bare") or entry.get("locked") or entry.get("prunable"): return {**r, "reason": "bare_locked_or_prunable"}
    if inside(backup_root, resolved) or inside(report_path, resolved): return {**r, "reason": "output_inside_worktree"}
    links = risky_links(resolved)
    if links: return {**r, "reason": "junction_or_directory_link", "links": links}
    used = process_using(resolved)
    if used == "unavailable": return {**r, "reason": "process_check_unavailable"}
    if used: return {**r, "reason": "process_in_use", "process": used}
    if prs is None: return {**r, "reason": "open_pr_check_unavailable"}
    try:
        if git_busy(resolved): return {**r, "reason": "git_operation_in_progress"}
    except RuntimeError: return {**r, "reason": "git_dir_unavailable"}
    if r["branch"] and r["branch"] in prs: return {**r, "reason": "open_pr_branch"}
    if r["detached"] and entry.get("head") in set(prs.values()): return {**r, "reason": "open_pr_head"}
    try: touched = last_touch(resolved)
    except RuntimeError: return {**r, "reason": "git_dir_unavailable"}
    r["last_touch"] = {"epoch": touched, "at": dt.datetime.fromtimestamp(touched, dt.timezone.utc).isoformat().replace("+00:00", "Z")}
    r["age_days"] = round((now - touched) / DAY, 3)
    if r["age_days"] < days: return {**r, "reason": "fresh"}
    rows = status_rows(resolved)
    if rows: return {**r, "reason": "backup_only_dirty", "status_count": len(rows), "preserve": True}
    if not merged(main, entry.get("head") or "HEAD"): return {**r, "reason": "backup_only_unmerged", "preserve": True}
    return {**r, "eligible": True, "reason": "eligible"}


def apply_one(main, wt, r, journal):
    # Re-check immediately before removal; git itself still supplies the final no-force guard.
    if process_using(wt): raise RuntimeError("process appeared before removal")
    if status_rows(wt): raise RuntimeError("worktree became dirty before removal")
    journal.write(json.dumps({"action": "worktree_remove", "worktree": str(wt), "head": git(wt, "rev-parse", "--verify", "HEAD").stdout.decode().strip(), "at": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z")}, ensure_ascii=False) + "\n")
    journal.flush()
    git(main, "worktree", "remove", str(wt))
    r["removed"] = True


def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)


def main(argv=None):
    ap = argparse.ArgumentParser(description="Dry-run or apply last-touch git worktree reclaim.")
    ap.add_argument("--repo", default="."); ap.add_argument("--min-age-days", type=float, default=7.0)
    ap.add_argument("--backup-dir", type=Path); ap.add_argument("--report", type=Path); ap.add_argument("--open-prs-file", type=Path)
    ap.add_argument("--apply", action="store_true"); ap.add_argument("--now", type=float)
    a = ap.parse_args(argv)
    now, repo = a.now or time.time(), Path(a.repo).resolve()
    main = main_root(repo)
    prs = open_prs(main, a.open_prs_file)
    stamp = dt.datetime.fromtimestamp(now, dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_root = a.backup_dir or Path.home() / ".helix-worktree-reclaim" / hashlib.sha256(str(main).encode()).hexdigest()[:12] / stamp
    report = a.report or backup_root / "report.json"
    results = []
    lock = None
    if a.apply:
        backup_root.mkdir(parents=True, exist_ok=True)
        lock = open(backup_root / "reclaim.lock", "a+", encoding="utf-8")
        try: fcntl.flock(lock.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
        except OSError: raise SystemExit("another worktree_reclaim --apply is running")
        journal = open(backup_root / "events.jsonl", "a", encoding="utf-8")
    else:
        journal = None
    for index, entry in enumerate(entries(main)):
        r = evaluate(repo, main, entry, now, a.min_age_days, prs, backup_root, report)
        if index == 0: r = {**r, "reason": "main_checkout", "eligible": False, "preserve": False, "removed": False}
        if a.apply:
            try:
                if r.get("preserve"):
                    dest = backup_root / ("%s-%s-%s" % (stamp, os.getpid(), hashlib.sha256(str(r["realpath"]).encode()).hexdigest()[:8]))
                    tmp = Path(tempfile.mkdtemp(prefix=dest.name + ".tmp-", dir=backup_root))
                    backup(main, Path(r["realpath"]), tmp, r)
                    os.rename(tmp, dest)
                    for key, value in list(r["backup"].items()):
                        if isinstance(value, str) and value.startswith(str(tmp)):
                            r["backup"][key] = value.replace(str(tmp), str(dest), 1)
                    r["reason"] += "_backed_up"
                elif r.get("eligible"):
                    apply_one(main, Path(r["realpath"]), r, journal); r["reason"] = "removed"
            except Exception as e: r.update(removed=False, reason="error", error=str(e))
        results.append(r)
    payload = {"schema": "helix-worktree-reclaim-report.v1", "evidence_kind": "scaffold", "authority_effect": "none", "repo": str(main),
               "apply": a.apply, "min_age_days": a.min_age_days, "generated_at": dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat().replace("+00:00", "Z"),
               "backup_dir": str(backup_root), "open_pr_check": "unavailable" if prs is None else "ok", "worktrees": results,
               "summary": {"entries": len(results), "eligible": sum(bool(x.get("eligible")) for x in results), "preserved": sum(bool(x.get("preserve")) for x in results),
                           "removed": sum(bool(x.get("removed")) for x in results), "skipped": sum(not x.get("eligible") and not x.get("preserve") for x in results),
                           "errors": sum(x.get("reason") == "error" for x in results)}}
    if lock:
        journal.close(); fcntl.flock(lock.fileno(), fcntl.LOCK_UN); lock.close()
    if a.apply or a.report: write_json(report, payload)
    json.dump(payload, sys.stdout, ensure_ascii=False, sort_keys=True, indent=2); sys.stdout.write("\n")
    return 1 if payload["summary"]["errors"] or prs is None else 0


if __name__ == "__main__": raise SystemExit(main())
