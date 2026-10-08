registerLesson('classes', {
  title: 'Classes, constructors and <em>lifetimes</em>',
  lead: 'A class is a struct with rules: it protects its data and guarantees that every object starts in a valid state and cleans up when it dies.',
  blocks: [
    { t: 'h2', text: 'Why a class and not just a struct?' },
    { t: 'levels',
      eli5: ['A bank account is not just a number. You cannot reach in and type any balance you like: you must go through **deposit** and **withdraw**, and those check the rules. A class is a thing with a locked front door and a few well-behaved buttons.'],
      plain: ['A **class** bundles data (members) with the functions that work on it (**methods**). Members marked `private` can only be touched from inside the class, so outside code cannot break the rules. A **constructor** runs when the object is created to set it up properly; a **destructor** runs when it dies to tidy up.'],
      tech: ['`class` differs from `struct` only in default access (private vs public). The class **invariant** is a property every public method preserves; encapsulation lets you enforce it in one place. Construction initializes members in **declaration order** via the member-initializer list, before the constructor body runs. Destructors run in reverse order of construction, deterministically, at scope exit, which is the foundation of RAII.'] },

    { t: 'code', file: 'account.cpp', hl: [5, 6, 8], code: `#include <iostream>
using namespace std;

class Account {
private:                                   // hidden from outside
    double balance;
public:
    Account(double start) : balance(start) {}      // constructor with initializer list

    void deposit(double amt) {
        if (amt > 0) balance += amt;               // rule: ignore nonsense
    }
    bool withdraw(double amt) {
        if (amt <= 0 || amt > balance) return false;   // rule: no overdraft
        balance -= amt;
        return true;
    }
    double get() const { return balance; }         // const: promises not to modify
};

int main() {
    Account a(100);
    a.deposit(50);
    cout << a.withdraw(500) << "\\n";   // 0 (refused)
    cout << a.get() << "\\n";           // 150
    // a.balance = 1e9;                // ✗ error: balance is private
}` },
    { t: 'ul', items: [
      '`private:` members are invisible outside. `public:` ones are the interface.',
      'The constructor has the **same name as the class** and no return type. `: balance(start)` is the **initializer list**: it builds the member directly, which is faster and is the only way for `const` and reference members.',
      'Mark methods that do not change the object `const`. Then they can be called on `const` objects too.',
    ] },

    { t: 'h2', text: 'The life of an object' },
    { t: 'p', html: 'Objects are born (constructor) and die (destructor) at predictable moments. That predictability is one of C++’s superpowers. Step through and watch the console:' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Constructor and destructor order',
      code: `struct Noisy {
    string name;
    Noisy(string n) : name(n) { cout << "+" << name << "\\n"; }
    ~Noisy()                  { cout << "-" << name << "\\n"; }
};

int main() {
    Noisy a("A");
    {
        Noisy b("B");
        Noisy c("C");
    }
    Noisy d("D");
}`,
      steps: [
        { line: 7, note: 'Program starts in `main`.' },
        { line: 8, set: { a: ['Noisy', 'A'] }, out: '+A', note: 'Constructing `a` runs the constructor: it prints `+A`.' },
        { line: 10, set: { b: ['Noisy', 'B'] }, out: '+B', note: 'Entering the inner block. `b` is born.' },
        { line: 11, set: { c: ['Noisy', 'C'] }, out: '+C', note: '`c` is born.' },
        { line: 12, del: ['b', 'c'], out: '-C\n-B', note: 'The block ends. Locals are destroyed in **reverse order of creation**: `c` first, then `b`. Destructors run automatically.' },
        { line: 13, set: { d: ['Noisy', 'D'] }, out: '+D', note: '`d` is born in the outer scope.' },
        { line: 14, del: ['a', 'd'], out: '-D\n-A', note: '`main` ends. Again reverse order: `d`, then `a`. Last in, first out, like a stack of plates.' },
      ] } },
    { t: 'callout', kind: 'interview', html: '“What order do destructors run in?” **Reverse of construction.** For a class, members are destroyed in reverse declaration order, after the destructor body. This ordering is what makes resources (locks, files, memory) safe to nest.' },

    { t: 'h2', text: 'Copying objects' },
    { t: 'p', html: 'If you do nothing, C++ gives every class a **copy constructor** and **copy assignment** that copy each member. That is perfect for ints and strings. It is dangerous when a member is a raw pointer: both copies end up pointing at the same heap block and both try to delete it. We solve that with **RAII** in two lessons.' },
    { t: 'code', file: 'this_and_static.cpp', code: `#include <iostream>
using namespace std;

class Counter {
    static int total;            // shared by ALL objects of the class
    int mine = 0;
public:
    Counter& add() { mine++; total++; return *this; }   // *this = the object itself
    int get() const { return mine; }
    static int all() { return total; }
};
int Counter::total = 0;          // a static member needs a definition

int main() {
    Counter a, b;
    a.add().add();               // chaining works because add() returns *this
    b.add();
    cout << a.get() << " " << b.get() << " " << Counter::all() << "\\n";   // 2 1 3
}` },

    { t: 'quiz', q: 'In which order are these destroyed? `{ Foo a; Foo b; Foo c; }`', opts: ['a, b, c', 'c, b, a', 'all at once', 'it varies'], ans: 1,
      why: 'Locals are destroyed in the reverse order of their construction: c, b, a.' },
    { t: 'quiz', q: 'Why make `balance` private in the `Account` class?', opts: ['To save memory', 'So only the class’s own methods can change it, and they enforce the rules', 'Because doubles must be private', 'It makes the program faster'], ans: 1,
      why: 'Encapsulation: all changes go through `deposit` / `withdraw`, which keep the account valid (for example, no overdraft).' },

    { t: 'recap', items: [
      'Write a class with private data, public methods, and a constructor with an initializer list.',
      'Use `const` methods and explain why.',
      'Predict the order constructors and destructors run in.',
      'Explain why default copying is a problem for classes that own raw pointers.',
    ] },
  ],
});
