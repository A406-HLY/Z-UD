import re
import os

class ArticleChunker:
    """
    규정 문서를 '제n조' 단위로 분할하는 클래스
    """
    def __init__(self, file_path=None, content=None):
        self.file_path = file_path
        self.content = content

    def run(self):
        if self.content is not None:
            content = self.content
        elif self.file_path and os.path.exists(self.file_path):
            with open(self.file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        else:
            raise FileNotFoundError("Valid file_path or content must be provided.")

        chunks = []
        pattern = re.compile(r'^(제\d+조\s[^\n]+)', re.MULTILINE)
        matches = list(pattern.finditer(content))
        
        for i, match in enumerate(matches):
            start = match.start()
            end = matches[i+1].start() if i + 1 < len(matches) else len(content)
            
            header = match.group(0).strip()
            article_id_match = re.search(r'제\d+조', header)
            article_id = article_id_match.group(0) if article_id_match else "제0조"
            article_title = header.strip()
            body = content[match.end():end].strip()
            
            chunks.append({
                "chunk_id": f"chunk_{i+1:02d}",
                "article_id": article_id,
                "title": article_title,
                "text": f"{article_title}\n{body}"
            })
            
        return chunks

if __name__ == "__main__":
    pass
