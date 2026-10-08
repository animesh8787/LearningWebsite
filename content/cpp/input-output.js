registerLesson('input-output', {
  title: 'Input and <em>output</em>',
  lead: 'Programs are only useful if they can listen and talk. C++ does both with two streams: cin to read, cout to write.',
  blocks: [
    { t: 'h2', text: 'Streams: a conveyor belt of characters' },
    { t: 'levels',
      eli5: ['Imagine a conveyor belt. `cout` is a belt carrying your words out to the screen. `cin` is a belt bringing what you type in to the program.',
             'The arrows `<<` and `>>` just show which way the stuff is moving.'],
      plain: ['A **stream** is a sequence of characters flowing in one direction. `cout << x` pushes the text of `x` toward the console. `cin >> x` pulls characters from the keyboard and converts them into the type of `x`.',
              'Arrows point in the direction of flow: `<<` into `cout`, `>>` out of `cin` and into your variable.'],
      tech: ['`std::cin` and `std::cout` are objects of type `istream` / `ostream` with overloaded `operator>>` / `operator<<`. Each `operator>>` skips leading whitespace, parses as much as matches the target type, and sets the stream’s `failbit` on mismatch. Because the operators return the stream itself, they chain.'] },

    { t: 'h2', text: 'Reading and printing' },
    { t: 'code', file: 'io.cpp', code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;                       // reads two numbers, separated by space or newline
    cout << "sum = " << a + b << "\\n";   // chain as many << as you like
}` },
    { t: 'viz', kind: 'memory', cfg: { title: 'Reading input', intro: 'Pretend the user typed: 7 5',
      code: `int a, b;
cin >> a >> b;     // input: 7 5
int sum = a + b;
cout << "sum = " << sum << "\\n";`,
      steps: [
        { line: 1, set: { a: ['int', '?'], b: ['int', '?'] }, note: 'Two boxes are created but **not initialized**: the `?` is whatever garbage was already in memory.' },
        { line: 2, set: { a: 7, b: 5 }, note: '`cin >> a` skips spaces, reads `7`, converts the text “7” to the number 7 and stores it. Then `>> b` does the same for `5`.' },
        { line: 3, set: { sum: ['int', 12] }, note: 'A new box, filled with the sum of the other two.' },
        { line: 4, out: 'sum = 12', note: 'The text and the number are sent to the console one after another.' },
      ] } },

    { t: 'h2', text: 'Reading a whole line' },
    { t: 'p', html: '`cin >> name` stops at the first space, so it can only read one **word**. For a full sentence use `getline`:' },
    { t: 'code', file: 'getline.cpp', hl: [8], code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int age;
    cin >> age;                    // leaves the newline in the buffer!
    cin.ignore();                  // throw that leftover newline away
    string name;
    getline(cin, name);            // now reads the whole line, spaces included
    cout << name << " is " << age << "\\n";
}` },
    { t: 'callout', kind: 'warn', html: 'Mixing `cin >> x` and `getline` is the #1 input bug. After `>>`, the Enter key is still waiting in the buffer, so `getline` instantly reads an empty line. Call `cin.ignore()` in between.' },

    { t: 'h2', text: 'Reading until the input ends' },
    { t: 'code', file: 'loop_input.cpp', run: false, code: `int x, total = 0;
while (cin >> x) {      // the expression is false when reading fails or input ends
    total += x;
}
cout << total << "\\n";` },

    { t: 'h2', text: 'Fast I/O for big inputs' },
    { t: 'p', html: 'By default C++ keeps `cin`/`cout` synchronized with C’s `scanf`/`printf`, which is slow. Two lines at the top of `main` remove that cost, and matter when reading hundreds of thousands of numbers:' },
    { t: 'code', file: 'fast.cpp', run: false, code: `#include <iostream>
using namespace std;

int main() {
    ios::sync_with_stdio(false);   // stop syncing with C I/O
    cin.tie(nullptr);              // stop flushing cout before every cin
    // ... use cin/cout as normal, but don't mix with scanf/printf now
}` },
    { t: 'callout', kind: 'interview', html: 'Use `"\\n"` instead of `endl` when printing many lines. `endl` flushes the buffer on every call, which can make output 10× slower.' },

    { t: 'h2', text: 'Making output look nice' },
    { t: 'code', file: 'format.cpp', code: `#include <iostream>
#include <iomanip>
using namespace std;
int main() {
    double pi = 3.14159265;
    cout << fixed << setprecision(2) << pi << "\\n";   // 3.14
    cout << setw(6) << 42 << "|\\n";                   //     42|
    cout << boolalpha << (3 > 2) << "\\n";             // true
}` },

    { t: 'quiz', q: 'The user types `hello world` and your code runs `string s; cin >> s;`. What is in `s`?', opts: ['hello world', 'hello', 'world', 'nothing'], ans: 1,
      why: '`>>` stops at whitespace. To read the full line you need `getline(cin, s)`.' },
    { t: 'quiz', q: 'Why does `getline` sometimes return an empty string right after `cin >> n`?', opts: ['getline is broken', 'The newline typed after the number is still in the buffer', 'cin crashed', 'n was too big'], ans: 1,
      why: '`cin >> n` consumes the digits but leaves the `\\n`. `getline` reads up to the next newline, finds one immediately, and returns an empty line.' },

    { t: 'recap', items: [
      'Read numbers and words with `cin >>`, and print with `cout <<`.',
      'Read full lines with `getline` and avoid the leftover-newline trap.',
      'Loop until input ends with `while (cin >> x)`.',
      'Add fast-I/O lines and prefer `"\\n"` over `endl` for big outputs.',
    ] },
  ],
});
