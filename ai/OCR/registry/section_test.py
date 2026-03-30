from section_splitter import split_sections

result = split_sections("../data/등기사항증명서 - 김민수_page_001.png")

sections = result["sections"]

for sec in sections:
    print(sec["index"], sec["bbox"])
    print(sec["image_pil"])

    # 이거 바로 Qwen에 넣으면 됨
    pil_img = sec["image_pil"]