from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def extract(
    source: Image.Image,
    *,
    column: int,
    row: int,
    columns: int,
    rows: int,
    output: Path,
) -> None:
    cell_width = source.width // columns
    cell_height = source.height // rows
    left = column * cell_width
    top = row * cell_height
    right = source.width if column == columns - 1 else left + cell_width
    bottom = source.height if row == rows - 1 else top + cell_height

    cell = source.crop((left, top, right, bottom)).convert("RGB")
    luminance = cell.convert("L")
    alpha = luminance.point(lambda value: 0 if value >= 250 else 255 - value)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError(f"No figure found in cell ({column}, {row})")

    alpha = alpha.crop(bbox)
    width, height = alpha.size
    padding = max(28, round(max(width, height) * 0.08))

    result = Image.new(
        "RGBA",
        (width + padding * 2, height + padding * 2),
        (0, 0, 0, 0),
    )
    ink = Image.new("RGBA", (width, height), (35, 35, 35, 255))
    ink.putalpha(alpha)
    result.alpha_composite(ink, (padding, padding))

    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("first_board", type=Path)
    parser.add_argument("action_board", type=Path)
    parser.add_argument("output_root", type=Path)
    args = parser.parse_args()

    first = Image.open(args.first_board)
    actions = Image.open(args.action_board)

    first_assets = [
        ("pose-01-arm-linked.png", 0),
        ("pose-02-facing-hands-joined.png", 1),
        ("pose-03-walking-together.png", 2),
        ("pose-04-formal-portrait.png", 3),
    ]
    for filename, column in first_assets:
        extract(
            first,
            column=column,
            row=0,
            columns=4,
            rows=1,
            output=args.output_root / filename,
        )

    action_assets = [
        ("pose-13-bicycle-side-saddle.png", 0),
        ("pose-14-walking-bicycle.png", 1),
        ("pose-15-waving-guests.png", 2),
    ]
    for filename, column in action_assets:
        extract(
            actions,
            column=column,
            row=0,
            columns=3,
            rows=2,
            output=args.output_root / filename,
        )


if __name__ == "__main__":
    main()
