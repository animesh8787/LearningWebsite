registerLesson('what-is-a-program', {
  title: 'What is a <em>program,</em> really?',
  lead: 'Before any syntax: what is the thing you are about to write, and how does text on a screen become something that runs?',
  blocks: [
    { t: 'h2', text: 'A program is a recipe for a very literal cook' },
    { t: 'levels',
      eli5: ['A program is a recipe. The computer is a cook who follows it exactly, one step at a time, and never uses common sense.',
             'If the recipe says “add 1000 spoons of salt”, the cook does it. Your job is to write steps so clear that even a cook with zero imagination gets it right.'],
      plain: ['A program is a list of instructions the computer’s processor (CPU) carries out in order. Each instruction is tiny: add two numbers, copy a value, jump to another instruction if something is zero.',
              'Writing code means describing what you want in a language that is comfortable for humans (C++), then letting a tool called a [[compiler]] translate it into the tiny steps the CPU understands.'],
      tech: ['A CPU executes machine instructions from an instruction set architecture (x86-64, ARM64). A program is a sequence of such instructions plus data, laid out in an executable file that the OS loader maps into a process’s virtual address space.',
             'C++ is an ahead-of-time compiled language: the toolchain turns source into native machine code once, so there is no interpreter or virtual machine at run time. That is the main reason it is fast and why you get direct control over [[memory]].'] },

    { t: 'h2', text: 'How your text becomes a running program' },
    { t: 'p', html: 'You never hand your `.cpp` file to the CPU. It passes through a **pipeline** of tools. Click each stage, or press play.' },
    { t: 'viz', kind: 'pipeline', cfg: {} },
    { t: 'p', html: 'On most systems one command does all of it: `g++ hello.cpp -o hello`. The pieces matter because **different mistakes are caught at different stages**:' },
    { t: 'table', head: ['Stage', 'Mistake it catches', 'Looks like'], rows: [
      ['Preprocessor', 'a header file that does not exist', '`fatal error: foo.h: No such file`'],
      ['Compiler', 'typos, wrong types, missing semicolons', '`error: expected \';\' before ...`'],
      ['Linker', 'you declared a function but never defined it', '`undefined reference to ...`'],
      ['Running', 'logic mistakes, crashes, wrong answers', 'the program starts, then misbehaves'],
    ] },
    { t: 'callout', kind: 'tip', html: 'When you see an error, ask “which stage said that?” **Compile errors** mean your code is not valid C++. **Runtime errors** mean it was valid, and still did something bad.' },

    { t: 'h2', text: 'Compiled vs interpreted' },
    { t: 'table', head: ['', 'Compiled (C++)', 'Interpreted (Python)'], rows: [
      ['When is it translated?', 'once, before you run it', 'line by line, while it runs'],
      ['Speed', 'very fast', 'slower (often 10 to 100×)'],
      ['Mistakes found', 'many before the first run', 'many only when that line runs'],
      ['Control over memory', 'full, and so full responsibility', 'handled for you'],
    ] },
    { t: 'p', html: 'That last row is the deal you are making with C++: **power and speed in exchange for responsibility.** This course teaches you to carry that responsibility without fear.' },

    { t: 'quiz', q: 'You wrote `int x = "hello";` and the build failed before anything ran. Which stage most likely reported it?', opts: ['The linker', 'The compiler', 'The operating system at run time', 'The preprocessor'], ans: 1,
      why: 'Putting text into an `int` is a **type error**. The compiler checks types while translating, so it refuses to produce a program at all.' },
    { t: 'quiz', q: 'Why is C++ usually faster than an interpreted language?', opts: ['It has fewer features', 'It is translated to machine code ahead of time, so nothing translates while running', 'It only runs on newer computers', 'Its programs are shorter'], ans: 1,
      why: 'The expensive translation work happens **once** at build time. At run time the CPU executes native instructions directly.' },

    { t: 'recap', items: [
      'Describe a program as an exact list of tiny instructions for the CPU.',
      'Name the five stages from source file to running program, and what each does.',
      'Tell a compile error, a link error and a run-time error apart.',
      'Explain the compiled-vs-interpreted trade-off in one sentence.',
    ] },
  ],
});
