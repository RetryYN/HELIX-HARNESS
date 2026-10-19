#!/usr/bin/env python3
"""仮設パケットの改変・取り違えを検出する。旧testを使用しない。"""
import copy
import json
import subprocess
import sys
import unittest
import packet as p


class PacketChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.head = p.git("rev-parse", "HEAD").decode().strip()
        cls.base = p.git("rev-parse", "HEAD^").decode().strip()
        cls.request = json.loads(subprocess.check_output([
            sys.executable, "-B", str(p.Path(__file__).with_name("packet.py")), "build",
            "--base", cls.base, "--head", cls.head, "--pr", "1", "--request-id", "SELFTEST-ONLY",
            "--author", "codex", "--purpose", "仮設形式検査", "--scope", "合成入力のみ"], cwd=p.ROOT))

    def check(self, packet):
        p.validate(packet, self.base, self.head)

    def response(self):
        r = {k: self.request[k] for k in ("request_id", "base_sha", "content_sha", "reviewer")}
        r.update(schema="scaffold-review-response.v1", evidence_kind="scaffold", authority_effect="none",
                 request_payload_sha256=self.request["payload_sha256"], result="no_findings", findings=[], unreviewed=[])
        return r

    def test_roundtrip(self):
        self.check(self.request)
        p.validate_response(self.response(), self.request)

    def test_stale_head(self):
        with self.assertRaises(ValueError):
            p.validate(self.request, self.head, self.base)

    def test_payload_tamper(self):
        r = copy.deepcopy(self.request)
        r["purpose"] += "改変"
        with self.assertRaises(ValueError): self.check(r)

    def test_reference_omission(self):
        r = copy.deepcopy(self.request)
        r["references"].pop()
        with self.assertRaises(ValueError): self.check(r)

    def test_candidate_promotion(self):
        r = copy.deepcopy(self.request)
        r["references"][-1]["kind"] = "project_rule"
        with self.assertRaises(ValueError): self.check(r)

    def test_same_runtime(self):
        r = copy.deepcopy(self.request)
        r["reviewer"] = r["author"]
        with self.assertRaises(ValueError): self.check(r)

    def test_worker_runtime_roles(self):
        # PRの作成側・review側はClaudeとCodexだけ。DevinとAntigravityは作業結果を返す作業側に限る。
        for author, reviewer in (("devin", "claude"), ("antigravity", "codex"), ("claude", "devin")):
            r = copy.deepcopy(self.request)
            r.update(author=author, reviewer=reviewer)
            core = {k: v for k, v in r.items() if k != "payload_sha256"}
            r["payload_sha256"] = p.sha(p.encode(core))
            with self.assertRaises(ValueError): self.check(r)

    def test_work_packet(self):
        work = json.loads(subprocess.check_output([
            sys.executable, "-B", str(p.Path(__file__).with_name("packet.py")), "build-work",
            "--base", self.base, "--issue", "1", "--request-id", "WORK-SELFTEST", "--dispatcher", "codex",
            "--worker", "devin", "--purpose", "仮設形式検査", "--scope", "合成入力のみ"], cwd=p.ROOT))
        p.validate_work(work, self.base)
        for field, value in (("dispatcher", "devin"), ("worker", "codex"), ("issue", 0), ("purpose", "改変"),
                             ("authority_effect", "approved"), ("route", "manual_handoff_no_launch")):
            r = copy.deepcopy(work)
            r[field] = value
            with self.assertRaises(ValueError): p.validate_work(r, self.base)
        with self.assertRaises(ValueError): p.validate_work(work, self.head)
        with self.assertRaises(ValueError): p.validate(work, self.base, self.head)
        result = dict(schema="scaffold-work-result.v1", evidence_kind="scaffold", authority_effect="none",
                      request_id=work["request_id"], request_payload_sha256=work["payload_sha256"], issue=1,
                      base_sha=self.base, dispatcher="codex", worker="devin", result="proposal",
                      result_sha=self.head, branch="devin/selftest", summary=["合成入力"])
        p.validate_work_result(result, work)
        for field, value in (("result_sha", self.base), ("branch", "bad branch"), ("worker", "antigravity"),
                             ("request_payload_sha256", "0" * 64), ("summary", []), ("result", "done")):
            r = dict(result, **{field: value})
            with self.assertRaises(ValueError): p.validate_work_result(r, work)
        # 依頼baseから派生しないcommitは提案にできない。
        with self.assertRaises(ValueError):
            p.validate_work_result(dict(result, result_sha=self.base, base_sha=self.base), dict(work, base_sha=self.head))
        p.validate_work_result(dict(result, result="incomplete", result_sha=None, branch=None), work)
        with self.assertRaises(ValueError):
            p.validate_work_result(dict(result, result="declined"), work)

    def test_unknown_authority(self):
        for field, value in (("approved", True), ("authority_effect", "approved"), ("route", "cli")):
            r = copy.deepcopy(self.request)
            r[field] = value
            with self.assertRaises(ValueError): self.check(r)

    def test_wrong_response_binding(self):
        for field in ("request_id", "request_payload_sha256", "base_sha", "content_sha", "reviewer"):
            r = self.response()
            r[field] = "wrong"
            with self.assertRaises(ValueError): p.validate_response(r, self.request)

    def test_incomplete_not_clean(self):
        r = self.response()
        r["unreviewed"] = ["未確認"]
        with self.assertRaises(ValueError): p.validate_response(r, self.request)
        r["result"] = "incomplete"
        p.validate_response(r, self.request)

    def test_findings_need_evidence(self):
        r = self.response()
        r["result"] = "findings"
        r["findings"] = [{"id": "F1", "severity": "Major", "evidence": "", "change": "修正箇所"}]
        with self.assertRaises(ValueError): p.validate_response(r, self.request)
        r["findings"][0]["evidence"] = "対象path:行と反例"
        p.validate_response(r, self.request)


if __name__ == "__main__":
    unittest.main()
