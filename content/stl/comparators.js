registerLesson('comparators', {
  title: 'Comparators and <em>ordering</em> rules',
  lead: 'Whenever the STL has to put things in order (sort, set, map, priority_queue), it asks one question: “which of these two comes first?” You get to answer it.',
  blocks: [
    { t: 'h2', text: 'The question every ordered container asks' },
    { t: 'levels',
      eli5: ['Line up kids by height, or by name, or by birthday. The line-up depends on the **rule** you choose. A comparator is that rule: “Kid A goes before kid B if…”.'],
      plain: ['A **comparator** is a function that takes two items `a` and `b` and returns `true` if `a` should come **strictly before** `b`. By default the STL uses `<`, which sorts ascending. To sort descending, by a field, or by several keys, you supply your own comparator, usually as a [[lambda]].'],
      tech: ['Ordered facilities require a **strict weak ordering**: irreflexive (`comp(a,a)` is false), asymmetric (`comp(a,b)` implies `!comp(b,a)`), transitive, and with transitive equivalence (if `a` and `b` are each unordered relative to `c`, they are unordered to each other). Violating this (for example using `<=`) is undefined behavior and can crash `sort`. Equivalence in a `set` is defined as `!comp(a,b) && !comp(b,a)`, not `==`.'] },

    { t: 'h2', text: 'Sort with a lambda' },
    { t: 'code', file: 'sort_cmp.cpp', code: `#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

struct Student { string name; int score; };

int main() {
    vector<int> v = {5, 2, 9, 1};
    sort(v.begin(), v.end());                              // ascending (default <)
    sort(v.begin(), v.end(), greater<int>());              // descending, ready-made comparator
    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });   // same, as a lambda

    vector<Student> s = {{"Mia", 90}, {"Raj", 85}, {"Sam", 90}};
    sort(s.begin(), s.end(), [](const Student& a, const Student& b) {
        if (a.score != b.score) return a.score > b.score;  // higher score first
        return a.name < b.name;                            // tie: name A to Z
    });
    for (auto& x : s) cout << x.name << " " << x.score << "\\n";   // Mia 90, Sam 90, Raj 85
}` },
    { t: 'p', html: 'The multi-key pattern is always the same: **compare the first key; if it differs, decide; otherwise fall through to the next key.**' },
    { t: 'callout', kind: 'tip', html: 'A shortcut for multi-key ordering: compare tuples. `return tie(a.score, a.name) < tie(b.score, b.name);` ranks by score, then by name. To reverse one key, negate it: `make_pair(-a.score, a.name)`.' },

    { t: 'h2', text: 'The strictness requirement' },
    { t: 'p', html: 'A comparator must say “goes before”, **never** “goes before or is equal”. With `<=`, comparing an element with itself returns true, which breaks the algorithm’s assumptions.' },
    { t: 'table', head: ['Comparator', 'Valid?', 'Why'], rows: [
      ['`a < b`', '✓', 'strict'],
      ['`a > b`', '✓', 'strict (descending)'],
      ['`a <= b`', '✗', '`comp(a, a)` is true: not irreflexive. `sort` may crash or loop forever'],
      ['`a.x != b.x`', '✗', 'not asymmetric, no ordering at all'],
      ['`abs(a) < abs(b)`', '✓', 'fine: ties are simply “equivalent”'],
    ] },
    { t: 'callout', kind: 'warn', html: 'This is one of the nastiest C++ bugs: a comparator with `<=` works on small tests and then segfaults on a big input. If `sort` crashes only sometimes, check your comparator for a missing strictness.' },

    { t: 'h2', text: 'Where else comparators go' },
    { t: 'code', file: 'cmp_everywhere.cpp', code: `#include <iostream>
#include <queue>
#include <set>
#include <vector>
using namespace std;

struct ByLength {
    bool operator()(const string& a, const string& b) const {      // a functor: a struct with ()
        if (a.size() != b.size()) return a.size() < b.size();
        return a < b;
    }
};

int main() {
    // set / map: the comparator is a TEMPLATE argument (a type)
    set<string, ByLength> words = {"pear", "fig", "banana", "kiwi"};
    for (auto& w : words) cout << w << " ";                 // fig kiwi pear banana

    set<int, greater<int>> desc = {3, 1, 2};                // 3 2 1

    // priority_queue: default is a MAX-heap; use greater<> for a MIN-heap
    priority_queue<int, vector<int>, greater<int>> minHeap;
    minHeap.push(5); minHeap.push(1); minHeap.push(3);
    cout << "\\n" << minHeap.top() << "\\n";                  // 1

    // a lambda as the comparator needs decltype
    auto cmp = [](int a, int b) { return a > b; };
    set<int, decltype(cmp)> s2(cmp);
    s2.insert(7); s2.insert(9);                             // 9 7
}` },
    { t: 'callout', kind: 'interview', html: 'Note: `sort` and `priority_queue` use **opposite** conventions for the same comparator. `sort(..., greater<>())` puts the biggest first, but `priority_queue<..., greater<>>` puts the **smallest** on top. The queue returns the element that is “last” under the comparator.' },

    { t: 'h2', text: 'Defining < once for your type' },
    { t: 'code', file: 'operator_less.cpp', code: `#include <iostream>
#include <set>
using namespace std;

struct Point {
    int x, y;
    bool operator<(const Point& o) const {      // gives Point a natural ordering
        return x != o.x ? x < o.x : y < o.y;
    }
};

int main() {
    set<Point> pts = {{2, 1}, {1, 5}, {1, 2}};  // now set and sort work out of the box
    for (auto& p : pts) cout << "(" << p.x << "," << p.y << ") ";   // (1,2) (1,5) (2,1)
}` },

    { t: 'quiz', q: 'Why is `sort(v.begin(), v.end(), [](int a, int b){ return a <= b; })` dangerous?', opts: ['It sorts descending', 'It is not a strict weak ordering and may crash or misbehave', 'It is slower', 'It does not compile'], ans: 1,
      why: '`comp(a, a)` returns true, which violates irreflexivity. Always use `<` or `>`.' },
    { t: 'quiz', q: 'What is on top of `priority_queue<int, vector<int>, greater<int>> pq;` after pushing 4, 9, 2?', opts: ['9', '4', '2', '15'], ans: 2,
      why: 'With `greater<int>` the queue is a **min-heap**, so the smallest element, 2, is on top.' },

    { t: 'recap', items: [
      'Write comparators as lambdas, functors or by defining `operator<`.',
      'Sort by several keys with the “if different, decide; else next key” pattern.',
      'Keep every comparator strict (`<` / `>`, never `<=`).',
      'Remember `priority_queue` inverts the sense of the comparator compared to `sort`.',
    ] },
  ],
});
