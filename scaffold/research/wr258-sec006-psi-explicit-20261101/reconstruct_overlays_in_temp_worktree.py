#!/usr/bin/env python3
"""Rebuild WR258 four-layer candidates in an ephemeral worktree at f328."""
import json
import argparse
import hashlib
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

PINNED_COMMIT = 'f32812ea08cc88545ea228e71146738553ae1e35'
REL = Path('scaffold/research/wr258-sec006-psi-explicit-20261101')
OVERLAY_NAMES = ('integrated-overlay-candidate', 'caller-provenance-overlay-candidate')


def run(args, cwd, *, check=True, capture=False):
    return subprocess.run(args, cwd=cwd, check=check, text=True,
                          stdout=subprocess.PIPE if capture else None,
                          stderr=subprocess.PIPE if capture else None)


def summarize(report):
    four = report['negative_4way']
    return {
        'exit_code': 0 if report['passed'] else 1,
        'overall_passed': report['passed'],
        'l4_l9_pair_passed': report['L4_L9_pair']['passed'],
        'l5_l8_pair_passed': report['L5_L8_pair']['passed'],
        'fourway_passed': four['passed'],
        'class_rows': four['class_row_counts'],
        'case_rows': four['case_row_counts'],
        'matched_case_count': four['matched_case_count'],
        'failure_count': len(four['failures']),
        'failure_groups': _failure_groups(four['failures']),
    }


def _failure_groups(failures):
    counts = {}
    for failure in failures:
        key = (failure.get('layer'), failure.get('attribute'), failure.get('reason'))
        counts[key] = counts.get(key, 0) + 1
    return [
        {'layer': key[0], 'attribute': key[1], 'reason': key[2], 'count': count}
        for key, count in sorted(counts.items())
    ]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--record', help='新しい記録先。既存ファイルは上書きしない。')
    args = parser.parse_args()
    if args.record and Path(args.record).exists():
        raise FileExistsError(f'record_path_must_be_new:{args.record}')
    repo = Path(__file__).resolve().parents[3]
    with tempfile.TemporaryDirectory(prefix='wr258-reconstruct-') as temp:
        worktree = Path(temp) / 'source'
        run(['git', 'worktree', 'add', '--quiet', '--detach', str(worktree), PINNED_COMMIT], repo, capture=True)
        try:
            actual = run(['git', 'rev-parse', 'HEAD'], worktree, capture=True).stdout.strip()
            if actual != PINNED_COMMIT:
                raise RuntimeError(f'pinned_revision_mismatch:{actual}')

            # f328 retained the full generated copies as historical evidence.
            # Remove only those copies inside this disposable worktree so the
            # procedure proves they can be recreated from fixed source inputs.
            inventory_path = repo / REL / 'f328-overlay-disposition.json'
            inventory = json.loads(inventory_path.read_text())
            verified_historical_copies = 0
            for item in inventory['files']:
                historical_path = worktree / item['path']
                actual_hash = hashlib.sha256(historical_path.read_bytes()).hexdigest()
                if actual_hash != item['sha256']:
                    raise RuntimeError(f'historical_overlay_hash_mismatch:{item["path"]}')
                verified_historical_copies += 1
            for name in OVERLAY_NAMES:
                shutil.rmtree(worktree / REL / name, ignore_errors=True)

            results = {}
            for name in OVERLAY_NAMES:
                out = worktree / REL / name
                run([sys.executable, str(REL / 'build_overlay_probe.py'), '--out', str(out)], worktree, capture=True)
                if name == 'caller-provenance-overlay-candidate':
                    run([sys.executable, str(REL / 'build_caller_provenance_overlay.py'), str(out)], worktree, capture=True)
                checker_args = [
                    sys.executable, str(REL.parent.parent / 'tools/design_verification_checker.py'),
                    'check-child', '--root', '.',
                    '--l4', str(out / 'l4.json'), '--l5', str(out / 'l5.json'),
                    '--l8', str(out / 'l8.json'), '--l9', str(out / 'l9.json'),
                ]
                checked = run(checker_args, worktree, check=False, capture=True)
                if checked.returncode not in (0, 1):
                    raise RuntimeError(f'check_child_execution_failed:{checked.returncode}:{checked.stderr}')
                results[name] = summarize(json.loads(checked.stdout))

            report = {
                'schema': 'wr258-temp-worktree-overlay-reconstruction.v1',
                'evidence_kind': 'scaffold', 'authority_effect': 'none',
                'fixed_commit': PINNED_COMMIT,
                'worktree_head_verified': actual,
                'historical_full_copy_hashes_verified_before_rebuild': verified_historical_copies,
                'generated_outputs_left_in_main_worktree': False,
                'results': results,
            }
            serialized = json.dumps(report, ensure_ascii=False, indent=2) + '\n'
            if args.record:
                target = Path(args.record)
                with target.open('x', encoding='utf-8') as stream:
                    stream.write(serialized)
            print(serialized, end='')
        finally:
            run(['git', 'worktree', 'remove', '--force', str(worktree)], repo, check=False, capture=True)


if __name__ == '__main__':
    main()
