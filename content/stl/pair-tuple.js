registerLesson('pair-tuple', {
  title: '<em>pair</em> and tuple',
  lead: 'The smallest STL building block: glue two (or more) values together so they travel as one. You will use it in nearly every problem you ever solve.',
  blocks: [
    { t: 'h2', text: 'Two values, one parcel' },
    { t: 'levels',
      eli5: ['A luggage tag with two lines: “name” and “seat number”. The two facts belong together, so you clip them into one tag. That is a `pair`.'],
      plain: ['`pair<A, B>` is a tiny struct with exactly two members: `.first` of type `A` and `.second` of type `B`. They can be different types. `tuple` is the same idea for any number of values. Because pairs compare **lexicographically** (first, then second), you can sort them with no extra code.'],
      tech: ['`std::pair<T1,T2>` is an aggregate-like class template with public members `first` and `second`, in `<utility>`. `operator<` compares `first`, then `second` only if the firsts are equivalent, giving a strict weak ordering when both element types have one. `std::tuple` generalises this (access via `std::get<I>` or structured bindings) and is stored as nested/compressed members with no padding guarantee.'] },

    { t: 'h2', text: 'Creating and reading' },
    { t: 'code', file: 'pair_basics.cpp', code: `#include <iostream>
#include <string>
#include <utility>
using namespace std;

int main() {
    pair<int, string> p = {1, "apple"};
    cout << p.first << " " << p.second << "\\n";       // 1 apple

    auto q = make_pair(3, 4.5);                         // pair<int, double>, type deduced
    pair<int, int> point = {2, 5};

    pair<int, pair<int, int>> nested = {1, {2, 3}};     // pairs can nest
    cout << nested.second.first << "\\n";                // 2

    cout << (point < make_pair(2, 9)) << "\\n";          // 1  (2==2, then 5 < 9)
    cout << (make_pair(1, 100) < make_pair(2, 0)) << "\\n";   // 1  (first decides)
}` },

    { t: 'viz', kind: 'memory', cfg: { title: 'A pair is a two-field box',
      code: `pair<int, string> p = {7, "tea"};
p.first = 8;
auto q = p;
q.second = "cake";`,
      steps: [
        { line: 1, set: { p: ['pair', '{ first: 7, second: "tea" }'] }, note: 'One object, two fields. The type of each field is chosen by you.' },
        { line: 2, set: { p: '{ first: 8, second: "tea" }' }, note: '`.first` and `.second` are **variables, not functions**. No parentheses.' },
        { line: 3, set: { q: ['pair', '{ first: 8, second: "tea" }'] }, note: 'Copying a pair copies both members. `q` is independent.' },
        { line: 4, set: { q: '{ first: 8, second: "cake" }' }, note: '`p` is untouched. Just like a struct.' },
      ] } },

    { t: 'h2', text: 'Unpacking: structured bindings' },
    { t: 'p', html: 'Since C++17 you can **unpack** a pair or tuple into named variables, which reads far better than `.first` / `.second`. You will use this constantly with `map`.' },
    { t: 'code', file: 'unpack.cpp', std17: true, code: `#include <iostream>
#include <map>
#include <tuple>
#include <vector>
using namespace std;

pair<int, int> minMax(const vector<int>& v) {          // return two values at once
    int lo = v[0], hi = v[0];
    for (int x : v) { lo = min(lo, x); hi = max(hi, x); }
    return {lo, hi};
}

int main() {
    auto [lo, hi] = minMax({4, 9, 2, 7});               // unpack into two variables
    cout << lo << " " << hi << "\\n";                    // 2 9

    map<string, int> age = {{"Mia", 20}, {"Raj", 22}};
    for (const auto& [name, a] : age)                   // each element IS a pair<const string,int>
        cout << name << " is " << a << "\\n";

    tuple<int, string, double> t = {1, "x", 2.5};
    cout << get<1>(t) << "\\n";                          // x   (access by position)
    auto [i, s, d] = t;
}` },

    { t: 'h2', text: 'Where you will use it' },
    { t: 'table', head: ['Use', 'Example', 'Why a pair'], rows: [
      ['Value + original index', '`vector<pair<int,int>> a; a.push_back({v[i], i});`', 'sort by value, still know the index'],
      ['Coordinates', '`pair<int,int> pos = {r, c};`', 'grid / BFS queues'],
      ['Graph edge', '`vector<vector<pair<int,int>>> adj; adj[u].push_back({v, w});`', 'neighbour + weight'],
      ['Dijkstra heap', '`priority_queue<pair<int,int>, ...> pq; pq.push({dist, node});`', 'ordered by distance first'],
      ['Map entry', 'every `map` element is a `pair<const K, V>`', 'that is literally what a map stores'],
    ] },
    { t: 'code', file: 'sort_with_index.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {40, 10, 30, 20};
    vector<pair<int, int>> v;                           // (value, original index)
    for (int i = 0; i < (int)nums.size(); i++) v.push_back({nums[i], i});

    sort(v.begin(), v.end());                           // sorts by value, then index

    for (auto& p : v) cout << p.first << "@" << p.second << " ";   // 10@1 20@3 30@2 40@0
}` },

    { t: 'callout', kind: 'interview', html: 'A pair costs nothing extra (it is as big as its two members) and is trivially copyable for small types. But for anything with 3+ fields, or a meaning worth naming, write a tiny `struct`: `edge.weight` beats `edge.second.second`.' },
    { t: 'callout', kind: 'warn', html: 'Mixing pair types: `pair<int,long long>` and `pair<int,int>` are **different types**. Inserting `{5, 6}` into the wrong one may compile but silently narrow. `auto` and `make_pair` help you keep them consistent.' },

    { t: 'quiz', q: 'Which is smaller? `make_pair(2, 9) < make_pair(3, 0)`', opts: ['False: 9 > 0', 'True: the first elements decide (2 < 3)', 'Compile error', 'Undefined'], ans: 1,
      why: 'Lexicographic order: compare `first`; only if equal compare `second`. Since 2 < 3, the second values are never looked at.' },
    { t: 'quiz', q: 'You store `(value, index)` pairs and call `sort`. Two equal values come out in what order?', opts: ['Random', 'Smaller index first, since ties on `first` fall to `second`', 'Larger index first', 'Original order always'], ans: 1,
      why: 'Equal first elements are broken by comparing the second, so the smaller index comes first.' },

    { t: 'recap', items: [
      'Create pairs and tuples and read `.first` / `.second`, `get<N>`.',
      'Explain lexicographic comparison and why sorting pairs just works.',
      'Unpack with `auto [a, b] = ...`.',
      'Recognize the common pair patterns: (value, index), (row, col), (node, weight), (dist, node).',
    ] },
  ],
});
