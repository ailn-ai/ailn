import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('installer', Path(__file__).with_name('install-approved.py'))
installer = importlib.util.module_from_spec(spec)
spec.loader.exec_module(installer)


class InstallerTests(unittest.TestCase):
    def test_installs_frozen_version_and_rejects_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            target = Path(tmp) / 'ailn'
            installer.install(installer.ARCHIVE, target)
            self.assertIn('version: 0.6.0-mint.11', (target / 'SKILL.md').read_text('utf-8'))
            before = (target / 'SKILL.md').read_bytes()
            with self.assertRaisesRegex(ValueError, 'already exists'):
                installer.install(installer.ARCHIVE, target)
            self.assertEqual(before, (target / 'SKILL.md').read_bytes())

    def test_corruption_rejected_before_creating_target(self):
        with tempfile.TemporaryDirectory() as tmp:
            archive = Path(tmp) / 'bad.zip'
            archive.write_bytes(installer.ARCHIVE.read_bytes() + b'tamper')
            target = Path(tmp) / 'ailn'
            with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
                installer.install(archive, target)
            self.assertFalse(target.exists())

    def test_candidate_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            candidate = installer.ARCHIVE.with_name('ailn-skill-0.6.0-mint.12.zip')
            with self.assertRaisesRegex(ValueError, 'SHA-256 mismatch'):
                installer.install(candidate, Path(tmp) / 'ailn')


if __name__ == '__main__':
    unittest.main()
