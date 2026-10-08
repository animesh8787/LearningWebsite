registerLesson('smart-pointers', {
  title: 'Smart pointers: <em>ownership</em> you can see',
  lead: 'A smart pointer is a small object that holds a heap address and deletes it for you at exactly the right moment. It turns “remember to clean up” into “cleanup cannot be forgotten”.',
  blocks: [
    { t: 'h2', text: 'Ownership in one sentence' },
    { t: 'levels',
      eli5: ['Imagine a hotel key card that **expires by itself** when you check out. You never have to remember to return the room. Smart pointers are key cards for heap memory: when the last holder of the card is done, the room is cleaned automatically.'],
      plain: ['An **owner** is the part of the program responsible for freeing something. A smart pointer makes that responsibility explicit in the code. `unique_ptr` means exactly **one** owner. `shared_ptr` means **many** owners, and the last one out frees it. Both free the memory automatically when they go out of scope.'],
      tech: ['Smart pointers apply **RAII**: acquisition in the constructor, release in the destructor, which runs on every exit path including exceptions. `unique_ptr<T>` is move-only with zero overhead over a raw pointer (with the default deleter). `shared_ptr<T>` keeps a control block with strong and weak reference counts (atomic increments), costing an extra allocation unless created with `make_shared`.'] },

    { t: 'h2', text: 'unique_ptr: one owner' },
    { t: 'code', file: 'unique.cpp', hl: [8, 10], code: `#include <iostream>
#include <memory>
using namespace std;

struct Dog { ~Dog() { cout << "Dog destroyed\\n"; } };

int main() {
    unique_ptr<Dog> a = make_unique<Dog>();   // allocates, and owns it
    // unique_ptr<Dog> b = a;                 // ✗ error: can't copy a sole owner
    unique_ptr<Dog> b = move(a);              // ✓ transfer ownership; a is now empty
    cout << (a == nullptr) << "\\n";           // 1
    cout << "leaving main\\n";
}   // b dies here and automatically deletes the Dog` },
    { t: 'p', html: 'Because there is only one owner, you can reason locally: when that owner goes away, so does the object. No `delete`, no leak, no double free.' },

    { t: 'h2', text: 'shared_ptr: many owners, counted' },
    { t: 'p', html: 'Each copy of a `shared_ptr` bumps a **reference count**. When a copy dies, it drops. At zero, the object is deleted. Step through:' },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Reference counting', heapIds: ['b1'],
      code: `auto a = make_shared<int>(7);
auto b = a;          // copy: count goes up
{
    auto c = b;      // another owner, briefly
}                    // c dies: count goes down
a.reset();           // a lets go
// b dies at end of scope`,
      steps: [
        { line: 1, stack: { a: { type: 'shared_ptr', ref: 'h:b1' } }, heap: { b1: { val: 7, rc: 1 } }, note: 'One owner, count = **1**.' },
        { line: 2, stack: { b: { type: 'shared_ptr', ref: 'h:b1' } }, heap: { b1: { rc: 2 } }, note: 'Copying a `shared_ptr` shares ownership. Same block, count = **2**.' },
        { line: 4, stack: { c: { type: 'shared_ptr', ref: 'h:b1' } }, heap: { b1: { rc: 3 } }, note: 'A third owner inside the inner braces: count = **3**.' },
        { line: 5, stack: { c: null }, heap: { b1: { rc: 2 } }, note: '`c` goes out of scope; its destructor lowers the count to **2**. The object lives on.' },
        { line: 6, stack: { a: null }, heap: { b1: { rc: 1 } }, note: '`a.reset()` lets go. Count = **1**.' },
        { line: 7, stack: { b: null }, heap: { b1: { rc: 0, freed: true } }, note: 'The last owner leaves: count hits **0** and the block is **deleted automatically**.' },
      ] } },

    { t: 'h2', text: 'Which one do I use?' },
    { t: 'table', head: ['Situation', 'Use', 'Why'], rows: [
      ['Object has one clear owner (the common case)', '`unique_ptr`', 'free, simple, fast'],
      ['Several parts genuinely share lifetime', '`shared_ptr`', 'counted, safe, has overhead'],
      ['Observe without owning, may outlive', '`weak_ptr`', 'does not keep it alive; breaks cycles'],
      ['Just use an object someone else owns', 'raw pointer or reference', 'non-owning, no cost'],
      ['A collection of things', '`vector`, not an array of pointers', 'it already manages its memory'],
    ] },
    { t: 'callout', kind: 'interview', html: 'Default answer: **`unique_ptr` first.** Reach for `shared_ptr` only when ownership is truly shared. A cycle of `shared_ptr`s (A owns B, B owns A) never reaches count zero and leaks; one side should be a `weak_ptr`. Create with `make_unique` / `make_shared` rather than `new`.' },

    { t: 'code', file: 'tree_node.cpp', code: `#include <memory>
using namespace std;

struct Node {
    int val;
    unique_ptr<Node> left, right;           // each child has exactly one owner: its parent
    Node(int v) : val(v) {}
};

int main() {
    auto root = make_unique<Node>(1);
    root->left  = make_unique<Node>(2);     // -> reaches a member through a pointer
    root->right = make_unique<Node>(3);
}   // root dies, destroys its children, which destroy theirs: no manual delete anywhere` },
    { t: 'callout', kind: 'tip', html: 'On LeetCode the node types use raw pointers (`TreeNode*`) and the judge manages memory, so you will not use smart pointers there. In real C++ projects and systems interviews, they are the standard.' },

    { t: 'quiz', q: 'What happens with `unique_ptr<int> a = make_unique<int>(1); unique_ptr<int> b = a;`?', opts: ['Both own the int', 'Compile error: a `unique_ptr` cannot be copied', '`b` copies the int', 'A leak'], ans: 1,
      why: 'A sole owner cannot be duplicated. Transfer it explicitly with `std::move(a)` and `a` becomes empty.' },
    { t: 'quiz', q: 'Three `shared_ptr`s share one object. Two are destroyed. What is true?', opts: ['The object is deleted', 'The count is 1 and the object lives', 'The count is negative', 'It leaks'], ans: 1,
      why: 'The object is deleted only when the **last** owner releases it (count reaches 0).' },

    { t: 'recap', items: [
      'Define ownership and explain how smart pointers make it visible.',
      'Use `make_unique` and `make_shared`, and transfer a `unique_ptr` with `move`.',
      'Trace a `shared_ptr` reference count up and down.',
      'Pick the right pointer kind for a situation.',
    ] },
  ],
});
