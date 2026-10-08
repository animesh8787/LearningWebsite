registerLesson('set', {
  title: '<em>set:</em> unique items, always sorted',
  lead: 'A collection with no duplicates that keeps itself in order. Behind the scenes it is a balanced search tree, which is why every operation is O(log n) and why you can ask questions like “what is the next value above 17?”.',
  blocks: [
    { t: 'h2', text: 'A self-sorting guest list' },
    { t: 'levels',
      eli5: ['A guest list that (1) never lets the same name in twice and (2) is always kept in alphabetical order, no matter in which order people sign up. To check if someone is on the list you do not read every name: you open the book in the middle and go left or right, like a dictionary.'],
      plain: ['`set<T>` stores **unique** values in **sorted order**. `insert` ignores duplicates. `find` / `count` test membership in **O(log n)**. Because it is sorted you can also iterate in order, get the smallest (`*begin()`), the largest (`*rbegin()`), and use `lower_bound` / `upper_bound` to find neighbours.'],
      tech: ['`std::set` is implemented as a **red-black tree** (a self-balancing binary search tree guaranteeing height ≤ 2·log₂(n+1)). Each element is a heap-allocated node with parent/left/right pointers and a colour bit. Insert and erase rebalance with at most a few rotations. Elements are `const`: changing a key in place would break the ordering, so you erase and re-insert instead. Equivalence is defined by the comparator (`!comp(a,b) && !comp(b,a)`), not `==`. Iterators remain valid across insert/erase of other elements.'] },

    { t: 'h2', text: 'See the tree' },
    { t: 'p', html: 'Insert keys, then try **lower_bound** (first key ≥ x) and watch the highlighted search path. Click “insert 1…7 in order”: a plain tree would degrade into a chain, but the self-balancing rotations keep it short.' },
    { t: 'viz', kind: 'bst', cfg: { next: 25 } },

    { t: 'code', file: 'set_basics.cpp', code: `#include <iostream>
#include <set>
using namespace std;

int main() {
    set<int> s = {5, 1, 9, 1, 5};        // duplicates dropped, stored sorted
    s.insert(7);
    auto r = s.insert(7);                 // r.second == false: already there
    cout << r.second << " " << s.size() << "\\n";      // 0 4

    for (int x : s) cout << x << " ";                 // 1 5 7 9   (always sorted)
    cout << "\\n";

    cout << s.count(5) << s.count(6) << "\\n";          // 10   (membership: 0 or 1)
    if (s.find(9) != s.end()) cout << "has 9\\n";
    s.erase(5);                                        // erase by value
    cout << *s.begin() << " " << *s.rbegin() << "\\n";  // smallest 1, largest 9

    // order queries: the reason to choose set over unordered_set
    auto lb = s.lower_bound(6);                        // first element >= 6
    auto ub = s.upper_bound(7);                        // first element >  7
    cout << *lb << " " << *ub << "\\n";                 // 7 9
    if (lb != s.begin()) cout << *prev(lb) << "\\n";    // predecessor of 6: 1
}` },
    { t: 'table', head: ['Operation', 'Cost'], rows: [
      ['`insert`, `erase(value)`, `find`, `count`', '**O(log n)**'],
      ['`lower_bound`, `upper_bound`', '**O(log n)**'],
      ['`begin()`, `rbegin()` (min / max)', 'O(1)'],
      ['iterate everything in order', 'O(n)'],
      ['`s[i]` by position', '✗ not available'],
    ] },
    { t: 'callout', kind: 'warn', html: '`std::lower_bound(s.begin(), s.end(), x)` on a set is **O(n)**: the free function cannot jump around a tree. Always use the member `s.lower_bound(x)`, which is O(log n).' },

    { t: 'h2', text: 'Set versus the alternatives' },
    { t: 'table', head: ['Need', 'Pick'], rows: [
      ['just “have I seen this?”, no ordering', '`unordered_set` (O(1) average)'],
      ['unique **and** sorted, or neighbour queries', '`set`'],
      ['duplicates allowed, sorted', '`multiset`'],
      ['small, static data searched many times', 'sorted `vector` + `binary_search`'],
    ] },

    { t: 'h2', text: 'Patterns' },
    { t: 'code', file: 'set_patterns.cpp', code: `#include <iostream>
#include <set>
#include <vector>
using namespace std;

// 1. Contains Duplicate / dedupe
bool hasDup(const vector<int>& v) {
    set<int> seen;
    for (int x : v) if (!seen.insert(x).second) return true;   // insert fails => already present
    return false;
}

// 2. Closest value in a changing collection (predecessor / successor)
int closest(const set<int>& s, int x) {
    auto it = s.lower_bound(x);                       // first >= x
    if (it == s.end()) return *prev(it);              // all smaller
    if (it == s.begin()) return *it;                  // all bigger
    int hi = *it, lo = *prev(it);
    return (x - lo <= hi - x) ? lo : hi;
}

int main() {
    cout << hasDup({1, 2, 3, 2}) << "\\n";             // 1
    set<int> s = {10, 20, 30, 40};
    cout << closest(s, 26) << " " << closest(s, 5) << " " << closest(s, 99) << "\\n";   // 30 10 40
}` },
    { t: 'table', head: ['LeetCode problem', 'How set helps'], rows: [
      ['Contains Duplicate (I / II / III)', 'membership; III needs `lower_bound` on a sliding window'],
      ['Intersection of Two Arrays', 'set operations'],
      ['Longest Consecutive Sequence', 'find sequence starts with O(1)/O(log n) lookups'],
      ['My Calendar I', 'find the neighbouring interval with `lower_bound`'],
      ['Kth smallest in a dynamic stream', 'ordered iteration'],
    ] },
    { t: 'callout', kind: 'interview', html: 'The one-liner that earns points: “I used an ordered `set` so I can find the **predecessor/successor in O(log n)** with `lower_bound`. A hash set could not do that.”' },

    { t: 'quiz', q: 'What does `set<int> s = {3, 1, 3, 2}; cout << s.size();` print?', opts: ['4', '3', '2', '1'], ans: 1,
      why: 'Duplicates are dropped, leaving {1, 2, 3}: size 3.' },
    { t: 'quiz', q: 'You need to find the smallest stored value that is ≥ x, repeatedly, while inserting new values. Best container?', opts: ['`unordered_set`', '`vector` with `sort` each time', '`set` with `lower_bound`', '`stack`'], ans: 2,
      why: '`set` keeps order automatically and `lower_bound` answers in O(log n), even as you insert.' },

    { t: 'recap', items: [
      'Describe a set as a balanced tree: unique, sorted, O(log n).',
      'Use `insert`, `find`, `count`, `erase`, and iterate in order.',
      'Use the member `lower_bound` / `upper_bound` for neighbour queries.',
      'Decide between `set` and `unordered_set`.',
    ] },
  ],
});
