registerLesson('string-deep', {
  title: '<em>string,</em> deeply',
  lead: 'You met std::string in Part 1. Here is what it really is, what each operation costs, and the idioms that come up in almost every text problem.',
  blocks: [
    { t: 'h2', text: 'A vector of characters, with extras' },
    { t: 'levels',
      eli5: ['A string is a necklace of letter beads. You can look at bead number 3, add beads to the end, or take a few beads out to make a shorter necklace. Everything costs time in proportion to how many beads you touch.'],
      plain: ['`std::string` behaves like a `vector<char>`: contiguous characters, a size, a capacity, `push_back`, indexing, iterators. On top it adds text tools: `+`, `substr`, `find`, comparison, conversion to and from numbers. Because it is contiguous, **indexing is O(1)** and appending a character is **amortized O(1)**, but anything that creates a new string (`substr`, `+`) costs O(length).'],
      tech: ['Most implementations use the **small string optimization (SSO)**: strings up to about 15 (libstdc++) or 22 (libc++) characters are stored inside the object itself with no heap allocation. Longer ones allocate a heap buffer like a vector. `s.c_str()` returns a null-terminated `const char*`. `string_view` (C++17) is a non-owning view of characters: pass it instead of `const string&` when you only read, and it accepts literals without constructing a string.'] },

    { t: 'h2', text: 'The operations, with costs' },
    { t: 'table', head: ['Operation', 'Example', 'Cost'], rows: [
      ['index', '`s[i]`, `s.at(i)`', 'O(1)'],
      ['append char / string', '`s.push_back(c)`, `s += "ab"`', 'O(1) amortized / O(k)'],
      ['pop last', '`s.pop_back()`', 'O(1)'],
      ['substring (a copy!)', '`s.substr(pos, len)`', 'O(len)'],
      ['find', '`s.find("ab")`, `s.find(\'x\', from)`', 'O(n·m) worst'],
      ['compare', '`s == t`, `s < t`', 'O(min length)'],
      ['insert / erase in the middle', '`s.insert(i, "x")`, `s.erase(i, k)`', 'O(n)'],
      ['concatenate in a loop', '`r = r + c` (⚠) vs `r += c` (✓)', 'O(n) each vs O(1) each'],
    ] },
    { t: 'callout', kind: 'warn', html: '`result = result + c;` builds a brand-new string every time, so a loop of n characters is **O(n²)**. `result += c;` or `result.push_back(c);` appends in place. This difference turns TLE into AC on string-building problems.' },

    { t: 'h2', text: 'Searching and slicing' },
    { t: 'code', file: 'string_ops.cpp', code: `#include <algorithm>
#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

int main() {
    string s = "the quick brown fox";

    size_t p = s.find("quick");                   // 4; string::npos if absent
    if (p != string::npos) cout << s.substr(p, 5) << "\\n";     // quick  (start, LENGTH)
    cout << s.find('z') << "\\n";                  // 18446744073709551615 (npos): NOT -1!
    cout << s.rfind('o') << "\\n";                 // last occurrence: 17
    cout << s.find_first_of("aeiou") << "\\n";     // first vowel: 2
    cout << s.find_first_not_of("the ") << "\\n";  // 4

    s.replace(4, 5, "slow");                       // the slow brown fox
    s.erase(0, 4);                                  // slow brown fox
    s.insert(0, ">> ");                              // >> slow brown fox
    cout << s << "\\n";

    reverse(s.begin(), s.end());                   // algorithms work on strings
    transform(s.begin(), s.end(), s.begin(), ::toupper);
    cout << s << "\\n";                             // XOF NWORB WOLS >>

    // split on spaces with stringstream
    istringstream in("alpha beta  gamma");
    string w; vector<string> words;
    while (in >> w) words.push_back(w);             // skips repeated spaces
    cout << words.size() << "\\n";                  // 3

    // split on a delimiter with getline
    istringstream csv("a,b,,d"); string cell; vector<string> cells;
    while (getline(csv, cell, ',')) cells.push_back(cell);
    cout << cells.size() << "\\n";                  // 4 (includes the empty cell)
}` },

    { t: 'h2', text: 'Numbers, characters and strings' },
    { t: 'code', file: 'string_convert.cpp', code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    int n = stoi("123");               // string -> int      (throws if not a number)
    long long big = stoll("9000000000");
    double d = stod("3.14");
    string a = to_string(42);          // int -> string
    string b = to_string(2.5);         // "2.500000"

    string bin;                        // manual base conversion
    for (int x = 10; x > 0; x /= 2) bin = char('0' + x % 2) + bin;
    cout << bin << "\\n";               // 1010

    string digits = "4821";
    int sum = 0;
    for (char c : digits) sum += c - '0';
    cout << n + 1 << " " << a + b << " " << sum << "\\n";   // 124 422.500000 15

    string t(3, 'x');                  // "xxx"
    cout << t << (t == "xxx") << (t < "xxy") << "\\n";       // xxx11
}` },

    { t: 'h2', text: 'Patterns that reappear' },
    { t: 'table', head: ['Problem type', 'Tool', 'Example'], rows: [
      ['Count letters', '`int cnt[26]` or `array<int,26>`', 'Valid Anagram, Ransom Note'],
      ['Sliding window over text', 'two indices + frequency table', 'Longest Substring Without Repeating'],
      ['Palindromes', 'two pointers from both ends / expand around centre', 'Valid Palindrome, Longest Palindromic Substring'],
      ['Group by signature', '`unordered_map<string, vector<string>>` keyed by sorted letters', 'Group Anagrams'],
      ['Parse / tokenise', '`istringstream`, `stoi`', 'Basic Calculator, Decode String'],
      ['Build output', '`+=` into one string, return at the end', 'almost everything'],
    ] },
    { t: 'code', file: 'anagrams.cpp', code: `#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

int main() {
    vector<string> words = {"eat", "tea", "tan", "ate", "nat", "bat"};
    unordered_map<string, vector<string>> groups;
    for (const string& w : words) {
        string key = w;
        sort(key.begin(), key.end());          // "eat","tea","ate" all become "aet"
        groups[key].push_back(w);
    }
    cout << groups["aet"].size() << " " << groups.size() << "\\n";   // 3 3
}` },

    { t: 'callout', kind: 'interview', html: 'Mention **string_view** when comparing options: `bool startsWith(string_view s, string_view p)` avoids copies. And when asked about `substr` in a loop, point out it copies; use indices and compare ranges instead for O(1) extra memory.' },

    { t: 'quiz', q: 'What does `"abc".find("z")` return?', opts: ['-1', '0', '`string::npos` (a huge unsigned number)', 'It throws'], ans: 2,
      why: '`find` returns `string::npos` when not found. Compare against `string::npos`, never `-1` or `< 0`, since the type is unsigned.' },
    { t: 'quiz', q: 'Why is `for (char c : text) result = result + c;` slow?', opts: ['`+` is not defined', 'Each `+` creates a new string, making the loop O(n²)', 'Chars cannot be added', 'It is fine'], ans: 1,
      why: 'Every iteration copies the whole result so far. Use `result += c` to append in place.' },

    { t: 'recap', items: [
      'Treat `string` as a contiguous vector of chars with known costs.',
      'Search, slice, split and convert with `find`, `substr`, `stringstream` and `stoi`.',
      'Avoid O(n²) concatenation and the `npos` comparison trap.',
      'Map common text problems to counting arrays, windows, and map-of-sorted-keys.',
    ] },
  ],
});
