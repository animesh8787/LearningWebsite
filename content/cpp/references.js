registerLesson('references', {
  title: 'Values vs <em>references</em>',
  lead: 'By default C++ hands a function a photocopy of your data. References let it work on the original. Knowing which one you are using is the key to correct and fast code.',
  blocks: [
    { t: 'h2', text: 'Copy or original?' },
    { t: 'levels',
      eli5: ['You have a drawing. Give a **photocopy** to a friend, and their scribbles never touch your original. Give them the **original** and every scribble is on your drawing.',
             'Passing by value is the photocopy. Passing by reference is handing over the original.'],
      plain: ['When you pass a variable to a function normally, the function receives its own **copy**. Changing the copy leaves your variable untouched. Adding `&` to the parameter makes it an **alias**: another name for the *same* box, so changes show up in the caller.',
              'Copies of big objects (a vector of a million numbers) are slow. A **const reference** gives read-only access with no copy.'],
      tech: ['A reference is an alias bound at initialization to an existing object; it cannot be null, reseated or left uninitialized. In practice compilers implement it as an address, but language-wise it has no storage you can observe. Pass-by-value copy-constructs the parameter; `const T&` binds to lvalues and temporaries without copying; `T&&` (rvalue reference) enables moves.'] },

    { t: 'h2', text: 'See the difference' },
    { t: 'code', file: 'swap_demo.cpp', hl: [4, 8], code: `#include <iostream>
using namespace std;

void bump_copy(int n)  { n = n + 1; }     // changes a photocopy
void bump_ref(int& n)  { n = n + 1; }     // changes the original

int main() {
    int x = 5;
    bump_copy(x);
    cout << x << "\\n";   // 5
    bump_ref(x);
    cout << x << "\\n";   // 6
}` },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Copy vs alias', heapIds: [],
      code: `int x = 5;
bump_copy(x);   // n is a copy
bump_ref(x);    // n is an alias of x`,
      steps: [
        { line: 1, stack: { x: { type: 'int', val: 5 } }, note: 'One box, `x`, holding 5.' },
        { line: 2, stack: { n: { type: 'int (copy)', val: 5 } }, note: '**By value:** inside `bump_copy` a brand-new box `n` is created and filled with a copy of 5. They are unrelated boxes.' },
        { line: 2, stack: { n: { val: 6 } }, note: '`n = n + 1` changes only the copy. `x` is still 5.' },
        { line: 3, stack: { n: null }, note: 'The function ends, so its copy is destroyed. Nothing happened to `x`.' },
        { line: 3, stack: { n: { type: 'int&', val: null, ref: 's:x' } }, note: '**By reference:** no new storage. `n` is just another **name** for `x` (the arrow shows the link).' },
        { line: 3, stack: { x: { val: 6 } }, note: '`n = n + 1` really changes `x`. After the call, `x` is 6.' },
      ] } },

    { t: 'h2', text: 'Three ways to take a parameter' },
    { t: 'table', head: ['Signature', 'Copies?', 'Can modify caller’s data?', 'Use for'], rows: [
      ['`void f(int n)`', 'yes', 'no', 'small values: `int`, `double`, `char`, `bool`'],
      ['`void f(int& n)`', 'no', '**yes**', 'output parameters, swap, in-place edits'],
      ['`void f(const vector<int>& v)`', 'no', 'no (read-only)', 'big objects you only read: vectors, strings, maps'],
    ] },
    { t: 'callout', kind: 'interview', html: 'The default for **large read-only** inputs is `const T&`. Passing `vector<int> v` by value copies every element on every call. In a recursive function that turns O(n) work into O(n²) or worse, and is a very common reason for “Time Limit Exceeded”.' },

    { t: 'code', file: 'swap.cpp', code: `#include <iostream>
#include <vector>
using namespace std;

void mySwap(int& a, int& b) {       // modifies the caller’s variables
    int tmp = a; a = b; b = tmp;
}

int sum(const vector<int>& v) {     // reads without copying
    int s = 0;
    for (int x : v) s += x;
    return s;
}

int main() {
    int p = 1, q = 2;
    mySwap(p, q);
    cout << p << " " << q << "\\n";   // 2 1
    vector<int> data = {10, 20, 30};
    cout << sum(data) << "\\n";       // 60
}` },

    { t: 'callout', kind: 'warn', html: 'Never return a reference to a **local** variable. It dies when the function ends, and you are left holding an alias to nothing (a *dangling reference*): `int& bad() { int x = 1; return x; }` is a bug.' },

    { t: 'quiz', q: 'You write `void addOne(vector<int> v) { v.push_back(1); }` and call `addOne(data);`. What happens to `data`?', opts: ['It gets a new element', 'Nothing: the function worked on a copy', 'Compile error', 'It is cleared'], ans: 1,
      why: 'The parameter is a **copy** of the whole vector. The push_back changes the copy, which is destroyed at the end. Use `vector<int>& v` to modify the caller’s vector.' },
    { t: 'quiz', q: 'You need to print a 1-million-element vector inside a function without modifying it. Best parameter type?', opts: ['`vector<int> v`', '`vector<int>& v`', '`const vector<int>& v`', '`int v`'], ans: 2,
      why: '`const &` avoids the million-element copy **and** the compiler stops you from accidentally changing it.' },

    { t: 'recap', items: [
      'Explain pass-by-value as a photocopy and pass-by-reference as an alias.',
      'Choose `T`, `T&` or `const T&` for each parameter.',
      'Write a `swap` that actually swaps the caller’s variables.',
      'Avoid returning references to locals.',
    ] },
  ],
});
