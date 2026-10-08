registerLesson('move-semantics', {
  title: 'Move semantics: <em>steal</em>, don’t copy',
  lead: 'Copying a big object is expensive. If the original is about to disappear anyway, why not just take its insides? That is what a move does.',
  blocks: [
    { t: 'h2', text: 'Moving house vs photocopying a house' },
    { t: 'levels',
      eli5: ['You are giving your friend a box of 1,000 books. You can **photocopy** every page (slow, and you keep the originals). Or, if you do not need them anymore, you can just **hand over the box** (instant). Moving is handing over the box.'],
      plain: ['A **copy** makes a new, independent duplicate. A **move** transfers the internals (usually a pointer to heap data) from one object to another and leaves the source empty but valid. It is fast because no elements are duplicated. The compiler moves automatically from **temporaries** (values about to vanish), and you can ask for a move with `std::move`.'],
      tech: ['C++11 added **rvalue references** (`T&&`) that bind to temporaries and to expressions marked with `std::move` (which is just a cast to `T&&`; it moves nothing by itself). A move constructor/assignment overload takes `T&&` and steals resources, leaving the source in a valid-but-unspecified (in practice empty) state. Return-value optimization (**copy elision**) often avoids even the move. Mark moves `noexcept` so containers use them when reallocating.'] },

    { t: 'viz', kind: 'heapview', cfg: { title: 'Copy vs move of a vector', heapIds: ['b1', 'b2'],
      code: `vector<int> a = {1, 2, 3};
vector<int> b = a;            // copy
vector<int> c = std::move(a); // move`,
      steps: [
        { line: 1, stack: { a: { type: 'vector', ref: 'h:b1' } }, heap: { b1: { val: '[1, 2, 3]', size: 12 } }, note: '`a` owns an array on the heap.' },
        { line: 2, stack: { b: { type: 'vector', ref: 'h:b2' } }, heap: { b2: { val: '[1, 2, 3]', size: 12 } }, note: '**Copy:** a second array is allocated and every element is duplicated. O(n) work and an allocation. Two independent owners.' },
        { line: 3, stack: { c: { type: 'vector', ref: 'h:b1' }, a: { ref: 'null' } }, note: '**Move:** `c` takes `a`’s pointer. No allocation, no element copied: O(1). `a` is left empty (it points to nothing now). It is still a valid vector, but its contents are gone.' },
      ] } },

    { t: 'code', file: 'move_demo.cpp', code: `#include <iostream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    string a = "a very long string that lives on the heap, not inside the object";
    string b = a;              // copy: a still has its text
    string c = move(a);        // move: c steals the heap buffer

    cout << "b: " << b.size() << "\\n";    // 64
    cout << "c: " << c.size() << "\\n";    // 64
    cout << "a: " << a.size() << "\\n";    // 0   (valid, but empty: don't rely on its value)

    vector<string> names;
    string s = "Alexandria";
    names.push_back(s);              // copies s
    names.push_back(move(s));        // moves s into the vector, no copy
    names.push_back("Bob");          // temporary: moved automatically
    names.emplace_back("Carol");     // builds the string IN PLACE, no temporary at all
}` },

    { t: 'h2', text: 'The rules of thumb' },
    { t: 'ul', items: [
      '**Returning a local by value is fine and fast.** `return result;` is moved (or elided entirely). Do **not** write `return std::move(result);`: it can actually prevent elision.',
      'After `std::move(x)`, treat `x` as **empty**. You may assign to it or destroy it, but do not read from it.',
      'Passing by value then moving (`void set(string s) { name = std::move(s); }`) is a good pattern when you will store the argument.',
      '`std::move` on a `const` object silently falls back to a **copy**, since you cannot steal from something you may not modify.',
    ] },
    { t: 'callout', kind: 'interview', html: 'A great interview answer for “why are `vector` returns cheap?”: *“Returning by value either elides the copy or moves it, and moving a vector just transfers its three pointers: O(1).”* Prefer `emplace_back(args...)` over `push_back(T(args...))` for the same reason.' },

    { t: 'quiz', q: 'What does `std::move(x)` do by itself?', opts: ['Moves the data out of x', 'Casts x to an rvalue reference, so a move *may* then happen', 'Deletes x', 'Copies x'], ans: 1,
      why: '`std::move` performs no move. It only marks the value as “OK to steal from”. The move constructor or assignment that receives it does the actual stealing.' },
    { t: 'quiz', q: 'You write `vector<int> c = std::move(a);`. Which is safe afterwards?', opts: ['Reading `a[0]`', 'Calling `a.size()` or assigning a new value to `a`', 'Printing all elements of `a`', 'Nothing about `a` is safe'], ans: 1,
      why: 'A moved-from standard object is valid but unspecified. Operations with no preconditions (size, assign, destroy) are safe; reading specific elements is not.' },

    { t: 'recap', items: [
      'Describe a move as transferring ownership of internals instead of copying them.',
      'Know what `std::move` really does and what state the source is left in.',
      'Return locals by value without `std::move`, and use `emplace_back`.',
    ] },
  ],
});
