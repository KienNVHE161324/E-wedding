from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def extract_cell(
    source: Image.Image,
    *,
    column: int,
    row: int,
    columns: int,
    rows: int,
    destination: Path,
) -> None:
    cell_width = source.width // columns
    cell_height = source.height // rows
    left = column * cell_width
    top = row * cell_height
    right = source.width if column == columns - 1 else left + cell_width
    bottom = source.height if row == rows - 1 else top + cell_height

    cell = source.crop((left, top, right, bottom)).convert("RGB")
    luminance = cell.convert("L")

    # White review-board pixels become transparent. Darker line work becomes
    # alpha, retaining anti-aliased edges without a white fringe.
    alpha = luminance.point(lambda value: 0 if value >= 250 else 255 - value)
    bbox = alpha.getbbox()
    if bbox is None:
        raise ValueError(f"No visible motif found in cell ({column}, {row})")

    alpha = alpha.crop(bbox)
    width, height = alpha.size
    padding = max(24, round(max(width, height) * 0.10))

    result = Image.new(
        "RGBA",
        (width + padding * 2, height + padding * 2),
        (0, 0, 0, 0),
    )
    ink = Image.new("RGBA", (width, height), (35, 35, 35, 255))
    ink.putalpha(alpha)
    result.alpha_composite(ink, (padding, padding))

    destination.parent.mkdir(parents=True, exist_ok=True)
    result.save(destination, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_root", type=Path)
    args = parser.parse_args()

    source = Image.open(args.source)
    assets = [
        ("architecture/mai-dinh-01.png", 0, 0),
        ("architecture/cong-tam-quan-01.png", 1, 0),
        ("attire-accessories/non-quai-thao-nghieng-01.png", 3, 0),
        ("attire-accessories/quat-giay-nghieng-01.png", 0, 1),
        ("symbols/chu-hy-trien-01.png", 2, 1),
        ("nature/song-nuoc-may-troi-01.png", 3, 1),
    ]

    for relative_path, column, row in assets:
        extract_cell(
            source,
            column=column,
            row=row,
            columns=4,
            rows=2,
            destination=args.output_root / relative_path,
        )


if __name__ == "__main__":
    main()
