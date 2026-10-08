"""The fixed five-check plan; callers cannot replace commands or selection."""
from common import CHECK_IDS, Diagnostic, canonical_bytes, sha256
from target import GIT_ENV, GIT_POLICY

COMMAND_TEMPLATES = (
    ("python3", "-B", "scaffold/tools/scfctl.py", "validate"),
    ("python3", "-B", "scaffold/tools/scfctl.py", "stale"),
    ("python3", "-B", "scaffold/governance/tools/govcheck.py"),
    ("git", "diff", "--check", "--no-ext-diff", "--no-textconv", "{merge_base}", "{head_commit}", "--"),
    ("python3", "-B", "scaffold/local-ci/design_check.py"),
)


_FIXED_COMMAND_TEMPLATES = COMMAND_TEMPLATES

def compile_plan(target: dict, portable_config: dict, manifest_digest: str,
                 manifest_version: str) -> dict:
    if len(COMMAND_TEMPLATES) < len(CHECK_IDS):
        raise Diagnostic("Unknown", "missing_input", "required fixed plan step absent")
    if COMMAND_TEMPLATES != _FIXED_COMMAND_TEMPLATES:
        raise Diagnostic("Rejected", "invalid_input", "fixed command plan cannot be overridden")
    config = {"version": "1", "commands": COMMAND_TEMPLATES,
              "selection": [{"required": True, "local": True, "merge_unit": i == 3}
                            for i in range(5)],
              "manifest_version": manifest_version, "timeout_seconds": 300,
              "term_grace_seconds": 5, "runtime": portable_config,
              "git_policy": GIT_POLICY, "git_environment": GIT_ENV}
    commands = []
    for index, (check_id, template) in enumerate(zip(CHECK_IDS, COMMAND_TEMPLATES)):
        commands.append({"check_id": check_id,
                         "argv": [part.format(**target) for part in template],
                         "cwd_rel": ".", "selection": config["selection"][index],
                         "timeout_seconds": 300})
    return {"target": target, "contract_id": "OS-LOCAL-CI-001", "contract_version": "1",
            "selected_check_ids": list(CHECK_IDS), "selection_basis": "fixed_local_ci_contract",
            "config_digest": sha256(canonical_bytes(config)),
            "design_manifest_digest": manifest_digest, "commands": commands, "state": "success"}
