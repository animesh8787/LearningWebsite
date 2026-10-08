registerLesson('loops', {
  title: '<em>Loops:</em> repeating work without repeating code',
  lead: 'Computers are good at one thing above all: doing the same task a million times without getting bored. Loops are how you ask for that.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['Imagine washing 10 plates. You do not write “wash plate 1, wash plate 2, …”. You say: “while there is a dirty plate, wash one.” A loop is that sentence.'],
      plain: ['A loop repeats a block of code. Each trip through the block is an **iteration**. Every loop has three jobs: a **start** (where to begin), a **condition** (when to keep going) and a **step** (how to move toward the end). Forget the step and it never ends.'],
      tech: ['`for (init; cond; step) body` is equivalent to `{ init; while (cond) { body; step; } }`, except `continue` jumps to `step`. A loop terminates when a **variant** (a quantity that strictly moves toward the exit condition) reaches its bound. Compilers may assume loops without side effects terminate.'] },

    { t: 'h2', text: 'The for loop, one trip at a time' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Summing 1 to 4',
      code: `int sum = 0;
for (int i = 1; i <= 4; i++) {
    sum += i;
}
cout << sum;`,
      steps: [
        { line: 1, set: { sum: ['int', 0] }, note: 'The accumulator starts at 0. Always initialize it: the empty total is zero.' },
        { line: 2, set: { i: ['int', 1] }, note: '**Start:** `int i = 1` runs once. **Check:** `1 <= 4` is true, so enter the body.' },
        { line: 3, set: { sum: 1 }, note: 'Iteration 1: `sum = 0 + 1`.' },
        { line: 2, set: { i: 2 }, note: '**Step:** `i++`. **Check:** `2 <= 4` is true, so go again.' },
        { line: 3, set: { sum: 3 }, note: 'Iteration 2: `sum = 1 + 2`.' },
        { line: 2, set: { i: 3 }, note: 'Step and check: `3 <= 4`, true.' },
        { line: 3, set: { sum: 6 }, note: 'Iteration 3: `sum = 3 + 3`.' },
        { line: 2, set: { i: 4 }, note: 'Step and check: `4 <= 4`, true. Equal still counts because of `<=`.' },
        { line: 3, set: { sum: 10 }, note: 'Iteration 4: `sum = 6 + 4`.' },
        { line: 2, set: { i: 5 }, note: 'Step: `i` is 5. **Check:** `5 <= 4` is **false.** The loop is over. (`i` itself disappears after the loop.)' },
        { line: 5, del: ['i'], out: '10', note: 'Execution continues after the loop and prints the total: **10**.' },
      ] } },

    { t: 'h2', text: 'Which loop do I pick?' },
    { t: 'table', head: ['Loop', 'Use it when', 'Shape'], rows: [
      ['`for`', 'you know how many times, or are counting', '`for (int i = 0; i < n; i++)`'],
      ['`while`', 'you repeat until something happens', '`while (x > 0) { ... }`'],
      ['`do … while`', 'the body must run **at least once**', '`do { ... } while (cond);`'],
      ['range-`for`', 'you want every element of a collection', '`for (int x : v)`'],
    ] },
    { t: 'code', file: 'loops.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    // counting
    for (int i = 0; i < 3; i++) cout << i << " ";
    cout << "\\n";

    // until something happens: how many times can 100 be halved?
    int n = 100, halvings = 0;
    while (n > 1) { n /= 2; halvings++; }
    cout << halvings << "\\n";

    // every element
    vector<int> v = {4, 8, 15};
    for (int x : v) cout << x * 2 << " ";
    cout << "\\n";

    // modify elements: need a reference (&)
    for (int& x : v) x += 1;
    for (int x : v) cout << x << " ";
}` },
    { t: 'callout', kind: 'warn', html: 'In `for (int x : v)` the `x` is a **copy**. Changing it does nothing to the vector. To change the elements, or avoid copying big ones, write `int& x` (or `const auto& x`).' },

    { t: 'h2', text: 'break and continue' },
    { t: 'ul', items: [
      '`break` leaves the **innermost** loop immediately.',
      '`continue` skips the rest of this iteration and jumps to the next one.',
    ] },
    { t: 'code', file: 'break_continue.cpp', run: false, code: `for (int i = 1; i <= 10; i++) {
    if (i % 2 == 0) continue;    // skip even numbers
    if (i > 7) break;            // stop completely
    cout << i << " ";            // 1 3 5 7
}` },

    { t: 'h2', text: 'Nested loops: loops inside loops' },
    { t: 'p', html: 'The inner loop runs completely for **every** step of the outer loop. If both run 4 times, the body runs 4 × 4 = 16 times. Remember this: it is the root of O(n²).' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Nested loop output',
      code: `for (int r = 1; r <= 3; r++) {
    for (int c = 1; c <= r; c++) {
        cout << "*";
    }
    cout << "\\n";
}`,
      steps: [
        { line: 1, set: { r: ['int', 1] }, note: 'Outer loop starts with `r = 1`.' },
        { line: 2, set: { c: ['int', 1] }, note: 'Inner loop runs `c` from 1 up to `r` (1).' },
        { line: 3, out: '*', note: 'One star.' },
        { line: 4, out: '', note: 'Inner loop done (`c` would be 2 > 1). Newline comes next.' },
        { line: 1, set: { r: 2 }, note: 'Outer step: `r = 2`. The inner loop **restarts from scratch**.' },
        { line: 2, set: { c: 1 }, note: '`c` resets to 1.' },
        { line: 3, out: '**', note: 'Two stars this time, since `c` goes 1, 2.' },
        { line: 1, set: { r: 3 }, note: 'Outer step: `r = 3`.' },
        { line: 3, out: '***', note: 'Three stars. Total body runs: 1 + 2 + 3 = 6.' },
      ] } },

    { t: 'h2', text: 'Off-by-one: the most common bug' },
    { t: 'p', html: 'Count from 0 and stop **before** `n`. An array of `n` items has indices `0 … n-1`.' },
    { t: 'table', head: ['Loop', 'Runs for', 'Verdict'], rows: [
      ['`for (i = 0; i < n; i++)`', 'i = 0 … n−1  (n times)', 'standard, correct'],
      ['`for (i = 0; i <= n; i++)`', 'i = 0 … n  (n+1 times)', 'reads one past the end of an array'],
      ['`for (i = 1; i < n; i++)`', 'i = 1 … n−1  (n−1 times)', 'skips the first element'],
    ] },
    { t: 'callout', kind: 'interview', html: 'To avoid infinite loops, prove the **variant** moves toward the exit: in `while (n > 1) n /= 2;` the number shrinks every time, so it must end. In `while (n != 1) n -= 2;` starting from an even number, it jumps over 1 forever.' },

    { t: 'quiz', q: 'How many times does the body run? `for (int i = 3; i < 10; i += 2)`', opts: ['3', '4', '5', '7'], ans: 1,
      why: '`i` takes 3, 5, 7, 9. At 11 the condition `11 < 10` fails. That is **4** iterations.' },
    { t: 'quiz', q: 'Which loop is the right choice when the body must run at least once (like asking for a password)?', opts: ['`for`', '`while`', '`do … while`', 'range-`for`'], ans: 2,
      why: '`do … while` checks the condition **after** the body, so one run is guaranteed.' },

    { t: 'recap', items: [
      'Trace a `for` loop trip by trip: start, check, body, step.',
      'Pick between `for`, `while`, `do … while` and range-`for` deliberately.',
      'Use `break` and `continue`, and know that `break` only leaves the innermost loop.',
      'Count nested-loop iterations and spot off-by-one errors.',
    ] },
  ],
});
