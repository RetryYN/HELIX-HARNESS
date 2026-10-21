#!/usr/bin/env python3
"""Last-touch worktree reclaim helper. Dry-run by default; --apply backs up then removes."""
import argparse, datetime as dt, hashlib, json, os, shutil, stat, subprocess, sys, tarfile, tempfile, time
from pathlib import Path

DAY = 86400.0
SECONDS_PER_DAY = DAY

def sh(cmd, cwd=None, check=True, out=None):
    p = subprocess.run([str(x) for x in cmd], cwd=cwd, input=None, stdout=out or subprocess.PIPE, stderr=subprocess.PIPE)
    if check and p.returncode:
        raise RuntimeError("failed %s: %s" % (" ".join(map(str, cmd)), p.stderr.decode("utf-8", "replace").strip()))
    return p

def git(repo, *args, check=True):
    return sh(["git", "-C", repo, *args], check=check)

def main_root(repo):
    p = Path(git(repo, "rev-parse", "--git-common-dir").stdout.decode().strip())
    if not p.is_absolute(): p = Path(repo) / p
    return p.resolve().parent

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

def last_touch(path):
    latest = os.lstat(path).st_mtime
    for base, dirs, files in os.walk(path, followlinks=False):
        for name in dirs + files:
            try: latest = max(latest, os.lstat(os.path.join(base, name)).st_mtime)
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
    target = os.path.realpath(path)
    for pid in filter(str.isdigit, os.listdir("/proc")):
        links = [os.path.join("/proc", pid, x) for x in ("cwd", "root")]
        try: links += [os.path.join("/proc", pid, "fd", x) for x in os.listdir(os.path.join("/proc", pid, "fd"))]
        except OSError: pass
        for link in links:
            try: resolved = os.path.realpath(os.readlink(link))
            except OSError: continue
            if resolved == target or resolved.startswith(target + os.sep):
                return {"pid": int(pid), "path": resolved}
    return None

def open_prs(repo, file):
    if file:
        data = json.loads(Path(file).read_text(encoding="utf-8"))
        if isinstance(data, dict): data = data.get("branches", data.get("open_prs", []))
        return {x.get("headRefName", x.get("branch")) if isinstance(x, dict) else x for x in data}
    if not shutil.which("gh"): return None
    p = sh(["gh", "pr", "list", "--state", "open", "--limit", "200", "--json", "headRefName"], cwd=repo, check=False)
    if p.returncode: return None
    try: return {x["headRefName"] for x in json.loads(p.stdout.decode()) if x.get("headRefName")}
    except (KeyError, TypeError, json.JSONDecodeError): return None

def status_paths(wt):
    out = git(wt, "status", "--porcelain=v1", "-uall", "--ignored=matching", "-z").stdout.decode("utf-8", "surrogateescape")
    return [r[3:] for r in out.split("\0") if r[:2] in ("??", "!!")]

def backup(wt, dest, result):
    dest.mkdir(parents=True, exist_ok=True)
    with open(dest / "head.bundle", "wb") as f: sh(["git", "-C", str(wt), "bundle", "create", "-", "HEAD"], out=f)
    (dest / "worktree.patch").write_bytes(git(wt, "diff", "--binary", "HEAD").stdout)
    paths = status_paths(wt)
    with tarfile.open(dest / "untracked.tar.gz", "w:gz") as tar:
        for rel in paths:
            p = wt / rel
            if os.path.lexists(p): tar.add(p, arcname=rel, recursive=True)
    meta = {"worktree": str(wt), "head": git(wt, "rev-parse", "--verify", "HEAD").stdout.decode().strip(), "untracked": paths}
    (dest / "metadata.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    result["backup"] = {**meta, "dir": str(dest), "bundle": str(dest / "head.bundle"), "patch": str(dest / "worktree.patch"), "untracked_tar": str(dest / "untracked.tar.gz")}

def remove_untracked(wt):
    for rel in sorted(status_paths(wt), key=lambda x: x.count("/"), reverse=True):
        p = wt / rel
        if not os.path.lexists(p): continue
        if os.path.islink(p) or not stat.S_ISDIR(os.lstat(p).st_mode): os.unlink(p)
        else: shutil.rmtree(p)

def branch(ref):
    return ref[11:] if ref and ref.startswith("refs/heads/") else ref

def evaluate(main, entry, now, days, prs):
    path = entry["path"]
    r = {"worktree": path, "branch": branch(entry.get("branch")), "detached": bool(entry.get("detached")), "removed": False}
    resolved = realdir(path)
    if resolved is None: return {**r, "reason": "unsafe_or_missing_path"}
    r["realpath"] = resolved
    if resolved == str(main): return {**r, "reason": "main_checkout"}
    if entry.get("bare") or entry.get("locked") or entry.get("prunable"): return {**r, "reason": "bare_locked_or_prunable"}
    links = risky_links(resolved)
    if links: return {**r, "reason": "junction_or_directory_link", "links": links}
    used = process_using(resolved)
    if used == "unavailable": return {**r, "reason": "process_check_unavailable"}
    if used: return {**r, "reason": "process_in_use", "process": used}
    if r["branch"]:
        if prs is None: return {**r, "reason": "open_pr_check_unavailable"}
        if r["branch"] in prs: return {**r, "reason": "open_pr_branch"}
    touched = last_touch(resolved)
    r["last_touch"] = {"epoch": touched, "at": dt.datetime.fromtimestamp(touched, dt.timezone.utc).isoformat().replace("+00:00", "Z")}
    r["age_days"] = round((now - touched) / DAY, 3)
    if r["age_days"] < days: return {**r, "reason": "fresh"}
    return {**r, "eligible": True, "reason": "eligible"}

def apply_one(main, wt, root, r):
    dest = root / hashlib.sha256(str(wt).encode()).hexdigest()[:16]
    backup(wt, dest, r)
    git(wt, "reset", "--hard", "HEAD")
    remove_untracked(wt)
    if git(wt, "status", "--porcelain=v1", "-uall", "--ignored=matching").stdout.decode().strip():
        raise RuntimeError("worktree still dirty after backup")
    git(main, "worktree", "remove", str(wt))
    r["removed"] = True

def write_json(path, obj):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(path.name + ".tmp")
    tmp.write_text(json.dumps(obj, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    os.replace(tmp, path)

def main(argv=None):
    ap = argparse.ArgumentParser(description="Dry-run or apply last-touch git worktree reclaim.")
    ap.add_argument("--repo", default=".")
    ap.add_argument("--min-age-days", type=float, default=7.0)
    ap.add_argument("--backup-dir", type=Path)
    ap.add_argument("--report", type=Path)
    ap.add_argument("--open-prs-file", type=Path)
    ap.add_argument("--apply", action="store_true")
    ap.add_argument("--now", type=float)
    a = ap.parse_args(argv)
    now = a.now or time.time()
    main = main_root(Path(a.repo).resolve())
    prs = open_prs(main, a.open_prs_file)
    stamp = dt.datetime.fromtimestamp(now, dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    backup_root = a.backup_dir or Path.home() / ".helix-worktree-reclaim" / hashlib.sha256(str(main).encode()).hexdigest()[:12] / stamp
    report = a.report or backup_root / "report.json"
    results = []
    for entry in entries(main):
        r = evaluate(main, entry, now, a.min_age_days, prs)
        if r.get("eligible") and a.apply:
            try:
                apply_one(main, Path(r["realpath"]), backup_root, r)
                r["reason"] = "removed"
            except Exception as e:
                r.update(removed=False, reason="error", error=str(e))
        results.append(r)
    payload = {"schema": "helix-worktree-reclaim-report.v1", "evidence_kind": "scaffold", "authority_effect": "none", "repo": str(main), "apply": a.apply,
               "min_age_days": a.min_age_days, "generated_at": dt.datetime.fromtimestamp(now, dt.timezone.utc).isoformat().replace("+00:00", "Z"),
               "backup_dir": str(backup_root), "open_pr_check": "unavailable" if prs is None else "ok", "worktrees": results,
               "summary": {"entries": len(results), "eligible": sum(bool(x.get("eligible")) for x in results),
                           "removed": sum(bool(x.get("removed")) for x in results),
                           "skipped": sum(not x.get("eligible") for x in results),
                           "errors": sum(x.get("reason") == "error" for x in results)}}
    write_json(report, payload)
    json.dump(payload, sys.stdout, ensure_ascii=False, sort_keys=True, indent=2)
    sys.stdout.write("\n")
    return 1 if payload["summary"]["errors"] else 0

if __name__ == "__main__":
    raise SystemExit(main())
