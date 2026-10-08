registerLesson('types', {
  title: 'Types, sizes and <em>overflow</em>',
  lead: 'A type is a promise about how much memory a value needs and how to interpret the bits inside. Get it wrong and numbers silently turn into nonsense.',
  blocks: [
    { t: 'h2', text: 'Why types exist' },
    { t: 'levels',
      eli5: ['A box for socks and a box for a piano are not the same size. A type tells the computer how big a box to make, and what kind of thing goes inside.',
             'If you try to cram a piano into a sock box, something breaks.'],
      plain: ['Memory is just a long row of bytes. The **type** tells the compiler how many bytes a value uses (its size) and how to read those bytes: as a whole number, a decimal, or a letter.',
              'The same 4 bytes can mean the integer 1078530011 or the decimal 3.14159. Only the type says which.'],
      tech: ['A type fixes an object’s size, alignment, representation (two’s complement for signed integers, IEEE-754 for floating point) and the operations that are well-formed on it. Sizes are implementation-defined except `char`, which is exactly 1 byte; use `<cstdint>` (`int32_t`, `int64_t`) when you need exact widths.'] },

    { t: 'h2', text: 'The types you will use 95% of the time' },
    { t: 'table', head: ['Type', 'Typical size', 'Range / precision', 'Use it for'], rows: [
      ['`int`', '4 bytes', '−2.1 billion … 2.1 billion', 'counts, indices, most whole numbers'],
      ['`long long`', '8 bytes', '±9.2 × 10¹⁸', 'big sums, products, timestamps'],
      ['`unsigned int`', '4 bytes', '0 … 4.29 billion', 'bit tricks, hashes (careful!)'],
      ['`double`', '8 bytes', '≈15–16 digits of precision', 'decimals, measurements'],
      ['`float`', '4 bytes', '≈7 digits of precision', 'rarely; graphics, big arrays'],
      ['`char`', '1 byte', '−128 … 127 (a letter)', 'single characters'],
      ['`bool`', '1 byte', '`true` / `false`', 'yes/no flags'],
    ] },
    { t: 'p', html: 'You can ask the compiler for any size with `sizeof`. Run it on your own machine:' },
    { t: 'code', file: 'sizes.cpp', code: `#include <iostream>
#include <climits>
using namespace std;

int main() {
    cout << "int       " << sizeof(int)       << " bytes\\n";
    cout << "long long " << sizeof(long long) << " bytes\\n";
    cout << "double    " << sizeof(double)    << " bytes\\n";
    cout << "char      " << sizeof(char)      << " byte\\n";
    cout << "INT_MAX   " << INT_MAX << "\\n";
    cout << "INT_MIN   " << INT_MIN << "\\n";
}` },

    { t: 'h2', text: 'Overflow: the odometer problem' },
    { t: 'p', html: 'A 4-byte `int` has 32 switches, so it can count to about 2.1 billion. One more and it **wraps around**. Pick a type and push it over the edge:' },
    { t: 'viz', kind: 'typebox', cfg: {} },
    { t: 'callout', kind: 'interview', html: 'Almost every “sum of array” bug on LeetCode is overflow. If `n` can be 10⁵ and values 10⁹, the sum can reach 10¹⁴. Declare the accumulator as `long long`.' },
    { t: 'code', file: 'overflow.cpp', hl: [5, 6], code: `#include <iostream>
using namespace std;
int main() {
    int a = 2000000000;            // 2 billion fits in int
    int bad = a + a;               // 4 billion does NOT (undefined behavior!)
    long long good = (long long)a + a;   // widen BEFORE adding
    cout << bad << "\\n" << good << "\\n";
}` },

    { t: 'h2', text: 'The unsigned trap' },
    { t: 'p', html: 'Unsigned types cannot be negative, so subtracting past zero **wraps to a huge number**. The classic victim is `.size()`, which is unsigned:' },
    { t: 'code', file: 'unsigned_trap.cpp', hl: [6], code: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    vector<int> v;               // empty
    cout << v.size() - 1 << "\\n"; // NOT -1 ! prints 18446744073709551615 (64-bit)
    cout << (int)v.size() - 1 << "\\n"; // -1, as you expected
}` },
    { t: 'callout', kind: 'warn', html: '`for (unsigned i = n - 1; i >= 0; i--)` never stops: an unsigned `i` is always `>= 0`. Use a signed `int` for loop counters that count down.' },

    { t: 'h2', text: 'Decimals are approximate' },
    { t: 'p', html: 'Computers store decimals in binary, and numbers like 0.1 have no exact binary form, just like ⅓ has no exact decimal form (0.3333…).' },
    { t: 'code', file: 'precision.cpp', code: `#include <iostream>
#include <cmath>
using namespace std;
int main() {
    double x = 0.1 + 0.2;
    cout << (x == 0.3) << "\\n";               // 0  (false!)
    cout << (fabs(x - 0.3) < 1e-9) << "\\n";   // 1  compare with a tolerance
    cout.precision(17);
    cout << x << "\\n";                         // 0.30000000000000004
}` },

    { t: 'h2', text: 'Letting the compiler pick: auto and const' },
    { t: 'code', file: 'auto_const.cpp', run: false, code: `auto n = 42;          // int
auto pi = 3.14;       // double
auto big = 5000000000LL;   // long long (LL suffix)

const int MAX = 100;  // a box that can never change
// MAX = 5;           // error: caught at compile time` },
    { t: 'ul', items: [
      '`auto` deduces the type from the value. It saves typing, but the type is still fixed forever.',
      '`const` turns mistakes (accidentally changing something) into compile errors. Use it generously.',
      'Brace-init `int x{3.5};` refuses to silently lose data, while `int x = 3.5;` quietly truncates to 3.',
    ] },

    { t: 'quiz', q: 'Which type should hold the sum of up to 100,000 numbers, each up to 1,000,000,000?', opts: ['`int`', '`unsigned int`', '`long long`', '`float`'], ans: 2,
      why: 'The sum can reach 10¹⁴, far beyond `int`’s 2.1×10⁹. `long long` holds up to about 9.2×10¹⁸.' },
    { t: 'quiz', q: 'What does `cout << (0.1 + 0.2 == 0.3)` print?', opts: ['1', '0', 'a compile error', 'it depends on the compiler flags'], ans: 1,
      why: '0.1 + 0.2 is 0.30000000000000004 in binary floating point, which is not equal to the closest double to 0.3. Compare decimals with a small tolerance instead of `==`.' },

    { t: 'recap', items: [
      'Choose between `int`, `long long`, `double`, `char` and `bool` on purpose.',
      'Predict overflow and widen before arithmetic, not after.',
      'Avoid the unsigned-subtraction trap with `.size()`.',
      'Explain why `0.1 + 0.2 != 0.3` and what to do about it.',
    ] },
  ],
});
