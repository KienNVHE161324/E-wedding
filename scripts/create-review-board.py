from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("destination", type=Path)
    parser.add_argument("sources", nargs="+", type=Path)
    parser.add_argument("--labels", required=True)
    parser.add_argument("--columns", type=int, default=3)
    parser.add_argument("--cell-size", type=int, default=640)
    args = parser.parse_args()

    labels = [item.strip() for item in args.labels.split(",")]
    if len(labels) != len(args.sources):
        raise ValueError("The number of labels must equal the number of sources")

    rows = (len(args.sources) + args.columns - 1) // args.columns
    board = Image.new(
        "RGB",
        (args.columns * args.cell_size, rows * args.cell_size),
        "white",
    )
    draw = ImageDraw.Draw(board)
    try:
        font = ImageFont.truetype("arialbd.ttf", 34)
    except OSError:
        font = ImageFont.load_default()

    for index, (source, label) in enumerate(zip(args.sources, labels)):
        image = Image.open(source).convert("RGB")
        image = ImageOps.contain(
            image,
            (args.cell_size - 48, args.cell_size - 48),
            Image.Resampling.LANCZOS,
        )
        x0 = index % args.columns * args.cell_size
        y0 = index // args.columns * args.cell_size
        x = x0 + (args.cell_size - image.width) // 2
        y = y0 + (args.cell_size - image.height) // 2
        board.paste(image, (x, y))
        draw.rectangle(
            (x0, y0, x0 + args.cell_size - 1, y0 + args.cell_size - 1),
            outline=(218, 210, 199),
            width=2,
        )
        bounds = draw.textbbox((0, 0), label, font=font)
        draw.rounded_rectangle(
            (x0 + 18, y0 + 16, x0 + 42 + bounds[2], y0 + 34 + bounds[3]),
            radius=10,
            fill=(255, 255, 255),
            outline=(74, 51, 42),
            width=3,
        )
        draw.text((x0 + 30, y0 + 24), label, font=font, fill=(74, 51, 42))

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    board.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
