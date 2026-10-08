registerLesson('vector', {
  title: '<em>vector:</em> the container you will use for everything',
  lead: 'If you remember one STL container, make it this one. A vector is a growable array: fast indexing, fast appends, and it manages its own memory.',
  blocks: [
    { t: 'h2', text: 'An array that can grow' },
    { t: 'levels',
      eli5: ['A row of lockers. When you run out of lockers, the school does not add one at the end (the hallway is full). Instead it moves everything to a new, longer hallway with twice as many lockers, then keeps adding. Moving is a big job, but it happens rarely.'],
      plain: ['A `vector<T>` stores its elements **side by side in one block of memory**, just like an array, so `v[i]` is instant. It tracks two numbers: its **size** (how many elements you have) and its **capacity** (how many fit before it must grow). When `push_back` finds no room, the vector allocates a bigger block (about 2× larger), copies the elements over, and frees the old block.'],
      tech: ['A vector holds three pointers: `begin`, `end` (one past last element) and `end_of_storage`. `push_back` is **amortized O(1)**: reallocation is O(n) but geometric growth (×2 in libstdc++/libc++, ×1.5 in MSVC) makes total copy cost ≤ ~2n for n pushes. Contiguity makes iteration cache-friendly and allows `v.data()` to be passed to C APIs. `vector<bool>` is a special bit-packed container that does **not** behave like the others; avoid it.'] },

    { t: 'h2', text: 'Under the hood: size vs capacity' },
    { t: 'p', html: 'Push elements one at a time and watch the capacity double. Notice how the **data address changes** on each reallocation. Try `reserve(32)` to avoid all of them.' },
    { t: 'viz', kind: 'vecgrow', cfg: {} },

    { t: 'h2', text: 'The everyday toolkit' },
    { t: 'code', file: 'vector_basics.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> a;                    // empty
    vector<int> b(5);                 // five 0s
    vector<int> c(5, 7);              // five 7s
    vector<int> d = {3, 1, 4, 1, 5};  // initializer list
    vector<vector<int>> grid(3, vector<int>(4, 0));   // 3x4 grid of zeros

    d.push_back(9);                   // append
    d.pop_back();                     // remove last
    cout << d.size() << " " << d.empty() << "\\n";     // 5 0
    cout << d[0] << " " << d.front() << " " << d.back() << "\\n";   // 3 3 5
    cout << d.at(2) << "\\n";          // 4  (at() checks bounds and throws; [] does not)

    d.insert(d.begin() + 1, 99);      // insert at index 1: shifts the rest right (O(n))
    d.erase(d.begin());               // remove first element: shifts left (O(n))
    d.resize(3);                      // keep first 3 (or pad with zeros if growing)
    d.clear();                        // remove all (capacity stays)

    d.assign(4, 2);                   // replace content with four 2s
    for (int i = 0; i < (int)d.size(); i++) cout << d[i] << " ";
}` },

    { t: 'h2', text: 'Complexity' },
    { t: 'table', head: ['Operation', 'Cost', 'Note'], rows: [
      ['`v[i]`, `at(i)`, `front()`, `back()`', '**O(1)**', 'contiguous memory'],
      ['`push_back`, `pop_back`', '**O(1)** amortized', 'occasional O(n) reallocation'],
      ['`insert` / `erase` in the middle', '**O(n)**', 'shifts every element after it'],
      ['`insert` / `erase` at the front', '**O(n)**', 'use `deque` if you need this often'],
      ['search (`find`)', 'O(n)', 'O(log n) with `binary_search` if sorted'],
      ['`size()`, `empty()`', 'O(1)', ''],
      ['`reserve(n)`', 'O(n) once', 'prevents later reallocations'],
    ] },

    { t: 'h2', text: 'Patterns you will use daily' },
    { t: 'code', file: 'vector_patterns.cpp', code: `#include <algorithm>
#include <iostream>
#include <numeric>
#include <vector>
using namespace std;

int main() {
    // 1. build up results, then return them
    vector<int> evens;
    for (int i = 1; i <= 10; i++) if (i % 2 == 0) evens.push_back(i);

    // 2. if you know the size, reserve first: no reallocations
    vector<int> sq;
    sq.reserve(1000);
    for (int i = 0; i < 1000; i++) sq.push_back(i * i);

    // 3. emplace_back builds the element IN PLACE (no temporary)
    vector<pair<int, string>> people;
    people.emplace_back(1, "Mia");               // vs people.push_back(make_pair(1, "Mia"))

    // 4. prefix sums: a staple of array problems
    vector<int> a = {3, 1, 4, 1, 5};
    vector<int> pre(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) pre[i + 1] = pre[i] + a[i];
    cout << pre[4] - pre[1] << "\\n";              // sum of a[1..3] = 1+4+1 = 6

    // 5. remove duplicates from a sorted copy
    vector<int> d = {4, 2, 4, 1, 2};
    sort(d.begin(), d.end());
    d.erase(unique(d.begin(), d.end()), d.end());   // 1 2 4
    for (int x : d) cout << x << " ";
}` },
    { t: 'callout', kind: 'tip', html: 'Pass vectors to functions as `const vector<int>&` (read-only) or `vector<int>&` (modify). Passing by value copies every element. Return vectors **by value**: it is moved or elided, so it is cheap.' },

    { t: 'h2', text: 'Pitfalls' },
    { t: 'ul', items: [
      '`v[i]` with `i >= v.size()` is **undefined behavior**: no exception, just silent corruption. Use `at(i)` while debugging.',
      '`v.size() - 1` on an empty vector underflows (unsigned). Write `(int)v.size() - 1`.',
      '**Invalidation:** `push_back` can reallocate, so a pointer, reference or iterator into the vector may dangle: `int& first = v[0]; v.push_back(1); first = 5;` is a bug.',
      '`vector<int> v(n)` creates `n` zeros. `vector<int> v; v[0] = 1;` writes into an empty vector (undefined behavior); you wanted `push_back` or `v(n)`.',
      '`vector<bool>` is not a real container of `bool`. Use `vector<char>` or `bitset`.',
      'Erasing inside a range-for over the same vector invalidates its hidden iterators.',
    ] },

    { t: 'h2', text: 'LeetCode: where vector shows up' },
    { t: 'table', head: ['Pattern', 'How vector is used', 'Example problem'], rows: [
      ['Two pointers', 'indices `l`, `r` over a sorted vector', 'Two Sum II, 3Sum'],
      ['Sliding window', 'window `[l, r]` moves along the vector', 'Maximum Subarray, Longest Substring'],
      ['Prefix sums', 'extra vector of running totals', 'Subarray Sum, Range Sum Query'],
      ['Dynamic programming', '`vector<int> dp(n+1)` or `vector<vector<int>>`', 'Climbing Stairs, Knapsack'],
      ['Graphs', '`vector<vector<int>> adj` adjacency list', 'Course Schedule, Clone Graph'],
      ['In-place edits', 'swap / overwrite elements', 'Move Zeroes, Remove Duplicates'],
    ] },

    { t: 'callout', kind: 'interview', html: '“Why is `push_back` O(1) amortized?” Each reallocation doubles the capacity, so for n pushes the total copy work is n/2 + n/4 + … ≈ n. Spread over n operations that is a constant per push. Mention `reserve` when the final size is known.' },

    { t: 'quiz', q: 'A vector has size 8 and capacity 8. You call `push_back`. What is the capacity afterwards (on a typical implementation)?', opts: ['9', '16', '8', '1'], ans: 1,
      why: 'No room, so it reallocates with geometric growth: capacity doubles to 16.' },
    { t: 'quiz', q: 'You hold `int& r = v[0];` then call `v.push_back(x)` in a loop. What is the danger?', opts: ['None', 'A reallocation can leave `r` dangling', 'push_back is O(n)', 'The compiler forbids it'], ans: 1,
      why: 'When the vector grows it moves every element to a new block. `r` still refers to the freed old location.' },
    { t: 'quiz', q: 'Which is the fastest way to build a vector of 1,000,000 known values?', opts: ['`insert` at the front repeatedly', '`reserve(1000000)` then `push_back`', '`push_back` with no reserve', 'All are identical'], ans: 1,
      why: '`reserve` allocates once, so there are zero reallocations. Inserting at the front is O(n) each time, O(n²) total.' },

    { t: 'recap', items: [
      'Describe size vs capacity and why `push_back` is amortized O(1).',
      'Use the core operations and know which are O(1) and which O(n).',
      'Use `reserve`, `emplace_back`, `erase(unique(...))` and prefix sums.',
      'Avoid invalidation and out-of-bounds bugs.',
    ] },
  ],
});
