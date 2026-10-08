registerLesson('strings', {
  title: 'Strings and <em>characters</em>',
  lead: 'Text feels like a different kind of thing from numbers. Underneath it is not: every character is a small number, and a string is an array of them.',
  blocks: [
    { t: 'h2', text: 'Letters are numbers in disguise' },
    { t: 'levels',
      eli5: ['A computer only understands numbers, so people agreed on a secret code: A is 65, B is 66, and so on. When you type a letter, the computer stores the number, and when it shows the letter, it looks the number up in the code book.'],
      plain: ['A `char` is a 1-byte integer. The [[ascii]] table says which number means which character: `\'A\'` = 65, `\'a\'` = 97, `\'0\'` = 48. Because chars are numbers, you can do math on them: `\'a\' + 1` is `\'b\'`, and `c - \'0\'` converts a digit character into its numeric value.'],
      tech: ['`char` is an integral type of exactly one byte, signed or unsigned by implementation. ASCII defines 0–127; `\'0\'..\'9\'`, `\'A\'..\'Z\'` and `\'a\'..\'z\'` are contiguous, which makes arithmetic idioms safe for them. Upper and lower case differ by exactly 32 (one bit: `c ^ 32` toggles case for letters). Multi-byte encodings like UTF-8 are not handled by `std::string` automatically.'] },
    { t: 'p', html: 'Type anything and watch it turn into numbers. Notice the hidden **`\\0`** at the end of a C-style string: the “stop here” marker.' },
    { t: 'viz', kind: 'ascii', cfg: { text: 'Hi!' } },

    { t: 'h2', text: 'std::string: the friendly one' },
    { t: 'p', html: '`string` is a growable array of `char` that knows its own length and cleans up after itself. This is what you use in practice.' },
    { t: 'code', file: 'string_basics.cpp', code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string s = "hello";
    s += " world";                       // append
    cout << s.size() << "\\n";            // 11
    cout << s[0] << s[4] << "\\n";        // ho   (index like an array)
    s[0] = 'H';                          // strings are mutable
    cout << s << "\\n";                   // Hello world

    cout << s.substr(6, 5) << "\\n";      // world  (start index, LENGTH)
    cout << s.find("wor") << "\\n";       // 6
    cout << (s.find("xyz") == string::npos) << "\\n";   // 1: not found

    string t = "apple";
    cout << (t < "banana") << "\\n";      // 1: compared alphabetically
    cout << (s == "Hello world") << "\\n"; // 1: == compares contents
}` },

    { t: 'h2', text: 'Walking through a string' },
    { t: 'viz', kind: 'array', cfg: { title: 'Counting vowels in "code"', arr: ['c', 'o', 'd', 'e'], addr: false,
      code: `string s = "code";
int vowels = 0;
for (char c : s) {
    if (c == 'a' || c == 'e' || c == 'i' || c == 'o' || c == 'u')
        vowels++;
}`,
      steps: [
        { line: 1, note: 'A string is an array of characters. Four slots, indexes 0 to 3.' },
        { line: 3, hl: [0], ptr: { c: 0 }, note: '`c` is `\'c\'`. Not a vowel. `vowels` stays 0.' },
        { line: 4, hl: [1], ptr: { c: 1 }, note: '`c` is `\'o\'`: a vowel! `vowels` becomes **1**.' },
        { line: 3, hl: [2], ptr: { c: 2 }, note: '`\'d\'`: not a vowel.' },
        { line: 4, hl: [3], ptr: { c: 3 }, note: '`\'e\'`: a vowel! `vowels` becomes **2**. Done.' },
      ] } },

    { t: 'h2', text: 'Character tricks you will use constantly' },
    { t: 'code', file: 'char_tricks.cpp', code: `#include <iostream>
#include <string>
#include <cctype>
using namespace std;

int main() {
    char d = '7';
    int digit = d - '0';                 // 7  (digit chars are consecutive)
    char next = 'a' + 2;                 // 'c'
    int pos = 'e' - 'a';                 // 4  (index in the alphabet, 0-based)

    cout << digit + 1 << " " << next << " " << pos << "\\n";   // 8 c 4

    cout << (bool)isalpha('x') << (bool)isdigit('5') << (bool)isupper('Q') << "\\n";   // 111
    cout << (char)toupper('b') << (char)tolower('Z') << "\\n";       // Bz

    string n = to_string(123) + "!";     // number -> string
    int x = stoi("456");                 // string -> number
    cout << n << " " << x + 1 << "\\n";   // 123! 457
}` },
    { t: 'callout', kind: 'interview', html: 'Counting letters? Use an array of 26: `int cnt[26] = {}; for (char c : s) cnt[c - \'a\']++;`. It is faster and simpler than a map when the alphabet is small and fixed.' },

    { t: 'h2', text: 'C-strings: know them, avoid them' },
    { t: 'p', html: 'C++ inherited C’s way of storing text: a `char` array ending with `\'\\0\'`. You will still see it in old code and in `main`’s arguments.' },
    { t: 'table', head: ['', 'C-string', 'std::string'], rows: [
      ['Declared as', '`char s[] = "hi";`', '`string s = "hi";`'],
      ['Knows its length', 'no: scans for `\\0`', 'yes: `s.size()`'],
      ['Concatenate / compare', '`strcat`, `strcmp` (manual, unsafe)', '`+`, `==` (just works)'],
      ['Can overflow', 'easily', 'grows automatically'],
    ] },

    { t: 'callout', kind: 'warn', html: '`"a" + "b"` does **not** work: both are C-strings (really pointers). Make one a `string` first: `string("a") + "b"`. And remember: `\'a\'` (one char) is not `"a"` (a string).' },

    { t: 'quiz', q: 'What is `\'d\' - \'a\'`?', opts: ['3', '4', '100', '\'3\''], ans: 0,
      why: 'Characters are numbers: 100 − 97 = **3**, the 0-based position of `d` in the alphabet.' },
    { t: 'quiz', q: 'For `string s = "hello";`, what does `s.substr(1, 3)` return?', opts: ['"hel"', '"ell"', '"ello"', '"el"'], ans: 1,
      why: '`substr(start, length)`: begin at index 1 and take **3** characters: e, l, l. The second argument is a length, not an end index.' },

    { t: 'recap', items: [
      'Explain that a `char` is a small integer and use `c - \'0\'` and `c - \'a\'`.',
      'Use `string`: size, indexing, `+`, `substr`, `find`, comparison.',
      'Convert between numbers and strings with `to_string` and `stoi`.',
      'Tell `\'a\'` from `"a"`, and know why to prefer `string` over C-strings.',
    ] },
  ],
});
