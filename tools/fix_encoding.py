# fix_encoding.py — fix mojibake from Tesseract OCR on Latin-1 PDF
import sys

input_path = 'legal_refs/pdf/decret-11-125-eau.txt'
output_path = 'legal_refs/decret-11-125-eau-consommation-humaine.md'

content = open(input_path, encoding='utf-8').read()

replacements = [
    ('\u00c3\u00a9', '\u00e9'),  # é
    ('\u00c3\u00a8', '\u00e8'),  # è
    ('\u00c3\u00a0', '\u00e0'),  # à
    ('\u00c3\u00a2', '\u00e2'),  # â
    ('\u00c3\u00ae', '\u00ee'),  # î
    ('\u00c3\u00b4', '\u00f4'),  # ô
    ('\u00c3\u00bb', '\u00fb'),  # û
    ('\u00c3\u00a7', '\u00e7'),  # ç
    ('\u00c3\u0089', '\u00c9'),  # É
    ('\u00c3\u0080', '\u00c0'),  # À
    ('\u00c3\u0087', '\u00c7'),  # Ç
    ('\u00c3\u008b', '\u00cb'),  # Ë
    ('\u00c3\u00af', '\u00ef'),  # ï
    ('\u00c3\u00b9', '\u00f9'),  # ù
    ('\u00c3\u00aa', '\u00ea'),  # ê
    ('\u00c3\u00ba', '\u00fa'),  # ú
    ('\u00c3\u00b3', '\u00f3'),  # ó
    ('\u00c2\u00b0', '\u00b0'),  # °
    ('\u00c2\u00ab', '\u00ab'),  # «
    ('\u00c2\u00bb', '\u00bb'),  # »
    ('\u00c2\u00b2', '\u00b2'),  # ²
    ('\u00c2\u00b3', '\u00b3'),  # ³
    ('\u00c2\u00b5', '\u00b5'),  # µ
    ('\u00c2\u00a0', ' '),        # non-breaking space
    ('n\u00c2\u00b0', 'n\u00b0'),  # n°
    ('N\u00c2\u00b0', 'N\u00b0'),  # N°
    ('\u00e2\u0080\u0093', '\u2013'),  # –
    ('\u00e2\u0080\u0094', '\u2014'),  # —
    ('\u00e2\u0080\u009c', '\u201c'),  # "
    ('\u00e2\u0080\u009d', '\u201d'),  # "
    ('\u00e2\u0080\u0099', '\u2019'),  # '
    ('\u00e2\u0080\u0098', '\u2018'),  # '
    ('\u00e2\u0080\u00a2', '\u2022'),  # •
]

fixed = content
for bad, good in replacements:
    fixed = fixed.replace(bad, good)

open(output_path, 'w', encoding='utf-8').write(fixed)
print('Done. Lines:', fixed.count('\n'))
print(fixed[:3000])
