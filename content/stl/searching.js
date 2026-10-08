registerLesson('searching', {
  title: 'Binary search <em>tools</em>',
  lead: 'On sorted data you can find anything by repeatedly cutting the problem in half. The STL packages that idea into lower_bound, upper_bound and friends, which are also the foundation of “binary search on the answer”.',
  blocks: [
    { t: 'h2', text: 'The guessing game' },
    { t: 'levels',
      eli5: ['“I am thinking of a number from 1 to 100.” You guess 50: “higher.” Now 75: “lower.” Each guess throws away half the possibilities, so you need at most 7 guesses, not 100. That only works because the numbers are **in order**.'],
      plain: ['If a range is **sorted**, you can look at the middle element: if the target is smaller, discard the right half; otherwise discard the left half. Repeat. Each step halves the search space, so searching a million items takes about 20 steps: **O(log n)**.',
              'The STL gives you `binary_search` (does it exist?), `lower_bound` (first element ≥ x) and `upper_bound` (first element > x). The last two return **iterators**, so they tell you *where*.'],
      tech: ['`lower_bound(first, last, x)` returns the first position `p` such that `!(*p < x)`; `upper_bound` returns the first `p` with `x < *p`. Together they bound the **equal range**, so `upper_bound − lower_bound` counts occurrences of `x` in O(log n). They require a range **partitioned** with respect to the predicate (usually sorted). On random-access iterators they take O(log n) steps; on `list` or `set` iterators the *free* functions still take O(n) iterator moves, so use the container’s member functions.'] },

    { t: 'h2', text: 'Watch the window shrink' },
    { t: 'viz', kind: 'array', cfg: { title: 'lower_bound(a, 23)', arr: [3, 8, 12, 17, 23, 23, 31, 40], addr: false,
      code: `lo = 0, hi = n;            // search in [lo, hi)
while (lo < hi) {
    mid = lo + (hi - lo) / 2;
    if (a[mid] < x) lo = mid + 1;
    else            hi = mid;
}
// lo = first index with a[lo] >= x`,
      steps: [
        { line: 1, ptr: { lo: 0, hi: 8 }, note: 'Searching for the first element **≥ 23**. The candidate range is the whole array. (`hi = 8` is one past the end.)' },
        { line: 3, ptr: { lo: 0, mid: 4, hi: 8 }, hl: [4], note: '`mid = 4`, value **23**. Is `23 < 23`? No.' },
        { line: 5, ptr: { lo: 0, hi: 4 }, dim: [4, 5, 6, 7], note: 'Not smaller, so `mid` **might be** the answer: keep it by setting `hi = mid = 4`. The right half is discarded.' },
        { line: 3, ptr: { lo: 0, mid: 2, hi: 4 }, hl: [2], dim: [4, 5, 6, 7], note: '`mid = 2`, value 12. `12 < 23`: too small.' },
        { line: 4, ptr: { lo: 3, hi: 4 }, dim: [0, 1, 2, 4, 5, 6, 7], note: 'Everything up to `mid` is too small: `lo = mid + 1 = 3`.' },
        { line: 3, ptr: { lo: 3, mid: 3, hi: 4 }, hl: [3], dim: [0, 1, 2, 4, 5, 6, 7], note: '`mid = 3`, value 17. `17 < 23`: too small again.' },
        { line: 4, ptr: { lo: 4, hi: 4 }, note: '`lo = 4`, and now `lo == hi`: the window is empty.' },
        { line: 7, ptr: { result: 4 }, hl: [4], note: '**Answer: index 4**, the first 23. About 3 comparisons for 8 elements: log₂ 8.' },
      ] } },

    { t: 'code', file: 'bound_basics.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {3, 8, 12, 17, 23, 23, 31, 40};          // MUST be sorted

    cout << binary_search(v.begin(), v.end(), 17) << "\\n";   // 1: exists?

    auto lo = lower_bound(v.begin(), v.end(), 23);           // first element >= 23
    auto hi = upper_bound(v.begin(), v.end(), 23);           // first element >  23
    cout << (lo - v.begin()) << " " << (hi - v.begin()) << "\\n";   // 4 6
    cout << (hi - lo) << "\\n";                               // 2  = how many 23s

    auto it = lower_bound(v.begin(), v.end(), 20);           // value not present
    cout << *it << " " << (it - v.begin()) << "\\n";          // 23 4  (next larger)
    if (it != v.begin()) cout << *prev(it) << "\\n";          // 17    (the predecessor)

    auto none = lower_bound(v.begin(), v.end(), 99);
    cout << (none == v.end()) << "\\n";                       // 1: past the end, don't dereference!

    // descending data: pass the SAME comparator you sorted with
    vector<int> d = {9, 7, 5, 3};
    auto p = lower_bound(d.begin(), d.end(), 6, greater<int>());   // first element NOT greater than 6
    cout << *p << "\\n";                                       // 5
}` },
    { t: 'table', head: ['Question', 'Call', 'Result'], rows: [
      ['Is x present?', '`binary_search(b, e, x)`', '`bool`'],
      ['Index of the first occurrence', '`lower_bound(b, e, x) - b`', 'valid only if `*it == x`'],
      ['How many x?', '`upper_bound − lower_bound`', 'count'],
      ['Smallest element ≥ x (successor)', '`lower_bound`', 'iterator'],
      ['Smallest element > x', '`upper_bound`', 'iterator'],
      ['Largest element ≤ x (predecessor)', '`upper_bound`, then `prev`', 'iterator'],
      ['Number of elements < x', '`lower_bound(b, e, x) - b`', 'integer'],
    ] },
    { t: 'callout', kind: 'warn', html: 'Binary search on **unsorted** data gives garbage with no error. And always compare the returned iterator with `end()` before dereferencing: `lower_bound` returns `end()` when every element is smaller than `x`.' },

    { t: 'h2', text: 'Binary search on the answer' },
    { t: 'p', html: 'The most powerful use: you are not searching an array but a **range of possible answers**, for which some yes/no test flips from false to true exactly once (it is *monotonic*). Example: “smallest eating speed `k` so Koko finishes all piles within `h` hours.”' },
    { t: 'code', file: 'answer_search.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

bool canFinish(const vector<int>& piles, long long speed, int h) {
    long long hours = 0;
    for (int p : piles) hours += (p + speed - 1) / speed;      // ceil(p / speed)
    return hours <= h;                                          // faster speed => fewer hours: monotonic
}

int minSpeed(const vector<int>& piles, int h) {
    long long lo = 1, hi = 1e9;                                 // answer lies in [lo, hi]
    while (lo < hi) {
        long long mid = lo + (hi - lo) / 2;
        if (canFinish(piles, mid, h)) hi = mid;                 // mid works: try smaller (keep mid)
        else lo = mid + 1;                                      // too slow: need more
    }
    return lo;                                                  // smallest speed that works
}

int main() { cout << minSpeed({3, 6, 7, 11}, 8) << "\\n"; }      // 4
` },
    { t: 'callout', kind: 'interview', html: 'Spot it by the wording: “**minimum** X such that…”, “**maximum** value we can still…”, “split into K parts minimising the largest”. Write the yes/no check first, confirm it is monotonic, then binary search. Remember `mid = lo + (hi - lo) / 2` to avoid overflow, and `long long` for large ranges.' },

    { t: 'quiz', q: 'For sorted `{1, 4, 4, 4, 9}`, what is `upper_bound(…, 4) - lower_bound(…, 4)`?', opts: ['0', '1', '3', '4'], ans: 2,
      why: '`lower_bound` points at the first 4 (index 1), `upper_bound` at 9 (index 4). Their difference, 3, is the number of 4s.' },
    { t: 'quiz', q: 'Your yes/no test is false, false, false, true, true, true across the range. What does binary search on the answer find?', opts: ['The first `true`', 'The last `false`', 'Nothing: it needs a sorted array', 'The middle'], ans: 0,
      why: 'Monotonic predicates are all you need. The `hi = mid` / `lo = mid + 1` loop converges on the boundary: the smallest value where the test is true.' },

    { t: 'recap', items: [
      'Explain binary search as halving a sorted range, and write it from memory.',
      'Use `binary_search`, `lower_bound` and `upper_bound`, and always check against `end()`.',
      'Count occurrences and find predecessors/successors.',
      'Apply binary search on the answer to “minimise the maximum” style problems.',
    ] },
  ],
});
