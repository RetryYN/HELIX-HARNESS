#!/usr/bin/env python3
"""GUI hookへの入出力と別process間の通知を検査する。実GUIのACKとは区別する。"""
import copy
import io
import json
import multiprocessing
from pathlib import Path
import subprocess
import sys
import tempfile
import time
import unittest
from unittest.mock import patch
import gui_mailbox as g
import configure_gui as config
import packet as p


def receiving(store, out):
    out.put(g.receive("claude", "claude-gui", 3, Path(store)))


class GuiChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.head = p.git("rev-parse", "HEAD").decode().strip()
        cls.request = json.loads(subprocess.check_output([
            sys.executable, "-B", str(g.HERE / "packet.py"), "build", "--base", cls.head,
            "--head", cls.head, "--pr", "1", "--request-id", "GUI-SELFTEST", "--author", "codex",
            "--purpose", "合成入力の通知試験", "--scope", "GUI受信を主張しない"] ))

    def setUp(self):
        self.now = time.time()
        self.data = dict(version=1, lanes={}, observed={}, messages={})
        g.bind(self.data, "codex", "codex-gui", "execution", 60, self.now)
        g.bind(self.data, "claude", "claude-gui", "review_merge", 60, self.now)

    def send(self, event="event-1"):
        return g.send(self.data, "codex", "codex-gui", event, "review_request", self.request, None, 60, self.now)

    def test_bidirectional_ack(self):
        self.send()
        m = g.claim(self.data, "claude", "claude-gui", self.now)
        self.assertEqual(m["status"], "claimed")
        g.ack(self.data, "event-1", "claude", "claude-gui", m["digest"], m["claim"]["nonce"], self.now)
        self.assertEqual(m["status"], "acked")
        r = {k:self.request[k] for k in ("request_id", "base_sha", "content_sha", "reviewer")}
        r.update(schema="scaffold-review-response.v1", evidence_kind="scaffold", authority_effect="none",
                 request_payload_sha256=self.request["payload_sha256"], result="no_findings", findings=[], unreviewed=[])
        g.send(self.data, "claude", "claude-gui", "response-1", "review_response", self.request, r, 60, self.now)
        reply = g.claim(self.data, "codex", "codex-gui", self.now)
        g.ack(self.data, "response-1", "codex", "codex-gui", reply["digest"], reply["claim"]["nonce"], self.now)

    def test_duplicate_and_atomic_claim(self):
        self.send()
        self.send("event-other")
        self.assertEqual(len(self.data["messages"]), 1)
        self.assertIsNotNone(g.claim(self.data, "claude", "claude-gui", self.now))
        self.assertIsNone(g.claim(self.data, "claude", "claude-gui", self.now))

    def test_wrong_session_and_ack(self):
        self.send()
        with self.assertRaises(ValueError): g.claim(self.data, "claude", "other-gui", self.now)
        m = g.claim(self.data, "claude", "claude-gui", self.now)
        with self.assertRaises(ValueError): g.ack(self.data,"event-1","claude","claude-gui","wrong",m["claim"]["nonce"],self.now)
        with self.assertRaises(ValueError): g.ack(self.data,"event-1","claude","claude-gui",m["digest"],"wrong",self.now)
        self.assertEqual(m["status"], "claimed")

    def test_expiry(self):
        m = self.send()
        m["expires"] = self.now - 1
        self.assertIsNone(g.claim(self.data, "claude", "claude-gui", self.now))
        self.assertEqual(m["status"], "expired")

    def test_rebind_and_role_conflict(self):
        with self.assertRaises(ValueError): g.bind(self.data,"claude","other","review_merge",60,self.now)
        with self.assertRaises(ValueError): g.bind(self.data,"claude","claude-gui","execution",60,self.now)

    def test_tamper(self):
        m = self.send()
        m["payload"]["request"] = copy.deepcopy(self.request)
        m["payload"]["request"]["purpose"] = "tampered"
        with self.assertRaises(ValueError): g.claim(self.data,"claude","claude-gui",self.now)

    def test_persisted_cross_process(self):
        local = g.HERE / "local"
        local.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=local) as directory:
            store = Path(directory)
            with g.state(store) as data: data.update(copy.deepcopy(self.data))
            out = multiprocessing.Queue()
            receiver = multiprocessing.Process(target=receiving, args=(directory, out))
            receiver.start()
            try:
                with g.state(store) as data:
                    g.send(data,"codex","codex-gui","event-1","review_request",self.request,None,60,time.time())
                message = out.get(timeout=5)
                self.assertEqual(message["payload"]["receiver_session"], "claude-gui")
                receiver.join(5)
                self.assertEqual(receiver.exitcode, 0)
                with g.state(store) as data: self.assertEqual(data["messages"]["event-1"]["status"], "claimed")
            finally:
                if receiver.is_alive(): receiver.terminate(); receiver.join()
                out.close()

    def test_gui_hook_output(self):
        # native hookのstdin/出力形式を確認。実GUIへ注入した試験ではない。
        self.send()
        m = g.claim(self.data,"claude","claude-gui",self.now)
        for runtime in ("claude","codex"):
            stdin = io.StringIO(json.dumps(dict(session_id=runtime+"-gui",cwd=str(p.ROOT),hook_event_name="Stop")))
            stdout, stderr = io.StringIO(), io.StringIO()
            from contextlib import contextmanager
            @contextmanager
            def fake_state(): yield self.data
            with patch.object(g,"state",fake_state),patch.object(g,"receive",return_value=m),patch.object(sys,"stdin",stdin),patch.object(sys,"stdout",stdout),patch.object(sys,"stderr",stderr):
                if runtime == "claude":
                    with self.assertRaises(SystemExit) as raised: g.hook(runtime,0)
                    self.assertEqual(raised.exception.code,2)
                    self.assertIn("GUI",stderr.getvalue())
                else:
                    g.hook(runtime,0)
                    self.assertEqual(json.loads(stdout.getvalue())["decision"],"block")

    def test_hook_config_preserves_unrelated(self):
        old = {"unrelated":{"keep":True},"hooks":{"Stop":[{"hooks":[{"type":"command","command":"existing-hook"}]}]}}
        for runtime in ("claude","codex"):
            updated = config.update(old,runtime)
            self.assertEqual(updated,config.update(updated,runtime))
            self.assertEqual(old,config.update(updated,runtime,True))
        self.assertTrue(config.entries("claude")["Stop"][0]["hooks"][0]["asyncRewake"])
        self.assertNotIn("async",config.entries("codex")["Stop"][0]["hooks"][0])

    def test_timeout_and_old_watcher(self):
        local = g.HERE / "local"
        local.mkdir(exist_ok=True)
        with tempfile.TemporaryDirectory(dir=local) as directory:
            store=Path(directory)
            with g.state(store) as data: data.update(copy.deepcopy(self.data))
            self.assertIsNone(g.receive("claude","claude-gui",0,store))
            self.assertIsNone(g.receive("claude","claude-gui",1,store,watcher="superseded"))


if __name__ == "__main__": unittest.main()
