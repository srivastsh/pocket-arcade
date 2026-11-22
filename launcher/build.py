"""Build a self-contained Games.app from the catalog using the macOS SDK."""
import os
import plistlib
import shutil
import subprocess
import tempfile
from html.parser import HTMLParser
from pathlib import Path


class Catalog(HTMLParser):
    def __init__(self):
        super().__init__()
        self.games = []

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == "a" and "g" in attributes.get("class", "").split():
            self.games.append(attributes["href"])


def build():
    sources = Path(__file__).resolve().parent
    root = sources.parent
    destination = root / "Games.app"
    identifier = "com.srivastsh.games"
    catalog = Catalog()
    catalog.feed((root / "index.html").read_text())
    if not catalog.games or len(catalog.games) != len(set(catalog.games)):
        raise ValueError("The catalog must contain unique game links")
    if destination.exists():
        info = plistlib.loads((destination / "Contents/Info.plist").read_bytes())
        if info.get("CFBundleIdentifier") != identifier:
            raise ValueError(f"Another application already uses {destination}")

    with tempfile.TemporaryDirectory() as staging:
        bundle = Path(staging) / "Games.app"
        contents = bundle / "Contents"
        resources = contents / "Resources"
        games = resources / "Games"
        games.mkdir(parents=True)
        binaries = contents / "MacOS"
        binaries.mkdir()
        for name in ["index.html", *catalog.games, "shared.css", "cards.css", "common.js", "controls.js",
                     "board-colors.js", "rally-courses.js", "rally-scenery.js", "category-symbols.png", "launcher-mark.png"]:
            shutil.copyfile(root / name, games / name)
        shutil.copyfile(sources / "Games.icns", resources / "Games.icns")
        shutil.copyfile(sources / "toolbar.js", resources / "toolbar.js")
        info = {
            "CFBundleDevelopmentRegion": "en",
            "CFBundleExecutable": "Games",
            "CFBundleIconFile": "Games.icns",
            "CFBundleIdentifier": identifier,
            "CFBundleInfoDictionaryVersion": "6.0",
            "CFBundleDisplayName": "Pocket Arcade",
            "CFBundleName": "Pocket Arcade",
            "CFBundlePackageType": "APPL",
            "CFBundleShortVersionString": "1.2",
            "CFBundleVersion": "3",
            "LSApplicationCategoryType": "public.app-category.games",
            "LSMinimumSystemVersion": "13.0",
            "NSHighResolutionCapable": True,
        }
        (contents / "Info.plist").write_bytes(plistlib.dumps(info))
        subprocess.run(["xcrun", "clang", "-arch", "arm64", "-arch", "x86_64",
                        "-mmacosx-version-min=13.0", "-fobjc-arc", "-O2",
                        "-framework", "Cocoa", "-framework", "WebKit",
                        str(sources / "main.m"), "-o", str(binaries / "Games")], check=True)
        subprocess.run(["xattr", "-cr", str(bundle)], check=True)
        subprocess.run(["codesign", "--force", "--sign", "-", str(bundle)], check=True)
        subprocess.run(["codesign", "--verify", "--strict", str(bundle)], check=True)
        previous = Path(staging) / "previous.app"
        if destination.exists():
            destination.rename(previous)
        try:
            os.replace(bundle, destination)
        except OSError:
            if previous.exists():
                previous.rename(destination)
            raise
    print(f"Built {destination} with {len(catalog.games)} games")


if __name__ == "__main__":
    build()
