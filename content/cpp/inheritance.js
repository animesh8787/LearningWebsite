registerLesson('inheritance', {
  title: 'Inheritance and <em>polymorphism</em>',
  lead: 'Some things are special cases of other things. Inheritance lets one class reuse another, and polymorphism lets one line of code do the right thing for many different types.',
  blocks: [
    { t: 'h2', text: 'Is-a relationships' },
    { t: 'levels',
      eli5: ['A dog is an animal. A cat is an animal. Every animal can “make a sound”, but a dog says “woof” and a cat says “meow”. If you hold a leash labelled “animal” and say “speak!”, the right sound comes out, depending on what is really at the other end.'],
      plain: ['`class Dog : public Animal` means “a Dog **is an** Animal”: it gets everything Animal has, and can add or change things. **Polymorphism** means calling a method through a base-class pointer or reference and having the **actual object’s** version run. It needs the method marked `virtual`.'],
      tech: ['A class with `virtual` functions has a hidden **vptr** to a per-class **vtable**: an array of function pointers. A virtual call loads the vptr from the object, indexes the vtable, and calls through it (dynamic dispatch). Without `virtual`, the call is bound at compile time to the **static type**. Polymorphic base classes need a `virtual` destructor so deleting through a base pointer destroys the full object.'] },

    { t: 'code', file: 'animals.cpp', hl: [6, 12, 17], code: `#include <iostream>
using namespace std;

class Animal {
public:
    virtual void speak() const { cout << "...\\n"; }     // virtual: can be overridden
    virtual ~Animal() = default;                       // virtual destructor!
};

class Dog : public Animal {
public:
    void speak() const override { cout << "Woof\\n"; }   // override: compiler checks it matches
};

class Cat : public Animal {
public:
    void speak() const override { cout << "Meow\\n"; }
};

void talk(const Animal& a) { a.speak(); }              // takes ANY animal

int main() {
    Dog d; Cat c; Animal generic;
    talk(d);         // Woof
    talk(c);         // Meow
    talk(generic);   // ...
}` },
    { t: 'p', html: '`talk` only knows about `Animal`. Yet `talk(d)` prints “Woof”, because the call **looks at the real object at run time**. That is dynamic dispatch.' },

    { t: 'h2', text: 'How the right function gets picked' },
    { t: 'viz', kind: 'memory', cfg: { title: 'Virtual dispatch',
      code: `Animal* a = new Dog();
a->speak();
delete a;`,
      steps: [
        { line: 1, set: { a: ['Animal*', '→ Dog object'] }, note: 'The pointer’s **static type** is `Animal*`, but the object it points to is really a `Dog`. Inside that object is a hidden pointer, the **vptr**, aimed at Dog’s vtable.' },
        { line: 2, out: 'Woof', note: 'The compiler sees `speak` is `virtual`, so it does not hardwire a call. At run time it follows the vptr to Dog’s vtable and calls **Dog::speak**.' },
        { line: 3, del: ['a'], out: '~Dog() then ~Animal()', note: '`delete a` runs the right destructors only because `~Animal` is `virtual`. Without it, only `~Animal` would run and the Dog part would leak.' },
      ] } },
    { t: 'table', head: ['', 'Without `virtual`', 'With `virtual`'], rows: [
      ['Which function runs?', 'decided by the **pointer’s type**, at compile time', 'decided by the **object’s real type**, at run time'],
      ['Cost', 'free', 'one extra pointer lookup per call, plus a hidden pointer per object'],
      ['Needed for', 'plain reuse', 'treating different types uniformly'],
    ] },

    { t: 'h2', text: 'Reusing the parent, and abstract classes' },
    { t: 'code', file: 'shapes.cpp', code: `#include <iostream>
#include <memory>
#include <vector>
using namespace std;

class Shape {
public:
    virtual double area() const = 0;        // = 0 : pure virtual. No body. Makes Shape ABSTRACT.
    virtual ~Shape() = default;
};

class Rect : public Shape {
    double w, h;
public:
    Rect(double w, double h) : w(w), h(h) {}
    double area() const override { return w * h; }
};

class Circle : public Shape {
    double r;
public:
    Circle(double r) : r(r) {}
    double area() const override { return 3.14159 * r * r; }
};

int main() {
    vector<unique_ptr<Shape>> shapes;       // a list of DIFFERENT shapes, same interface
    shapes.push_back(make_unique<Rect>(3, 4));
    shapes.push_back(make_unique<Circle>(1));
    double total = 0;
    for (const auto& s : shapes) total += s->area();   // right area() each time
    cout << total << "\\n";                  // 15.1416
    // Shape s;                             // ✗ cannot create an abstract class
}` },
    { t: 'callout', kind: 'warn', html: '**Object slicing:** `Animal a = dog;` (by value) copies only the `Animal` part of the dog and throws the rest away, so `a.speak()` no longer says “Woof”. Polymorphism works through **pointers and references**, never by value.' },
    { t: 'callout', kind: 'interview', html: 'Checklist for a base class meant to be inherited: **virtual destructor**, `virtual` on overridable methods, `override` on every override, pass/store by pointer or reference. “Prefer composition over inheritance” is the common design advice: use inheritance for true is-a relationships only.' },

    { t: 'quiz', q: 'You delete a `Dog` through an `Animal*`, and `~Animal` is NOT virtual. What happens?', opts: ['Both destructors run', 'Only `~Animal` runs: undefined behavior and likely a leak', 'Compile error', 'Nothing is deleted'], ans: 1,
      why: 'Deleting a derived object through a base pointer whose destructor is non-virtual is undefined behavior. Always make destructors of polymorphic bases `virtual`.' },
    { t: 'quiz', q: 'What does `override` do?', opts: ['Makes a function faster', 'Asks the compiler to verify this really overrides a base virtual function', 'Deletes the base function', 'Makes it private'], ans: 1,
      why: 'If you mistype the signature, `override` turns a silent “new unrelated function” bug into a compile error.' },

    { t: 'recap', items: [
      'Express is-a relationships with `class Derived : public Base`.',
      'Use `virtual`, `override` and pure virtual functions for polymorphic interfaces.',
      'Explain the vptr / vtable mechanism in two sentences.',
      'Avoid slicing and always give polymorphic bases a virtual destructor.',
    ] },
  ],
});
