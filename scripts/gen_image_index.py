#!/usr/bin/env python3
"""Generate images/index.json listing all files in the images/ folder."""
import os
import json

HERE = os.path.dirname(__file__)
ROOT = os.path.abspath(os.path.join(HERE, '..'))
IMAGES_DIR = os.path.join(ROOT, 'images')
OUT_FILE = os.path.join(IMAGES_DIR, 'index.json')

def main():
    if not os.path.isdir(IMAGES_DIR):
        print('images/ directory not found')
        return
    items = sorted([f for f in os.listdir(IMAGES_DIR) if os.path.isfile(os.path.join(IMAGES_DIR, f))])
    with open(OUT_FILE, 'w', encoding='utf-8') as fh:
        json.dump(items, fh, ensure_ascii=False, indent=2)
    print(f'Wrote {len(items)} filenames to {OUT_FILE}')

if __name__ == '__main__':
    main()
