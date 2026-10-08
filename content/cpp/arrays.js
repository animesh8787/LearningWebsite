registerLesson('arrays', {
  title: '<em>Arrays:</em> many boxes in a row',
  lead: 'One variable holds one value. An array holds many, side by side in memory. That one fact explains why arrays are so fast, and so dangerous.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['Think of an egg carton. Twelve identical slots in a row, each one numbered. You do not give each egg its own name: you say “the egg in slot 3”.',
             'An array is an egg carton for values. The slot number is called the **index**, and it starts at **0**, not 1.'],
      plain: ['An array is a fixed number of values of the **same type**, stored in **consecutive** memory. `int a[5]` reserves 5 ints in a row. Slot `i` is read with `a[i]`. Because they sit back-to-back, the computer can jump straight to any slot without searching.'],
      tech: ['An array object is a contiguous block of `N × sizeof(T)` bytes. `a[i]` is defined as `*(a + i)`: the address of slot i is `base + i × sizeof(T)`, a single multiply-add, so access is O(1). There is **no bounds checking** in the language: `a[N]` is undefined behavior. Contiguity is also why arrays are cache-friendly, often beating pointer-based structures in practice.'] },

    { t: 'h2', text: 'Declaring and using' },
    { t: 'code', file: 'array_basics.cpp', code: `#include <iostream>
using namespace std;

int main() {
    int a[5] = {10, 20, 30, 40, 50};   // 5 ints, filled in
    int b[5] = {1, 2};                 // the rest become 0: {1, 2, 0, 0, 0}
    int c[5] = {};                     // all zeros
    int d[] = {7, 8, 9};               // size deduced: 3

    cout << a[0] << " " << a[4] << "\\n";   // 10 50  (first and last)
    a[2] = 99;                              // overwrite slot 2

    for (int i = 0; i < 5; i++) cout << a[i] << " ";
    cout << "\\n";
    cout << sizeof(a) / sizeof(a[0]) << "\\n";   // 5 : how many elements
}` },

    { t: 'h2', text: 'Memory layout' },
    { t: 'p', html: 'Each slot sits exactly 4 bytes (the size of an `int`) after the previous one. Step through to see values and **addresses**:' },
    { t: 'viz', kind: 'array', cfg: { title: 'int a[5] in memory', arr: [0, 0, 0, 0, 0], base: 0x1000, size: 4,
      code: `int a[5] = {0};
a[0] = 5;
a[3] = 8;
int i = 1;
a[i] = a[0] + a[3];`,
      steps: [
        { line: 1, hl: [0, 1, 2, 3, 4], note: 'Five consecutive boxes are reserved in one go. Addresses go up by **4** each time. Indexes start at 0.' },
        { line: 2, set: { 0: 5 }, hl: [0], note: '`a[0] = 5` writes into the first slot (base address `0x1000`).' },
        { line: 3, set: { 3: 8 }, hl: [3], note: '`a[3]` is at `0x1000 + 3 × 4 = 0x100C`. The CPU computes that address directly, with no searching.' },
        { line: 4, ptr: { i: 1 }, note: 'An index can be a variable. Here `i` points at slot 1.' },
        { line: 5, set: { 1: 13 }, ptr: { i: 1 }, hl: [0, 3, 1], note: '`a[i]` is `a[1]`. It becomes `a[0] + a[3] = 5 + 8 = 13`.' },
      ] } },

    { t: 'h2', text: 'Out-of-bounds access' },
    { t: 'p', html: 'C++ does **not** check your index. Writing past the end overwrites whatever happens to live next door: another variable, the loop counter, or the return address.' },
    { t: 'code', file: 'oob.cpp', run: false, hl: [4, 5], code: `int a[3] = {1, 2, 3};
int x = 42;

a[3] = 100;     // ✗ one past the end: undefined behavior
a[-1] = 5;      // ✗ before the start: undefined behavior

// It might crash, might change x, or might seem fine today.
// Valid indices are 0 .. size-1` },
    { t: 'callout', kind: 'warn', html: 'Undefined behavior means **anything** can happen, including “it worked on my machine”. Tools like AddressSanitizer find these bugs: compile with `g++ -fsanitize=address,undefined` while practicing.' },

    { t: 'h2', text: 'Arrays and functions' },
    { t: 'p', html: 'When you pass an array to a function, it **decays** into a pointer to its first element. The size information is lost, so you must pass it separately:' },
    { t: 'code', file: 'array_func.cpp', code: `#include <iostream>
using namespace std;

int sum(int arr[], int n) {          // arr is really an int*; n is the length
    int s = 0;
    for (int i = 0; i < n; i++) s += arr[i];
    return s;
}

int main() {
    int a[4] = {1, 2, 3, 4};
    cout << sum(a, 4) << "\\n";       // 10
    // Inside sum(), sizeof(arr) would be 8 (a pointer), NOT 16!
}` },
    { t: 'callout', kind: 'tip', html: 'Plain arrays have a fixed size known at compile time. For anything that grows or whose size comes from input, use `vector<int>`. You will meet it in the STL part, and it behaves like a smarter array that remembers its own size.' },

    { t: 'h2', text: 'Common patterns' },
    { t: 'code', file: 'patterns.cpp', code: `#include <iostream>
using namespace std;
int main() {
    int a[] = {4, 9, 2, 7, 5};
    int n = 5;

    // 1. maximum
    int mx = a[0];
    for (int i = 1; i < n; i++) if (a[i] > mx) mx = a[i];

    // 2. reverse in place (two ends move inward)
    for (int l = 0, r = n - 1; l < r; l++, r--) swap(a[l], a[r]);

    // 3. frequency counting (values 0..9)
    int count[10] = {};
    for (int i = 0; i < n; i++) count[a[i]]++;

    cout << mx << " " << a[0] << " " << count[7] << "\\n";   // 9 5 1
}` },

    { t: 'quiz', q: 'For `int a[6];` what is the last valid index?', opts: ['6', '5', '7', '0'], ans: 1,
      why: 'Indexes run from 0 to size − 1, so `a[5]`. `a[6]` is one past the end.' },
    { t: 'quiz', q: 'If `a` starts at address 0x2000 and holds `int`s (4 bytes each), where is `a[3]`?', opts: ['0x2003', '0x200C', '0x2010', '0x2006'], ans: 1,
      why: '`0x2000 + 3 × 4 = 0x200C`. Address = base + index × element size.' },

    { t: 'recap', items: [
      'Declare, initialize and index an array, remembering 0-based indexing.',
      'Compute the address of any element from its index.',
      'Spot out-of-bounds access and know it is undefined behavior.',
      'Pass an array with its length, and know why `sizeof` lies inside a function.',
    ] },
  ],
});
