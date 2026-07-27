from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--columns", type=int, required=True)
    parser.add_argument("--rows", type=int, required=True)
    parser.add_argument("--prefix", required=True)
    parser.add_argument("--start", type=int, default=1)
    parser.add_argument(
        "--labels",
        help="Comma-separated labels in row-major order; overrides prefix/start.",
    )
    args = parser.parse_args()

    image = Image.open(args.source).convert("RGBA")
    draw = ImageDraw.Draw(image)
    font_size = max(22, round(image.width / 58))
    try:
        font = ImageFont.truetype("arialbd.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    cell_width = image.width / args.columns
    cell_height = image.height / args.rows

    labels = (
        [label.strip() for label in args.labels.split(",")]
        if args.labels
        else None
    )
    expected = args.columns * args.rows
    if labels is not None and len(labels) != expected:
        raise ValueError(f"Expected {expected} labels, received {len(labels)}")

    index = args.start
    cell_index = 0
    for row in range(args.rows):
        for column in range(args.columns):
            label = labels[cell_index] if labels is not None else f"{args.prefix}{index}"
            x = round(column * cell_width + 18)
            y = round(row * cell_height + 14)
            bounds = draw.textbbox((x, y), label, font=font)
            padding_x = 10
            padding_y = 6
            draw.rounded_rectangle(
                (
                    bounds[0] - padding_x,
                    bounds[1] - padding_y,
                    bounds[2] + padding_x,
                    bounds[3] + padding_y,
                ),
                radius=8,
                fill=(255, 255, 255, 238),
                outline=(64, 45, 38, 255),
                width=2,
            )
            draw.text((x, y), label, font=font, fill=(64, 45, 38, 255))
            index += 1
            cell_index += 1

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(args.destination, optimize=True)


if __name__ == "__main__":
    main()
