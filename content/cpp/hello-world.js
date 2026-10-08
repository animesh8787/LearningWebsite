registerLesson('hello-world', {
  title: 'Hello, world: <em>every</em> line explained',
  lead: 'Six lines. Each one hides an idea you will use in every program you ever write. This lesson walks through each one.',
  blocks: [
    { t: 'h2', text: 'The smallest real program' },
    { t: 'code', file: 'hello.cpp', code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, world!" << endl;
    return 0;
}` },
    { t: 'p', html: 'Press **Run** to execute it on a real compiler (needs internet), then read on to see why every character is there.' },

    { t: 'h2', text: 'Line by line' },
    { t: 'table', head: ['Line', 'What it does', 'Everyday analogy'], rows: [
      ['`#include <iostream>`', 'Pastes in the header that knows how to print and read. Without it, `cout` does not exist yet.', 'Borrowing a toolbox before starting the job'],
      ['`using namespace std;`', 'Lets you write `cout` instead of `std::cout`. All standard tools live in a “room” called `std`.', 'Saying “Sam” instead of “Sam from accounting”'],
      ['`int main() {`', 'The **entry point**. The operating system starts your program by calling `main`. `int` means it hands back a whole number when done.', 'The front door of the building'],
      ['`cout << "Hello, world!"`', 'Sends the text to the screen. `<<` means “send this into that”.', 'Dropping a letter into a mailbox'],
      ['`<< endl`', 'Ends the line and flushes (forces the text out now).', 'Pressing Enter'],
      ['`return 0;`', 'Reports success (0) back to the operating system.', 'Telling the boss “job done, no problems”'],
      ['`}`', 'Closes the body of `main`. The program ends here.', 'Leaving by the same door'],
    ] },

    { t: 'h2', text: 'Watch it execute' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Program flow',
      code: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, ";
    cout << "world!" << endl;
    return 0;
}`,
      steps: [
        { line: [1, 2], note: 'Before running anything, the preprocessor pasted in `<iostream>`. That is all done at **build** time, so nothing happens in memory yet.' },
        { line: 4, note: 'The operating system calls `main`. Execution always starts here, no matter where `main` sits in the file.' },
        { line: 5, out: 'Hello, ', note: 'The text goes to the console. There is **no newline yet**, so the cursor stays on the same line.' },
        { line: 6, out: 'world!', note: 'More text is appended right after the first. `endl` then moves to a new line.' },
        { line: 7, note: '`return 0` ends `main` and tells the OS “everything went fine”. A non-zero value means “something went wrong”.' },
      ] } },

    { t: 'h2', text: 'Rules you must not forget' },
    { t: 'ul', items: [
      'Almost every statement ends with a **semicolon** `;`. Block headers like `int main()` do not.',
      '**Curly braces** `{ }` group statements into a block. Every `{` needs its `}`.',
      'C++ is **case-sensitive**: `Cout` and `cout` are different words.',
      'Text in double quotes is a **string**. Single quotes are for one **character**: `\'a\'`.',
      'Comments are ignored by the compiler: `// until end of line` and `/* across lines */`. Write them for humans.',
    ] },
    { t: 'callout', kind: 'warn', html: 'Compiler errors point at the line **after** a missing semicolon, because that is where the compiler realised something was wrong. If the error line looks fine, check the line above it.' },

    { t: 'h2', text: 'Try changing it' },
    { t: 'code', file: 'practice.cpp', code: `#include <iostream>
using namespace std;

int main() {
    cout << "Line one\\n";          // \\n is a newline too
    cout << "Tab\\tseparated\\n";    // \\t is a tab
    cout << "She said \\"hi\\"\\n";   // \\" prints a quote mark
    return 0;
}` },
    { t: 'callout', kind: 'tip', html: '`\\n` and `endl` both start a new line. In competitive programming prefer `\\n`: `endl` also flushes the output every time, which is slow when you print a lot.' },

    { t: 'quiz', q: 'What happens first when your program starts?', opts: ['The first line of the file runs', 'The OS calls `main`', 'Every function runs once', '`cout` is created'], ans: 1,
      why: 'Whatever order your functions appear in the file, execution begins at `main`.' },
    { t: 'quiz', q: 'Which line has a bug?', opts: ['`cout << "hi";`', '`cout << \'hi\';`', '`int main() {`', '`return 0;`'], ans: 1,
      why: 'Single quotes are for **one** character. `\'hi\'` has two, so it is not a valid character literal. Use double quotes for text.' },

    { t: 'recap', items: [
      'Write, compile and run a complete C++ program.',
      'Explain `#include`, `main`, `cout`, `endl` and `return 0` in plain words.',
      'Avoid the classic beginner slips: missing `;`, wrong quotes, mismatched braces.',
    ] },
  ],
});
