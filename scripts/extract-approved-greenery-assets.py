from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def extract(
    source: Image.Image,
    *,
    column: int,
    row: int,
    output: Path,
) -> None:
    columns, rows = 4, 3
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
        raise ValueError(f"No greenery found in cell ({column}, {row})")

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
    output.parent.mkdir(parents=True, exist_ok=True)
    result.save(output, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output_root", type=Path)
    parser.add_argument(
        "--batch",
        choices=("WG01-WG12", "WG13-WG24", "PG01-PG12"),
        default="WG01-WG12",
    )
    args = parser.parse_args()

    if args.batch == "WG01-WG12":
        names = [
            "WG01-bamboo-branch.png",
            "WG02-weeping-willow.png",
            "WG03-round-leaf-sprig.png",
            "WG04-fern-frond.png",
            "WG05-pampas-grass.png",
            "WG06-rice-stalks.png",
            "WG07-reeds.png",
            "WG08-meadow-grass.png",
            "WG09-trailing-vine.png",
            "WG10-curling-vine.png",
            "WG11-areca-frond.png",
            "WG12-wild-grass.png",
        ]
    elif args.batch == "WG13-WG24":
        names = [
            "WG13-betel-vine.png",
            "WG14-banyan-branch.png",
            "WG15-young-areca-spray.png",
            "WG16-lotus-pod-stems.png",
            "WG17-water-grass.png",
            "WG18-sedge-cluster.png",
            "WG19-foxtail-grass.png",
            "WG20-clover-vine.png",
            "WG21-olive-like-sprig.png",
            "WG22-dry-bud-branch.png",
            "WG23-berry-branch.png",
            "WG24-small-leaf-garland.png",
        ]
    else:
        names = [
            "PG01-bamboo-branch.png",
            "PG02-weeping-willow.png",
            "PG03-fern-frond.png",
            "PG04-pampas-grass.png",
            "PG05-rice-stalks.png",
            "PG06-reeds.png",
            "PG07-meadow-grass.png",
            "PG08-horizontal-leaf-branch.png",
            "PG09-curling-vine.png",
            "PG10-areca-frond.png",
            "PG11-wild-grass.png",
            "PG12-betel-vine.png",
        ]

    image = Image.open(args.source)
    for index, filename in enumerate(names):
        extract(
            image,
            column=index % 4,
            row=index // 4,
            output=args.output_root / filename,
        )


if __name__ == "__main__":
    main()
