registerLesson('sorting', {
  title: '<em>sort</em> and friends',
  lead: 'The <algorithm> header is a toolbox of ready-made loops. Learn the handful you will use daily, and your code gets shorter, faster and harder to get wrong.',
  blocks: [
    { t: 'h2', text: 'Algorithms work on ranges' },
    { t: 'levels',
      eli5: ['Instead of writing your own routine every time you need to sort, count, or reverse a pile of cards, you hand the pile to a specialist: “sort this from here to there.” The specialist works the same way on any kind of pile.'],
      plain: ['STL algorithms take a **range** given by two iterators `[first, last)` (the start, and one past the end). They do not care which container the range came from. Most accept an optional extra argument: a comparator or a predicate, usually a [[lambda]]. Because they take iterators, you can run them on part of a container, on a reversed view, or on a plain array.'],
      tech: ['`std::sort` is **introsort** (quicksort that switches to heapsort if recursion gets too deep, and insertion sort for tiny partitions): O(n log n) worst case, not stable, requires random-access iterators. `stable_sort` is a merge sort that preserves the relative order of equivalent elements (O(n log n) with extra memory). `partial_sort` and `nth_element` solve “top-K” and “K-th smallest” in O(n log K) and O(n) average. C++20 adds `std::ranges::sort(v)`.'] },

    { t: 'h2', text: 'sort: and how to read the result' },
    { t: 'viz', kind: 'array', cfg: { title: 'Insertion sort (what std::sort uses on tiny ranges)', arr: [5, 2, 4, 1, 3], addr: false,
      code: `// insertion sort: grow a sorted prefix
for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;
    while (j >= 0 && a[j] > key) { a[j+1] = a[j]; j--; }
    a[j+1] = key;
}`,
      steps: [
        { line: 1, hl: [0], note: 'The first element on its own is trivially sorted. We will extend the sorted prefix one element at a time.' },
        { line: 3, hl: [1], set: { 0: 2, 1: 5 }, note: '`2` is smaller than `5`, so it shifts left past it. Prefix [2, 5] is sorted.' },
        { line: 3, hl: [2], set: { 1: 4, 2: 5 }, note: '`4` slides left past `5`, stops after `2`. Sorted prefix: [2, 4, 5].' },
        { line: 3, hl: [3], set: { 0: 1, 1: 2, 2: 4, 3: 5 }, note: '`1` is the smallest so far: it travels all the way to the front.' },
        { line: 3, hl: [4], set: { 2: 3, 3: 4, 4: 5 }, note: '`3` slides left past 5 and 4, and settles after 2. **Sorted: 1 2 3 4 5.** `std::sort` is much smarter for big inputs: O(n log n) instead of O(n²).' },
      ] } },
    { t: 'code', file: 'sort_basics.cpp', code: `#include <algorithm>
#include <functional>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 2, 9, 1, 7};
    sort(v.begin(), v.end());                           // ascending: 1 2 5 7 9
    sort(v.rbegin(), v.rend());                         // descending, via reverse iterators
    sort(v.begin(), v.end(), greater<int>());           // descending, via comparator

    vector<string> w = {"pear", "fig", "banana"};
    sort(w.begin(), w.end(), [](const string& a, const string& b) {
        return a.size() < b.size();                     // by length
    });
    for (auto& s : w) cout << s << " ";                 // fig pear banana

    sort(v.begin() + 1, v.begin() + 4);                 // sort only a sub-range
    int a[] = {3, 1, 2};
    sort(a, a + 3);                                     // raw arrays work: pointers are iterators

    // stable_sort: keeps the original order of equal elements
    vector<pair<int, char>> p = {{2, 'a'}, {1, 'b'}, {2, 'c'}, {1, 'd'}};
    stable_sort(p.begin(), p.end(), [](auto& x, auto& y) { return x.first < y.first; });
    for (auto& e : p) cout << e.first << e.second << " ";   // 1b 1d 2a 2c
}` },
    { t: 'table', head: ['Need', 'Use', 'Cost'], rows: [
      ['full sort', '`sort`', 'O(n log n)'],
      ['sort, keep ties in original order', '`stable_sort`', 'O(n log n)'],
      ['smallest K in order', '`partial_sort(b, b+K, e)`', 'O(n log K)'],
      ['K-th smallest only (rest unordered)', '`nth_element(b, b+k, e)`', 'O(n) average'],
      ['is it already sorted?', '`is_sorted`', 'O(n)'],
      ['sort a `list`', '`l.sort()` member', 'O(n log n)'],
    ] },
    { t: 'callout', kind: 'interview', html: 'Median / K-th element without sorting everything: `nth_element(v.begin(), v.begin() + k, v.end());` then `v[k]` is the K-th smallest in **O(n) average**. It is quickselect, built in.' },

    { t: 'h2', text: 'The rest of the daily toolbox' },
    { t: 'code', file: 'algo_toolbox.cpp', code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {4, 8, 15, 16, 23, 42, 8};

    reverse(v.begin(), v.end());                                 // in place
    cout << *max_element(v.begin(), v.end()) << " "              // returns an ITERATOR: dereference it
         << *min_element(v.begin(), v.end()) << "\\n";            // 42 4
    cout << count(v.begin(), v.end(), 8) << "\\n";                // 2
    cout << count_if(v.begin(), v.end(), [](int x) { return x > 10; }) << "\\n";   // 4
    cout << accumulate(v.begin(), v.end(), 0) << "\\n";           // 116 (use 0LL for big sums!)

    auto it = find(v.begin(), v.end(), 15);                      // first match or end()
    cout << (it != v.end() ? it - v.begin() : -1) << "\\n";       // index 4

    cout << all_of(v.begin(), v.end(), [](int x) { return x > 0; })     // 1
         << any_of(v.begin(), v.end(), [](int x) { return x == 42; })   // 1
         << none_of(v.begin(), v.end(), [](int x) { return x < 0; }) << "\\n";   // 1

    vector<int> w = v;
    sort(w.begin(), w.end());
    w.erase(unique(w.begin(), w.end()), w.end());                // dedupe a SORTED range: 4 8 15 16 23 42

    rotate(v.begin(), v.begin() + 2, v.end());                   // left-rotate by 2
    fill(v.begin(), v.end(), 0);                                 // set every element
    iota(w.begin(), w.end(), 1);                                 // 1 2 3 4 5 6
    swap(v[0], v[1]);
    cout << max({3, 9, 4}) << min(2, 7) << "\\n";                 // 9 2 : max/min of values (not ranges)
}` },

    { t: 'h2', text: 'Erase–remove: deleting from a vector correctly' },
    { t: 'p', html: '`remove` and `remove_if` do **not** shrink the container; they shuffle the keepers to the front and return the new logical end. You then `erase` the leftover tail. This two-step is the **erase–remove idiom**:' },
    { t: 'code', file: 'erase_remove.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3, 4, 5, 6};
    v.erase(remove_if(v.begin(), v.end(), [](int x) { return x % 2 == 0; }), v.end());   // drop evens
    for (int x : v) cout << x << " ";                     // 1 3 5

    vector<int> w = {7, 3, 7, 7, 1};
    w.erase(remove(w.begin(), w.end(), 7), w.end());      // drop every 7
    cout << "\\n" << w.size() << "\\n";                     // 2
}` },
    { t: 'callout', kind: 'tip', html: 'C++20 shortcut: `erase(v, 7)` and `erase_if(v, pred)` do the whole idiom in one call. Until then, memorise the two-step form: `v.erase(remove_if(...), v.end())`.' },

    { t: 'callout', kind: 'warn', html: '`accumulate(v.begin(), v.end(), 0)` uses an **int** accumulator, since the initial value `0` sets the type. For big sums write `0LL`, otherwise it overflows silently. Likewise `max_element` returns an **iterator**, so you must dereference it.' },

    { t: 'quiz', q: 'You call `remove_if(v.begin(), v.end(), pred)` and nothing else. What is the size of `v` afterwards?', opts: ['Smaller by the number removed', 'Unchanged: it only moves keepers forward and returns the new end', 'Zero', 'It throws'], ans: 1,
      why: 'The algorithm only sees iterators, so it cannot change the container’s size. You must follow with `v.erase(newEnd, v.end())`.' },
    { t: 'quiz', q: 'Which gives the K-th smallest element fastest on average?', opts: ['`sort` then index: O(n log n)', '`nth_element`: O(n)', '`partial_sort` of everything', '`set` of all elements'], ans: 1,
      why: '`nth_element` is a quickselect that places the K-th element correctly without ordering the rest.' },

    { t: 'recap', items: [
      'Pass `[first, last)` ranges and comparators/lambdas to algorithms.',
      'Choose between `sort`, `stable_sort`, `partial_sort` and `nth_element`.',
      'Use `count_if`, `any_of`, `accumulate`, `max_element`, `unique`, `iota` fluently.',
      'Delete correctly with the erase–remove idiom.',
    ] },
  ],
});
