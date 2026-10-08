registerLesson('mistakes', {
  title: 'Common <em>mistakes</em> gallery',
  lead: 'Nearly every wrong answer and crash in STL code comes from this short list. Read each one, find its sibling in your own code, and you will skip hours of debugging.',
  blocks: [
    { t: 'h2', text: 'Crashes and undefined behavior' },
    { t: 'code', file: 'crash_1.cpp', run: false, code: `// 1. Out-of-range index (no exception, just corruption)
vector<int> v(3);
v[3] = 1;                       // ✗ valid indices are 0..2        -> use at() while debugging

// 2. front()/back()/top()/pop() on an EMPTY container
stack<int> st;
int x = st.top();               // ✗ undefined behavior            -> if (!st.empty())

// 3. Dereferencing end()
auto it = find(v.begin(), v.end(), 99);
cout << *it;                    // ✗ it == end() if not found      -> if (it != v.end())

// 4. Iterator invalidation
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it == 0) v.push_back(1);   // ✗ push_back may reallocate  -> don't grow while iterating

// 5. Erasing in a loop the wrong way
for (auto it = v.begin(); it != v.end(); ++it)
    if (*it == 2) v.erase(it);      // ✗ 'it' is invalid after erase -> it = v.erase(it);

// 6. Dangling reference
int& r = v[0];
v.push_back(7);
r = 5;                          // ✗ r may point to freed memory` },

    { t: 'h2', text: 'Wrong answers (silent bugs)' },
    { t: 'table', head: ['Mistake', 'Why it is wrong', 'Fix'], rows: [
      ['`int sum` for big totals', 'overflows past ≈2.1×10⁹', '`long long sum`'],
      ['`accumulate(b, e, 0)`', 'accumulates in `int`', '`0LL`'],
      ['`v.size() - 1` when empty', 'unsigned wrap to a huge number', '`(int)v.size() - 1`'],
      ['`for (unsigned i = n-1; i >= 0; i--)`', 'never ends (unsigned ≥ 0)', 'use `int`'],
      ['`mid = (lo + hi) / 2`', '`lo + hi` can overflow', '`lo + (hi - lo) / 2`'],
      ['`m[key]` just to check', 'inserts the key', '`count` / `find`'],
      ['`a / b` with ints', 'truncates the decimals', '`(double)a / b`'],
      ['`double == double`', 'floating-point error', '`fabs(a - b) < 1e-9`'],
      ['Sort comparator with `<=`', 'violates strict weak ordering → crash', 'use `<`'],
      ['`str.find(x) == -1`', '`npos` is a huge unsigned number', '`== string::npos`'],
      ['`substr(start, end)`', 'second argument is a **length**', '`substr(start, end - start)`'],
      ['`lower_bound` on unsorted data', 'garbage with no error', 'sort first'],
    ] },

    { t: 'h2', text: 'Performance pitfalls (common causes of timeouts)' },
    { t: 'table', head: ['Trap', 'Cost', 'Better'], rows: [
      ['Passing `vector` / `string` by value', 'O(n) copy per call', '`const T&`'],
      ['`s = s + c` in a loop', 'O(n²)', '`s += c`'],
      ['`v.insert(v.begin(), x)` repeatedly', 'O(n) each → O(n²)', '`deque`, or build reversed'],
      ['`erase` in the middle of a vector in a loop', 'O(n) each', 'erase–remove idiom (one pass)'],
      ['`std::lower_bound` on a `set`', 'O(n) walk', '`s.lower_bound(x)` member'],
      ['`endl` in heavy output', 'flushes every line', '`"\\n"`'],
      ['No fast I/O for 10⁵+ inputs', 'slow `cin`', '`ios::sync_with_stdio(false); cin.tie(nullptr);`'],
      ['`list::size()` in a loop (older libraries)', 'was O(n)', 'store it once'],
      ['`push_back` without `reserve` when size is known', 'repeated reallocations', '`reserve(n)`'],
      ['Recomputing the same subproblem (naive recursion)', 'exponential', 'memoize with `vector` / `unordered_map`'],
    ] },

    { t: 'h2', text: 'The safe versions' },
    { t: 'code', file: 'safe_patterns.cpp', code: `#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {1, 2, 0, 3, 0};

    // safe erase in a loop: use the return value
    for (auto it = v.begin(); it != v.end(); ) {
        if (*it == 0) it = v.erase(it);
        else ++it;
    }

    // safe find: always compare to end()
    auto f = find(v.begin(), v.end(), 99);
    if (f != v.end()) cout << *f; else cout << "not found\\n";

    // safe map check
    map<string, int> m = {{"a", 1}};
    if (m.count("zzz") == 0) cout << "no zzz, and m still has " << m.size() << " entry\\n";

    // safe subtraction on size()
    vector<int> e;
    int lastIdx = (int)e.size() - 1;               // -1, as intended
    cout << lastIdx << "\\n";

    // safe big sum
    vector<int> big = {2000000000, 2000000000};
    long long total = 0;
    for (int x : big) total += x;
    cout << total << "\\n";                          // 4000000000
}` },

    { t: 'callout', kind: 'tip', html: 'Compile while learning with warnings and sanitizers on: <code class="i">g++ -std=c++17 -Wall -Wextra -fsanitize=address,undefined main.cpp</code>. They catch out-of-range access, use-after-free, signed overflow and uninitialised reads at run time with a clear message instead of a mystery crash.' },
    { t: 'callout', kind: 'interview', html: 'Before saying “done”, **test the edges**: empty input, a single element, all elements equal, the maximum values (overflow!), and negative numbers. Naming those out loud shows an interviewer you debug like an engineer.' },

    { t: 'quiz', q: 'Your solution passes small tests but crashes randomly on large ones when sorting with `[](int a, int b){ return a <= b; }`. Most likely cause?', opts: ['Not enough memory', 'The comparator is not a strict weak ordering', 'The vector is too big', 'A compiler bug'], ans: 1,
      why: 'Using `<=` makes `comp(a, a)` true. `sort` assumes strictness and may read out of bounds on inputs with equal elements.' },
    { t: 'quiz', q: 'Which loop erases every even number from `v` correctly?', opts: ['`for (auto it = v.begin(); it != v.end(); ++it) if (*it % 2 == 0) v.erase(it);`', '`for (auto it = v.begin(); it != v.end(); ) { if (*it % 2 == 0) it = v.erase(it); else ++it; }`', '`for (int x : v) if (x % 2 == 0) v.erase(&x);`', '`v.erase(0)`'], ans: 1,
      why: '`erase` returns the next valid iterator, and we only advance manually when we did not erase.' },

    { t: 'recap', items: [
      'Recognise the six crash patterns: bounds, empty access, `end()`, invalidation, bad erase, dangling references.',
      'Avoid the silent wrong-answer traps: overflow, unsigned, truncation, `[]` insertion, `npos`.',
      'Know the standard performance fixes.',
      'Compile with warnings and sanitizers while practising.',
    ] },
  ],
});
