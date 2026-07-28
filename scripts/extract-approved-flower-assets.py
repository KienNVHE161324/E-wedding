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
        raise ValueError(f"No flower found in cell ({column}, {row})")

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
        choices=("F01-F12", "F13-F24", "SB01-SB12", "WF01-WF12", "HD01-HD12"),
        default="F01-F12",
    )
    args = parser.parse_args()

    image = Image.open(args.source)
    if args.batch == "F01-F12":
        assets = [
            ("F01-lotus-front.png", 0, 0),
            ("F02-lotus-side.png", 1, 0),
            ("F03-peony.png", 2, 0),
            ("F04-chrysanthemum.png", 3, 0),
            ("F05-orchid-spray.png", 0, 1),
            ("F06-small-flower-branch.png", 1, 1),
            ("F07-areca-blossom.png", 2, 1),
            ("F08-peach-blossom.png", 3, 1),
            ("F09-camellia.png", 0, 2),
            ("F10-magnolia.png", 1, 2),
            ("F11-vertical-flower-stem.png", 2, 2),
            ("F12-leaf-bud-filler.png", 3, 2),
        ]
    elif args.batch == "F13-F24":
        assets = [
            ("F13-garden-rose.png", 0, 0),
            ("F14-spray-rose.png", 1, 0),
            ("F15-hydrangea.png", 2, 0),
            ("F16-calla-lilies.png", 3, 0),
            ("F17-lily-stem.png", 0, 1),
            ("F18-babys-breath.png", 1, 1),
            ("F19-ranunculus.png", 2, 1),
            ("F20-anemone.png", 3, 1),
            ("F21-plum-blossom.png", 0, 2),
            ("F22-apricot-blossom.png", 1, 2),
            ("F23-carnation.png", 2, 2),
            ("F24-freesia.png", 3, 2),
        ]
    elif args.batch == "SB01-SB12":
        assets = [
            ("small-bouquets/SB01-lotus-cluster.png", 0, 0),
            ("small-bouquets/SB02-peony-jasmine.png", 1, 0),
            ("small-bouquets/SB03-orchid-cluster.png", 2, 0),
            ("small-bouquets/SB04-chrysanthemum-buds.png", 3, 0),
            ("small-bouquets/SB05-rose-babys-breath.png", 0, 1),
            ("small-bouquets/SB06-hydrangea-leaves.png", 1, 1),
            ("small-bouquets/SB07-calla-leaves.png", 2, 1),
            ("small-bouquets/SB08-lily-freesia.png", 3, 1),
            ("small-bouquets/SB09-magnolia-buds.png", 0, 2),
            ("small-bouquets/SB10-peach-plum.png", 1, 2),
            ("small-bouquets/SB11-camellia-carnation.png", 2, 2),
            ("small-bouquets/SB12-lotus-areca.png", 3, 2),
        ]
    elif args.batch == "WF01-WF12":
        assets = [
            ("single-flowers/WF01-lotus-front.png", 0, 0),
            ("single-flowers/WF02-lotus-side.png", 1, 0),
            ("single-flowers/WF03-peony.png", 2, 0),
            ("single-flowers/WF04-chrysanthemum.png", 3, 0),
            ("single-flowers/WF05-orchid-spray.png", 0, 1),
            ("single-flowers/WF06-small-flower-branch.png", 1, 1),
            ("single-flowers/WF07-areca-blossom.png", 2, 1),
            ("single-flowers/WF08-peach-blossom.png", 3, 1),
            ("single-flowers/WF09-camellia.png", 0, 2),
            ("single-flowers/WF10-magnolia.png", 1, 2),
            ("single-flowers/WF11-vertical-flower-stem.png", 2, 2),
            ("single-flowers/WF12-leaf-bud-filler.png", 3, 2),
        ]
    else:
        assets = [
            ("horizontal-dividers/HD01-lotus-divider.png", 0, 0),
            ("horizontal-dividers/HD02-peony-divider.png", 1, 0),
            ("horizontal-dividers/HD03-orchid-divider.png", 2, 0),
            ("horizontal-dividers/HD04-chrysanthemum-divider.png", 3, 0),
            ("horizontal-dividers/HD05-rose-divider.png", 0, 1),
            ("horizontal-dividers/HD06-hydrangea-divider.png", 1, 1),
            ("horizontal-dividers/HD07-calla-divider.png", 2, 1),
            ("horizontal-dividers/HD08-freesia-divider.png", 3, 1),
            ("horizontal-dividers/HD09-magnolia-divider.png", 0, 2),
            ("horizontal-dividers/HD10-plum-blossom-divider.png", 1, 2),
            ("horizontal-dividers/HD11-camellia-divider.png", 2, 2),
            ("horizontal-dividers/HD12-babys-breath-divider.png", 3, 2),
        ]

    for filename, column, row in assets:
        extract(
            image,
            column=column,
            row=row,
            columns=4,
            rows=3,
            output=args.output_root / filename,
        )


if __name__ == "__main__":
    main()
