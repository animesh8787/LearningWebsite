registerLesson('unordered-set', {
  title: '<em>unordered_set:</em> the fastest “have I seen this?”',
  lead: 'Trade away ordering and get near-instant membership tests. A hash table turns a key into a bucket number, so lookup does not depend on how many items you have.',
  blocks: [
    { t: 'h2', text: 'Coat-check, not a sorted shelf' },
    { t: 'levels',
      eli5: ['A coat check with 7 numbered hooks. When you hand over your coat, a rule turns your name into a hook number (say, “add up the letters, then take the remainder after dividing by 7”). To retrieve it, apply the same rule and go **straight** to that hook. No searching through all the coats.',
             'If two coats land on the same hook, they just hang together and you check both.'],
      plain: ['`unordered_set<T>` stores unique values in a **hash table**: an array of **buckets**. A **hash function** turns each value into a number; that number (modulo the bucket count) picks the bucket. `insert`, `find`, `count` and `erase` take **O(1) on average**. The price: elements come out in **no particular order**, and there is no “next larger value”.',
              'When many values land in the same bucket (a **collision**) they are chained together. If the table gets too full, it **rehashes** into more buckets.'],
      tech: ['libstdc++ uses separate chaining: an array of bucket heads, each a singly linked list of nodes, with prime bucket counts. The **load factor** (`size / bucket_count`) is kept ≤ `max_load_factor` (default 1.0); exceeding it triggers a rehash (O(n)) that invalidates **iterators** but not references. Worst case, if every key collides, operations degrade to **O(n)**: this is what anti-hash tests attack. Integers hash to themselves in libstdc++, which makes them hackable with multiples of the bucket count.'] },

    { t: 'h2', text: 'See the buckets' },
    { t: 'p', html: 'Insert keys. The hash here is just `key % bucketCount`. Pre-filled 10, 17, 24 all land in bucket 3: a **collision chain**. Keep inserting until the table **rehashes**. Use find to see how many comparisons a lookup needs.' },
    { t: 'viz', kind: 'hashtab', cfg: { next: '31', items: ['10', '17', '24', '3'] } },

    { t: 'code', file: 'uset_basics.cpp', code: `#include <iostream>
#include <unordered_set>
#include <vector>
using namespace std;

int main() {
    unordered_set<int> seen = {3, 1, 4, 1, 5};      // duplicates dropped
    seen.insert(9);
    cout << seen.size() << "\\n";                     // 5

    cout << seen.count(4) << seen.count(7) << "\\n";   // 10   (1 = present)
    if (seen.find(9) != seen.end()) cout << "has 9\\n";
    seen.erase(1);

    // iteration order is NOT sorted and may change after inserts: never rely on it
    for (int x : seen) cout << x << " ";

    // handy: build from a vector, then ask many questions
    vector<int> v = {7, 8, 9, 7};
    unordered_set<int> s(v.begin(), v.end());
    cout << "\\n" << s.size() << "\\n";                // 3

    seen.reserve(1000);                              // pre-size buckets: avoids rehashes
}` },
    { t: 'table', head: ['Operation', 'Average', 'Worst case'], rows: [
      ['`insert`, `erase`, `find`, `count`', '**O(1)**', 'O(n) (all keys collide)'],
      ['iterate everything', 'O(n + buckets)', 'same'],
      ['min / max / `lower_bound`', '✗ not supported', 'use `set`'],
      ['`reserve(n)` / `rehash`', 'O(n)', 'once, up front'],
    ] },

    { t: 'h2', text: 'The classic patterns' },
    { t: 'code', file: 'uset_patterns.cpp', code: `#include <iostream>
#include <unordered_set>
#include <vector>
using namespace std;

// 1. first duplicate: O(n) instead of O(n^2)
int firstDup(const vector<int>& v) {
    unordered_set<int> seen;
    for (int x : v) if (!seen.insert(x).second) return x;   // insert returns {iterator, wasNew}
    return -1;
}

// 2. Longest Consecutive Sequence: only start counting from a sequence's beginning
int longestConsecutive(const vector<int>& a) {
    unordered_set<int> s(a.begin(), a.end());
    int best = 0;
    for (int x : s) {
        if (s.count(x - 1)) continue;                     // not a start: skip, it will be counted from its start
        int len = 1;
        while (s.count(x + len)) len++;
        best = max(best, len);
    }
    return best;                                          // each number is visited O(1) times => O(n)
}

int main() {
    cout << firstDup({2, 5, 3, 5, 2}) << "\\n";                    // 5
    cout << longestConsecutive({100, 4, 200, 1, 3, 2}) << "\\n";   // 4  (1 2 3 4)
}` },
    { t: 'table', head: ['LeetCode problem', 'Why unordered_set'], rows: [
      ['Contains Duplicate', 'O(1) “seen before?”'],
      ['Intersection of Two Arrays', 'put one array in a set, scan the other'],
      ['Happy Number', 'detect a repeated state'],
      ['Longest Consecutive Sequence', 'O(1) neighbour checks, no sorting'],
      ['Valid Sudoku', 'one set per row / column / box'],
      ['Word Break (dictionary)', 'dictionary membership'],
    ] },
    { t: 'callout', kind: 'warn', html: '**Custom keys need a hash.** `unordered_set<pair<int,int>>` does not compile out of the box. Encode the pair into one number (`r * 100003LL + c`), use a string key, or supply your own hash functor. `set<pair<int,int>>` just works if you can afford O(log n).' },
    { t: 'callout', kind: 'interview', html: 'On Codeforces, plain `unordered_set<int>` can be attacked with inputs that collide on purpose and push you to O(n²). Mitigation: a custom hash with a random seed (e.g. splitmix64 + `chrono` time), or use a sorted `vector` / `set`. On LeetCode you do not need to worry.' },

    { t: 'quiz', q: 'Two different keys hash to the same bucket. What happens?', opts: ['The second insert fails', 'Both are stored in that bucket’s chain, and lookups compare along it', 'The table crashes', 'The first key is overwritten'], ans: 1,
      why: 'That is a collision. Chaining stores both, and a lookup walks the short chain comparing keys with `==`.' },
    { t: 'quiz', q: 'You need the smallest value ≥ x from a collection of integers. Is `unordered_set` suitable?', opts: ['Yes, with `lower_bound`', 'No: there is no ordering, so use `set`', 'Yes, using `find`', 'Only for strings'], ans: 1,
      why: 'Hash tables destroy ordering. Order-based queries need a tree (`set`) or a sorted `vector`.' },

    { t: 'recap', items: [
      'Explain hashing: key → bucket, collisions via chains, rehash at high load factor.',
      'Use insert/find/count/erase in O(1) average and know the O(n) worst case.',
      'Apply the “seen before?” and “start of sequence” patterns.',
      'Know when to switch to `set` (order) or supply a custom hash (pair keys).',
    ] },
  ],
});
