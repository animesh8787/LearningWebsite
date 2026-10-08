registerLesson('functions', {
  title: '<em>Functions:</em> name a piece of work',
  lead: 'A function wraps some steps behind a name. You write them once and use them anywhere, and every function call leaves a footprint on the call stack.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['A function is a little machine. You put things in (ingredients), it does its job, and it hands something back (a cake). You do not need to remember how it works every time. You just use it.'],
      plain: ['A function has a **name**, takes **parameters** (inputs), runs a block of code, and **returns** a value (output). Splitting code into functions makes it shorter, testable and easier to read: `isPrime(n)` explains itself better than ten lines of loop.'],
      tech: ['A function definition gives a name, a parameter list and a return type to a block of code. A call evaluates the arguments, pushes a **stack frame** holding parameters and locals plus the return address, jumps into the body, and on `return` pops the frame. Arguments are initialized from the call’s expressions, which is why passing by value copies.'] },

    { t: 'h2', text: 'Anatomy' },
    { t: 'code', file: 'add.cpp', hl: [4, 5, 14], code: `#include <iostream>
using namespace std;

int add(int a, int b) {      // return type, name, parameters
    return a + b;            // hand a value back
}

void greet(string name) {    // void = returns nothing
    cout << "Hi " << name << "\\n";
}

int main() {
    int total = add(2, 3);   // call: 2 and 3 are the ARGUMENTS
    greet("Mia");
    cout << total << "\\n";
}` },
    { t: 'ul', items: [
      '**Parameters** are the names inside the function (`a`, `b`). **Arguments** are the actual values at the call (`2`, `3`).',
      'A function must be **declared before it is used**. If the body comes after `main`, put a one-line **prototype** first: `int add(int a, int b);`.',
      'A non-`void` function must return on **every** path. Falling off the end is undefined behavior.',
    ] },

    { t: 'h2', text: 'What happens when you call one' },
    { t: 'p', html: 'Every call pushes a **frame** onto the call stack: a private workspace holding that call’s variables. When the function returns, its frame disappears and so do its variables.' },
    { t: 'viz', kind: 'callstack', cfg: { title: 'Calling add and square',
      code: `int square(int x) {
    return x * x;
}
int add(int a, int b) {
    return a + b;
}
int main() {
    int s = square(4);
    int t = add(s, 1);
}`,
      steps: [
        { line: 7, push: { fn: 'main()', vars: {} }, note: 'The OS calls `main`. The first frame goes on the stack.' },
        { line: 8, push: { fn: 'square(4)', vars: { x: 4 } }, note: '`main` calls `square(4)`. A new frame is stacked on top. `x` is a **copy** of the argument 4.' },
        { line: 2, note: 'Inside `square`, compute `4 * 4`. Only the top frame is running; `main` waits underneath.' },
        { line: 2, pop: true, ret: 16, note: '`return` pops the `square` frame. Its `x` is gone. The value 16 travels back to `main`.' },
        { line: 8, set: { s: 16 }, note: '`main` stores the result in `s`.' },
        { line: 9, push: { fn: 'add(16, 1)', vars: { a: 16, b: 1 } }, note: 'Second call. A new frame appears in the same spot where `square`’s frame lived.' },
        { line: 5, pop: true, ret: 17, note: 'Returns 17, and the frame is popped again.' },
        { line: 9, set: { t: 17 }, note: '`main` now holds `s = 16`, `t = 17`.' },
      ] } },

    { t: 'h2', text: 'Scope: where does a variable live?' },
    { t: 'table', head: ['Kind', 'Declared', 'Visible', 'Dies'], rows: [
      ['Local', 'inside a function or block', 'from the declaration to the closing `}`', 'at the closing `}`'],
      ['Parameter', 'in the parameter list', 'whole function body', 'when the function returns'],
      ['Global', 'outside every function', 'everywhere below it', 'when the program ends'],
    ] },
    { t: 'callout', kind: 'tip', html: 'Prefer locals and parameters over globals. A global can be changed from anywhere, so when a bug appears you have to suspect the whole program.' },

    { t: 'h2', text: 'Overloading and default arguments' },
    { t: 'code', file: 'overload.cpp', code: `#include <iostream>
using namespace std;

int area(int side)              { return side * side; }         // square
int area(int w, int h)          { return w * h; }               // rectangle
double area(double radius)      { return 3.14159 * radius * radius; }  // circle

void line(char c = '-', int n = 10) {      // default arguments
    for (int i = 0; i < n; i++) cout << c;
    cout << "\\n";
}

int main() {
    cout << area(3) << " " << area(3, 4) << " " << area(1.5) << "\\n";
    line();          // ----------
    line('*');       // **********
    line('=', 5);    // =====
}` },
    { t: 'p', html: '**Overloading** lets the same name serve different parameter lists; the compiler picks the best match. The return type alone is **not** enough to tell two overloads apart.' },

    { t: 'callout', kind: 'interview', html: 'Interviewers watch your **decomposition**. Name functions after what they do (`isValid`, `buildGraph`), keep each one doing a single job, and you will find bugs far faster.' },

    { t: 'quiz', q: 'What is wrong with: `int f(int x) { if (x > 0) return 1; }`?', opts: ['Nothing', 'No return when `x <= 0`, which is undefined behavior', 'It must be `void`', '`x` must be a reference'], ans: 1,
      why: 'If `x <= 0`, control reaches the end of a non-void function without returning a value. Make sure **every** path returns.' },
    { t: 'quiz', q: 'In `int r = add(2, 3);` which words are the **arguments**?', opts: ['`add` and `r`', '`2` and `3`', '`int a, int b`', '`return`'], ans: 1,
      why: 'Arguments are the values you pass at the call site. `a` and `b` in the definition are the **parameters**.' },

    { t: 'recap', items: [
      'Define, declare (prototype) and call functions with parameters and return values.',
      'Picture each call as a frame pushed on, and popped off, the call stack.',
      'Explain local, parameter and global scope.',
      'Use overloading and default arguments, and know their limits.',
    ] },
  ],
});
