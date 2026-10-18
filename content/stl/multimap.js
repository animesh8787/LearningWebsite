registerLesson('multimap', {
  title: '<em>multimap:</em> one key, many values',
  lead: 'A map that lets the same key appear more than once. It is the right answer less often than you would think, because a map of vectors is usually simpler. Know both.',
  blocks: [
    { t: 'h2', text: 'A phone book with shared names' },
    { t: 'levels',
      eli5: ['A phone book where several people can have the same surname. Looking up “Smith” gives you **all** the Smiths, one after another, and the book stays in alphabetical order.'],
      plain: ['`multimap<K, V>` is a sorted map that allows **duplicate keys**. There is no `operator[]` (which key would it mean?). You `insert` pairs, and `equal_range(key)` hands back every entry for a key. All operations are O(log n) plus the number of results.'],
      tech: ['Same red-black tree as `map`, with insertion of equivalent keys always succeeding and placed after existing equals. Because keys are not unique there is no `[]` or `at`. `count(k)` is O(log n + count). Erasing by key removes all matches; erasing by iterator removes one.'] },

    { t: 'code', file: 'multimap_basics.cpp', code: `#include <iostream>
#include <map>
#include <string>
using namespace std;

int main() {
    multimap<string, string> courses;           // student -> course (a student takes several)
    courses.insert({"Mia", "Math"});
    courses.insert({"Raj", "Physics"});
    courses.insert({"Mia", "Art"});
    courses.insert({"Mia", "Chess"});

    cout << courses.count("Mia") << "\\n";       // 3

    auto r = courses.equal_range("Mia");         // all entries with key "Mia"
    for (auto it = r.first; it != r.second; ++it) cout << it->second << " ";   // Math Art Chess
    cout << "\\n";

    for (auto& kv : courses) cout << kv.first << ":" << kv.second << " ";      // sorted by key
    courses.erase("Mia");                        // removes ALL of Mia's entries
    cout << "\\n" << courses.size() << "\\n";      // 1
}` },

    { t: 'viz', kind: 'array', cfg: { title: 'A multimap stays sorted by key', addr: false,
      arr: [],
      code: `multimap<string, string> courses;
courses.insert({"Mia", "Math"});
courses.insert({"Raj", "Physics"});
courses.insert({"Mia", "Art"});
courses.insert({"Mia", "Chess"});
auto r = courses.equal_range("Mia");`,
      steps: [
        { line: 1, note: 'An empty multimap. (It is drawn as a row here to show the order; inside it is a balanced tree.)' },
        { line: 2, push: 'Mia:Math', note: 'The first entry.' },
        { line: 3, push: 'Raj:Physics', note: '"Raj" sorts after "Mia", so it goes second.' },
        { line: 4, set: { 1: 'Mia:Art' }, push: 'Raj:Physics', hl: [1], note: 'A second "Mia" is allowed. It is placed right after the existing "Mia" entry, ahead of "Raj", so equal keys sit together.' },
        { line: 5, set: { 2: 'Mia:Chess' }, push: 'Raj:Physics', hl: [2], note: 'And a third. Every `insert` succeeds, since keys need not be unique.' },
        { line: 6, hl: [0, 1, 2], ptr: { first: 0 }, note: '`equal_range("Mia")` returns two iterators. `first` points at the first Mia entry; `second` points one past the last (here "Raj:Physics"). Walking from `first` to `second` visits all three.' },
      ] } },

    { t: 'h2', text: 'Usually: map of vectors instead' },
    { t: 'p', html: 'Most of the time you want the values of one key **grouped together** and easy to access. A `map<K, vector<V>>` gives that directly, with `[]` and a simple loop over the vector:' },
    { t: 'code', file: 'map_of_vectors.cpp', code: `#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    map<string, vector<string>> courses;
    courses["Mia"].push_back("Math");        // [] works, vectors group the values
    courses["Mia"].push_back("Art");
    courses["Raj"].push_back("Physics");

    for (const string& c : courses["Mia"]) cout << c << " ";   // Math Art
    cout << courses["Mia"].size() << "\\n";                     // 2
}` },
    { t: 'table', head: ['', '`multimap<K,V>`', '`map<K, vector<V>>`'], rows: [
      ['Duplicate keys', 'yes, natively', 'one key, values in a vector'],
      ['`m[k]`', '✗', '✓'],
      ['Get all values of a key', '`equal_range`', 'just `m[k]`'],
      ['Remove one specific entry', 'erase by iterator (easy)', 'erase from the vector (O(size))'],
      ['Memory', 'one node per entry', 'one node per key + a vector'],
      ['Typical choice', 'rare', '**default**'],
    ] },
    { t: 'callout', kind: 'tip', html: 'Pick `multimap` when you need entries ordered by key **and** individually insertable/erasable, e.g. a scheduler of `time → task` where many tasks share a timestamp and you pop the earliest one with `begin()`. Otherwise use `map` of vectors.' },

    { t: 'quiz', q: 'Why does `multimap` have no `operator[]`?', opts: ['It is slower', 'A key can map to several values, so “the value of this key” is ambiguous', 'It is an oversight', 'It only stores ints'], ans: 1,
      why: '`m[k]` must return one value. With duplicates there is no single answer, so you use `equal_range` to get them all.' },
    { t: 'quiz', q: 'You want “all course names for student X” as simply as possible. Best fit?', opts: ['`multimap` with `find`', '`map<string, vector<string>>`', '`set<string>`', '`stack`'], ans: 1,
      why: 'The vector groups the values, and `m[x]` returns them directly.' },

    { t: 'recap', items: [
      'Describe multimap as a sorted map that allows duplicate keys.',
      'Retrieve all values of a key with `equal_range`.',
      'Prefer `map<K, vector<V>>` unless you need ordered, individually-erasable entries.',
    ] },
  ],
});
