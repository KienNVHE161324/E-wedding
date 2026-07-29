from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--padding", type=float, default=0.08)
    args = parser.parse_args()

    source = Image.open(args.source).convert("RGBA")
    pixels = source.load()
    for y in range(source.height):
        for x in range(source.width):
            red, green, blue, _ = pixels[x, y]
            distance = max(0, 255 - min(red, green, blue))
            alpha = max(0, min(255, round(distance * 5.1)))
            pixels[x, y] = (red, green, blue, alpha)

    alpha = source.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError("No visible subject found")

    subject = source.crop(bbox)
    padding = max(24, round(max(subject.size) * args.padding))
    result = Image.new(
        "RGBA",
        (subject.width + padding * 2, subject.height + padding * 2),
        (0, 0, 0, 0),
    )
    result.alpha_composite(subject, (padding, padding))

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    result.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
