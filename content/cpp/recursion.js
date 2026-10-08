registerLesson('recursion', {
  title: '<em>Recursion</em> and the call stack',
  lead: 'A function that calls itself sounds circular. It is really just a clean way to solve a big problem by solving a smaller copy of it.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['Standing in a queue and want to know your position? Ask the person in front: “what is your position?” They ask the one in front of them, and so on, until the first person says “1”. Then each person adds 1 and passes it back.',
             'That is recursion: **ask a smaller version of the same question, trust the answer, and add your bit.**'],
      plain: ['A recursive function solves a problem by calling itself on a **smaller** input. Every recursive function needs two parts:',
              '**Base case:** an input so small the answer is obvious. It stops the chain. **Recursive case:** shrink the input, call yourself, and combine the result with your own step.'],
      tech: ['Each call allocates a new stack frame. The recursion unwinds in LIFO order, so a depth-d recursion uses O(d) stack space. Compilers can turn **tail calls** into jumps (not guaranteed in C++), but a non-tail recursion like `n * fact(n-1)` always needs to keep frames alive. Default stack size (≈1 to 8 MB) limits depth to roughly 10⁴ to 10⁵ frames.'] },

    { t: 'h2', text: 'Factorial, frame by frame' },
    { t: 'p', html: '`fact(3) = 3 × 2 × 1`. Notice how the stack **grows** until the base case, then **shrinks** as answers flow back.' },
    { t: 'viz', kind: 'callstack', cfg: { title: 'fact(3)',
      code: `int fact(int n) {
    if (n <= 1) return 1;      // base case
    return n * fact(n - 1);    // recursive case
}
int main() {
    cout << fact(3);
}`,
      steps: [
        { line: 5, push: { fn: 'main()', vars: {} }, note: 'Start in `main`.' },
        { line: 6, push: { fn: 'fact(3)', vars: { n: 3 } }, note: '`fact(3)` begins. Is `3 <= 1`? No. So it needs `fact(2)` before it can multiply.' },
        { line: 3, push: { fn: 'fact(2)', vars: { n: 2 } }, note: '`fact(3)` is **paused** mid-line, waiting. A new frame `fact(2)` goes on top.' },
        { line: 3, push: { fn: 'fact(1)', vars: { n: 1 } }, note: 'Same again: `fact(2)` waits for `fact(1)`. Three `fact` frames are alive at once, each with its own `n`.' },
        { line: 2, note: '`fact(1)`: `1 <= 1` is true, the **base case**. No more recursion. It can answer straight away.' },
        { line: 2, pop: true, ret: 1, note: '`fact(1)` returns 1 and its frame vanishes.' },
        { line: 3, pop: true, ret: 2, note: '`fact(2)` resumes: `2 * 1 = 2`. Returns 2.' },
        { line: 3, pop: true, ret: 6, note: '`fact(3)` resumes: `3 * 2 = 6`. Returns 6 to `main`.' },
        { line: 6, out: '6', note: '`main` prints **6**.' },
      ] } },

    { t: 'h2', text: 'How to write a recursive function' },
    { t: 'ul', ordered: true, items: [
      '**Define the question** in words. “`sum(n)` = the sum of 1 … n.”',
      '**Find the base case:** the smallest input with an obvious answer. “`sum(0) = 0`.”',
      '**Assume the function works for smaller inputs**, then express the answer using it. “`sum(n) = n + sum(n-1)`.”',
      '**Check it shrinks** toward the base case on every call.',
    ] },
    { t: 'code', file: 'sum.cpp', code: `#include <iostream>
using namespace std;

int sumTo(int n) {
    if (n == 0) return 0;          // base case
    return n + sumTo(n - 1);       // trust the smaller answer
}

int main() {
    cout << sumTo(5) << "\\n";      // 15
}` },

    { t: 'h2', text: 'When recursion goes wrong' },
    { t: 'table', head: ['Mistake', 'Result'], rows: [
      ['No base case, or it is never reached', 'infinite recursion, then **stack overflow** (crash)'],
      ['Argument does not shrink', 'same as above'],
      ['Doing the same sub-problem many times', 'exponential slowness (see Fibonacci below)'],
    ] },
    { t: 'code', file: 'fib.cpp', code: `#include <iostream>
using namespace std;

long long calls = 0;
int fib(int n) {
    calls++;
    if (n < 2) return n;
    return fib(n - 1) + fib(n - 2);   // two recursive calls each time
}

int main() {
    int r = fib(25);                  // compute first, so calls is final when printed
    cout << r << " using " << calls << " calls\\n";
}` },
    { t: 'p', html: 'Run it: `fib(25)` takes about **250,000 calls** for a number that needs only 25 steps. The tree of calls recomputes `fib(3)` thousands of times. Remembering answers you have already computed (**memoization**) turns this from O(2ⁿ) into O(n). You will do exactly that with `vector` and `unordered_map` later.' },

    { t: 'callout', kind: 'interview', html: 'Recursion shines for **trees, graphs, backtracking** (try a choice, recurse, undo it) and divide-and-conquer. If you can state the problem as “same problem, smaller input,” try it. If the depth could reach 10⁵ or more, switch to a loop or an explicit stack to avoid overflow.' },

    { t: 'quiz', q: 'What does this return? `int f(int n) { if (n == 0) return 0; return 1 + f(n - 1); }` with `f(4)`', opts: ['0', '4', '10', 'It never ends'], ans: 1,
      why: 'Each call adds 1 and asks about `n - 1`, until `f(0)` returns 0. That is four additions: 4. (It counts down n.)' },
    { t: 'quiz', q: 'What happens with `int g(int n) { return g(n + 1); }`?', opts: ['Returns 0', 'Stack overflow: there is no base case', 'Compile error', 'Loops forever without using memory'], ans: 1,
      why: 'Every call pushes a frame and none returns. The stack fills up and the program crashes. Recursion is **not** free: each level costs stack memory.' },

    { t: 'recap', items: [
      'State a recursive solution as base case plus a smaller sub-problem.',
      'Trace recursion on the call stack, growing then unwinding.',
      'Recognize stack overflow and repeated work, and know memoization is the cure.',
    ] },
  ],
});
