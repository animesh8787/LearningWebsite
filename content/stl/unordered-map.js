registerLesson('unordered-map', {
  title: '<em>unordered_map:</em> the interview workhorse',
  lead: 'Instant lookup by key. If you could only learn one container for coding interviews after vector, this is the one: counting, caching, grouping and indexing all run on it.',
  blocks: [
    { t: 'h2', text: 'A hash table of key → value' },
    { t: 'levels',
      eli5: ['A cloakroom where each hook holds not just a coat but also a note about it. You tell the attendant your name, they jump to your hook and read the note. It is the same coat-check idea as `unordered_set`, but every entry carries a **value** next to its key.'],
      plain: ['`unordered_map<K, V>` stores unique keys with an attached value, in a hash table. `m[key]`, `find`, `insert` and `erase` are **O(1) on average**. Like `map`, each element is a `pair<const K, V>`, but there is **no sorted order**. Everything you learned about `map` (including the `m[key]` auto-insert behaviour) applies here.'],
      tech: ['Same chained hash table as `unordered_set`, with nodes storing `pair<const K, V>`. `operator[]` default-constructs `V` on a miss (an insertion that may trigger a rehash). Rehash invalidates iterators but never references or pointers to elements, so `V&` obtained earlier stays valid. `reserve(n)` sets bucket count for n elements. Hashing for `string` is O(length); for custom key types provide a `std::hash` specialisation or a functor.'] },

    { t: 'code', file: 'umap_basics.cpp', code: `#include <iostream>
#include <string>
#include <unordered_map>
using namespace std;

int main() {
    unordered_map<string, int> stock;
    stock["apple"] = 5;
    stock["pear"] += 3;                       // missing key starts at 0, then += 3
    stock.insert({"fig", 9});
    stock.emplace("kiwi", 2);

    cout << stock["apple"] << " " << stock.size() << "\\n";         // 5 4

    auto it = stock.find("fig");              // look up WITHOUT inserting
    if (it != stock.end()) cout << it->first << "=" << it->second << "\\n";   // fig=9

    if (stock.count("plum") == 0) cout << "no plum\\n";
    stock.erase("pear");

    for (const auto& kv : stock) cout << kv.first << ":" << kv.second << " ";   // some order
    cout << "\\n";
    stock.reserve(1000);                       // avoid rehashes when you know the size
}` },
    { t: 'table', head: ['', '`map`', '`unordered_map`'], rows: [
      ['Structure', 'balanced tree', 'hash table'],
      ['lookup / insert / erase', 'O(log n)', '**O(1)** average, O(n) worst'],
      ['Iteration order', 'sorted by key', 'arbitrary'],
      ['`lower_bound`, range queries', '✓', '✗'],
      ['Key type needs', '`operator<`', '`hash` and `==`'],
      ['Memory', 'less', 'more (buckets + nodes)'],
    ] },

    { t: 'h2', text: 'Pattern 1: counting' },
    { t: 'code', file: 'umap_count.cpp', code: `#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    vector<string> votes = {"a", "b", "a", "c", "a", "b"};
    unordered_map<string, int> cnt;
    for (const string& v : votes) cnt[v]++;               // the idiom: [] creates 0, then ++

    string best; int bestN = 0;
    for (const auto& kv : cnt)
        if (kv.second > bestN) { bestN = kv.second; best = kv.first; }
    cout << best << " " << bestN << "\\n";                  // a 3
}` },

    { t: 'h2', text: 'Pattern 2: Two Sum, the most famous interview question' },
    { t: 'p', html: 'Find two numbers that add up to a target. The brute force checks every pair: O(n²). With a hash map, for each number `x` you ask in O(1): “have I already seen `target − x`?”. One pass, **O(n)**.' },
    { t: 'code', file: 'two_sum.cpp', code: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

vector<int> twoSum(const vector<int>& a, int target) {
    unordered_map<int, int> idx;                          // value -> index where we saw it
    for (int i = 0; i < (int)a.size(); i++) {
        auto it = idx.find(target - a[i]);                // is the complement already stored?
        if (it != idx.end()) return {it->second, i};
        idx[a[i]] = i;                                    // store AFTER checking (don't pair with itself)
    }
    return {};
}

int main() {
    auto r = twoSum({2, 7, 11, 15}, 9);
    cout << r[0] << " " << r[1] << "\\n";                   // 0 1
}` },

    { t: 'h2', text: 'Pattern 3: prefix sums + hash map' },
    { t: 'p', html: '“How many subarrays sum to K?” Keep a running sum. A subarray ending here sums to K exactly when an **earlier** prefix equalled `sum − K`. Count how often each prefix occurred.' },
    { t: 'code', file: 'subarray_sum.cpp', code: `#include <iostream>
#include <unordered_map>
#include <vector>
using namespace std;

int subarraySum(const vector<int>& a, int k) {
    unordered_map<int, int> seen;                         // prefix sum -> how many times
    seen[0] = 1;                                          // the empty prefix
    int sum = 0, count = 0;
    for (int x : a) {
        sum += x;
        auto it = seen.find(sum - k);
        if (it != seen.end()) count += it->second;        // each earlier match is one subarray
        seen[sum]++;
    }
    return count;
}

int main() { cout << subarraySum({1, 2, 3, -3, 3}, 3) << "\\n"; }   // 5: [1,2] [3] [1,2,3,-3] [3,-3,3] [3]
` },

    { t: 'h2', text: 'Pattern 4: memoization' },
    { t: 'code', file: 'memo.cpp', code: `#include <iostream>
#include <unordered_map>
using namespace std;

unordered_map<int, long long> memo;
long long fib(int n) {
    if (n < 2) return n;
    auto it = memo.find(n);
    if (it != memo.end()) return it->second;               // already computed
    return memo[n] = fib(n - 1) + fib(n - 2);              // compute once, store
}

int main() { cout << fib(80) << "\\n"; }                    // 23416728348467685, instant (vs 2^80 calls)
` },
    { t: 'table', head: ['LeetCode problem', 'unordered_map role'], rows: [
      ['Two Sum', 'value → index'],
      ['Group Anagrams', 'sorted string → vector of words'],
      ['Top K Frequent Elements', 'value → count'],
      ['Subarray Sum Equals K', 'prefix sum → count'],
      ['LRU Cache', 'key → list iterator'],
      ['Copy List with Random Pointer', 'old node → new node'],
      ['Word Pattern / Isomorphic Strings', 'character mappings'],
    ] },

    { t: 'h2', text: 'Pitfalls' },
    { t: 'ul', items: [
      '`m[k]` as a **check** inserts `k`. Use `count` / `find`.',
      'Modifying the map while holding an iterator: an insert may **rehash**, invalidating iterators.',
      '**Pair / vector keys** have no default hash. Use `map`, encode into `long long` / `string`, or write a hasher.',
      'Don’t depend on iteration order, not even between runs or platforms.',
      'Worst-case O(n) per operation: adversarial inputs can force collisions on contest sites. Randomise the hash or use `map`.',
    ] },
    { t: 'code', file: 'pair_hash.cpp', code: `#include <iostream>
#include <unordered_map>
using namespace std;

struct PairHash {                                             // a custom hash for pair<int,int>
    size_t operator()(const pair<int, int>& p) const {
        return hash<long long>()(((long long)p.first << 32) ^ (unsigned)p.second);
    }
};

int main() {
    unordered_map<pair<int, int>, int, PairHash> grid;       // 3rd template argument = the hasher
    grid[{2, 3}] = 7;
    cout << grid[{2, 3}] << "\\n";                             // 7
}` },
    { t: 'callout', kind: 'interview', html: 'Always state complexity honestly: “**O(1) average, O(n) worst case**; I can switch to `map` for guaranteed O(log n).” Interviewers like hearing that you know the worst case exists.' },

    { t: 'quiz', q: 'In Two Sum, why do we store `a[i]` in the map AFTER checking for the complement?', opts: ['Speed', 'So that an element is not paired with itself', 'The map would be empty otherwise', 'No reason'], ans: 1,
      why: 'If we stored first, then for `target = 2 × a[i]` the lookup would find `a[i]` itself, pairing an element with itself.' },
    { t: 'quiz', q: 'What does `unordered_map<int,int> m; if (m[5] == 0) {}` do to the map?', opts: ['Nothing', 'Inserts key 5 with value 0', 'Throws', 'Erases 5'], ans: 1,
      why: '`operator[]` inserts a default-constructed value on a miss, so the map now has an entry for 5.' },

    { t: 'recap', items: [
      'Use the O(1) average operations and know the worst case.',
      'Write counting, Two Sum, prefix-sum and memoization patterns.',
      'Avoid `[]` as a lookup, iterator invalidation on rehash, and unhashable keys.',
      'Choose `map` vs `unordered_map` with reasons.',
    ] },
  ],
});
