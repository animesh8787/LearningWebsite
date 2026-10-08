registerLesson('operators', {
  title: 'Operators and <em>expressions</em>',
  lead: 'Operators combine values into new values. Most are obvious. A few of them quietly bite, and those are the ones interviewers ask about.',
  blocks: [
    { t: 'h2', text: 'The everyday operators' },
    { t: 'table', head: ['Group', 'Operators', 'Notes'], rows: [
      ['Arithmetic', '`+  -  *  /  %`', '`%` is remainder and works on integers only'],
      ['Comparison', '`==  !=  <  >  <=  >=`', 'result is a `bool`. Note `==` (compare) vs `=` (assign)'],
      ['Logical', '`&&  ||  !`', 'and / or / not'],
      ['Assignment', '`=  +=  -=  *=  /=  %=`', '`x += 3` means `x = x + 3`'],
      ['Increment', '`++  --`', 'add or subtract 1, in two flavors (below)'],
      ['Ternary', '`cond ? a : b`', 'a one-line if/else that produces a value'],
    ] },

    { t: 'h2', text: 'Integer division and the remainder' },
    { t: 'levels',
      eli5: ['Share 17 sweets between 5 kids. Each kid gets **3** sweets, and **2** are left over. Integer division gives you the 3. The remainder operator `%` gives you the 2.'],
      plain: ['When both sides of `/` are integers, the answer is an integer: the decimal part is **thrown away**. `17 / 5` is `3`, not `3.4`. The leftover is `17 % 5 = 2`, and they always fit together: `(a / b) * b + a % b == a`.',
              'To keep decimals, make at least one side a decimal: `17 / 5.0` or `(double)17 / 5` is `3.4`.'],
      tech: ['Since C++11, integer division truncates toward zero, and `a % b` has the sign of `a`, so `-17 / 5 == -3` and `-17 % 5 == -2`. Division by zero is undefined behavior for integers; for floating point it yields ±inf or NaN. `INT_MIN / -1` overflows.'] },
    { t: 'p', html: 'Type in your own numbers, including negatives and zero:' },
    { t: 'viz', kind: 'exprlab', cfg: { a: 17, b: 5 } },
    { t: 'callout', kind: 'interview', html: 'The most common use of `%`: **wrap-around** and **even/odd**. `i % n` cycles through `0 … n-1`; `x % 2 == 0` tests for even. `(a % m + m) % m` is the safe way to get a non-negative remainder when `a` can be negative.' },

    { t: 'h2', text: 'Prefix vs postfix: i++ and ++i' },
    { t: 'p', html: 'Both add 1 to `i`. The difference is the **value of the expression itself**: `i++` gives the old value, `++i` gives the new one.' },
    { t: 'viz', kind: 'memory', cfg: { title: 'i++ vs ++i',
      code: `int i = 5;
int a = i++;
int b = ++i;`,
      steps: [
        { line: 1, set: { i: ['int', 5] }, note: 'Start with `i = 5`.' },
        { line: 2, set: { a: ['int', 5], i: 6 }, note: '**Postfix:** the expression’s value is the OLD `i` (5), so `a` gets 5. Afterwards `i` becomes 6.' },
        { line: 3, set: { b: ['int', 7], i: 7 }, note: '**Prefix:** `i` is bumped first (6 → 7) and the NEW value 7 is used, so `b` gets 7.' },
      ] } },
    { t: 'callout', kind: 'tip', html: 'On its own line (`i++;` or `++i;`) the two are identical. Prefer `++i` in loops over iterators: for class types, postfix has to make a temporary copy.' },

    { t: 'h2', text: 'Logical operators and short-circuiting' },
    { t: 'p', html: '`&&` and `||` evaluate left to right and **stop as soon as the answer is known**. This is a feature you can rely on:' },
    { t: 'code', file: 'shortcircuit.cpp', hl: [7], code: `#include <iostream>
#include <vector>
using namespace std;
int main() {
    vector<int> v;                       // empty
    int i = 0;
    if (i < (int)v.size() && v[i] > 0) { // v[i] is NEVER evaluated when i is out of range
        cout << "positive\\n";
    } else {
        cout << "safe\\n";
    }
}` },
    { t: 'ul', items: [
      '`A && B`: if `A` is false, `B` is skipped. Put the **guard** on the left.',
      '`A || B`: if `A` is true, `B` is skipped.',
      'Zero is false and anything else is true: `if (n)` means `if (n != 0)`.',
    ] },

    { t: 'h2', text: 'Precedence: who goes first?' },
    { t: 'table', head: ['Expression', 'The compiler reads it as', 'Result'], rows: [
      ['`2 + 3 * 4`', '`2 + (3 * 4)`', '14'],
      ['`10 - 4 - 3`', '`(10 - 4) - 3`', '3'],
      ['`a == b && c`', '`(a == b) && c`', 'bool'],
      ['`x = y = 5`', '`x = (y = 5)`', 'both become 5'],
      ['`!a && b`', '`(!a) && b`', 'bool'],
    ] },
    { t: 'callout', kind: 'tip', html: 'You do not need to memorize the full precedence table. **Use parentheses** whenever the order is not obvious to a reader. They cost nothing and prevent a whole category of bugs.' },

    { t: 'h2', text: 'The ternary operator' },
    { t: 'code', file: 'ternary.cpp', run: false, code: `int a = 7, b = 12;
int bigger = (a > b) ? a : b;     // "if a > b then a else b"
cout << bigger << "\\n";           // 12
cout << (a % 2 == 0 ? "even" : "odd") << "\\n";   // odd` },

    { t: 'quiz', q: 'What is `-7 / 2` in C++?', opts: ['-3.5', '-4', '-3', '3'], ans: 2,
      why: 'Integer division truncates toward zero, so -3.5 becomes **-3**, not -4. (And `-7 % 2` is `-1`.)' },
    { t: 'quiz', q: 'After `int x = 5; int y = x++ + x;`, what is `y`?', opts: ['10', '11', '12', 'undefined'], ans: 3,
      why: 'Modifying `x` and reading it in the same expression without a defined order is **undefined behavior**: the two operands of `+` are unsequenced, so the compiler may read `x` before or after the increment. Never write code like this. Split it into separate statements.' },

    { t: 'recap', items: [
      'Predict integer division, remainder and mixed int/double results.',
      'Explain `i++` versus `++i` with a concrete example.',
      'Use `&&` and `||` short-circuiting as a safety guard.',
      'Add parentheses instead of relying on memorized precedence.',
    ] },
  ],
});
