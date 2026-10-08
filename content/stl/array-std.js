registerLesson('array-std', {
  title: 'std::<em>array</em>',
  lead: 'A plain array with manners: it knows its own size, copies properly, and works with every algorithm. Use it whenever the size is fixed and known at compile time.',
  blocks: [
    { t: 'h2', text: 'Fixed size, zero overhead' },
    { t: 'levels',
      eli5: ['An egg carton that always has exactly 12 holes, and a label on the side saying “12”. It cannot grow, but it never forgets how big it is.'],
      plain: ['`array<T, N>` wraps a C array of exactly `N` elements. Unlike a raw array it has `.size()`, `.begin()`/`.end()`, can be copied with `=`, returned from functions, compared with `==`, and does **not** decay into a pointer. It lives wherever you declare it (usually the stack) and has **no heap allocation** and no overhead.'],
      tech: ['`std::array` is an aggregate containing `T elems[N]`. `N` is a non-type template parameter, so `array<int,3>` and `array<int,4>` are different types. It supports `constexpr` use and structured bindings. There is no bounds checking on `operator[]`; `at()` throws `out_of_range`. Because it is on the stack by default, very large arrays can overflow the stack: put those in a `vector` or `static`.'] },

    { t: 'code', file: 'std_array.cpp', code: `#include <algorithm>
#include <array>
#include <iostream>
using namespace std;

int main() {
    array<int, 5> a = {5, 3, 8, 1, 9};
    cout << a.size() << " " << a.front() << " " << a.back() << "\\n";   // 5 5 9

    sort(a.begin(), a.end());                       // all algorithms work
    for (int x : a) cout << x << " ";               // 1 3 5 8 9
    cout << "\\n";

    array<int, 5> b = a;                            // a real copy (C arrays can't do this)
    b[0] = 100;
    cout << (a == b) << "\\n";                       // 0

    array<int, 26> freq = {};                       // 26 zeros: the classic letter counter
    for (char c : string("hello")) freq[c - 'a']++;
    cout << freq['l' - 'a'] << "\\n";                 // 2

    array<array<int, 3>, 2> grid = {{ {1, 2, 3}, {4, 5, 6} }};   // 2 rows x 3 cols
    cout << grid[1][2] << "\\n";                     // 6
}` },

    { t: 'h2', text: 'array vs vector vs C array' },
    { t: 'table', head: ['', 'C array `int a[5]`', '`array<int,5>`', '`vector<int>`'], rows: [
      ['Size', 'fixed', 'fixed (part of the type)', '**dynamic**'],
      ['Knows its size', 'no (decays to pointer)', 'yes', 'yes'],
      ['Memory', 'stack / static', 'stack / static', '**heap**'],
      ['Copy with `=`', 'no', 'yes', 'yes'],
      ['Overhead', 'none', 'none', 'three pointers + heap allocation'],
      ['Use when', 'legacy code', 'size is a compile-time constant', 'size is only known at run time (default)'],
    ] },
    { t: 'callout', kind: 'tip', html: 'Rule of thumb: **fixed, small, known at compile time → `array`. Anything else → `vector`.** The 26-letter counter, a 3×3 board, or the 8 chess directions are textbook `array` uses.' },

    { t: 'h2', text: 'Complexity' },
    { t: 'table', head: ['Operation', 'Cost'], rows: [
      ['`a[i]`, `at(i)`, `front`, `back`', 'O(1)'],
      ['`fill(x)`', 'O(N)'],
      ['`swap` with another array', 'O(N) (elements are swapped one by one)'],
      ['insert / erase / push_back', 'not available: the size never changes'],
    ] },
    { t: 'callout', kind: 'warn', html: '`array<int, 1000000> big;` as a **local variable** puts 4 MB on the stack and can overflow it (stack overflow at startup). Make it `static`, a global, or a `vector`.' },

    { t: 'quiz', q: 'Which is true of `array<int, 5>` but not of `int a[5]`?', opts: ['It is stored on the heap', 'It can be copied with `b = a;` and knows `.size()`', 'It can grow', 'It is slower'], ans: 1,
      why: '`std::array` is a proper value type with member functions. It has exactly the same layout and speed as a C array.' },
    { t: 'quiz', q: 'You need a counter for 26 lowercase letters. Best choice?', opts: ['`vector<int>`', '`array<int, 26>`', '`list<int>`', '`map<char,int>`'], ans: 1,
      why: 'The size is fixed at compile time, so `array<int,26>` has no heap allocation and O(1) indexing by `c - \'a\'`.' },

    { t: 'recap', items: [
      'Use `array<T, N>` for compile-time-sized data and know how it differs from a C array.',
      'Choose between `array` and `vector`.',
      'Avoid giant stack arrays.',
    ] },
  ],
});
