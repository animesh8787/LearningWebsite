registerLesson('lambdas', {
  title: 'Lambdas: <em>tiny</em> functions on the spot',
  lead: 'Many STL algorithms ask you for a rule: “sort by this”, “count those”. A lambda lets you write that rule right where you need it, without naming a whole function.',
  blocks: [
    { t: 'h2', text: 'A function with no name' },
    { t: 'levels',
      eli5: ['Sometimes you just need a quick instruction: “put the tallest first.” You do not want to write a formal rulebook with a title for it. You just say the instruction out loud, once. A lambda is that spoken-once instruction.'],
      plain: ['A **lambda** is an unnamed function you write inline. Its shape is `[captures](parameters) { body }`. The square brackets say which outside variables the lambda may use. You can store a lambda in a variable (`auto f = ...`) or pass it directly to an algorithm.'],
      tech: ['A lambda expression creates an unnamed **closure type** with an `operator()` and a data member per capture. Captures by value copy the variable into the closure at creation; by reference store a reference (and dangle if the closure outlives the variable). Since C++14 parameters can be `auto` (generic lambdas) and since C++20 lambdas can be templated. Non-capturing lambdas convert to plain function pointers.'] },

    { t: 'code', file: 'lambda_basics.cpp', code: `#include <iostream>
using namespace std;

int main() {
    auto add = [](int a, int b) { return a + b; };    // no captures
    cout << add(2, 3) << "\\n";                        // 5

    auto sayHi = []() { cout << "hi\\n"; };            // no parameters
    sayHi();

    int factor = 10;
    auto scale = [factor](int x) { return x * factor; };   // captures factor by VALUE
    cout << scale(4) << "\\n";                         // 40
}` },

    { t: 'h2', text: 'The capture list' },
    { t: 'table', head: ['Capture', 'Meaning', 'Use when'], rows: [
      ['`[]`', 'nothing from outside', 'a self-contained rule'],
      ['`[x]`', 'copy `x` into the lambda', 'read-only, or must outlive the scope'],
      ['`[&x]`', 'use the original `x` (a reference)', 'you want to **modify** `x` or avoid a big copy'],
      ['`[=]`', 'copy everything it uses', 'quick and short-lived (be careful)'],
      ['`[&]`', 'reference everything it uses', 'quick and short-lived, **local only**'],
    ] },
    { t: 'p', html: 'The difference between copy and reference is exactly the one from the references lesson. Watch it:' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Capture by value vs by reference',
      code: `int n = 1;
auto byVal = [n]()  { return n; };
auto byRef = [&n]() { return n; };
n = 99;
cout << byVal() << " " << byRef();`,
      steps: [
        { line: 1, set: { n: ['int', 1] }, note: 'A plain int.' },
        { line: 2, set: { byVal: ['lambda', 'holds its own copy: n=1'] }, note: '`[n]` **copies** `n` (value 1) into the lambda object at this moment.' },
        { line: 3, set: { byRef: ['lambda', 'holds a link to n'] }, note: '`[&n]` stores a **reference**, so it will always see the current `n`.' },
        { line: 4, set: { n: 99 }, note: 'We change the original.' },
        { line: 5, out: '1 99', note: '`byVal()` still returns its private copy: **1**. `byRef()` sees the live variable: **99**.' },
      ] } },
    { t: 'callout', kind: 'warn', html: 'A lambda that captures by reference must **not outlive** the variable. Returning `[&]{...}` from a function that captured its locals leaves dangling references. When in doubt, capture by value.' },

    { t: 'h2', text: 'Where lambdas shine: STL algorithms' },
    { t: 'code', file: 'lambda_algo.cpp', code: `#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> v = {5, 2, 8, 1, 9, 3};

    sort(v.begin(), v.end(), [](int a, int b) { return a > b; });   // descending
    for (int x : v) cout << x << " ";                               // 9 8 5 3 2 1
    cout << "\\n";

    int limit = 4;
    int big = count_if(v.begin(), v.end(), [limit](int x) { return x > limit; });
    cout << big << " numbers above " << limit << "\\n";             // 3

    bool anyEven = any_of(v.begin(), v.end(), [](int x) { return x % 2 == 0; });
    cout << anyEven << "\\n";                                        // 1

    int total = 0;
    for_each(v.begin(), v.end(), [&total](int x) { total += x; });  // modifies total via reference
    cout << total << "\\n";                                          // 28
}` },
    { t: 'callout', kind: 'interview', html: 'The two lambdas you will write most on LeetCode: a **custom sort comparator** (`[](auto& a, auto& b){ return a.second < b.second; }`) and a **priority_queue / set comparator**. A comparator must be a strict weak ordering: `<`, never `<=`.' },

    { t: 'quiz', q: 'What does this print? `int x = 5; auto f = [x]() { return x; }; x = 8; cout << f();`', opts: ['8', '5', '0', 'compile error'], ans: 1,
      why: '`[x]` copied 5 when the lambda was created. Later changes to `x` do not affect it.' },
    { t: 'quiz', q: 'You need the lambda to add to an outer counter `total`. Which capture?', opts: ['`[total]`', '`[&total]`', '`[]`', '`[=]`'], ans: 1,
      why: 'To modify the original variable, capture it by reference: `[&total]`.' },

    { t: 'recap', items: [
      'Write lambdas with parameters, return values and captures.',
      'Choose capture by value or by reference and explain the dangling risk.',
      'Pass a lambda as a comparator or predicate to STL algorithms.',
    ] },
  ],
});
