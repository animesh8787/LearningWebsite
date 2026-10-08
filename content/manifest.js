/* Single source of truth for navigation, prev/next, search and progress.
   ready:true => content/<part>/<id>.js exists. */
(function () {
  const L = (id, title, min, ready) => ({ id, title, min, ready: !!ready });

  const COURSE = {
    parts: [
      {
        id: 'cpp', name: 'C++ from zero', blurb: 'No experience assumed. Learn what the machine is actually doing.',
        modules: [
          { id: 'start', title: 'Getting started', blurb: 'What a program is, how code becomes a running thing, and your first line.', lessons: [
            L('what-is-a-program', 'What is a program?', 8, true),
            L('hello-world', 'Hello, world — line by line', 10, true),
          ] },
          { id: 'basics', title: 'Variables & types', blurb: 'Boxes in memory, the types that size them, and how numbers behave.', lessons: [
            L('variables', 'Variables: boxes in memory', 14, true),
            L('types', 'Types, sizes & overflow', 14, true),
            L('input-output', 'Input & output', 9, true),
            L('operators', 'Operators & expressions', 12, true),
          ] },
          { id: 'flow', title: 'Control flow', blurb: 'Make decisions and repeat work.', lessons: [
            L('conditions', 'if, else & switch', 10, true),
            L('loops', 'Loops', 14, true),
          ] },
          { id: 'functions', title: 'Functions', blurb: 'Reusable code, passing data in, and the call stack.', lessons: [
            L('functions', 'Functions', 12, true),
            L('references', 'Values vs references', 14, true),
            L('recursion', 'Recursion & the call stack', 16, true),
          ] },
          { id: 'arrays', title: 'Arrays & strings', blurb: 'Many values in a row, and text as numbers.', lessons: [
            L('arrays', 'Arrays', 12, true),
            L('strings', 'Strings & characters', 12, true),
            L('grids', '2D arrays & grids', 10, true),
          ] },
          { id: 'pointers', title: 'Pointers & memory', blurb: 'Stack vs heap, addresses, and ownership.', lessons: [
            L('memory-model', 'The memory model', 14, true),
            L('pointers', 'Pointers', 16, true),
            L('heap', 'new, delete & leaks', 12, true),
            L('smart-pointers', 'Smart pointers', 12, true),
          ] },
          { id: 'oop', title: 'Structs & classes', blurb: 'Bundle data and behavior into your own types.', lessons: [
            L('structs', 'Structs', 10, true),
            L('classes', 'Classes & constructors', 16, true),
            L('inheritance', 'Inheritance & polymorphism', 16, true),
            L('raii', 'RAII & the rule of 3/5/0', 12, true),
          ] },
          { id: 'modern', title: 'Modern & generic C++', blurb: 'Templates, lambdas, moves, bits, and Big-O.', lessons: [
            L('templates', 'Templates', 14, true),
            L('lambdas', 'Lambdas', 12, true),
            L('move-semantics', 'Move semantics', 12, true),
            L('bits', 'Bits & bit tricks', 12, true),
            L('big-o', 'Big-O in plain English', 14, true),
            L('why-stl', 'Bridge: why STL exists', 8, true),
          ] },
        ],
      },
      {
        id: 'stl', name: 'The STL', blurb: 'The standard toolbox, understood from the inside out.',
        modules: [
          { id: 'stl-found', title: 'Foundations', blurb: 'pair, tuple, iterators and comparators.', lessons: [
            L('pair-tuple', 'pair & tuple', 10, true),
            L('iterators', 'Iterators', 14, true),
            L('comparators', 'Comparators & sorting rules', 10, true),
          ] },
          { id: 'stl-seq', title: 'Sequence containers', blurb: 'vector and its relatives.', lessons: [
            L('vector', 'vector', 20, true),
            L('string-deep', 'string, deeply', 12, true),
            L('array-std', 'array', 8, true),
            L('deque', 'deque', 12, true),
            L('list', 'list & forward_list', 10, true),
          ] },
          { id: 'stl-adapt', title: 'Adapters', blurb: 'stack, queue and the heap.', lessons: [
            L('stack', 'stack', 10, true),
            L('queue', 'queue', 10, true),
            L('priority-queue', 'priority_queue', 16, true),
          ] },
          { id: 'stl-ordered', title: 'Ordered containers', blurb: 'Self-balancing trees behind a simple interface.', lessons: [
            L('set', 'set', 12, true),
            L('multiset', 'multiset', 8, true),
            L('map', 'map', 14, true),
            L('multimap', 'multimap', 8, true),
          ] },
          { id: 'stl-hash', title: 'Hashed containers', blurb: 'The fastest lookups you have.', lessons: [
            L('unordered-set', 'unordered_set', 12, true),
            L('unordered-map', 'unordered_map', 14, true),
          ] },
          { id: 'stl-algo', title: 'Algorithms', blurb: 'Replace hand-written loops with tested building blocks.', lessons: [
            L('sorting', 'sort & friends', 12, true),
            L('searching', 'Binary search tools', 12, true),
            L('numeric', 'Numeric & utility algorithms', 12, true),
          ] },
          { id: 'stl-patterns', title: 'Patterns & review', blurb: 'Map problems to the right tool, fast.', lessons: [
            L('patterns', 'LeetCode patterns', 22, true),
            L('pick-container', 'Which container? (decision tree)', 8, true),
            L('mistakes', 'Common mistakes', 10, true),
            L('cheatsheet', 'Cheat sheet', 6, true),
          ] },
        ],
      },
    ],
  };

  // flatten + index
  const flat = [];
  let modNo = 0;
  COURSE.parts.forEach(part => {
    part.modules.forEach(mod => {
      modNo++; mod.no = modNo; mod.part = part.id;
      mod.lessons.forEach(l => { l.mod = mod; l.part = part; flat.push(l); });
    });
  });
  COURSE.flat = flat;
  COURSE.byId = Object.fromEntries(flat.map(l => [l.id, l]));
  COURSE.modules = COURSE.parts.flatMap(p => p.modules);
  COURSE.fileFor = l => `${window.BASE || ''}content/${l.part.id}/${l.id}.js`;
  window.COURSE = COURSE;
  window.LESSONS = {};                       // filled by content files
  window.registerLesson = (id, def) => { window.LESSONS[id] = def; };
})();
