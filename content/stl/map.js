registerLesson('map', {
  title: '<em>map:</em> key to value, in sorted order',
  lead: 'A dictionary: look something up by name and get its value. The map keeps its keys sorted, so you can also walk it in order and ask range questions.',
  blocks: [
    { t: 'h2', text: 'A dictionary that stays alphabetised' },
    { t: 'levels',
      eli5: ['A real dictionary: you look up a **word** (the key) to find its **meaning** (the value). Every word appears only once, and the book is always in alphabetical order, so you can flip straight to “the first word starting with M”.'],
      plain: ['`map<K, V>` stores **key → value** pairs with unique keys, sorted by key. Look up with `m[key]` or `m.find(key)` in **O(log n)**. Each element is a `pair<const K, V>`, so iterating gives `.first` (the key) and `.second` (the value), always in ascending key order.'],
      tech: ['Implemented as a red-black tree of `pair<const Key, T>` nodes, exactly like `set` but ordered by key only. `operator[]` **inserts** a value-initialised entry if the key is missing, which is both its convenience and its trap; `at()` throws instead; `find` / `count` / `contains` (C++20) do not modify the map. `insert_or_assign` (C++17) and `try_emplace` avoid redundant constructions. Iterators stay valid except for the erased element.'] },

    { t: 'code', file: 'map_basics.cpp', code: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    map<string, int> age;
    age["Mia"] = 20;                      // insert via []
    age["Raj"] = 22;
    age.insert({"Sam", 19});              // insert a pair
    age["Mia"] = 21;                      // overwrite existing key

    cout << age["Raj"] << " " << age.size() << "\\n";    // 22 3

    for (auto& kv : age)                                 // sorted by key: Mia Raj Sam
        cout << kv.first << "=" << kv.second << " ";
    cout << "\\n";

    auto it = age.find("Sam");                           // find without inserting
    if (it != age.end()) cout << it->second << "\\n";     // 19   (it->first is the key)
    cout << age.count("Zed") << "\\n";                    // 0

    age.erase("Raj");
    cout << age.begin()->first << " " << age.rbegin()->first << "\\n";   // Mia Sam (smallest / largest key)
    auto lb = age.lower_bound("N");                      // first key >= "N"
    cout << lb->first << "\\n";                           // Sam
}` },

    { t: 'h2', text: 'The [] trap' },
    { t: 'p', html: '`m[key]` on a **missing** key silently creates it with a default value (0 for numbers). Just *reading* with `[]` can grow your map.' },
    { t: 'viz', kind: 'memory', cfg: { title: 'm[key] inserts',
      code: `map<string,int> m;
m["a"] = 5;
if (m["b"] == 0) { }     // just a lookup?
int n = m.size();`,
      steps: [
        { line: 1, set: { m: ['map', '{}'] }, note: 'Empty map.' },
        { line: 2, set: { m: '{ "a": 5 }' }, note: '`m["a"]` creates the key, then `= 5` fills it.' },
        { line: 3, set: { m: '{ "a": 5, "b": 0 }' }, note: 'Reading `m["b"]` found nothing, so it **created** `"b"` with value 0. The comparison reads 0, but the map has changed!' },
        { line: 4, set: { n: ['int', 2] }, note: 'The size is 2, not 1. Use `m.count("b")` or `m.find("b") != m.end()` when you only want to **check**.' },
      ] } },
    { t: 'callout', kind: 'warn', html: 'Checking membership? Use `count()` or `find()`. Using `m[k]` to check silently adds `k`, can change later `size()` and iteration, and cannot be used on a `const map` at all.' },

    { t: 'h2', text: 'Complexity' },
    { t: 'table', head: ['Operation', 'Cost'], rows: [
      ['`m[k]`, `at(k)`, `find(k)`, `count(k)`', 'O(log n)'],
      ['`insert`, `erase(k)`', 'O(log n)'],
      ['`lower_bound`, `upper_bound`', 'O(log n)'],
      ['`begin()` / `rbegin()` (min / max key)', 'O(1)'],
      ['iterate all in key order', 'O(n)'],
    ] },

    { t: 'h2', text: 'Patterns' },
    { t: 'code', file: 'map_patterns.cpp', code: `#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    // 1. frequency counting (sorted output for free)
    map<char, int> freq;
    for (char c : string("banana")) freq[c]++;           // [] default-creates 0, then ++
    for (auto& kv : freq) cout << kv.first << kv.second << " ";   // a3 b1 n2

    // 2. group items under a key
    map<int, vector<string>> byLen;
    for (string w : {"hi", "yo", "cat", "dog", "bird"}) byLen[w.size()].push_back(w);
    cout << "\\n" << byLen[3].size() << "\\n";              // 2

    // 3. interval / event timeline: process in time order
    map<int, int> delta;                                   // time -> change in active meetings
    int meetings[][2] = {{1, 4}, {2, 5}, {7, 8}};
    for (auto& m : meetings) { delta[m[0]]++; delta[m[1]]--; }
    int cur = 0, best = 0;
    for (auto& kv : delta) { cur += kv.second; if (cur > best) best = cur; }
    cout << best << "\\n";                                  // 2 rooms needed
}` },
    { t: 'table', head: ['LeetCode problem', 'How map helps'], rows: [
      ['Two Sum, Subarray Sum Equals K', 'value → index (use `unordered_map` unless order matters)'],
      ['Group Anagrams', 'sorted word → list of words'],
      ['My Calendar II / III', 'ordered boundary events with sweep-line'],
      ['Time Based Key-Value Store', '`map<time,value>` per key + `lower_bound`'],
      ['Top K Frequent (needs sorted output)', 'count with a map first'],
    ] },
    { t: 'callout', kind: 'interview', html: '“`map` or `unordered_map`?” Default to **unordered_map** (O(1) average). Choose **map** when you need sorted iteration, `lower_bound` / range queries, or hashing your key is awkward (e.g. a `vector` or `pair` key). A `map<pair<int,int>, T>` works out of the box; `unordered_map` with a pair key needs a custom hash.' },

    { t: 'quiz', q: 'What does `map<int,int> m; cout << m[5] << m.size();` print?', opts: ['`01`', '`00`', '`10`', 'Error'], ans: 0,
      why: '`m[5]` inserts key 5 with value 0, so it prints 0, and the size is then 1.' },
    { t: 'quiz', q: 'Which statement about iterating a `map` is true?', opts: ['Order is arbitrary', 'Keys come out in ascending order', 'Insertion order is preserved', 'You cannot iterate a map'], ans: 1,
      why: 'A map keeps keys sorted, so iteration is in ascending key order regardless of insertion order.' },

    { t: 'recap', items: [
      'Use insert / `[]` / `find` / `count` / `erase` and iterate pairs in key order.',
      'Avoid the `m[key]` auto-insert trap when you only mean to check.',
      'Apply counting, grouping and event-timeline patterns.',
      'Choose between `map` and `unordered_map`.',
    ] },
  ],
});
