# Pocket Arcade

Pocket Arcade is a collection of 46 offline games for Mac. It runs on Apple silicon and Intel Macs with macOS 13 or later. The launcher uses Liquid Glass on macOS 26.

## Install

Download the DMG from the [latest release](https://github.com/srivastsh/pocket-arcade/releases/latest), open it, and drag **Pocket Arcade** into **Applications**. This build is ad-hoc signed. macOS may show a first-launch warning because the app has not been notarized by Apple.

## Play

Press **⌘L** to search the collection. Use WASD or the arrow keys to browse and Return to launch. Each game shows its own controls.

Rally has four circuits. Harbor Circuit follows the waterfront, Alpine Switchbacks has two hairpins, Red Mesa Speedway has a wide sweeper, and Redwood Run links S-bends. Each course saves your fastest lap and a ghost you can race. W accelerates, S brakes or reverses, A and D steer, and P pauses.

Light Cycles supports two players on one keyboard. Daily Picross offers a new puzzle each day and saves your progress locally.

## Build

Use Python 3 and Xcode Command Line Tools with a macOS 26 SDK or later. From the project root, run:

```sh
python3 launcher/build.py
python3 launcher/package.py --app Games.app --output Pocket-Arcade.dmg
```

To play the browser version, open `index.html` directly.
