registerLesson('heap', {
  title: 'new, delete and the art of not <em>leaking</em>',
  lead: 'Heap memory is a loan. Borrow it with new, return it with delete. Forget, and you leak. Return it twice, or use it after returning it, and you crash.',
  blocks: [
    { t: 'h2', text: 'Borrow and return' },
    { t: 'levels',
      eli5: ['Heap memory is like borrowing a library book. You take it out with `new`, and you must bring it back with `delete`. If you never return it, the library slowly runs out of books (a **leak**). If you return it and then keep reading it anyway, you are reading someone else’s pages (a **dangling pointer**).'],
      plain: ['`new T` allocates room for one `T` on the heap and returns its address. `delete p` releases it. For arrays the pair is `new T[n]` and `delete[] p`. The bookkeeping is **your** job, and the compiler cannot check it.'],
      tech: ['`operator new` calls the allocator and then runs the constructor; `delete` runs the destructor and then deallocates. Mismatching forms (`new[]` with `delete`, or `malloc` with `delete`) is undefined behavior. Failing to release leaks until process exit; releasing twice (**double free**) or using memory after release (**use-after-free**) corrupt the allocator’s state and are classic security vulnerabilities.'] },

    { t: 'code', file: 'new_delete.cpp', code: `#include <iostream>
using namespace std;

int main() {
    int* p = new int(5);          // one int, initialized to 5
    cout << *p << "\\n";
    delete p;                     // give it back
    p = nullptr;                  // good habit: don't leave a dangling address around

    int n = 4;
    int* arr = new int[n];        // n ints, size chosen at RUN time
    for (int i = 0; i < n; i++) arr[i] = i * i;
    cout << arr[3] << "\\n";       // 9
    delete[] arr;                 // note the []
}` },

    { t: 'h2', text: 'Three ways to get it wrong' },
    { t: 'p', html: 'Press play on each. The red marks are the bug.' },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Leak', heapIds: ['b1', 'b2'],
      code: `int* p = new int(1);
p = new int(2);   // oops
// p goes out of scope...`,
      steps: [
        { line: 1, stack: { p: { type: 'int*', ref: 'h:b1' } }, heap: { b1: { val: 1 } }, note: '`p` points to block 1.' },
        { line: 2, stack: { p: { ref: 'h:b2' } }, heap: { b2: { val: 2 }, b1: { leak: true } }, note: 'We re-aimed `p` to a new block **without deleting the first**. Nothing points to block 1 anymore, but it is still reserved. That is a **memory leak**.' },
        { line: 3, stack: { p: null }, heap: { b2: { leak: true } }, note: 'Scope ends, `p` disappears, and block 2 leaks too.' },
      ] } },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Dangling pointer and double delete', heapIds: ['b1'],
      code: `int* p = new int(7);
int* q = p;        // two pointers, one block
delete p;
*q = 8;            // ✗ use after free
delete q;          // ✗ double free`,
      steps: [
        { line: 1, stack: { p: { type: 'int*', ref: 'h:b1' } }, heap: { b1: { val: 7 } }, note: 'One block, one pointer.' },
        { line: 2, stack: { q: { type: 'int*', ref: 'h:b1' } }, note: 'Copying a pointer copies the **address**, not the data. Now two pointers share one block, and neither knows about the other.' },
        { line: 3, heap: { b1: { freed: true } }, note: '`delete p` frees the block. But `q` still holds the same address. It is now **dangling**.' },
        { line: 4, note: '`*q = 8` writes into memory we no longer own. It may seem to work, corrupt something unrelated, or crash: **undefined behavior**.' },
        { line: 5, note: '`delete q` frees the same block a second time (**double free**). The allocator’s bookkeeping breaks. Often a crash, sometimes an exploitable security hole.' },
      ] } },

    { t: 'h2', text: 'The checklist' },
    { t: 'table', head: ['Rule', 'Why'], rows: [
      ['Every `new` has exactly one matching `delete`', 'no leaks, no double frees'],
      ['`new[]` pairs with `delete[]`', 'mixed forms are undefined behavior'],
      ['Set a pointer to `nullptr` after `delete`', 'deleting `nullptr` is harmless, and use-after-free becomes a clean crash'],
      ['Decide who **owns** each allocation', 'exactly one owner is responsible for deleting it'],
      ['Early `return`, `throw` or `break` between `new` and `delete`', 'the `delete` is skipped, so you leak'],
    ] },
    { t: 'callout', kind: 'warn', html: 'That last row is the real problem: with exceptions or multiple returns, a manual `delete` is easy to skip. This is why modern C++ avoids bare `new`. The next lessons show how a **local object that deletes for you** removes the whole class of bug.' },

    { t: 'callout', kind: 'tip', html: 'In day-to-day code you should almost never write `new` or `delete`. Use `vector` for arrays, `string` for text, and smart pointers (next lesson) for single objects. Learn the raw form to understand what they do for you, and for reading older code.' },

    { t: 'quiz', q: 'Which of these is a memory leak?', opts: ['`int x = 5;` in a function', '`int* p = new int(5);` then the function returns without delete', '`delete p; p = nullptr;`', '`vector<int> v;`'], ans: 1,
      why: 'The heap block is never released, and the only pointer to it dies with the function. `x` and `v` clean up after themselves.' },
    { t: 'quiz', q: 'What is the correct way to free `int* a = new int[10];`?', opts: ['`delete a;`', '`delete[] a;`', '`free(a);`', '`a = nullptr;`'], ans: 1,
      why: 'Memory from `new[]` must be released with `delete[]`. Using plain `delete` is undefined behavior, and merely nulling the pointer would leak.' },

    { t: 'recap', items: [
      'Allocate and free single objects and arrays with the right pair: `new`/`delete`, `new[]`/`delete[]`.',
      'Recognize the three classic bugs: leak, dangling pointer, double free.',
      'Explain why manual cleanup breaks down, which motivates smart pointers and RAII.',
    ] },
  ],
});
