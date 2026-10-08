registerLesson('patterns', {
  title: 'LeetCode <em>patterns</em>, mapped to the STL',
  lead: 'Most interview problems are a few dozen patterns wearing different costumes. Learn to recognise the trigger words, and the right container and template follow almost automatically.',
  blocks: [
    { t: 'h2', text: 'The cheat map: words in the problem → tool to reach for' },
    { t: 'table', head: ['If the problem says…', 'Think', 'STL tools'], rows: [
      ['“have I seen…”, “duplicate”, “exists”', 'membership', '`unordered_set`'],
      ['“count how many of each”, “frequency”', 'counting', '`unordered_map<K,int>`, `array<int,26>`'],
      ['“pair that sums to…”, “complement”', 'complement lookup', '`unordered_map` (unsorted) / two pointers (sorted)'],
      ['“sorted array”, “find position”', 'binary search', '`lower_bound`, `upper_bound`'],
      ['“minimum X such that…”', 'binary search on the answer', 'yes/no check + `lo`/`hi` loop'],
      ['“subarray / substring” + “longest / shortest / at most K”', 'sliding window', 'two indices + counts'],
      ['“sum of subarray”, “range sum”', 'prefix sums', '`vector` of running totals (+ `unordered_map`)'],
      ['“next greater / smaller”, “matching brackets”', 'monotonic stack', '`stack` / `vector`'],
      ['“shortest path (unweighted)”, “level by level”, “minimum steps”', 'BFS', '`queue` + visited'],
      ['“shortest path (weighted)”', 'Dijkstra', '`priority_queue<pair>` min-heap'],
      ['“K largest / most frequent / closest”', 'top-K', '`priority_queue` of size K'],
      ['“merge / overlap / schedule intervals”', 'sort then sweep', '`sort`, `vector<vector<int>>`'],
      ['“all combinations / permutations / subsets”', 'backtracking', 'recursion + `vector` path'],
      ['“number of ways”, “minimum cost”, “can we reach”', 'dynamic programming', '`vector<int> dp`'],
      ['“connected components”, “are x and y connected”', 'union-find / DFS', '`vector<int> parent`'],
    ] },

    { t: 'h2', text: 'Pattern 1: Two pointers' },
    { t: 'p', html: 'On a **sorted** array, put one pointer at each end. If the sum is too small, move the left pointer up; too big, move the right pointer down. Every step discards one candidate, so it is O(n) instead of O(n²).' },
    { t: 'viz', kind: 'array', cfg: { title: 'Two Sum on a sorted array, target 13', arr: [1, 3, 4, 7, 9, 12], addr: false,
      code: `int l = 0, r = n - 1;
while (l < r) {
    int s = a[l] + a[r];
    if (s == target) return {l, r};
    if (s < target) l++;     // need a bigger sum
    else            r--;     // need a smaller sum
}`,
      steps: [
        { line: 1, ptr: { l: 0, r: 5 }, hl: [0, 5], note: 'Start at both ends: `1 + 12 = 13`. That equals the target immediately. (We will keep stepping on a harder target to see the moves.)' },
        { line: 3, ptr: { l: 0, r: 5 }, hl: [0, 5], note: 'Suppose the target were **16**. `1 + 12 = 13 < 16`: the sum is too small, and since the array is sorted, `1` cannot pair with anything smaller than 12.' },
        { line: 5, ptr: { l: 1, r: 5 }, hl: [1, 5], note: 'So `1` is discarded forever: `l++`. Now `3 + 12 = 15 < 16`: again too small.' },
        { line: 5, ptr: { l: 2, r: 5 }, hl: [2, 5], note: '`l++`: `4 + 12 = 16 == 16`. Found, after only 3 checks instead of 15 pairs.' },
      ] } },
    { t: 'code', file: 'two_pointers.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    // 1. pair with target sum in a SORTED array
    vector<int> a = {1, 3, 4, 7, 9, 12};
    int l = 0, r = a.size() - 1, target = 16;
    while (l < r) {
        int s = a[l] + a[r];
        if (s == target) break;
        (s < target) ? l++ : r--;
    }
    cout << l << " " << r << "\\n";                 // 2 5

    // 2. remove duplicates from a sorted array IN PLACE (slow/fast pointers)
    vector<int> b = {1, 1, 2, 2, 2, 3};
    int w = 0;                                       // w = write position
    for (int i = 0; i < (int)b.size(); i++)
        if (i == 0 || b[i] != b[i - 1]) b[w++] = b[i];
    b.resize(w);
    for (int x : b) cout << x << " ";                // 1 2 3
}` },

    { t: 'h2', text: 'Pattern 2: Sliding window' },
    { t: 'p', html: 'A window `[l, r]` slides over the data. Extend `r` to add an element; while the window breaks a rule, shrink from `l`. Each index enters and leaves once: **O(n)**.' },
    { t: 'code', file: 'sliding_window.cpp', code: `#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

// Longest substring without repeating characters
int longestUnique(const string& s) {
    unordered_map<char, int> cnt;
    int best = 0, l = 0;
    for (int r = 0; r < (int)s.size(); r++) {
        cnt[s[r]]++;                                  // extend the window to the right
        while (cnt[s[r]] > 1) {                       // rule broken: a duplicate
            cnt[s[l]]--; l++;                         // shrink from the left until valid again
        }
        best = max(best, r - l + 1);
    }
    return best;
}

// Maximum sum of any K consecutive elements (fixed-size window)
int maxSumK(const vector<int>& a, int k) {
    int sum = 0, best;
    for (int i = 0; i < k; i++) sum += a[i];
    best = sum;
    for (int i = k; i < (int)a.size(); i++) {
        sum += a[i] - a[i - k];                       // one enters, one leaves
        best = max(best, sum);
    }
    return best;
}

int main() {
    cout << longestUnique("abcabcbb") << " " << maxSumK({2, 1, 5, 1, 3, 2}, 3) << "\\n";   // 3 9
}` },

    { t: 'h2', text: 'Pattern 3: Prefix sums' },
    { t: 'code', file: 'prefix_sums.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {2, 4, 1, 7, 3};
    vector<long long> pre(a.size() + 1, 0);              // pre[i] = sum of the first i elements
    for (size_t i = 0; i < a.size(); i++) pre[i + 1] = pre[i] + a[i];

    auto rangeSum = [&](int l, int r) { return pre[r + 1] - pre[l]; };   // sum of a[l..r] in O(1)
    cout << rangeSum(1, 3) << " " << rangeSum(0, 4) << "\\n";            // 12 17

    // 2D version: prefix sums over a grid answer rectangle sums in O(1)
    vector<vector<int>> g = {{1, 2}, {3, 4}};
    vector<vector<int>> P(3, vector<int>(3, 0));
    for (int r = 0; r < 2; r++)
        for (int c = 0; c < 2; c++)
            P[r + 1][c + 1] = g[r][c] + P[r][c + 1] + P[r + 1][c] - P[r][c];
    cout << P[2][2] << "\\n";                                             // 10
}` },

    { t: 'h2', text: 'Pattern 4: Intervals — sort, then sweep' },
    { t: 'code', file: 'intervals.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

vector<vector<int>> mergeIntervals(vector<vector<int>> v) {
    sort(v.begin(), v.end());                              // by start (vectors compare lexicographically)
    vector<vector<int>> out;
    for (auto& cur : v) {
        if (out.empty() || out.back()[1] < cur[0]) out.push_back(cur);   // gap: start a new interval
        else out.back()[1] = max(out.back()[1], cur[1]);                  // overlap: extend the last one
    }
    return out;
}

int main() {
    for (auto& i : mergeIntervals({{1, 3}, {8, 10}, {2, 6}, {15, 18}}))
        cout << "[" << i[0] << "," << i[1] << "] ";        // [1,6] [8,10] [15,18]
}` },

    { t: 'h2', text: 'Pattern 5: Backtracking' },
    { t: 'p', html: 'Build a solution one choice at a time in a shared `vector` (the **path**): choose, recurse, then **undo** the choice so the next branch starts clean.' },
    { t: 'code', file: 'subsets_bt.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

void go(const vector<int>& a, int start, vector<int>& path, vector<vector<int>>& out) {
    out.push_back(path);                                   // every path so far is a valid subset
    for (int i = start; i < (int)a.size(); i++) {
        path.push_back(a[i]);                              // choose
        go(a, i + 1, path, out);                           // explore
        path.pop_back();                                   // un-choose (backtrack)
    }
}

int main() {
    vector<int> a = {1, 2, 3};
    vector<int> path; vector<vector<int>> out;
    go(a, 0, path, out);
    cout << out.size() << "\\n";                            // 8 subsets = 2^3
}` },

    { t: 'h2', text: 'Pattern 6: Dynamic programming with a vector' },
    { t: 'code', file: 'dp_coins.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// Fewest coins to make 'amount'. dp[x] = best answer for amount x.
int coinChange(const vector<int>& coins, int amount) {
    const int INF = 1e9;
    vector<int> dp(amount + 1, INF);
    dp[0] = 0;                                              // zero coins make zero
    for (int x = 1; x <= amount; x++)
        for (int c : coins)
            if (c <= x && dp[x - c] != INF) dp[x] = min(dp[x], dp[x - c] + 1);
    return dp[amount] == INF ? -1 : dp[amount];
}

int main() { cout << coinChange({1, 5, 10, 25}, 63) << " " << coinChange({2}, 3) << "\\n"; }   // 6 -1
` },

    { t: 'h2', text: 'Pattern 7: Union-Find' },
    { t: 'code', file: 'dsu.cpp', code: `#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

struct DSU {
    vector<int> p, sz;
    DSU(int n) : p(n), sz(n, 1) { iota(p.begin(), p.end(), 0); }    // each node its own parent
    int find(int x) { return p[x] == x ? x : p[x] = find(p[x]); }  // path compression
    bool unite(int a, int b) {
        a = find(a); b = find(b);
        if (a == b) return false;                                  // already connected
        if (sz[a] < sz[b]) swap(a, b);
        p[b] = a; sz[a] += sz[b];                                  // attach smaller under larger
        return true;
    }
};

int main() {
    DSU d(5);
    d.unite(0, 1); d.unite(1, 2); d.unite(3, 4);
    cout << (d.find(0) == d.find(2)) << (d.find(0) == d.find(3)) << "\\n";   // 10
}` },

    { t: 'h2', text: 'Already covered, now just recognise them' },
    { t: 'ul', items: [
      '**Frequency / complement** → `unordered_map` (Two Sum, Subarray Sum): see the unordered_map lesson.',
      '**Monotonic stack** (Next Greater, Histogram): the stack lesson.',
      '**BFS** (shortest path, levels): the queue lesson.',
      '**Top-K, Dijkstra, median of a stream**: the priority_queue lesson.',
      '**Binary search on the answer**: the searching lesson.',
      '**Sliding-window maximum** (monotonic deque): the deque lesson.',
    ] },
    { t: 'callout', kind: 'interview', html: 'How to attack a new problem in an interview: (1) restate it, (2) write a **brute force** and its complexity, (3) ask which pattern removes the wasted work (“I am re-scanning the same elements: sliding window / prefix sums / hash map”), (4) pick the container, (5) code it, (6) test with an empty, a single and a duplicate-heavy input.' },

    { t: 'quiz', q: '“Longest subarray with sum ≤ S, all numbers positive.” Which pattern?', opts: ['Backtracking', 'Sliding window', 'Union-find', 'Dijkstra'], ans: 1,
      why: 'Positive numbers make the sum monotonic as the window grows or shrinks, so a variable-size window with two pointers gives O(n).' },
    { t: 'quiz', q: 'You need to answer many “sum of a[l..r]” queries on a static array. Best approach?', opts: ['Loop over l..r each time: O(n) per query', 'Prefix sums: O(n) once, O(1) per query', 'A `set`', 'Sort the array'], ans: 1,
      why: 'Build prefix sums once, then every range sum is `pre[r+1] − pre[l]`.' },

    { t: 'recap', items: [
      'Map trigger phrases in a problem to the pattern and the container.',
      'Write templates for two pointers, sliding window, prefix sums, interval merging, backtracking, DP and union-find.',
      'Follow the brute-force → pattern → code → test routine in interviews.',
    ] },
  ],
});
