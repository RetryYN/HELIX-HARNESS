"""Trusted, fixed-policy Git reader. No archive code is executed."""
from __future__ import annotations

from pathlib import Path, PurePosixPath
import re
import subprocess

from common import Diagnostic, sha256

GIT_POLICY = ("--no-pager", "-c", "core.fsmonitor=false", "-c", "core.hooksPath=/dev/null",
              "-c", "core.untrackedCache=false", "-c", "credential.helper=",
              )
GIT_ENV = {"PATH": "/usr/bin:/bin", "LANG": "C.UTF-8", "LC_ALL": "C.UTF-8",
           "GIT_CONFIG_NOSYSTEM": "1", "GIT_CONFIG_GLOBAL": "/dev/null",
           "GIT_TERMINAL_PROMPT": "0", "GIT_OPTIONAL_LOCKS": "0",
           "PYTHONDONTWRITEBYTECODE": "1"}


_FIXED_GIT_POLICY = GIT_POLICY
_FIXED_GIT_ENV = dict(GIT_ENV)

def relative_path(value: str) -> str:
    if not isinstance(value, str) or not value or "\x00" in value or "\\" in value:
        raise Diagnostic("Rejected", "invalid_input", "invalid repository path")
    path = PurePosixPath(value)
    if path.is_absolute() or any(p in (".", "..") for p in value.split("/")):
        raise Diagnostic("Rejected", "invalid_input", "non-relative repository path")
    return value


class GitReader:
    def __init__(self, repo: Path, executable: str, identity: dict):
        if GIT_POLICY != _FIXED_GIT_POLICY or GIT_ENV != _FIXED_GIT_ENV:
            raise Diagnostic("Rejected", "invalid_input", "fixed Git policy cannot be overridden")
        self.repo = Path(repo).resolve()
        self.executable = str(Path(executable).resolve())
        self.identity = dict(identity)
        try:
            digest = sha256(Path(self.executable).read_bytes())
            probe = subprocess.run([self.executable, "--version"], env=GIT_ENV,
                                   capture_output=True, timeout=10, check=False)
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise Diagnostic("Unknown", "unsupported", "Git identity unavailable") from exc
        match = re.fullmatch(rb"git version (\d+)\.(\d+)\.(\d+)\n", probe.stdout)
        if (probe.returncode or not match or tuple(map(int, match.groups())) < (2, 35, 2)
                or identity.get("name") != "git" or digest != identity.get("sha256")
                or probe.stdout.decode().strip().removeprefix("git version ") != identity.get("version")):
            raise Diagnostic("Unknown", "unsupported", "Git identity/version mismatch")
        self._reject_unsafe_local_config()

    def _reject_unsafe_local_config(self):
        """Reject repository config that could include config or launch filters."""
        result = self.invoke("config", "--null", "--list", "--no-includes")
        if result.returncode:
            raise Diagnostic("Unknown", "unreadable", "Git config inspection failed")
        for entry in result.stdout.split(b"\x00"):
            if not entry:
                continue
            key, separator, _value = entry.partition(b"\n")
            if not separator:
                raise Diagnostic("Unknown", "unreadable", "Git config inspection failed")
            normalized = key.lower()
            if (normalized.startswith(b"filter.")
                    or normalized == b"include.path"
                    or (normalized.startswith(b"includeif.") and normalized.endswith(b".path"))):
                # Never include a config value: it may contain a credential or local path.
                raise Diagnostic("Rejected", "invalid_input", "unsafe repository Git config")

    def _reject_ambiguous_ref(self, ref: str):
        """Detect exact shorthand refs that Git would otherwise choose by precedence."""
        if ref.startswith("refs/"):
            candidates = (ref,)
        elif re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._/-]*", ref):
            candidates = tuple("refs/" + prefix + ref for prefix in
                               ("", "heads/", "tags/", "remotes/"))
        else:
            return
        raw_refs = self.read("for-each-ref", "--format=%(refname)")
        try:
            refs = set(raw_refs.decode("utf-8", "strict").splitlines())
        except UnicodeError as exc:
            raise Diagnostic("Unknown", "unsupported", "non-UTF8 ref name") from exc
        if len(refs.intersection(candidates)) > 1:
            raise Diagnostic("Unknown", "ambiguous", "target ref resolves to multiple refs")

    def read(self, *args: str, invalid: bool = False) -> bytes:
        run = self.invoke(*args)
        if run.returncode:
            raise Diagnostic("Rejected" if invalid else "Unknown",
                             "invalid_input" if invalid else "unreadable", "Git read failed")
        return run.stdout

    def invoke(self, *args: str):
        try:
            run = subprocess.run([self.executable, *GIT_POLICY, *args], cwd=self.repo,
                                 env=GIT_ENV, capture_output=True, timeout=60, check=False)
        except (OSError, subprocess.TimeoutExpired) as exc:
            raise Diagnostic("Unknown", "unreadable", "Git read failed") from exc
        return run

    def commit(self, ref: str) -> str:
        if ref is None or ref == "":
            raise Diagnostic("Rejected", "missing_key", "target ref missing")
        if not isinstance(ref, str) or "\x00" in ref:
            raise Diagnostic("Rejected", "invalid_input", "target ref is malformed")
        self._reject_ambiguous_ref(ref)
        return self.read("rev-parse", "--verify", "--end-of-options", ref + "^{commit}",
                         invalid=True).decode("ascii").strip()

    def tree(self, commit: str) -> str:
        return self.read("rev-parse", "--verify", "--end-of-options", commit + "^{tree}").decode().strip()

    def entries(self, tree: str) -> dict[str, tuple[str, str, str]]:
        entries = {}
        for record in self.read("ls-tree", "-r", "-z", tree).split(b"\x00"):
            if not record:
                continue
            meta, raw_path = record.split(b"\t", 1)
            mode, kind, oid = meta.decode("ascii").split()
            try:
                path = relative_path(raw_path.decode("utf-8", "strict"))
            except UnicodeError as exc:
                raise Diagnostic("Unknown", "unsupported", "non-UTF8 repository path") from exc
            entries[path] = (mode, kind, oid)
        return entries

    def blob(self, entries: dict, path: str, expected: str | None = None) -> bytes:
        entry = entries.get(relative_path(path))
        if entry is None:
            raise Diagnostic("Unknown", "missing_input", "declared source absent: " + path)
        mode, kind, oid = entry
        if kind != "blob" or mode not in ("100644", "100755"):
            raise Diagnostic("Unknown", "conflict", "declared source is not a regular blob: " + path)
        data = self.read("cat-file", "blob", oid)
        if expected is not None and sha256(data) != expected:
            raise Diagnostic("Unknown", "conflict", "declared source digest mismatch: " + path)
        return data


def resolve_target(reader: GitReader, base_ref: str, head_ref: str, repository_id: str) -> dict:
    if not repository_id:
        raise Diagnostic("Rejected", "missing_key", "repository identity missing")
    base, head = reader.commit(base_ref), reader.commit(head_ref)
    current = reader.commit("HEAD")
    tree = reader.tree(head)
    if current != head or reader.tree(current) != tree:
        raise Diagnostic("Stale", "target_changed", "requested head differs from checkout")
    merge_base = reader.read("merge-base", base, head).decode().strip()
    target = dict(repository_id=repository_id, base_commit=base, merge_base=merge_base,
                  head_commit=head, head_tree=tree, worktree_clean=True)
    return check_clean_checkout(reader, target)


def check_clean_checkout(reader: GitReader, target: dict) -> dict:
    if (reader.commit("HEAD") != target["head_commit"]
            or reader.tree(target["head_commit"]) != target["head_tree"]
            or reader.read("status", "--porcelain=v1", "-z", "--untracked-files=all")):
        raise Diagnostic("Stale", "target_changed", "checkout is dirty or changed")
    return target
