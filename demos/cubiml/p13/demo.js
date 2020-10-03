'use strict';


let mod = null;
const mod_promise = import('./cubiml_demo.js').then(
    m => (mod = m, mod.default()));



const HTML = `
<style>
    #container {
        height: 32em;
        position: relative;
        font: medium monospace;
    }
    #container.loading {
        opacity: 85%;
    }

    #container form {
        margin: 0;
    }
    #container, #prompt, #editor {
        background: darkslategrey;
        color: white;
    }

    #loading {
        position: absolute;
        top: 15%;
        left: 12%;
    }


    #pane1, #pane2 {
        float: left;
        width: 50%;
        height: 100%;

        display: flex;
        flex-direction: column;
    }
    #editor {
        height: 100%;
        resize: none;
        margin: 0;
    }


    #container .error {
        background: darkred;
    }

    #container pre {
        white-space: pre-wrap;
        overflow-wrap: anywhere;
        margin: 0;
    }

    #output {
        overflow-y: scroll;
    }
    #input-line {
        display: flex;
    }
    #prompt {
        flex-grow: 1;
        border: 0;
    }
    #space-below-prompt {
        flex-grow: 1;
    }
</style>


<div id=container class=loading>
    <div id=loading>Loading, please wait...</div>

    <div id=pane1>
        <textarea id=editor>
(* Compile time fibonacci number calculation *)
let end = \`End {};

let push0 = fun frame -> {frame | val=\`0 frame.val};
let push1 = fun frame -> {frame | val=\`1 frame.val};

(* Add frame.val + 1 *)
let increment = fun frame ->
    match frame.val with
    | \`End _ -> {frame | val=\`1 end}
    | \`0 xs -> {frame | val=\`1 xs}
    | \`1 xs -> (
        (* call push0 (increment xs) *)
        (* where push0 = fun x -> \`0 x *)
        {val=xs; stack=\`Increment {stack=\`Push0 {stack=frame.stack}}}
    );

(* Decrement frame.val, with initial bit of return value representing status
    if frame.val is zero, returns \`0 end to represent an error state
    otherwise, returns \`1 (n-1). *)
let decrement = fun frame ->
    match frame.val with
    | \`End _ -> {frame | val=\`0 end}
    | \`1 xs -> {frame | val=\`1\`0 xs}
    | \`0 xs -> (
        (* call decrement2 (decrement xs) *)
        {val=xs; stack=\`Decrement {stack=\`Decrement2 {stack=frame.stack}}}
    );
let decrement2 = fun frame ->
    match frame.val with
    | \`1 xs_dec -> {frame | val=\`1\`1 xs_dec}
    (* when val represents an error, return it unchanged *)
    | \`0 _ -> {frame | val=\`0 end}
    (* this case isn't actually reachable, but is needed for type checking *)
    | \`End _ -> {frame | val=\`0 end}
    ;

(* add frame.val + (frame.ys << 1) *)
let add_shifted = fun frame ->
    match frame.val with
    (* this case isn't actually reachable, but is needed for type checking *)
    | \`End _ -> {val=\`0 frame.ys; stack=frame.stack}
    | \`0 xs -> (
        (* call push0 (add {val=xs; y=ys}) *)
        {val=xs; stack=\`Add {y=frame.ys; stack=\`Push0 {stack=frame.stack}}}
    )
    | \`1 xs -> (
        (* call push1 (add {val=xs; y=ys}) *)
        {val=xs; stack=\`Add {y=frame.ys; stack=\`Push1 {stack=frame.stack}}}
    );

(* add frame.val + frame.y *)
let add = fun frame ->
    match frame.y with
    (* when y=0, return frame.val unchanged *)
    | \`End _ -> frame
    | \`0 ys -> add_shifted {val=frame.val; ys=ys; stack=frame.stack}
    | \`1 ys ->  (
        (* call add_shifted {val=increment frame.val; ys=ys} *)
        increment {val=frame.val; stack=\`AddShifted {ys=ys; stack=frame.stack}}
    );

(* computes an iteration of the fibonacci calculations:
    fib_sub (n, a, b) -> (n-1, a+b, a) where a=frame.val*)
let fib_sub = fun frame -> decrement {val=frame.n; stack=\`FibSub2 {a=frame.val; b=frame.b; stack=frame.stack}};

(* note that here, val is the "n" value rather than the "a" value *)
let fib_sub2 = fun frame ->
    match frame.val with
    (* this case isn't actually reachable, but is needed for type checking *)
    | \`End _ -> {val=frame.a; stack=frame.stack}
    | \`0 _ -> {val=frame.a; stack=frame.stack}
    | \`1 n -> {val=frame.a; stack=\`Add {y=frame.b; stack=\`FibSub {n=n; b=frame.a; stack=frame.stack}}};

let tick = fun state ->
    match state.stack with
    | \`Push0 frame -> push0 {frame | val=state.val}
    | \`Push1 frame -> push1 {frame | val=state.val}
    | \`Increment frame -> increment {frame | val=state.val}
    | \`Decrement frame -> decrement {frame | val=state.val}
    | \`Decrement2 frame -> decrement2 {frame | val=state.val}
    | \`AddShifted frame -> add_shifted {frame | val=state.val}
    | \`Add frame -> add {frame | val=state.val}
    | \`FibSub frame -> fib_sub {frame | val=state.val}
    | \`FibSub2 frame -> fib_sub2 {frame | val=state.val}
    (* if the computation is done, just return the state unchanged *)
    | \`Done _ -> state
    ;

let tick2 = fun state -> tick (tick state);
let tick3 = fun state -> tick2 (tick2 state);
let tick4 = fun state -> tick3 (tick3 state);
let tick5 = fun state -> tick4 (tick4 state);
let tick6 = fun state -> tick5 (tick5 state);
let tick7 = fun state -> tick6 (tick6 state);
let tick8 = fun state -> tick7 (tick7 state);
let tick9 = fun state -> tick8 (tick8 state);

let fib9 = fun n ->
    (* set up the initial state to call fib_sub *)
    tick9 {val=\`1 end; stack=\`FibSub {n=n; b=\`1 end; stack=\`Done {}}};

(* compute the 12th fibonacci number *)
let state = fib9 \`0\`0\`1\`1 end;
match state.stack with | \`Done _ -> _;
(* the 12th fibonacci number is 377 = 0b101111001 *)
match state.val with | \`1 x ->
    (match x with | \`0 x ->
    (match x with | \`0 x ->
    (match x with | \`1 x ->
    (match x with | \`1 x ->
    (match x with | \`1 x ->
    (match x with | \`1 x ->
    (match x with | \`0 x ->
    (match x with | \`1 x ->
    (match x with | \`End _ -> _)))))))))
        </textarea>
        <button id=compile-and-run type=button>Compile and run</button>
    </div>

    <div id=pane2>
        <div id=output>
        </div>

        <form id=rhs-form>
        <pre id=input-line>&gt;&gt; <input id=prompt type="text" autocomplete="off" placeholder="Enter code here or to the left" disabled></pre>
        </form>

        <div id=space-below-prompt></div>
    </div>
</div>
`;

class CubimlDemo extends HTMLElement {
  constructor() {
    // Always call super first in constructor
    super();

    // Create a shadow root
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = HTML;

    mod_promise.then(
        wasm => initializeRepl(shadow, mod.State.new(), Printer)).catch(
        e => {root.getElementById('loading').textContent = 'Failed to load demo: ' + e});

  }
}
customElements.define('cubiml-demo', CubimlDemo);


function initializeRepl(root, compiler, Printer) {
    console.log('Initializing REPL');
    const container = root.getElementById('container');
    const output = root.getElementById('output');
    const prompt = root.getElementById('prompt');
    const editor = root.getElementById('editor');

    function addOutput(line, cls) {
        const l = document.createElement('pre');
        l.textContent = line;
        if (cls) {
            l.classList.add(cls);
        }
        output.appendChild(l);
        return l;
    }

    const $ = Object.create(null);
    const history = [];
    let history_offset = -1;

    function execCode(script) {
        let compiled;
        try {
            if (!compiler.process(script)) {return [false, compiler.get_err()];}
            compiled = '(' + compiler.get_output() + ')';
        } catch (e) {
            return [false, 'Internal compiler error: ' + e.toString()];
        }

        try {
            const val = eval(compiled);
            return [true, (new Printer).print(val)];
        } catch (e) {
            return [false, 'An error occurred during evaluation in the repl: ' + e.toString()];
        }
    }

    function processCode(script) {
        const [success, res] = execCode(script);
        addOutput(res, success ? 'success' : 'error');
        // scroll output window to the bottom
        output.scrollTop = output.scrollHeight;
        return success;
    }


    function processReplInput(line) {
        line = line.trim();
        if (!line) {return;}

        history_offset = -1;
        if (history[history.length-1] !== line) {history.push(line);}
        // \u00a0 = non breaking space
        addOutput('>>\u00a0' + line, 'input');
        processCode(line);
    }

    root.getElementById('compile-and-run').addEventListener('click', e => {
        const s = editor.value.trim();
        if (!s) {return;}

        // Clear repl output
        output.textContent = '';
        compiler.reset();
        if (processCode(s)) {prompt.focus({preventScroll: true})}
    });

    // Implement repl command history
    prompt.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowDown': history_offset -= 1; break;
            case 'ArrowUp': history_offset += 1; break;
            default: return;
        }
        e.preventDefault();

        if (history_offset >= history.length) {history_offset = history.length - 1;}
        if (history_offset < 0) {history_offset = 0;}
        prompt.value = history[history.length - history_offset - 1];
    });

    // If they click in the space below the prompt, focus on the prompt to make it easier to select
    root.getElementById('space-below-prompt').addEventListener('click', e => {
        e.preventDefault();
        prompt.focus({preventScroll: true});
    });

    root.getElementById('rhs-form').addEventListener('submit', e => {
        e.preventDefault();
        const s = prompt.value.trim();
        prompt.value = '';

        if (!s) {return;}
        processReplInput(s);
    });

    container.classList.remove('loading');
    prompt.disabled = false;
    container.removeChild(root.getElementById('loading'));
    console.log('Initialized REPL');

    // Run the example code
    // processCode(editor.value.trim())
}

class Printer {
    constructor() {
        this.parts = [];
        this.seen = new WeakSet;
    }

    visit(e) {
        const type = typeof e;
        if (type === 'boolean' || type === 'bigint') {this.parts.push(e.toString()); return;}
        if (type === 'string') {this.parts.push(JSON.stringify(e)); return;}
        if (type === 'number') {
            let s = e.toString();
            if (/^-?\d+$/.test(s)) {s += '.0'}
            this.parts.push(s);
            return;
        }
        if (type === 'function') {this.parts.push('<fun>'); return;}
        if (type === 'symbol') {this.parts.push('<sym>'); return;}
        if (e === null) {this.parts.push('null'); return;}
        if (e === undefined) {this.parts.push('<undefined>'); return;}

        if (this.seen.has(e)) {this.parts.push('...'); return;}
        this.seen.add(e);

        if (e.$tag) {
            this.parts.push(e.$tag);
            if (!e.$val || typeof e.$val !== 'object') {
                this.parts.push(' ');
            }
            this.visit(e.$val);
        } else if ('$p' in e) {
            this.parts.push('ref ');
            this.visit(e.$p);
        } else {
            this.parts.push('{');
            let first = true;
            for (const [k, v] of Object.entries(e)) {
                if (!first) {this.parts.push('; ')}
                first = false;

                this.parts.push(k + '=');
                this.visit(v);
            }
            this.parts.push('}');
        }
    }

    print(e) {this.visit(e); return this.parts.join('');}
}
