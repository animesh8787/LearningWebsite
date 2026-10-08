registerLesson('iterators', {
  title: '<em>Iterators:</em> the finger that walks any container',
  lead: 'Every container is built differently inside, but you can walk all of them the same way. Iterators are the one idea that makes the whole STL fit together.',
  blocks: [
    { t: 'h2', text: 'A finger pointing at an element' },
    { t: 'levels',
      eli5: ['Imagine reading a shopping list with your finger. You can point at an item, read it, and slide to the next. You do not care if the list is on paper, a whiteboard, or a phone: pointing and sliding works the same.',
             'An iterator is that finger.'],
      plain: ['An [[iterator]] points at one element of a [[container]]. `*it` reads (or writes) that element, `++it` moves to the next one. Every container offers `begin()` (the first element) and `end()` (**one past** the last element, a marker meaning “finished”). Pointers, as you learned, behave exactly like this for arrays. Iterators generalise them to lists, trees and hash tables.',
              'Because all containers speak this same language, algorithms like `sort` and `find` can work on any of them.'],
      tech: ['Iterators form a hierarchy by capability: **input/output** (single pass), **forward** (multi-pass, `++`), **bidirectional** (`--`; `list`, `set`, `map`), **random-access** (`+n`, `-`, `<`; `vector`, `deque`, `array`, `string`) and, in C++20, **contiguous**. Ranges are half-open `[first, last)`; `end()` is a sentinel that must never be dereferenced. Algorithms are written against the weakest category they need: `sort` requires random access, `find` only input.'] },

    { t: 'h2', text: 'begin and end' },
    { t: 'p', html: 'The key trick: `end()` is **not** the last element. It is the position *after* it. A loop runs while `it != end()`. Step through:' },
    { t: 'viz', kind: 'array', cfg: { title: 'Walking with begin() and end()', arr: [10, 20, 30, 40], base: 0x1000, size: 4,
      code: `vector<int> v = {10, 20, 30, 40};
auto it = v.begin();
it++;
*it = 99;
it += 2;
// it == v.end() ?`,
      steps: [
        { line: 1, ptr: { begin: 0 }, note: '`begin()` points at the first element. `end()` would sit just **past** the last one (index 4), where there is no element.' },
        { line: 2, ptr: { it: 0, begin: 0 }, hl: [0], note: '`it` is a copy of `begin()`. `*it` would read 10.' },
        { line: 3, ptr: { it: 1, begin: 0 }, hl: [1], note: '`++` slides the finger to the next element.' },
        { line: 4, set: { 1: 99 }, ptr: { it: 1, begin: 0 }, hl: [1], note: '`*it = 99` writes through the iterator, changing the vector itself.' },
        { line: 5, ptr: { it: 3, begin: 0 }, hl: [3], note: 'Random-access iterators (vector, array, deque, string) can jump: `it += 2` moves two elements. A `list` iterator can only step with `++`/`--`.' },
        { line: 6, ptr: { it: 4, begin: 0, end: 4 }, note: 'One more step and `it == end()`: the loop is finished. **Never dereference `end()`.**' },
      ] } },

    { t: 'h2', text: 'Three ways to loop (they are the same thing)' },
    { t: 'code', file: 'loops_iter.cpp', code: `#include <iostream>
#include <vector>
#include <set>
using namespace std;

int main() {
    vector<int> v = {3, 1, 4};

    // 1. the explicit iterator loop
    for (vector<int>::iterator it = v.begin(); it != v.end(); ++it)
        cout << *it << " ";

    // 2. same, with auto: much nicer
    for (auto it = v.begin(); it != v.end(); ++it)
        cout << *it << " ";

    // 3. range-for: the compiler writes loop #2 for you
    for (int x : v) cout << x << " ";

    // iterators work identically on a set, whose elements are NOT contiguous:
    set<int> s = {5, 2, 8};
    for (auto it = s.begin(); it != s.end(); ++it) cout << *it << " ";   // 2 5 8
}` },
    { t: 'table', head: ['Member', 'Meaning'], rows: [
      ['`begin()` / `end()`', 'first element / one past the last'],
      ['`rbegin()` / `rend()`', 'walk **backwards**: `for (auto it = v.rbegin(); it != v.rend(); ++it)`'],
      ['`cbegin()` / `cend()`', 'read-only iterators (`const`)'],
      ['`next(it, n)` / `prev(it, n)`', 'return a moved copy, without changing `it`'],
      ['`distance(a, b)`', 'how many steps from `a` to `b` (O(1) random access, O(n) otherwise)'],
    ] },
    { t: 'code', file: 'iter_utils.cpp', code: `#include <algorithm>
#include <iostream>
#include <iterator>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {10, 20, 30, 40, 50};

    auto it = find(v.begin(), v.end(), 30);          // algorithms RETURN iterators
    if (it != v.end()) {                              // always compare with end() before using
        cout << "found at index " << (it - v.begin()) << "\\n";   // 2  (iterator arithmetic = index)
        cout << *next(it) << " " << *prev(it) << "\\n";            // 40 20
    }

    auto last = prev(v.end());                       // the LAST element (end() itself is past it)
    cout << *last << "\\n";                           // 50
    for (auto r = v.rbegin(); r != v.rend(); ++r) cout << *r << " ";   // 50 40 30 20 10
}` },

    { t: 'h2', text: 'The danger: invalidation' },
    { t: 'p', html: 'An iterator is only valid while its element is **where it was**. If the container rearranges its memory, your finger points at air. This is the single most important iterator rule.' },
    { t: 'table', head: ['Container', 'Operation', 'What becomes invalid'], rows: [
      ['`vector`', '`push_back` that triggers reallocation', '**all** iterators, pointers and references'],
      ['`vector`', '`insert` / `erase` in the middle', 'everything **at or after** that position'],
      ['`deque`', 'insert/erase in the middle', 'all iterators'],
      ['`list`, `set`, `map`', 'insert', 'nothing'],
      ['`list`, `set`, `map`', 'erase', 'only iterators to the **erased** element'],
      ['`unordered_*`', 'insert causing a rehash', 'all iterators (references stay valid)'],
    ] },
    { t: 'code', file: 'erase_loop.cpp', hl: [8, 9, 10], code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 2, 3, 4, 5, 6};

    for (auto it = v.begin(); it != v.end(); ) {   // NO ++it in the header
        if (*it % 2 == 0) it = v.erase(it);        // erase RETURNS the next valid iterator
        else ++it;                                 // only advance when we did not erase
    }
    for (int x : v) cout << x << " ";              // 1 3 5
}` },
    { t: 'callout', kind: 'warn', html: 'Writing `for (auto it = v.begin(); it != v.end(); ++it) { if (...) v.erase(it); }` is a classic bug: after `erase`, `it` is invalid, and `++it` on it is undefined behavior. Always use the return value of `erase`, or use the **erase-remove idiom** (algorithms lesson).' },
    { t: 'callout', kind: 'interview', html: '“Why does `push_back` in a loop over a vector crash?” Because growing may reallocate and invalidate the loop’s iterators (and the range-for’s hidden ones). Loop by index, or collect changes and apply them afterwards.' },

    { t: 'quiz', q: 'For `vector<int> v = {7, 8, 9};` what is `*(v.end() - 1)`?', opts: ['7', '8', '9', 'undefined'], ans: 2,
      why: '`end()` is one past the last element, so `end() - 1` is the last: 9. (`*v.end()` itself would be undefined.)' },
    { t: 'quiz', q: 'You hold `auto it = v.begin();` and then call `v.push_back(1)` many times. What is true of `it`?', opts: ['It is always valid', 'It may be invalid if the vector reallocated', 'It moves to the new element', 'It becomes end()'], ans: 1,
      why: 'Reallocation moves every element to a new block, so old iterators, pointers and references point at freed memory.' },

    { t: 'recap', items: [
      'Describe an iterator as a pointer-like finger, and `end()` as one past the last element.',
      'Loop with iterators, reverse iterators and range-for, and know they are equivalent.',
      'Use `next`, `prev`, `distance` and `it - v.begin()` for indexes.',
      'Know when iterators are invalidated, and erase safely with the return value.',
    ] },
  ],
});
