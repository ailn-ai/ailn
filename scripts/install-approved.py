"""Install the frozen approved release into an explicit, new local directory.

No network, shell execution, agent activation, or replacement of existing installs.
"""
import argparse
import hashlib
import json
from pathlib import Path, PurePosixPath
import re
import shutil
import tempfile
import zipfile

VERSION = '0.6.0-mint.11'
SHA256 = '46f623e00f9c8b0351b3d0485b572983a8c40a3cbe7e1eeb8c7ca5a25b90b6ab'
ARCHIVE = Path(__file__).resolve().parents[1] / 'skill/ailn/release' / f'ailn-skill-{VERSION}.zip'


def install(archive, target):
    if target.exists():
        raise ValueError('Destination already exists; select a new directory')
    if hashlib.sha256(archive.read_bytes()).hexdigest() != SHA256:
        raise ValueError('Approved archive SHA-256 mismatch')
    with tempfile.TemporaryDirectory() as tmp:
        root = Path(tmp)
        with zipfile.ZipFile(archive) as z:
            names = z.namelist()
            if len(names) != len(set(names)):
                raise ValueError('Duplicate archive entries')
            for item in z.infolist():
                p = PurePosixPath(item.filename)
                if (p.is_absolute() or '..' in p.parts or '\\' in item.filename
                        or ':' in item.filename or not p.parts or p.parts[0] != 'ailn'
                        or (item.external_attr >> 16) & 0o170000 == 0o120000):
                    raise ValueError('Unsafe archive entry')
            z.extractall(root)
        skill = root / 'ailn'
        manifest = json.loads((skill / 'manifest.json').read_text('utf-8'))
        if manifest['version'] != VERSION:
            raise ValueError('Manifest version mismatch')
        for entry in manifest['files']:
            data = (skill / entry['path']).read_bytes()
            if len(data) != entry['bytes'] or hashlib.sha256(data).hexdigest() != entry['sha256']:
                raise ValueError('Manifest mismatch: ' + entry['path'])
        for file in skill.rglob('*.md'):
            for link in re.findall(r'\[[^\]]*\]\(([^)\s]+)\)', file.read_text('utf-8')):
                if re.match(r'^(https?:|mailto:|#)', link):
                    continue
                resolved = (file.parent / link.split('#')[0]).resolve()
                if not resolved.is_relative_to(skill.resolve()) or not resolved.exists():
                    raise ValueError('Broken or escaping relative link: ' + link)
        if f'version: {VERSION}' not in (skill / 'SKILL.md').read_text('utf-8'):
            raise ValueError('SKILL version mismatch')
        target.parent.mkdir(parents=True, exist_ok=True)
        # Stage on the destination volume, then rename only after a complete copy.
        staging = Path(tempfile.mkdtemp(prefix='.ailn-stage-', dir=target.parent))
        try:
            shutil.copytree(skill, staging / 'ailn')
            (staging / 'ailn').rename(target)
        finally:
            shutil.rmtree(staging)
        print(json.dumps({'version': VERSION, 'sha256': SHA256,
                          'manifestFiles': len(manifest['files']), 'target': str(target)}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', type=Path, default=ARCHIVE)
    parser.add_argument('--target', type=Path, required=True)
    args = parser.parse_args()
    install(args.archive, args.target.resolve())
