import json
import sys
import os
sys.stdout.reconfigure(encoding='utf-8')
from api import search_rules, _update_pipeline
def generate_check():
    with open('dummy_employee_data.json', 'r', encoding='utf-8') as f:
        user_data = json.load(f)
    print("Initializing Retrievers...")
    _update_pipeline()
    print("Running Search...")
    response = search_rules(user_data)
    with open('../check.txt', 'w', encoding='utf-8') as f:
        json.dump(response.dict(), f, ensure_ascii=False, indent=4)
if __name__ == "__main__":
    generate_check()
    print("Regenerated ../check.txt successfully.")
