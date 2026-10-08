registerLesson('bits', {
  title: 'Bits and <em>bit tricks</em>',
  lead: 'Under every number is a row of on/off switches. Learning to flip and read them directly gives you fast techniques, compact data, and a clearer picture of how computers actually count.',
  blocks: [
    { t: 'h2', text: 'Binary in two minutes' },
    { t: 'levels',
      eli5: ['Light switches. Each switch is on or off. Put 8 switches in a row and you can make 256 different patterns, so 8 switches can count from 0 to 255.',
             'Each switch is worth double the one to its right: 1, 2, 4, 8, 16, 32, 64, 128. Add up the values of the switches that are on, and you get the number.'],
      plain: ['A **bit** is a 0 or a 1. We write numbers in base 2 the same way we write them in base 10, except each position is worth a power of 2 instead of a power of 10. `1011` in binary is `8 + 0 + 2 + 1 = 11`. Hexadecimal (base 16) is a shorthand: each hex digit is exactly 4 bits, so `0xB3` is `1011 0011`.'],
      tech: ['Integers use **two’s complement**: the top bit has weight −2ⁿ⁻¹, so `-1` is all ones. Bitwise operators work on every bit position independently; shifts are arithmetic multiplications/divisions by powers of two (left shift of a negative or overflowing signed value is the dangerous territory). `<bit>` in C++20 offers `popcount`, `countl_zero`, `has_single_bit`. Use unsigned types or `std::bitset` for bit manipulation to avoid signed-shift pitfalls.'] },

    { t: 'h2', text: 'Play with the switches' },
    { t: 'p', html: 'Click bits of **A** to flip them. Try each operator and watch the result row.' },
    { t: 'viz', kind: 'bits', cfg: { a: 178, b: 15, op: '&' } },

    { t: 'h2', text: 'The operators' },
    { t: 'table', head: ['Op', 'Name', 'Rule, per bit', 'Typical use'], rows: [
      ['`a & b`', 'AND', '1 only if **both** are 1', '**mask** out bits, test a bit'],
      ['`a | b`', 'OR', '1 if **either** is 1', '**set** bits'],
      ['`a ^ b`', 'XOR', '1 if they **differ**', 'flip bits, find the odd one out'],
      ['`~a`', 'NOT', 'flip every bit', 'build masks'],
      ['`a << k`', 'shift left', 'move bits left, zeros enter', 'multiply by 2ᵏ, build `1 << k`'],
      ['`a >> k`', 'shift right', 'move bits right', 'divide by 2ᵏ'],
    ] },

    { t: 'h2', text: 'The four moves you will use forever' },
    { t: 'code', file: 'bit_moves.cpp', code: `#include <iostream>
using namespace std;

int main() {
    unsigned x = 0b1010;                 // 10

    bool isSet = (x >> 1) & 1;           // TEST bit 1  -> 1
    x |= (1u << 2);                      // SET   bit 2 -> 1110 (14)
    x &= ~(1u << 3);                     // CLEAR bit 3 -> 0110 (6)
    x ^= (1u << 0);                      // TOGGLE bit 0 -> 0111 (7)

    cout << isSet << " " << x << "\\n";   // 1 7

    // handy one-liners
    int n = 12;
    bool even   = !(n & 1);                      // lowest bit 0  => even
    bool pow2   = n > 0 && (n & (n - 1)) == 0;   // power of two has exactly one bit
    int  lowbit = n & -n;                        // isolates the lowest set bit (4)
    cout << even << pow2 << " " << lowbit << " " << __builtin_popcount(n) << "\\n";   // 10 4 2
}` },
    { t: 'callout', kind: 'interview', html: '**XOR tricks** are interview favourites: `a ^ a == 0` and `a ^ 0 == a`, so XOR-ing a whole array cancels every pair and leaves the single number that appears once. Also swap without a temp: `a ^= b; b ^= a; a ^= b;` (though `std::swap` is clearer).' },

    { t: 'h2', text: 'Subsets as bitmasks' },
    { t: 'p', html: 'A set of up to ~20 items fits in one integer: bit `i` says whether item `i` is in the set. Counting from `0` to `2ⁿ − 1` visits **every subset**:' },
    { t: 'code', file: 'subsets.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<char> items = {'a', 'b', 'c'};
    int n = items.size();
    for (int mask = 0; mask < (1 << n); mask++) {        // 0 .. 7
        cout << "{ ";
        for (int i = 0; i < n; i++)
            if (mask & (1 << i)) cout << items[i] << " ";   // is bit i set?
        cout << "}\\n";
    }
}` },
    { t: 'callout', kind: 'warn', html: 'Use `1u << k` or `1LL << k`, not `1 << k`, when `k` can reach 31 or 63. Shifting a signed `int` into its sign bit is undefined behavior, and `1 << 40` on a 32-bit `int` is simply wrong.' },

    { t: 'quiz', q: 'What is `13 & 6`? (13 = 1101, 6 = 0110)', opts: ['4', '7', '15', '0'], ans: 0,
      why: 'Bit by bit: 1101 AND 0110 = 0100, which is **4**. Only the bit set in both survives.' },
    { t: 'quiz', q: 'Which expression is true exactly when `n` is a power of two (and positive)?', opts: ['`n & 1`', '`n > 0 && (n & (n - 1)) == 0`', '`n ^ n`', '`n >> 1`'], ans: 1,
      why: 'A power of two has a single 1 bit. Subtracting 1 flips that bit and all lower ones, so the AND is 0. (e.g. 8 = 1000, 7 = 0111.)' },

    { t: 'recap', items: [
      'Read and write numbers in binary and hex.',
      'Apply AND, OR, XOR, NOT and shifts, and know what each is for.',
      'Test, set, clear and toggle a single bit.',
      'Enumerate all subsets with a bitmask loop.',
    ] },
  ],
});
