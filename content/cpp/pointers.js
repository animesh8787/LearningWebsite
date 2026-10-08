registerLesson('pointers', {
  title: '<em>Pointers:</em> variables that hold addresses',
  lead: 'A pointer is simply a box whose contents is the address of another box. Once that sentence feels obvious, the rest of pointers is just notation.',
  blocks: [
    { t: 'h2', text: 'A note with directions' },
    { t: 'levels',
      eli5: ['A variable is a box. A pointer is a **sticky note** with the *location* of a box written on it. The note is not the box, but if you follow the directions you can find the box and look inside or change it.'],
      plain: ['Every variable has an [[address]]. The `&` operator gives it: `&x`. A pointer variable stores such an address. The `*` operator follows it: `*p` means “the thing `p` points to”. A pointer has a **type** (`int*`) so the compiler knows how to read what is at the other end.'],
      tech: ['A pointer is an object whose value is a memory address (typically 8 bytes on 64-bit systems, regardless of pointee type). `&` is the address-of operator; unary `*` is dereference and yields an lvalue. `nullptr` is the null pointer constant; dereferencing it is undefined behavior (usually a segmentation fault). Pointers to different types are different types; converting between them is mostly an error without a cast.'] },

    { t: 'h2', text: 'The two symbols' },
    { t: 'table', head: ['Symbol', 'Read it as', 'Example', 'Meaning'], rows: [
      ['`&x`', '“address of x”', '`int* p = &x;`', 'store x’s address in p'],
      ['`int*`', '“pointer to int”', '`int* p;`', 'a box that holds the address of an int'],
      ['`*p`', '“what p points to”', '`int y = *p;`', 'follow the arrow, read the value'],
      ['`*p = 5`', '“set what p points to”', '`*p = 5;`', 'follow the arrow, write the value'],
    ] },
    { t: 'p', html: 'The `*` does two jobs depending on context: in a **declaration** (`int* p`) it means “is a pointer”; in an **expression** (`*p`) it means “follow it”.' },

    { t: 'viz', kind: 'heapview', cfg: { title: 'Pointers to stack variables', heapIds: [],
      code: `int x = 10;
int y = 20;
int* p = &x;
*p = 11;
p = &y;
*p = 21;`,
      steps: [
        { line: 1, stack: { x: { type: 'int', val: 10 } }, note: 'An ordinary box.' },
        { line: 2, stack: { y: { type: 'int', val: 20 } }, note: 'Another box.' },
        { line: 3, stack: { p: { type: 'int*', ref: 's:x' } }, note: '`p` holds the **address of x**. The arrow is that address, drawn.' },
        { line: 4, stack: { x: { val: 11 } }, note: '`*p = 11`: follow the arrow to `x` and write 11 there. We changed `x` without ever naming it.' },
        { line: 5, stack: { p: { ref: 's:y' } }, note: '`p = &y` re-aims the pointer. The note now has new directions; `x` is untouched.' },
        { line: 6, stack: { y: { val: 21 } }, note: '`*p = 21` now changes `y`.' },
      ] } },

    { t: 'h2', text: 'nullptr: a note with no directions' },
    { t: 'code', file: 'null.cpp', hl: [4, 6], code: `#include <iostream>
using namespace std;
int main() {
    int* p = nullptr;          // points to nothing, on purpose
    if (p != nullptr) {
        cout << *p;            // safe: only runs if p is valid
    } else {
        cout << "no target yet\\n";
    }
    // cout << *p;             // ✗ crash: dereferencing nullptr
}` },
    { t: 'callout', kind: 'warn', html: 'An **uninitialized** pointer holds random garbage, which is worse than null. It looks valid but points somewhere arbitrary. Always write `int* p = nullptr;` or give it a real target.' },

    { t: 'h2', text: 'Pointers and arrays' },
    { t: 'p', html: 'An array’s name is a pointer to its first slot. Adding 1 to a pointer moves it by **one element** (not one byte), so the compiler scales by the type’s size. That is exactly how `a[i]` is defined: `*(a + i)`.' },
    { t: 'viz', kind: 'array', cfg: { title: 'Pointer arithmetic', arr: [10, 20, 30, 40], base: 0x1000, size: 4,
      code: `int a[4] = {10, 20, 30, 40};
int* p = a;       // points at a[0]
p++;              // moves 1 element
*p = 99;
p += 2;`,
      steps: [
        { line: 1, note: 'Four ints in a row, 4 bytes apart.' },
        { line: 2, ptr: { p: 0 }, hl: [0], note: '`p` holds the address `0x1000`, the address of `a[0]`.' },
        { line: 3, ptr: { p: 1 }, hl: [1], note: '`p++` adds **4 bytes** (one `int`): the address becomes `0x1004`, which is `a[1]`.' },
        { line: 4, set: { 1: 99 }, ptr: { p: 1 }, hl: [1], note: '`*p = 99` writes into `a[1]`.' },
        { line: 5, ptr: { p: 3 }, hl: [3], note: '`p += 2` jumps two elements to `a[3]`, address `0x100C`. Go further and you are out of bounds.' },
      ] } },
    { t: 'code', file: 'ptr_array.cpp', code: `#include <iostream>
using namespace std;
int main() {
    int a[5] = {1, 2, 3, 4, 5};
    int* end = a + 5;                        // one past the last element
    for (int* p = a; p != end; ++p)          // walk with a pointer
        cout << *p << " ";
    cout << "\\n";
    cout << a[2] << " " << *(a + 2) << " " << 2[a] << "\\n";   // all identical: 3 3 3
}` },
    { t: 'callout', kind: 'tip', html: 'This is the origin of STL **iterators**: `begin()` and `end()` behave like “pointer to first” and “pointer to one past the last”. You are learning the idea behind every container.' },

    { t: 'h2', text: 'Pointer vs reference' },
    { t: 'table', head: ['', 'Reference `int&`', 'Pointer `int*`'], rows: [
      ['Can be null', 'no', 'yes (`nullptr`)'],
      ['Can be re-aimed later', 'no, bound for life', 'yes'],
      ['Must be initialized', 'yes', 'should be'],
      ['Syntax to use', 'just the name', 'need `*p`'],
      ['Reach for it when', 'you always have a target', 'target may be absent, or you must re-aim'],
    ] },

    { t: 'h2', text: 'const and pointers: read right to left' },
    { t: 'code', file: 'const_ptr.cpp', run: false, code: `int x = 1, y = 2;

const int* a = &x;   // pointer to const int: can't change *a, CAN re-aim a
int* const b = &x;   // const pointer to int: CAN change *b, can't re-aim b
const int* const c = &x;   // neither

// *a = 5;   // error
// b = &y;   // error` },

    { t: 'quiz', q: 'After `int x = 3; int* p = &x; *p = 8;` what is `x`?', opts: ['3', '8', 'the address of x', 'undefined'], ans: 1,
      why: '`p` points to `x`, and `*p = 8` writes through the pointer, so `x` becomes 8.' },
    { t: 'quiz', q: 'If `int* p` points at `a[0]` of an int array, what does `p + 3` point to?', opts: ['a[0] plus 3 bytes', 'a[3]', 'a[4]', 'it is a compile error'], ans: 1,
      why: 'Pointer arithmetic is in **elements**: `p + 3` is the address of `a[3]` (12 bytes further for `int`).' },

    { t: 'recap', items: [
      'Say what `&`, `*` and `int*` mean, and read them in either context.',
      'Draw a pointer as an arrow between boxes and trace writes through it.',
      'Use `nullptr` and check before dereferencing.',
      'Explain pointer arithmetic, and how it relates to `a[i]` and iterators.',
    ] },
  ],
});
