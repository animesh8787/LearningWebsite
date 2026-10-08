registerLesson('conditions', {
  title: 'Making <em>decisions:</em> if, else and switch',
  lead: 'Programs get interesting when they can choose. A condition is a yes/no question, and the code underneath only runs when the answer is yes.',
  blocks: [
    { t: 'h2', text: 'The idea' },
    { t: 'levels',
      eli5: ['“If it is raining, take an umbrella. Otherwise, wear sunglasses.” That is exactly an `if` / `else`. The computer asks a yes/no question and follows only one of the two paths.'],
      plain: ['`if (condition) { ... }` runs the block only when the condition is `true`. Add `else` for “otherwise”. Chain extra questions with `else if`; the **first** one that is true wins and the rest are skipped.'],
      tech: ['The condition is contextually converted to `bool`: zero, `nullptr` and `false` are false, everything else is true. Only one branch executes; there is no fallthrough between `if` / `else if` arms. `if` accepts an init-statement since C++17: `if (auto it = m.find(k); it != m.end()) { ... }`.'] },

    { t: 'h2', text: 'Follow the path' },
    { t: 'p', html: 'Step through. The highlighted line shows exactly where the computer is. Notice the lines it **skips**.' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Which branch runs?',
      code: `int score = 72;
char grade;
if (score >= 90)      grade = 'A';
else if (score >= 80) grade = 'B';
else if (score >= 70) grade = 'C';
else                  grade = 'F';`,
      steps: [
        { line: 1, set: { score: ['int', 72] }, note: 'We start with 72.' },
        { line: 2, set: { grade: ['char', '?'] }, note: '`grade` exists but is uninitialized for now.' },
        { line: 3, note: 'Is `72 >= 90`? **No.** Skip the assignment and move to the next question.' },
        { line: 4, note: 'Is `72 >= 80`? **No.** Skip again.' },
        { line: 5, note: 'Is `72 >= 70`? **Yes!** This branch is chosen.' },
        { line: 5, set: { grade: "'C'" }, note: '`grade = \'C\'` runs. The final `else` is **never checked**: once a branch wins, the rest of the chain is skipped.' },
      ] } },

    { t: 'h2', text: 'Writing it for real' },
    { t: 'code', file: 'grade.cpp', code: `#include <iostream>
using namespace std;

int main() {
    int score;
    cin >> score;

    if (score < 0 || score > 100) {
        cout << "Invalid score\\n";
    } else if (score >= 90) {
        cout << "A\\n";
    } else if (score >= 80) {
        cout << "B\\n";
    } else {
        cout << "Keep going\\n";
    }
}` },
    { t: 'callout', kind: 'tip', html: 'Always use braces `{ }`, even for one-line bodies. Adding a second line later to a brace-less `if` is a common bug: only the first line belongs to the `if`.' },

    { t: 'h2', text: 'switch: many exact choices' },
    { t: 'p', html: 'When you compare **one integer or character** against several fixed values, `switch` reads better than a long `else if` chain.' },
    { t: 'code', file: 'switch.cpp', hl: [8, 9], code: `#include <iostream>
using namespace std;
int main() {
    char op = '*';
    int a = 6, b = 7;
    switch (op) {
        case '+': cout << a + b << "\\n"; break;
        case '*': cout << a * b << "\\n";
                  break;                      // without break, execution FALLS THROUGH
        case '-': cout << a - b << "\\n"; break;
        default:  cout << "unknown\\n";
    }
}` },
    { t: 'callout', kind: 'warn', html: 'Forget a `break` and execution **falls through** into the next case, running code you did not intend. Sometimes that is useful (stacking labels), but when it is accidental it is a bug. Modern compilers can warn you with `-Wimplicit-fallthrough`.' },

    { t: 'h2', text: 'Three classic bugs' },
    { t: 'table', head: ['Bug', 'What you wrote', 'What happens'], rows: [
      ['Assignment instead of comparison', '`if (x = 5)`', 'Sets `x` to 5, and 5 is true. **Always true.**'],
      ['Chained comparison', '`if (0 < x < 10)`', 'Parsed as `(0 < x) < 10`, which is `true < 10`. **Always true.**'],
      ['Comparing floats', '`if (d == 0.3)`', 'Precision errors make it false. Use a tolerance.'],
    ] },
    { t: 'p', html: 'The correct range check is `if (x > 0 && x < 10)`. Say it out loud: “x is greater than 0 **and** x is less than 10”.' },

    { t: 'quiz', q: 'With `int x = 3;` which block runs?\n', opts: ['`if (x > 5) {A} else if (x > 1) {B} else {C}` runs A', 'It runs B', 'It runs C', 'It runs both B and C'], ans: 1,
      why: '`x > 5` is false, `x > 1` is true, so B runs. After that the chain ends, so C is skipped.' },
    { t: 'quiz', q: 'What does `if (x = 0) { cout << "zero"; }` print when `x` was 9?', opts: ['zero', 'nothing', 'a compile error', 'it depends'], ans: 1,
      why: '`x = 0` is an **assignment**; its value is 0, which is false. So the block is skipped, and `x` is now 0 as a side effect. You meant `==`.' },

    { t: 'recap', items: [
      'Write if / else if / else chains and trace which branch runs.',
      'Use `&&`, `||` and `!` to build conditions, and range-check correctly.',
      'Use `switch` with `break`, and explain fallthrough.',
      'Spot `=` versus `==` and chained-comparison bugs on sight.',
    ] },
  ],
});
