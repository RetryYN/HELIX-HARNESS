"""Prepare the pinned external runtime tree and host-path config for local CI.

This tool only reads explicitly supplied paths and the checked-in portable
profile. It does not install, download, execute, or discover runtime software.
"""
from __future__ import annotations

import argparse
import os
from pathlib import Path
import shutil
import stat
import sys

from common import Diagnostic, canonical_bytes, sha256, strict_json


_EXCLUDE_COMPONENTS = frozenset(("__pycache__", "test", "venv"))
_EXECUTABLE_KEYS = frozenset(("python", "git", "bwrap"))


def _fail(detail: str, reason: str = "invalid_input") -> None:
    raise Diagnostic("Rejected", reason, detail)


def _read_json(path: Path, label: str):
    try:
        return strict_json(path.read_bytes())
    except Diagnostic as exc:
        raise Diagnostic("Rejected", "invalid_input", label + " is not valid JSON") from exc
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", label + " could not be read") from exc


def _absolute_path(value: object, label: str) -> Path:
    if not isinstance(value, str) or not value or "\x00" in value:
        _fail(label + " must be a nonempty absolute path")
    path = Path(value)
    if not path.is_absolute():
        _fail(label + " must be a nonempty absolute path")
    return path


def _resolve_existing(value: object, label: str) -> Path:
    path = _absolute_path(value, label)
    try:
        return path.resolve(strict=True)
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", label + " is unavailable") from exc


def _external_existing(value: object, label: str, repo: Path) -> Path:
    spelling = _absolute_path(value, label)
    normalized = Path(os.path.abspath(spelling))
    resolved = _resolve_existing(value, label)
    if _is_within(normalized, repo) or _is_within(resolved, repo):
        _fail(label + " must be outside the repository")
    return resolved


def _is_within(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _output_path(value: object, label: str, repo: Path) -> Path:
    raw = _absolute_path(value, label)
    normalized = Path(os.path.abspath(raw))
    try:
        parent = raw.parent.resolve(strict=True)
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", label + " parent directory is unavailable") from exc
    if not parent.is_dir():
        _fail(label + " parent must be a directory")
    result = parent / raw.name
    if _is_within(normalized, repo) or _is_within(result, repo):
        _fail(label + " must be outside the repository")
    if result.exists() or result.is_symlink():
        _fail(label + " must be a new path")
    return result


def _file_bytes(path: Path, label: str) -> bytes:
    try:
        resolved = path.resolve(strict=True)
        info = resolved.stat()
        if not stat.S_ISREG(info.st_mode):
            _fail(label + " must resolve to a regular file")
        return resolved.read_bytes()
    except Diagnostic:
        raise
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", label + " could not be read") from exc


def tree_digest(files: dict[str, bytes]) -> str:
    """Return the runner-compatible digest for relative paths and file bytes."""
    rows = {name: sha256(data) for name, data in sorted(files.items())}
    return sha256(canonical_bytes(rows))


def _collect_tree(source_value: object, repo_root: Path) -> dict[str, bytes]:
    source_input = _absolute_path(source_value, "stdlib source")
    try:
        root_info = source_input.lstat()
        if not stat.S_ISDIR(root_info.st_mode):
            _fail("stdlib source must be a real directory, not a symlink")
        root = source_input.resolve(strict=True)
    except Diagnostic:
        raise
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "stdlib source is unavailable") from exc

    files: dict[str, bytes] = {}

    def walk_error(_error):
        raise Diagnostic("Unknown", "unreadable", "stdlib source tree could not be traversed")

    try:
        for current, directory_names, file_names in os.walk(root, topdown=True,
                                                              followlinks=False,
                                                              onerror=walk_error):
            base = Path(current)
            kept_directories = []
            for name in sorted(directory_names):
                candidate = base / name
                info = candidate.lstat()
                if stat.S_ISLNK(info.st_mode):
                    _fail("stdlib source contains a symlink directory")
                if not stat.S_ISDIR(info.st_mode):
                    _fail("stdlib source contains a non-directory entry")
                if name not in _EXCLUDE_COMPONENTS:
                    kept_directories.append(name)
            directory_names[:] = kept_directories

            for name in sorted(file_names):
                candidate = base / name
                relative = candidate.relative_to(root).as_posix()
                if any(component in _EXCLUDE_COMPONENTS
                       for component in Path(relative).parts):
                    continue
                info = candidate.lstat()
                if stat.S_ISLNK(info.st_mode):
                    try:
                        resolved = candidate.resolve(strict=True)
                        target_info = resolved.stat()
                    except OSError as exc:
                        raise Diagnostic("Unknown", "unreadable",
                                         "stdlib file symlink target is unavailable") from exc
                    if _is_within(resolved, repo_root):
                        _fail("stdlib file symlink target must be outside the repository")
                    if not stat.S_ISREG(target_info.st_mode):
                        _fail("stdlib file symlink must resolve to a regular file")
                    source = resolved
                elif stat.S_ISREG(info.st_mode):
                    source = candidate
                else:
                    _fail("stdlib source contains a special file")
                try:
                    files[relative] = source.read_bytes()
                except OSError as exc:
                    raise Diagnostic("Unknown", "unreadable",
                                     "stdlib source file could not be read") from exc
    except Diagnostic:
        raise
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "stdlib source tree could not be read") from exc
    if not files:
        _fail("stdlib source tree is empty")
    return files


def _validate_inputs(repo_root: Path, portable: object, host_paths: object):
    if not isinstance(portable, dict) or set(portable) != {"executables", "sandbox"}:
        _fail("portable config fields are malformed")
    executables = portable["executables"]
    sandbox = portable["sandbox"]
    if (not isinstance(executables, dict)
            or set(executables) != _EXECUTABLE_KEYS | {"provider_git"}):
        _fail("portable executable identity set is incomplete")
    provider_git = executables["provider_git"]
    if provider_git is not None:
        if (not isinstance(provider_git, dict)
                or set(provider_git) != {"name", "version", "sha256"}
                or provider_git["name"] != "git"
                or not isinstance(provider_git["version"], str)
                or not provider_git["version"]
                or not isinstance(provider_git["sha256"], str)
                or len(provider_git["sha256"]) != 64
                or any(character not in "0123456789abcdef" for character in provider_git["sha256"])):
            _fail("portable provider Git identity is malformed")
    if not isinstance(sandbox, dict) or "mounts" not in sandbox or "profile_digest" not in sandbox:
        _fail("portable sandbox profile is malformed")
    profile_body = {key: value for key, value in sandbox.items() if key != "profile_digest"}
    if (not isinstance(sandbox["profile_digest"], str)
            or sha256(canonical_bytes(profile_body)) != sandbox["profile_digest"]):
        _fail("portable profile digest does not match its fixed fields", "conflict")
    mounts = sandbox["mounts"]
    if not isinstance(mounts, list) or not mounts:
        _fail("portable runtime mount list is malformed")
    mount_keys = []
    for row in mounts:
        if (not isinstance(row, dict)
                or set(row) != {"host_key", "target", "sha256", "kind"}
                or not isinstance(row["host_key"], str)
                or not isinstance(row["sha256"], str)
                or row["kind"] not in ("file", "tree")):
            _fail("portable runtime mount row is malformed")
        mount_keys.append(row["host_key"])
    if len(set(mount_keys)) != len(mount_keys) or mount_keys.count("stdlib") != 1:
        _fail("portable runtime mount keys are not unique or omit stdlib")

    if not isinstance(host_paths, dict) or set(host_paths) != {"python", "git", "bwrap", "mounts"}:
        _fail("host-path input must contain only python/git/bwrap and mounts")
    local_mounts = host_paths["mounts"]
    if not isinstance(local_mounts, dict) or set(local_mounts) != set(mount_keys):
        _fail("host-path mount keys differ from the portable profile")

    resolved_executables = {}
    for name in sorted(_EXECUTABLE_KEYS):
        path = _external_existing(host_paths[name], name + " executable path", repo_root)
        identity = executables[name]
        if (not isinstance(identity, dict) or set(identity) != {"name", "version", "sha256"}
                or not isinstance(identity["sha256"], str)):
            _fail("portable executable identity is malformed")
        digest = sha256(_file_bytes(path, name + " executable"))
        if digest != identity["sha256"]:
            _fail(name + " executable bytes do not match the portable pin", "conflict")
        resolved_executables[name] = str(path)

    resolved_mounts = {}
    for key, value in local_mounts.items():
        resolved_mounts[key] = _external_existing(value, "mount path " + key, repo_root)
    stdlib_row = next(row for row in mounts if row["host_key"] == "stdlib")
    if stdlib_row["kind"] != "tree":
        _fail("stdlib portable mount must be a tree")
    if not stat.S_ISDIR(resolved_mounts["stdlib"].stat().st_mode):
        _fail("stdlib source must be a directory")

    files = _collect_tree(host_paths["mounts"]["stdlib"], repo_root)
    stdlib_digest = tree_digest(files)
    if stdlib_digest != stdlib_row["sha256"]:
        _fail("prepared stdlib bytes do not match the portable pin", "conflict")

    checked_file_mounts = {}
    for row in mounts:
        key = row["host_key"]
        if key == "stdlib":
            continue
        if row["kind"] != "file":
            _fail("only the pinned stdlib mount may be a tree")
        data = _file_bytes(resolved_mounts[key], "mount " + key)
        if sha256(data) != row["sha256"]:
            _fail("mount bytes do not match the portable pin: " + key, "conflict")
        checked_file_mounts[key] = str(resolved_mounts[key])
    return resolved_executables, checked_file_mounts, files, stdlib_digest


def _write_bundle(destination: Path, files: dict[str, bytes], expected_digest: str) -> None:
    try:
        destination.mkdir(mode=0o700)
    except FileExistsError as exc:
        raise Diagnostic("Rejected", "invalid_input", "bundle output must be a new path") from exc
    try:
        for relative, data in sorted(files.items()):
            target = destination.joinpath(*Path(relative).parts)
            target.parent.mkdir(parents=True, exist_ok=True)
            with target.open("xb") as stream:
                stream.write(data)
        if tree_digest({name: path.read_bytes() for name, path in
                        ((rel, destination.joinpath(*Path(rel).parts)) for rel in files)}) != expected_digest:
            _fail("written stdlib bundle differs from the portable pin", "conflict")
    except BaseException:
        shutil.rmtree(destination, ignore_errors=True)
        raise


def prepare_runtime(repo_root: str | Path, portable_config: str | Path,
                    host_paths_file: str | Path, bundle_output: str | Path,
                    host_config_output: str | Path) -> dict:
    """Verify fixed pins, write a new stdlib bundle and runner host config."""
    try:
        repo = Path(repo_root).resolve(strict=True)
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "repository root is unavailable") from exc
    if not repo.is_dir():
        _fail("repository root must be a directory")

    portable_path = _resolve_existing(str(portable_config), "portable config path")
    try:
        fixed_portable_path = (repo / "scaffold/local-ci/config.json").resolve(strict=True)
    except OSError as exc:
        raise Diagnostic("Unknown", "unreadable", "repository portable config is unavailable") from exc
    if portable_path != fixed_portable_path:
        _fail("portable config must be the repository's fixed local-CI config")
    host_input_spelling = Path(os.path.abspath(
        _absolute_path(str(host_paths_file), "host-path JSON path")))
    host_input = _resolve_existing(str(host_paths_file), "host-path JSON path")
    if _is_within(host_input_spelling, repo) or _is_within(host_input, repo):
        _fail("host-path JSON input must be outside the repository")
    bundle = _output_path(str(bundle_output), "bundle output", repo)
    host_output = _output_path(str(host_config_output), "host config output", repo)
    if bundle == host_output or _is_within(host_output, bundle) or _is_within(bundle, host_output):
        _fail("bundle and host-config outputs must be separate paths")
    if bundle == host_input or host_output == host_input:
        _fail("outputs must not replace the host-path input")
    if bundle == portable_path or host_output == portable_path:
        _fail("outputs must not replace the portable config")
    if not bundle.parent.exists() or not host_output.parent.exists():
        _fail("output parent directories must already exist")

    portable = _read_json(portable_path, "portable config")
    host_paths = _read_json(host_input, "host-path input")
    resolved_executables, file_mounts, files, stdlib_digest = _validate_inputs(repo, portable, host_paths)
    source_root = _resolve_existing(host_paths["mounts"]["stdlib"], "stdlib source")
    if (_is_within(bundle, source_root) or _is_within(source_root, bundle)
            or _is_within(host_output, source_root)):
        _fail("outputs and stdlib source must not overlap")

    host_config = {
        **resolved_executables,
        "mounts": {**file_mounts, "stdlib": str(bundle)},
    }
    published_bundle = False
    created_host_config = False
    try:
        _write_bundle(bundle, files, stdlib_digest)
        published_bundle = True
        encoded = canonical_bytes(host_config) + b"\n"
        descriptor = None
        try:
            descriptor = os.open(host_output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
            created_host_config = True
            with os.fdopen(descriptor, "wb") as stream:
                descriptor = None
                stream.write(encoded)
                stream.flush()
                os.fsync(stream.fileno())
        except FileExistsError as exc:
            raise Diagnostic("Rejected", "invalid_input", "host config output must be a new path") from exc
        except OSError as exc:
            raise Diagnostic("Unknown", "unreadable", "host config output could not be written") from exc
        finally:
            if descriptor is not None:
                os.close(descriptor)
    except BaseException:
        if created_host_config:
            try:
                host_output.unlink()
            except OSError:
                pass
        if published_bundle:
            shutil.rmtree(bundle, ignore_errors=True)
        raise
    return {"bundle_file_count": len(files), "bundle_sha256": stdlib_digest,
            "profile_digest": portable["sandbox"]["profile_digest"]}


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="固定portable pinに合う外部local-CI runtimeを準備")
    parser.add_argument("--repo-root", required=True, help="repository root (absolute path)")
    parser.add_argument("--portable-config", required=True, help="checked-in portable config.json")
    parser.add_argument("--host-paths", required=True, help="external JSON containing explicit host paths")
    parser.add_argument("--bundle-output", required=True, help="new repository-external stdlib directory")
    parser.add_argument("--host-config-output", required=True, help="new repository-external host config JSON")
    args = parser.parse_args(argv)
    try:
        result = prepare_runtime(args.repo_root, args.portable_config, args.host_paths,
                                 args.bundle_output, args.host_config_output)
    except Diagnostic as exc:
        sys.stderr.buffer.write(canonical_bytes(exc.as_dict()) + b"\n")
        return 1
    sys.stdout.buffer.write(canonical_bytes({"status": "prepared", **result}) + b"\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
