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
