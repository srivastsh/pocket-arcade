"""Build Pocket Arcade and package it in a compressed, drag-to-install Mac disk image."""

import argparse
import os
from pathlib import Path
import plistlib
import subprocess
import sys
import tempfile


def run(*args):
    subprocess.run(args, check=True)


def main():
    launcher = Path(__file__).resolve().parent
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--app", type=Path, help="Use an existing built app bundle")
    parser.add_argument("--output", type=Path, default=launcher.parent / "Pocket-Arcade.dmg")
    parser.add_argument("--identity", help="Developer ID Application signing identity")
    args = parser.parse_args()

    if args.app is None:
        run(sys.executable, launcher / "build.py")
    app = (args.app or launcher.parent / "Games.app").resolve()
    info = plistlib.loads((app / "Contents/Info.plist").read_bytes())
    if info.get("CFBundleIdentifier") != "com.srivastsh.games":
        parser.error(f"Expected a Pocket Arcade app bundle at {app}")

    output = args.output.resolve()
    if output.suffix.lower() != ".dmg":
        parser.error("The output filename must end in .dmg")
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(dir=output.parent) as work:
        temp = Path(work)
        source = temp / "volume"
        source.mkdir()
        bundled = source / "Pocket Arcade.app"
        run("ditto", "--norsrc", "--noextattr", "--noqtn", "--noacl", app, bundled)
        if args.identity:
            run("codesign", "--force", "--options", "runtime", "--timestamp",
                "--sign", args.identity, bundled)
        run("codesign", "--verify", "--deep", "--strict", bundled)
        (source / "Applications").symlink_to("/Applications", target_is_directory=True)

        # makehybrid assembles the HFS+ volume in userspace, including file modes and links.
        volume = temp / "uncompressed.dmg"
        image = temp / "compressed.dmg"
        run("hdiutil", "makehybrid", "-hfs", "-hfs-volume-name", "Pocket Arcade",
            "-hfs-openfolder", source, "-o", volume, source)
        run("hdiutil", "convert", volume, "-format", "UDZO", "-o", image)
        if args.identity:
            run("codesign", "--timestamp", "--sign", args.identity, image)
            run("codesign", "--verify", "--strict", image)
        run("hdiutil", "verify", image)
        os.replace(image, output)
    print(f"Created {output}")


if __name__ == "__main__":
    main()
