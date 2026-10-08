# Marks lessons as ready in content/manifest.js when content/<part>/<id>.js exists.
import re, os

p = '../content/manifest.js'
s = open(p, encoding='utf-8').read()
pat = re.compile(r"L\('([\w-]+)', '((?:[^'\\]|\\.)*)', (\d+)(?:, true)?\)")

def fix(m):
    id_, title, mins = m.group(1), m.group(2), m.group(3)
    exists = os.path.exists(f'../content/cpp/{id_}.js') or os.path.exists(f'../content/stl/{id_}.js')
    return f"L('{id_}', '{title}', {mins}{', true' if exists else ''})"

s = pat.sub(fix, s)
open(p, 'w', encoding='utf-8').write(s)
print(len(re.findall(r", true\)", s)), 'ready')
