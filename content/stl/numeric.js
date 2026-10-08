registerLesson('numeric', {
  title: 'Numeric and <em>utility</em> algorithms',
  lead: 'Sums, prefix sums, permutations, gcd, min/max helpers and a few safety tricks. The small functions that quietly save you ten lines each.',
  blocks: [
    { t: 'h2', text: 'The <numeric> header' },
    { t: 'table', head: ['Function', 'What it does', 'Example'], rows: [
      ['`accumulate`', 'fold a range into one value (sum, product, custom)', '`accumulate(b, e, 0LL)`'],
      ['`partial_sum`', 'running totals: **prefix sums**', '`partial_sum(b, e, out.begin())`'],
      ['`adjacent_difference`', 'differences of neighbours (inverse of prefix sum)', '`adjacent_difference(b, e, out)`'],
      ['`iota`', 'fill with 0, 1, 2… (or any start)', '`iota(v.begin(), v.end(), 1)`'],
      ['`inner_product`', 'dot product', '`inner_product(a.begin(), a.end(), b.begin(), 0)`'],
      ['`gcd`, `lcm`', 'greatest common divisor / least common multiple (C++17)', '`gcd(12, 18)` → 6'],
    ] },
    { t: 'code', file: 'numeric_demo.cpp', std17: true, code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

int main() {
    vector<int> a = {3, 1, 4, 1, 5};

    long long sum = accumulate(a.begin(), a.end(), 0LL);                       // 14  (note the 0LL)
    long long prod = accumulate(a.begin(), a.end(), 1LL, [](long long x, int y) { return x * y; });
    cout << sum << " " << prod << "\\n";                                        // 14 60

    vector<int> pre(a.size());
    partial_sum(a.begin(), a.end(), pre.begin());                              // 3 4 8 9 14
    cout << pre[3] - pre[0] << "\\n";                                           // sum of a[1..3] = 6

    vector<int> idx(5);
    iota(idx.begin(), idx.end(), 0);                                           // 0 1 2 3 4
    // sort indices by value: an "argsort", ties broken by index
    sort(idx.begin(), idx.end(), [&](int i, int j) { return a[i] != a[j] ? a[i] < a[j] : i < j; });
    for (int i : idx) cout << i << " ";                                        // 1 3 0 2 4
    cout << "\\n" << gcd(84, 36) << " " << lcm(4, 6) << "\\n";                   // 12 12
}` },
    { t: 'callout', kind: 'warn', html: 'The **initial value decides the accumulator type.** `accumulate(v.begin(), v.end(), 0)` sums in `int`, even if `v` holds `long long`s. Pass `0LL` (or `0.0` for doubles) so the running total cannot overflow or truncate.' },

    { t: 'h2', text: 'min, max, swap, clamp' },
    { t: 'code', file: 'min_max.cpp', std17: true, code: `#include <algorithm>
#include <iostream>
using namespace std;

int main() {
    int a = 4, b = 9;
    cout << min(a, b) << max(a, b) << "\\n";            // 49
    cout << max({3, 8, 1, 6}) << "\\n";                  // 8   (initializer list: any number of args)
    auto mm = minmax({3, 8, 1, 6});                      // pair of (min, max) in ONE pass
    cout << mm.first << " " << mm.second << "\\n";        // 1 8
    swap(a, b);                                          // a=9, b=4
    cout << clamp(15, 0, 10) << "\\n";                    // 10   (C++17: force into [lo, hi])
    // pitfall: min(1, 2LL) does not compile: both arguments must be the SAME type
    cout << min<long long>(1, 2LL) << "\\n";              // name the type explicitly
}` },

    { t: 'h2', text: 'next_permutation: all arrangements' },
    { t: 'p', html: '`next_permutation` rearranges a sequence into the next arrangement in sorted (lexicographic) order, returning `false` when it wraps around. **Start from a sorted sequence** to visit every permutation exactly once.' },
    { t: 'code', file: 'permutations.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3};                           // sorted: required to see all 6
    do {
        for (int x : v) cout << x;
        cout << " ";
    } while (next_permutation(v.begin(), v.end()));      // 123 132 213 231 312 321
    cout << "\\n";

    vector<int> w = {1, 5, 1};
    next_permutation(w.begin(), w.end());                // the single next one: 5 1 1
    for (int x : w) cout << x;
}` },
    { t: 'callout', kind: 'interview', html: 'n! grows extremely fast: 8! is 40,320 but 12! is 479 million. `next_permutation` is perfect for n ≤ 8 to 10. For *Next Permutation* (LeetCode 31) the answer is literally that one call.' },

    { t: 'h2', text: 'Safety and speed helpers' },
    { t: 'table', head: ['Need', 'Tool'], rows: [
      ['Safe integer limits', '`numeric_limits<int>::max()`, or `INT_MAX` / `LLONG_MAX` from `<climits>`'],
      ['Round / floor / ceil / abs', '`round`, `floor`, `ceil`, `abs`, `fabs` from `<cmath>`'],
      ['Integer ceiling division', '`(a + b - 1) / b` (positive ints)'],
      ['Power / root / log', '`pow`, `sqrt`, `log2`, `hypot` (returns `double`: beware precision)'],
      ['Random numbers', '`mt19937 rng(seed); uniform_int_distribution<int> d(1, 6); d(rng)`'],
      ['Fast bit count', '`__builtin_popcount(x)` or C++20 `popcount`'],
    ] },
    { t: 'code', file: 'limits.cpp', code: `#include <climits>
#include <iostream>
#include <limits>
#include <random>
using namespace std;

int main() {
    cout << INT_MAX << " " << numeric_limits<long long>::max() << "\\n";   // 2147483647 9223372036854775807
    int best = INT_MAX;                                      // "infinity" for min-tracking
    for (int x : {7, 3, 9}) best = min(best, x);
    cout << best << "\\n";                                    // 3

    mt19937 rng(42);                                         // seeded: reproducible
    uniform_int_distribution<int> die(1, 6);
    int r = die(rng);
    cout << (r >= 1 && r <= 6) << "\\n";                       // 1
    cout << (7 + 2 - 1) / 2 << "\\n";                         // 4 = ceil(7 / 2)
}` },
    { t: 'callout', kind: 'warn', html: 'Using `INT_MAX` as infinity then adding to it (`dist[u] + w`) overflows. Use `INT_MAX / 2`, or `1e9`, or `LLONG_MAX / 2` as a safe “infinity”.' },

    { t: 'quiz', q: 'You compute `accumulate(v.begin(), v.end(), 0)` over a `vector<long long>` with huge values. What goes wrong?', opts: ['Nothing', 'The accumulator is an `int`, so the sum overflows', 'It returns a string', 'It does not compile'], ans: 1,
      why: 'The type of the initial value is the type of the running sum. Use `0LL`.' },
    { t: 'quiz', q: 'How many permutations does the loop below visit? `vector<int> v = {2, 1, 3}; do {} while (next_permutation(...));`', opts: ['6', '3', 'Fewer than 6, because it started unsorted', '1'], ans: 2,
      why: 'It only advances **forward** from the start. Starting from 2 1 3 it visits only the permutations after it in order (3 of them). Sort first to see all 6.' },

    { t: 'recap', items: [
      'Use `accumulate`, `partial_sum`, `iota`, `gcd` and friends, with the right accumulator type.',
      'Use `min`/`max`/`minmax`/`clamp` with matching types.',
      'Enumerate permutations with `next_permutation` from a sorted start.',
      'Pick safe “infinity” values.',
    ] },
  ],
});
