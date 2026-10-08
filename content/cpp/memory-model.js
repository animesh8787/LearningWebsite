registerLesson('memory-model', {
  title: 'The <em>memory</em> model: stack and heap',
  lead: 'Most C++ bugs (crashes, leaks, garbage values) come from not knowing where data lives. This lesson maps it out.',
  blocks: [
    { t: 'h2', text: 'One long street of numbered houses' },
    { t: 'levels',
      eli5: ['Memory is a very long street. Every house has a number (its **address**) and can store one small thing. When your program needs space, it rents some houses.',
             'There are two rental offices. The **stack** office is quick and automatic: you walk in, get a spot, and the moment you leave the room your spot is cleared. The **heap** office is slower: you ask for space, and you must remember to hand it back yourself.'],
      plain: ['Your running program gets a big block of [[memory]] split into regions. Two matter most: the [[stack]], where every function’s local variables live and vanish automatically, and the [[heap]], where you request memory by hand and keep it as long as you like.',
              'Every byte has an [[address]]. Printing `&x` shows where `x` lives.'],
      tech: ['A process’s virtual address space is typically laid out as: **text** (machine code, read-only), **rodata/data/bss** (string literals and globals), the **heap** (grows upward from `brk`/mmap regions, managed by `malloc`/`operator new`), and the **stack** (grows downward, one frame per call). Stack allocation is a pointer bump; heap allocation involves a general-purpose allocator with bookkeeping, fragmentation and locking costs, which is why it is often 10 to 100× slower.'] },

    { t: 'h2', text: 'The map' },
    { t: 'table', head: ['Region', 'Holds', 'Who manages it', 'Lifetime'], rows: [
      ['Code (text)', 'your compiled instructions', 'the OS', 'whole run'],
      ['Globals / statics', 'global variables, string literals', 'the compiler', 'whole run'],
      ['**Stack**', 'locals, parameters, return addresses', '**automatic**', 'until the function / block ends'],
      ['**Heap**', 'anything you `new` (and what containers allocate internally)', '**you** (or a smart pointer)', 'until released'],
    ] },

    { t: 'h2', text: 'Stack vs heap, side by side' },
    { t: 'p', html: 'Here `a` is an ordinary local, while `p` is a local that **points to** a number placed on the heap. Step through and watch where each thing goes.' },
    { t: 'viz', kind: 'heapview', cfg: { title: 'Two kinds of storage', heapIds: ['b1'],
      code: `int a = 5;
int* p = new int(42);
*p = 99;
delete p;
// end of scope`,
      steps: [
        { line: 1, stack: { a: { type: 'int', val: 5 } }, note: '`a` is a plain local. It lives on the **stack**, with no work from you.' },
        { line: 2, stack: { p: { type: 'int*', ref: 'h:b1' } }, heap: { b1: { val: 42, size: 4 } }, note: '`new int(42)` asks the heap for 4 bytes and stores 42 there. The **address** comes back and is stored in `p`. `p` itself is on the stack (it is just a number: the address). The arrow shows what it points to.' },
        { line: 3, heap: { b1: { val: 99 } }, note: '`*p = 99` means “follow the arrow and change what is there”.' },
        { line: 4, heap: { b1: { freed: true } }, note: '`delete p` hands the memory back. Notice `p` still holds the old address: it now points to freed memory, a **dangling pointer**. Never use it again.' },
        { line: 5, stack: { a: null, p: null }, note: 'At the end of the scope the stack variables vanish by themselves. The heap block (already freed) is gone too. Had we forgotten `delete`, the 4 bytes would stay **leaked** forever.' },
      ] } },

    { t: 'h2', text: 'Why have both?' },
    { t: 'ul', items: [
      '**Stack is fast and tidy**, but small (a few megabytes) and tied to scope. A function’s locals are gone after it returns.',
      '**Heap is large and flexible.** Use it when data must **outlive** the function that created it, or when its size is only known at run time.',
      'Most of the time you will never call `new` yourself: containers like `vector` and `string` allocate on the heap internally, and free it automatically.',
    ] },
    { t: 'code', file: 'addresses.cpp', code: `#include <iostream>
using namespace std;

int main() {
    int a = 1, b = 2;
    int* h = new int(3);

    cout << "a at " << &a << "\\n";    // stack addresses are close together
    cout << "b at " << &b << "\\n";
    cout << "h at " << &h << "  -> points to " << h << "\\n";  // heap address looks very different
    delete h;
}` },

    { t: 'h2', text: 'Stack overflow' },
    { t: 'p', html: 'The stack is small. Recursing too deep, or declaring a huge local array like `int big[10000000];`, exhausts it and the program crashes with a **stack overflow**. Large data belongs on the heap, which in practice means `vector`.' },
    { t: 'callout', kind: 'interview', html: 'Typical question: “Where does a `vector<int>` live?” The vector **object** (three small fields) is on the stack, but its **elements** are on the heap. That is why returning a vector from a function is safe and cheap: the heap data is simply handed over.' },

    { t: 'quiz', q: 'Which statement about a local variable `int x = 5;` inside a function is true?', opts: ['It lives on the heap until you delete it', 'It lives on the stack and is destroyed when the function returns', 'It lives forever', 'It is stored in the code region'], ans: 1,
      why: 'Locals are on the stack. Their lifetime is tied to the enclosing scope, so they vanish automatically.' },
    { t: 'quiz', q: 'You call `int* p = new int(7);` and then the function ends without `delete`. What happens to the 4 bytes?', opts: ['They are freed automatically', 'They stay allocated: a memory leak', 'The program crashes immediately', 'They move to the stack'], ans: 1,
      why: '`p` (on the stack) disappears, but the heap block does not. Nothing can reach it anymore, yet it is still reserved: a leak.' },

    { t: 'recap', items: [
      'Name the four regions of memory and what lives in each.',
      'Explain why locals vanish at scope end while heap data stays.',
      'Describe what a pointer actually is: an address stored in a variable.',
      'Know what a leak and a dangling pointer are, and why `vector` hides all of this.',
    ] },
  ],
});
