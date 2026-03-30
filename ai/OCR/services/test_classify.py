import json
from pathlib import Path

from classifier_service import classify_document

IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".webp", ".bmp"}


def main():
    image_dir = Path("../data")   # <- 여기 바꿔

    image_paths = sorted(
        [p for p in image_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS]
    )

    all_results = []

    for idx, image_path in enumerate(image_paths, start=1):
        print(f"\n==============================")
        print(f"[TEST] {idx}/{len(image_paths)} - {image_path.name}")
        print(f"==============================")

        document = {
            "fileId": f"FILE-{idx:03d}",
            "fileName": image_path.name,
            "pages": [
                {
                    "pageNum": 1,
                    "imagePath": str(image_path),
                }
            ]
        }

        result = classify_document(document)
        all_results.append(result)

        print(json.dumps(result["documentClassification"], ensure_ascii=False, indent=2))

    save_path = image_dir / "classification_results.json"
    with open(save_path, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)

    print(f"\n저장 완료: {save_path}")


if __name__ == "__main__":
    main()