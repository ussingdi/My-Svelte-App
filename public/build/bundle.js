
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=} start
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0 && stop) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const storeThemes = writable("light");

    var themeColor = {
    	subscribe: storeThemes.subscribe,
    	toggleThemeLight: () => storeThemes.update((themeColor) => "light"),
    	toggleThemeDark: () => storeThemes.update((themeColor) => "dark"),
    };

    /* src/Sidebar/LogoCone.svelte generated by Svelte v3.59.2 */
    const file$b = "src/Sidebar/LogoCone.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let img;
    	let img_class_value;
    	let img_src_value;
    	let div_class_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "img " + /*$themeColor*/ ctx[0] + " svelte-q5rllm");
    			attr_dev(img, "alt", "Logo");
    			if (!src_url_equal(img.src, img_src_value = ".//static/img/cone.svg")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$b, 5, 2, 101);
    			attr_dev(div, "class", div_class_value = "logo-bg " + /*$themeColor*/ ctx[0] + " svelte-q5rllm");
    			add_location(div, file$b, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && img_class_value !== (img_class_value = "img " + /*$themeColor*/ ctx[0] + " svelte-q5rllm")) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div_class_value !== (div_class_value = "logo-bg " + /*$themeColor*/ ctx[0] + " svelte-q5rllm")) {
    				attr_dev(div, "class", div_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LogoCone', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<LogoCone> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class LogoCone extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LogoCone",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/Sidebar/Sidebar.svelte generated by Svelte v3.59.2 */

    const { console: console_1$2 } = globals;
    const file$a = "src/Sidebar/Sidebar.svelte";

    function create_fragment$a(ctx) {
    	let div2;
    	let logocone;
    	let t0;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let img2;
    	let img2_src_value;
    	let t3;
    	let img3;
    	let img3_src_value;
    	let t4;
    	let img4;
    	let img4_src_value;
    	let t5;
    	let img5;
    	let img5_src_value;
    	let t6;
    	let img6;
    	let img6_src_value;
    	let t7;
    	let div1;
    	let input;
    	let t8;
    	let label;
    	let div2_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	logocone = new LogoCone({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			create_component(logocone.$$.fragment);
    			t0 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			img1 = element("img");
    			t2 = space();
    			img2 = element("img");
    			t3 = space();
    			img3 = element("img");
    			t4 = space();
    			img4 = element("img");
    			t5 = space();
    			img5 = element("img");
    			t6 = space();
    			img6 = element("img");
    			t7 = space();
    			div1 = element("div");
    			input = element("input");
    			t8 = space();
    			label = element("label");
    			attr_dev(img0, "class", "market svelte-luzren");
    			attr_dev(img0, "alt", "Market");
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/market.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$a, 22, 4, 537);
    			attr_dev(div0, "class", "market-bg svelte-luzren");
    			add_location(div0, file$a, 16, 2, 429);
    			attr_dev(img1, "class", "language svelte-luzren");
    			attr_dev(img1, "alt", "Language");
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/language.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$a, 26, 2, 675);
    			attr_dev(img2, "class", "security svelte-luzren");
    			attr_dev(img2, "alt", "Security");
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/security.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$a, 35, 2, 898);
    			attr_dev(img3, "class", "settings svelte-luzren");
    			attr_dev(img3, "alt", "Settings");
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/settings.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$a, 44, 2, 1121);
    			attr_dev(img4, "class", "exchange svelte-luzren");
    			attr_dev(img4, "alt", "Exchange");
    			if (!src_url_equal(img4.src, img4_src_value = ".//static/img/exchange.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$a, 53, 2, 1344);
    			attr_dev(img5, "class", "wallet svelte-luzren");
    			attr_dev(img5, "alt", "Language");
    			if (!src_url_equal(img5.src, img5_src_value = ".//static/img/wallet.svg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$a, 62, 2, 1567);
    			attr_dev(img6, "class", "dashboard svelte-luzren");
    			attr_dev(img6, "alt", "dashboard");
    			if (!src_url_equal(img6.src, img6_src_value = ".//static/img/dashboard.svg")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$a, 71, 2, 1784);
    			attr_dev(input, "type", "checkbox");
    			attr_dev(input, "name", "checkbox");
    			attr_dev(input, "id", "toggle");
    			attr_dev(input, "class", "svelte-luzren");
    			add_location(input, file$a, 80, 4, 1978);
    			attr_dev(label, "for", "toggle");
    			attr_dev(label, "class", "switch svelte-luzren");
    			add_location(label, file$a, 86, 4, 2088);
    			attr_dev(div1, "class", "switch1 svelte-luzren");
    			add_location(div1, file$a, 79, 2, 1952);
    			attr_dev(div2, "class", div2_class_value = "side-bar " + /*$themeColor*/ ctx[0] + " svelte-luzren");
    			add_location(div2, file$a, 12, 0, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			mount_component(logocone, div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div0);
    			append_dev(div0, img0);
    			append_dev(div2, t1);
    			append_dev(div2, img1);
    			append_dev(div2, t2);
    			append_dev(div2, img2);
    			append_dev(div2, t3);
    			append_dev(div2, img3);
    			append_dev(div2, t4);
    			append_dev(div2, img4);
    			append_dev(div2, t5);
    			append_dev(div2, img5);
    			append_dev(div2, t6);
    			append_dev(div2, img6);
    			append_dev(div2, t7);
    			append_dev(div2, div1);
    			append_dev(div1, input);
    			append_dev(div1, t8);
    			append_dev(div1, label);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div0, "click", /*click_handler*/ ctx[2], false, false, false, false),
    					listen_dev(img1, "click", /*click_handler_1*/ ctx[3], false, false, false, false),
    					listen_dev(img2, "click", /*click_handler_2*/ ctx[4], false, false, false, false),
    					listen_dev(img3, "click", /*click_handler_3*/ ctx[5], false, false, false, false),
    					listen_dev(img4, "click", /*click_handler_4*/ ctx[6], false, false, false, false),
    					listen_dev(img5, "click", /*click_handler_5*/ ctx[7], false, false, false, false),
    					listen_dev(img6, "click", /*click_handler_6*/ ctx[8], false, false, false, false),
    					listen_dev(input, "click", /*ThemeToggler*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$themeColor*/ 1 && div2_class_value !== (div2_class_value = "side-bar " + /*$themeColor*/ ctx[0] + " svelte-luzren")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(logocone.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(logocone.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(logocone);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Sidebar', slots, []);

    	function ThemeToggler(e) {
    		if ($themeColor === "dark") {
    			storeThemes.update(themeColor => "light");
    		} else {
    			storeThemes.update(themeColor => "dark");
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$2.warn(`<Sidebar> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log("Market Button Clicked");
    	};

    	const click_handler_1 = () => {
    		console.log("Language Button Clicked");
    	};

    	const click_handler_2 = () => {
    		console.log("Security Button Clicked");
    	};

    	const click_handler_3 = () => {
    		console.log("Settings Button Clicked");
    	};

    	const click_handler_4 = () => {
    		console.log("Exchange Button Clicked");
    	};

    	const click_handler_5 = () => {
    		console.log("Wallet Button Clicked");
    	};

    	const click_handler_6 = () => {
    		console.log("Dashboard Button Clicked");
    	};

    	$$self.$capture_state = () => ({
    		themeColor,
    		storeThemes,
    		LogoCone,
    		ThemeToggler,
    		$themeColor
    	});

    	return [
    		$themeColor,
    		ThemeToggler,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		click_handler_3,
    		click_handler_4,
    		click_handler_5,
    		click_handler_6
    	];
    }

    class Sidebar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Sidebar",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/Rightbar/Bar1.svelte generated by Svelte v3.59.2 */

    const { console: console_1$1 } = globals;
    const file$9 = "src/Rightbar/Bar1.svelte";

    function create_fragment$9(ctx) {
    	let div2;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div0;
    	let div1_class_value;
    	let t2;
    	let div6;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let img2;
    	let img2_src_value;
    	let t4;
    	let div5;
    	let img3;
    	let img3_src_value;
    	let t5;
    	let div3;
    	let t6;
    	let div3_class_value;
    	let t7;
    	let div4;
    	let t8;
    	let div4_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div0 = element("div");
    			div0.textContent = "Search Something";
    			t2 = space();
    			div6 = element("div");
    			img1 = element("img");
    			t3 = space();
    			img2 = element("img");
    			t4 = space();
    			div5 = element("div");
    			img3 = element("img");
    			t5 = space();
    			div3 = element("div");
    			t6 = text("Uvais Singdi");
    			t7 = space();
    			div4 = element("div");
    			t8 = text("uvais@Greenmusk.com");
    			attr_dev(img0, "class", "search-box svelte-1791ftd");
    			attr_dev(img0, "alt", "search-box");
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/box-1.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$9, 6, 4, 135);
    			attr_dev(div0, "class", "text svelte-1791ftd");
    			add_location(div0, file$9, 7, 4, 213);
    			attr_dev(div1, "class", div1_class_value = "search-rectangle " + /*$themeColor*/ ctx[0] + " svelte-1791ftd");
    			add_location(div1, file$9, 5, 2, 86);
    			attr_dev(div2, "class", "search svelte-1791ftd");
    			add_location(div2, file$9, 4, 0, 63);
    			attr_dev(img1, "class", "notif-img svelte-1791ftd");
    			attr_dev(img1, "alt", "Notif img");
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/notif.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$9, 12, 2, 350);
    			attr_dev(img2, "class", "message svelte-1791ftd");
    			attr_dev(img2, "alt", "message");
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/message.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$9, 21, 2, 577);
    			attr_dev(img3, "class", "user-img svelte-1791ftd");
    			attr_dev(img3, "alt", "User Image");
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/replace-image.png")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$9, 31, 4, 813);
    			attr_dev(div3, "class", div3_class_value = "user-name " + /*$themeColor*/ ctx[0] + " svelte-1791ftd");
    			add_location(div3, file$9, 37, 4, 920);
    			attr_dev(div4, "class", div4_class_value = "user-email " + /*$themeColor*/ ctx[0] + " svelte-1791ftd");
    			add_location(div4, file$9, 38, 4, 980);
    			attr_dev(div5, "class", "profile svelte-1791ftd");
    			add_location(div5, file$9, 29, 2, 737);
    			attr_dev(div6, "class", "tabs svelte-1791ftd");
    			add_location(div6, file$9, 10, 0, 270);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, div0);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div6, anchor);
    			append_dev(div6, img1);
    			append_dev(div6, t3);
    			append_dev(div6, img2);
    			append_dev(div6, t4);
    			append_dev(div6, div5);
    			append_dev(div5, img3);
    			append_dev(div5, t5);
    			append_dev(div5, div3);
    			append_dev(div3, t6);
    			append_dev(div5, t7);
    			append_dev(div5, div4);
    			append_dev(div4, t8);

    			if (!mounted) {
    				dispose = [
    					listen_dev(img1, "click", /*click_handler*/ ctx[1], false, false, false, false),
    					listen_dev(img2, "click", /*click_handler_1*/ ctx[2], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && div1_class_value !== (div1_class_value = "search-rectangle " + /*$themeColor*/ ctx[0] + " svelte-1791ftd")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div3_class_value !== (div3_class_value = "user-name " + /*$themeColor*/ ctx[0] + " svelte-1791ftd")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div4_class_value !== (div4_class_value = "user-email " + /*$themeColor*/ ctx[0] + " svelte-1791ftd")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div6);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bar1', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<Bar1> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		console.log("Notifications Button Clicked");
    	};

    	const click_handler_1 = () => {
    		console.log("Message Button Clicked");
    	};

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor, click_handler, click_handler_1];
    }

    class Bar1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bar1",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src/Rightbar/Overview.svelte generated by Svelte v3.59.2 */
    const file$8 = "src/Rightbar/Overview.svelte";

    function create_fragment$8(ctx) {
    	let div10;
    	let div1;
    	let h1;
    	let t1;
    	let div0;
    	let t3;
    	let p;
    	let t5;
    	let img0;
    	let img0_src_value;
    	let t6;
    	let div9;
    	let div8;
    	let div2;
    	let t8;
    	let div3;
    	let t10;
    	let div4;
    	let t12;
    	let div5;
    	let t14;
    	let div6;
    	let t16;
    	let div7;
    	let div8_class_value;
    	let t18;
    	let img1;
    	let img1_class_value;
    	let img1_src_value;
    	let t19;
    	let img2;
    	let img2_class_value;
    	let img2_src_value;
    	let t20;
    	let div30;
    	let div13;
    	let div11;
    	let img3;
    	let img3_src_value;
    	let t21;
    	let img4;
    	let img4_src_value;
    	let t22;
    	let img5;
    	let img5_src_value;
    	let t23;
    	let img6;
    	let img6_src_value;
    	let t24;
    	let img7;
    	let img7_src_value;
    	let t25;
    	let img8;
    	let img8_src_value;
    	let t26;
    	let img9;
    	let img9_src_value;
    	let t27;
    	let div12;
    	let img10;
    	let img10_src_value;
    	let t28;
    	let img11;
    	let img11_src_value;
    	let t29;
    	let img12;
    	let img12_src_value;
    	let t30;
    	let img13;
    	let img13_src_value;
    	let t31;
    	let img14;
    	let img14_src_value;
    	let t32;
    	let img15;
    	let img15_src_value;
    	let t33;
    	let img16;
    	let img16_src_value;
    	let t34;
    	let img17;
    	let img17_src_value;
    	let t35;
    	let div21;
    	let div14;
    	let t37;
    	let div15;
    	let t39;
    	let div16;
    	let t41;
    	let div17;
    	let t43;
    	let div18;
    	let t45;
    	let div19;
    	let t47;
    	let div20;
    	let t49;
    	let div29;
    	let div22;
    	let t51;
    	let div23;
    	let t53;
    	let div24;
    	let t55;
    	let div25;
    	let t57;
    	let div26;
    	let t59;
    	let div27;
    	let t61;
    	let div28;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div1 = element("div");
    			h1 = element("h1");
    			h1.textContent = "48.82";
    			t1 = space();
    			div0 = element("div");
    			div0.textContent = "+1.09(+2.28&)";
    			t3 = space();
    			p = element("p");
    			p.textContent = "Feb 01, 1:01:56 PM UTC+4, NASDAQ";
    			t5 = space();
    			img0 = element("img");
    			t6 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div2 = element("div");
    			div2.textContent = "1D";
    			t8 = space();
    			div3 = element("div");
    			div3.textContent = "1W";
    			t10 = space();
    			div4 = element("div");
    			div4.textContent = "1M";
    			t12 = space();
    			div5 = element("div");
    			div5.textContent = "6M";
    			t14 = space();
    			div6 = element("div");
    			div6.textContent = "1Y";
    			t16 = space();
    			div7 = element("div");
    			div7.textContent = "All";
    			t18 = space();
    			img1 = element("img");
    			t19 = space();
    			img2 = element("img");
    			t20 = space();
    			div30 = element("div");
    			div13 = element("div");
    			div11 = element("div");
    			img3 = element("img");
    			t21 = space();
    			img4 = element("img");
    			t22 = space();
    			img5 = element("img");
    			t23 = space();
    			img6 = element("img");
    			t24 = space();
    			img7 = element("img");
    			t25 = space();
    			img8 = element("img");
    			t26 = space();
    			img9 = element("img");
    			t27 = space();
    			div12 = element("div");
    			img10 = element("img");
    			t28 = space();
    			img11 = element("img");
    			t29 = space();
    			img12 = element("img");
    			t30 = space();
    			img13 = element("img");
    			t31 = space();
    			img14 = element("img");
    			t32 = space();
    			img15 = element("img");
    			t33 = space();
    			img16 = element("img");
    			t34 = space();
    			img17 = element("img");
    			t35 = space();
    			div21 = element("div");
    			div14 = element("div");
    			div14.textContent = "26 Jan 22";
    			t37 = space();
    			div15 = element("div");
    			div15.textContent = "27 Jan 22";
    			t39 = space();
    			div16 = element("div");
    			div16.textContent = "28 Jan 22";
    			t41 = space();
    			div17 = element("div");
    			div17.textContent = "29 Jan 22";
    			t43 = space();
    			div18 = element("div");
    			div18.textContent = "30 Jan 22";
    			t45 = space();
    			div19 = element("div");
    			div19.textContent = "31 Jan 22";
    			t47 = space();
    			div20 = element("div");
    			div20.textContent = "01 Feb 22";
    			t49 = space();
    			div29 = element("div");
    			div22 = element("div");
    			div22.textContent = "56.00";
    			t51 = space();
    			div23 = element("div");
    			div23.textContent = "55.00";
    			t53 = space();
    			div24 = element("div");
    			div24.textContent = "54.00";
    			t55 = space();
    			div25 = element("div");
    			div25.textContent = "53.00";
    			t57 = space();
    			div26 = element("div");
    			div26.textContent = "52.00";
    			t59 = space();
    			div27 = element("div");
    			div27.textContent = "51.00";
    			t61 = space();
    			div28 = element("div");
    			div28.textContent = "50.00";
    			attr_dev(h1, "class", "h-1 svelte-zo2x2");
    			add_location(h1, file$8, 6, 4, 110);
    			attr_dev(div0, "class", "element svelte-zo2x2");
    			add_location(div0, file$8, 7, 4, 141);
    			attr_dev(p, "class", "p svelte-zo2x2");
    			add_location(p, file$8, 8, 4, 190);
    			attr_dev(img0, "class", "polygon svelte-zo2x2");
    			attr_dev(img0, "alt", "Polygon");
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/polygon-1.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$8, 9, 4, 244);
    			attr_dev(div1, "class", "info svelte-zo2x2");
    			add_location(div1, file$8, 5, 2, 87);
    			attr_dev(div2, "class", "text-13 svelte-zo2x2");
    			add_location(div2, file$8, 13, 6, 393);
    			attr_dev(div3, "class", "text-14 svelte-zo2x2");
    			add_location(div3, file$8, 14, 6, 429);
    			attr_dev(div4, "class", "text-13 svelte-zo2x2");
    			add_location(div4, file$8, 15, 6, 465);
    			attr_dev(div5, "class", "text-13 svelte-zo2x2");
    			add_location(div5, file$8, 16, 6, 501);
    			attr_dev(div6, "class", "text-13 svelte-zo2x2");
    			add_location(div6, file$8, 17, 6, 537);
    			attr_dev(div7, "class", "text-13 svelte-zo2x2");
    			add_location(div7, file$8, 18, 6, 573);
    			attr_dev(div8, "class", div8_class_value = "navbar-2 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2");
    			add_location(div8, file$8, 12, 4, 350);
    			attr_dev(img1, "class", img1_class_value = "frame-3 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2");
    			attr_dev(img1, "alt", "Frame");
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/frame-4.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$8, 20, 4, 619);
    			attr_dev(img2, "class", img2_class_value = "frame-4 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2");
    			attr_dev(img2, "alt", "Frame");
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/frame-5.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$8, 25, 4, 727);
    			attr_dev(div9, "class", "time svelte-zo2x2");
    			add_location(div9, file$8, 11, 2, 327);
    			attr_dev(div10, "class", "group-3");
    			add_location(div10, file$8, 4, 0, 63);
    			attr_dev(img3, "class", "line-2 horizontal-line svelte-zo2x2");
    			attr_dev(img3, "alt", "Line");
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/line-7.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$8, 35, 6, 923);
    			attr_dev(img4, "class", "line-3 horizontal-line svelte-zo2x2");
    			attr_dev(img4, "alt", "Line");
    			if (!src_url_equal(img4.src, img4_src_value = ".//static/img/line-7.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$8, 40, 6, 1040);
    			attr_dev(img5, "class", "line-4 horizontal-line svelte-zo2x2");
    			attr_dev(img5, "alt", "Line");
    			if (!src_url_equal(img5.src, img5_src_value = ".//static/img/line-7.svg")) attr_dev(img5, "src", img5_src_value);
    			add_location(img5, file$8, 45, 6, 1157);
    			attr_dev(img6, "class", "line-5 horizontal-line svelte-zo2x2");
    			attr_dev(img6, "alt", "Line");
    			if (!src_url_equal(img6.src, img6_src_value = ".//static/img/line-7.svg")) attr_dev(img6, "src", img6_src_value);
    			add_location(img6, file$8, 50, 6, 1274);
    			attr_dev(img7, "class", "line-6 horizontal-line svelte-zo2x2");
    			attr_dev(img7, "alt", "Line");
    			if (!src_url_equal(img7.src, img7_src_value = ".//static/img/line-7.svg")) attr_dev(img7, "src", img7_src_value);
    			add_location(img7, file$8, 55, 6, 1391);
    			attr_dev(img8, "class", "line-7 horizontal-line svelte-zo2x2");
    			attr_dev(img8, "alt", "Line");
    			if (!src_url_equal(img8.src, img8_src_value = ".//static/img/line-7.svg")) attr_dev(img8, "src", img8_src_value);
    			add_location(img8, file$8, 60, 6, 1508);
    			attr_dev(img9, "class", "line-8 horizontal-line svelte-zo2x2");
    			attr_dev(img9, "alt", "Line");
    			if (!src_url_equal(img9.src, img9_src_value = ".//static/img/line-7.svg")) attr_dev(img9, "src", img9_src_value);
    			add_location(img9, file$8, 65, 6, 1625);
    			attr_dev(div11, "class", "horizontal svelte-zo2x2");
    			add_location(div11, file$8, 34, 4, 892);
    			attr_dev(img10, "class", "line-9 vertical-line svelte-zo2x2");
    			attr_dev(img10, "alt", "Line");
    			if (!src_url_equal(img10.src, img10_src_value = ".//static/img/line-8.svg")) attr_dev(img10, "src", img10_src_value);
    			add_location(img10, file$8, 72, 6, 1780);
    			attr_dev(img11, "class", "line-10 vertical-line svelte-zo2x2");
    			attr_dev(img11, "alt", "Line");
    			if (!src_url_equal(img11.src, img11_src_value = ".//static/img/line-14.svg")) attr_dev(img11, "src", img11_src_value);
    			add_location(img11, file$8, 77, 6, 1895);
    			attr_dev(img12, "class", "line-11 vertical-line svelte-zo2x2");
    			attr_dev(img12, "alt", "Line");
    			if (!src_url_equal(img12.src, img12_src_value = ".//static/img/line-14.svg")) attr_dev(img12, "src", img12_src_value);
    			add_location(img12, file$8, 82, 6, 2012);
    			attr_dev(img13, "class", "line-12 vertical-line svelte-zo2x2");
    			attr_dev(img13, "alt", "Line");
    			if (!src_url_equal(img13.src, img13_src_value = ".//static/img/line-14.svg")) attr_dev(img13, "src", img13_src_value);
    			add_location(img13, file$8, 87, 6, 2129);
    			attr_dev(img14, "class", "line-13 vertical-line svelte-zo2x2");
    			attr_dev(img14, "alt", "Line");
    			if (!src_url_equal(img14.src, img14_src_value = ".//static/img/line-14.svg")) attr_dev(img14, "src", img14_src_value);
    			add_location(img14, file$8, 92, 6, 2246);
    			attr_dev(img15, "class", "line-14 vertical-line svelte-zo2x2");
    			attr_dev(img15, "alt", "Line");
    			if (!src_url_equal(img15.src, img15_src_value = ".//static/img/line-14.svg")) attr_dev(img15, "src", img15_src_value);
    			add_location(img15, file$8, 97, 6, 2363);
    			attr_dev(img16, "class", "line-15 vertical-line svelte-zo2x2");
    			attr_dev(img16, "alt", "Line");
    			if (!src_url_equal(img16.src, img16_src_value = ".//static/img/line-14.svg")) attr_dev(img16, "src", img16_src_value);
    			add_location(img16, file$8, 102, 6, 2480);
    			attr_dev(div12, "class", "vertical svelte-zo2x2");
    			add_location(div12, file$8, 71, 4, 1751);
    			attr_dev(div13, "class", "line svelte-zo2x2");
    			add_location(div13, file$8, 33, 2, 869);
    			attr_dev(img17, "class", "chart-2 svelte-zo2x2");
    			attr_dev(img17, "alt", "Chart");
    			if (!src_url_equal(img17.src, img17_src_value = ".//static/img/chart.png")) attr_dev(img17, "src", img17_src_value);
    			add_location(img17, file$8, 109, 2, 2613);
    			attr_dev(div14, "class", "date-element");
    			add_location(div14, file$8, 111, 4, 2704);
    			attr_dev(div15, "class", "date-element");
    			add_location(div15, file$8, 112, 4, 2750);
    			attr_dev(div16, "class", "date-element");
    			add_location(div16, file$8, 113, 4, 2796);
    			attr_dev(div17, "class", "date-element");
    			add_location(div17, file$8, 114, 4, 2842);
    			attr_dev(div18, "class", "date-element");
    			add_location(div18, file$8, 115, 4, 2888);
    			attr_dev(div19, "class", "date-element");
    			add_location(div19, file$8, 116, 4, 2934);
    			attr_dev(div20, "class", "date-element");
    			add_location(div20, file$8, 117, 4, 2980);
    			attr_dev(div21, "class", "date svelte-zo2x2");
    			add_location(div21, file$8, 110, 2, 2681);
    			attr_dev(div22, "class", "price-elem");
    			add_location(div22, file$8, 120, 4, 3057);
    			attr_dev(div23, "class", "price-elem");
    			add_location(div23, file$8, 121, 4, 3097);
    			attr_dev(div24, "class", "price-elem");
    			add_location(div24, file$8, 122, 4, 3137);
    			attr_dev(div25, "class", "price-elem");
    			add_location(div25, file$8, 123, 4, 3177);
    			attr_dev(div26, "class", "price-elem");
    			add_location(div26, file$8, 124, 4, 3217);
    			attr_dev(div27, "class", "price-elem");
    			add_location(div27, file$8, 125, 4, 3257);
    			attr_dev(div28, "class", "price-elem");
    			add_location(div28, file$8, 126, 4, 3297);
    			attr_dev(div29, "class", "price svelte-zo2x2");
    			add_location(div29, file$8, 119, 2, 3033);
    			attr_dev(div30, "class", "chart svelte-zo2x2");
    			add_location(div30, file$8, 32, 0, 847);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div1);
    			append_dev(div1, h1);
    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div1, t3);
    			append_dev(div1, p);
    			append_dev(div1, t5);
    			append_dev(div1, img0);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, div8);
    			append_dev(div8, div2);
    			append_dev(div8, t8);
    			append_dev(div8, div3);
    			append_dev(div8, t10);
    			append_dev(div8, div4);
    			append_dev(div8, t12);
    			append_dev(div8, div5);
    			append_dev(div8, t14);
    			append_dev(div8, div6);
    			append_dev(div8, t16);
    			append_dev(div8, div7);
    			append_dev(div9, t18);
    			append_dev(div9, img1);
    			append_dev(div9, t19);
    			append_dev(div9, img2);
    			insert_dev(target, t20, anchor);
    			insert_dev(target, div30, anchor);
    			append_dev(div30, div13);
    			append_dev(div13, div11);
    			append_dev(div11, img3);
    			append_dev(div11, t21);
    			append_dev(div11, img4);
    			append_dev(div11, t22);
    			append_dev(div11, img5);
    			append_dev(div11, t23);
    			append_dev(div11, img6);
    			append_dev(div11, t24);
    			append_dev(div11, img7);
    			append_dev(div11, t25);
    			append_dev(div11, img8);
    			append_dev(div11, t26);
    			append_dev(div11, img9);
    			append_dev(div13, t27);
    			append_dev(div13, div12);
    			append_dev(div12, img10);
    			append_dev(div12, t28);
    			append_dev(div12, img11);
    			append_dev(div12, t29);
    			append_dev(div12, img12);
    			append_dev(div12, t30);
    			append_dev(div12, img13);
    			append_dev(div12, t31);
    			append_dev(div12, img14);
    			append_dev(div12, t32);
    			append_dev(div12, img15);
    			append_dev(div12, t33);
    			append_dev(div12, img16);
    			append_dev(div30, t34);
    			append_dev(div30, img17);
    			append_dev(div30, t35);
    			append_dev(div30, div21);
    			append_dev(div21, div14);
    			append_dev(div21, t37);
    			append_dev(div21, div15);
    			append_dev(div21, t39);
    			append_dev(div21, div16);
    			append_dev(div21, t41);
    			append_dev(div21, div17);
    			append_dev(div21, t43);
    			append_dev(div21, div18);
    			append_dev(div21, t45);
    			append_dev(div21, div19);
    			append_dev(div21, t47);
    			append_dev(div21, div20);
    			append_dev(div30, t49);
    			append_dev(div30, div29);
    			append_dev(div29, div22);
    			append_dev(div29, t51);
    			append_dev(div29, div23);
    			append_dev(div29, t53);
    			append_dev(div29, div24);
    			append_dev(div29, t55);
    			append_dev(div29, div25);
    			append_dev(div29, t57);
    			append_dev(div29, div26);
    			append_dev(div29, t59);
    			append_dev(div29, div27);
    			append_dev(div29, t61);
    			append_dev(div29, div28);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && div8_class_value !== (div8_class_value = "navbar-2 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2")) {
    				attr_dev(div8, "class", div8_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && img1_class_value !== (img1_class_value = "frame-3 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2")) {
    				attr_dev(img1, "class", img1_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && img2_class_value !== (img2_class_value = "frame-4 " + /*$themeColor*/ ctx[0] + " svelte-zo2x2")) {
    				attr_dev(img2, "class", img2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			if (detaching) detach_dev(t20);
    			if (detaching) detach_dev(div30);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Overview', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Overview> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class Overview extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Overview",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /* src/Rightbar/INTC.svelte generated by Svelte v3.59.2 */
    const file$7 = "src/Rightbar/INTC.svelte";

    function create_fragment$7(ctx) {
    	let div15;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div2;
    	let div0;
    	let t2;
    	let img1;
    	let img1_src_value;
    	let t3;
    	let div1;
    	let span0;
    	let t4;
    	let span0_class_value;
    	let t5;
    	let span1;
    	let t6;
    	let span1_class_value;
    	let div2_class_value;
    	let t7;
    	let div5;
    	let div3;
    	let img2;
    	let img2_src_value;
    	let t8;
    	let div4;
    	let t10;
    	let img3;
    	let img3_src_value;
    	let t11;
    	let div14;
    	let div13;
    	let div12;
    	let div6;
    	let t13;
    	let div7;
    	let t15;
    	let div8;
    	let t17;
    	let div9;
    	let t19;
    	let div10;
    	let t21;
    	let div11;
    	let t23;
    	let img4;
    	let img4_src_value;

    	const block = {
    		c: function create() {
    			div15 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div2 = element("div");
    			div0 = element("div");
    			div0.textContent = "Greenmusk Inc";
    			t2 = space();
    			img1 = element("img");
    			t3 = space();
    			div1 = element("div");
    			span0 = element("span");
    			t4 = text("NASDAQ:");
    			t5 = space();
    			span1 = element("span");
    			t6 = text("GMUSK");
    			t7 = space();
    			div5 = element("div");
    			div3 = element("div");
    			img2 = element("img");
    			t8 = space();
    			div4 = element("div");
    			div4.textContent = "Add to WatchList";
    			t10 = space();
    			img3 = element("img");
    			t11 = space();
    			div14 = element("div");
    			div13 = element("div");
    			div12 = element("div");
    			div6 = element("div");
    			div6.textContent = "General";
    			t13 = space();
    			div7 = element("div");
    			div7.textContent = "Chart";
    			t15 = space();
    			div8 = element("div");
    			div8.textContent = "Analysis";
    			t17 = space();
    			div9 = element("div");
    			div9.textContent = "News";
    			t19 = space();
    			div10 = element("div");
    			div10.textContent = "Financials";
    			t21 = space();
    			div11 = element("div");
    			div11.textContent = "Forum";
    			t23 = space();
    			img4 = element("img");
    			attr_dev(img0, "class", "replace-img1 svelte-197s3dk");
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/replace-image-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", " replace-image");
    			add_location(img0, file$7, 6, 2, 135);
    			attr_dev(div0, "class", "stock-name svelte-197s3dk");
    			add_location(div0, file$7, 12, 4, 284);
    			attr_dev(img1, "class", "index-img svelte-197s3dk");
    			attr_dev(img1, "alt", "index-img");
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/frame-2.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$7, 13, 4, 332);
    			attr_dev(span0, "class", span0_class_value = "index-name " + /*$themeColor*/ ctx[0] + " svelte-197s3dk");
    			add_location(span0, file$7, 15, 6, 437);
    			attr_dev(span1, "class", span1_class_value = "span " + /*$themeColor*/ ctx[0] + " svelte-197s3dk");
    			add_location(span1, file$7, 16, 6, 497);
    			attr_dev(div1, "class", "NASDAQ svelte-197s3dk");
    			add_location(div1, file$7, 14, 4, 410);
    			attr_dev(div2, "class", div2_class_value = "stock-info " + /*$themeColor*/ ctx[0] + " svelte-197s3dk");
    			add_location(div2, file$7, 11, 2, 241);
    			attr_dev(img2, "class", "starIn svelte-197s3dk");
    			attr_dev(img2, "alt", "Star");
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/star-1-4.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$7, 21, 6, 618);
    			attr_dev(div3, "class", "star svelte-197s3dk");
    			add_location(div3, file$7, 20, 4, 593);
    			attr_dev(div4, "class", "text-watch svelte-197s3dk");
    			add_location(div4, file$7, 23, 4, 700);
    			attr_dev(div5, "class", "watchlist svelte-197s3dk");
    			add_location(div5, file$7, 19, 2, 565);
    			attr_dev(img3, "class", "frame svelte-197s3dk");
    			attr_dev(img3, "alt", "Frame");
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/frame-2.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$7, 25, 2, 758);
    			attr_dev(div6, "class", "nav-1 svelte-197s3dk");
    			add_location(div6, file$7, 30, 8, 913);
    			attr_dev(div7, "class", "nav-2");
    			add_location(div7, file$7, 31, 8, 954);
    			attr_dev(div8, "class", "nav-3");
    			add_location(div8, file$7, 32, 8, 993);
    			attr_dev(div9, "class", "nav-4");
    			add_location(div9, file$7, 33, 8, 1035);
    			attr_dev(div10, "class", "nav-5");
    			add_location(div10, file$7, 34, 8, 1073);
    			attr_dev(div11, "class", "nav-");
    			add_location(div11, file$7, 35, 8, 1117);
    			attr_dev(div12, "class", "navbar svelte-197s3dk");
    			add_location(div12, file$7, 29, 6, 884);
    			attr_dev(img4, "class", "line svelte-197s3dk");
    			attr_dev(img4, "alt", "Line");
    			if (!src_url_equal(img4.src, img4_src_value = ".//static/img/line-17.svg")) attr_dev(img4, "src", img4_src_value);
    			add_location(img4, file$7, 37, 6, 1166);
    			attr_dev(div13, "class", "navigation");
    			add_location(div13, file$7, 28, 4, 853);
    			attr_dev(div14, "class", "group-2 svelte-197s3dk");
    			add_location(div14, file$7, 27, 2, 827);
    			attr_dev(div15, "class", "group-1");
    			add_location(div15, file$7, 4, 0, 63);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div15, anchor);
    			append_dev(div15, img0);
    			append_dev(div15, t0);
    			append_dev(div15, div2);
    			append_dev(div2, div0);
    			append_dev(div2, t2);
    			append_dev(div2, img1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div1, span0);
    			append_dev(span0, t4);
    			append_dev(div1, t5);
    			append_dev(div1, span1);
    			append_dev(span1, t6);
    			append_dev(div15, t7);
    			append_dev(div15, div5);
    			append_dev(div5, div3);
    			append_dev(div3, img2);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div15, t10);
    			append_dev(div15, img3);
    			append_dev(div15, t11);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, div12);
    			append_dev(div12, div6);
    			append_dev(div12, t13);
    			append_dev(div12, div7);
    			append_dev(div12, t15);
    			append_dev(div12, div8);
    			append_dev(div12, t17);
    			append_dev(div12, div9);
    			append_dev(div12, t19);
    			append_dev(div12, div10);
    			append_dev(div12, t21);
    			append_dev(div12, div11);
    			append_dev(div13, t23);
    			append_dev(div13, img4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && span0_class_value !== (span0_class_value = "index-name " + /*$themeColor*/ ctx[0] + " svelte-197s3dk")) {
    				attr_dev(span0, "class", span0_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && span1_class_value !== (span1_class_value = "span " + /*$themeColor*/ ctx[0] + " svelte-197s3dk")) {
    				attr_dev(span1, "class", span1_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div2_class_value !== (div2_class_value = "stock-info " + /*$themeColor*/ ctx[0] + " svelte-197s3dk")) {
    				attr_dev(div2, "class", div2_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div15);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('INTC', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<INTC> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class INTC extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "INTC",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/Rightbar/News.svelte generated by Svelte v3.59.2 */
    const file$6 = "src/Rightbar/News.svelte";

    function create_fragment$6(ctx) {
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let p0;
    	let t2;
    	let div0;
    	let div1_class_value;
    	let t4;
    	let div3;
    	let img1;
    	let img1_src_value;
    	let t5;
    	let p1;
    	let t7;
    	let div2;
    	let div3_class_value;
    	let t9;
    	let div5;
    	let img2;
    	let img2_src_value;
    	let t10;
    	let p2;
    	let t11;
    	let p2_class_value;
    	let t12;
    	let div4;
    	let div5_class_value;
    	let t14;
    	let div7;
    	let img3;
    	let img3_src_value;
    	let t15;
    	let p3;
    	let t17;
    	let div6;
    	let div7_class_value;
    	let t19;
    	let div9;
    	let div8;
    	let div9_class_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img0 = element("img");
    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "Vodafone to design chips with Intel for..";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "18h Ago";
    			t4 = space();
    			div3 = element("div");
    			img1 = element("img");
    			t5 = space();
    			p1 = element("p");
    			p1.textContent = "Apple, Microsoft and Intel earnings give a..";
    			t7 = space();
    			div2 = element("div");
    			div2.textContent = "20h Ago";
    			t9 = space();
    			div5 = element("div");
    			img2 = element("img");
    			t10 = space();
    			p2 = element("p");
    			t11 = text("Vodafone teams up with Intel on OpenRAN in..");
    			t12 = space();
    			div4 = element("div");
    			div4.textContent = "1D Ago";
    			t14 = space();
    			div7 = element("div");
    			img3 = element("img");
    			t15 = space();
    			p3 = element("p");
    			p3.textContent = "The Real Risk To Growth Stock And 'Style' Investing";
    			t17 = space();
    			div6 = element("div");
    			div6.textContent = "2D ago";
    			t19 = space();
    			div9 = element("div");
    			div8 = element("div");
    			div8.textContent = "See All";
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/replace-image-1.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Bg-Img");
    			attr_dev(img0, "class", "n-img svelte-1wvax0i");
    			add_location(img0, file$6, 5, 2, 102);
    			attr_dev(p0, "class", "news-para svelte-1wvax0i");
    			add_location(p0, file$6, 6, 2, 179);
    			attr_dev(div0, "class", "news-time svelte-1wvax0i");
    			add_location(div0, file$6, 7, 2, 248);
    			attr_dev(div1, "class", div1_class_value = "news1 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(div1, file$6, 4, 0, 63);
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/replace-image-1.png")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Bg-Img");
    			attr_dev(img1, "class", "n-img svelte-1wvax0i");
    			add_location(img1, file$6, 10, 2, 331);
    			attr_dev(p1, "class", "news-para svelte-1wvax0i");
    			add_location(p1, file$6, 11, 2, 408);
    			attr_dev(div2, "class", "news-time svelte-1wvax0i");
    			add_location(div2, file$6, 12, 2, 480);
    			attr_dev(div3, "class", div3_class_value = "news2 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(div3, file$6, 9, 0, 292);
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/replace-image-1.png")) attr_dev(img2, "src", img2_src_value);
    			attr_dev(img2, "alt", "Bg-Img");
    			attr_dev(img2, "class", "n-img svelte-1wvax0i");
    			add_location(img2, file$6, 15, 2, 563);
    			attr_dev(p2, "class", p2_class_value = "news-para " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(p2, file$6, 16, 2, 640);
    			attr_dev(div4, "class", "news-time svelte-1wvax0i");
    			add_location(div4, file$6, 19, 2, 734);
    			attr_dev(div5, "class", div5_class_value = "news3 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(div5, file$6, 14, 0, 524);
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/replace-image-1.png")) attr_dev(img3, "src", img3_src_value);
    			attr_dev(img3, "alt", "Bg-Img");
    			attr_dev(img3, "class", "n4-img svelte-1wvax0i");
    			add_location(img3, file$6, 22, 2, 813);
    			attr_dev(p3, "class", "news4-para svelte-1wvax0i");
    			add_location(p3, file$6, 23, 2, 891);
    			attr_dev(div6, "class", "news-time svelte-1wvax0i");
    			add_location(div6, file$6, 24, 2, 971);
    			attr_dev(div7, "class", div7_class_value = "news4 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(div7, file$6, 21, 0, 777);
    			attr_dev(div8, "class", "see-all-text svelte-1wvax0i");
    			add_location(div8, file$6, 27, 2, 1052);
    			attr_dev(div9, "class", div9_class_value = "see-all " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i");
    			add_location(div9, file$6, 26, 0, 1014);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img0);
    			append_dev(div1, t0);
    			append_dev(div1, p0);
    			append_dev(div1, t2);
    			append_dev(div1, div0);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, img1);
    			append_dev(div3, t5);
    			append_dev(div3, p1);
    			append_dev(div3, t7);
    			append_dev(div3, div2);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, div5, anchor);
    			append_dev(div5, img2);
    			append_dev(div5, t10);
    			append_dev(div5, p2);
    			append_dev(p2, t11);
    			append_dev(div5, t12);
    			append_dev(div5, div4);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, img3);
    			append_dev(div7, t15);
    			append_dev(div7, p3);
    			append_dev(div7, t17);
    			append_dev(div7, div6);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, div8);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && div1_class_value !== (div1_class_value = "news1 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div3_class_value !== (div3_class_value = "news2 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && p2_class_value !== (p2_class_value = "news-para " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(p2, "class", p2_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div5_class_value !== (div5_class_value = "news3 n1 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div7_class_value !== (div7_class_value = "news4 " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(div7, "class", div7_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div9_class_value !== (div9_class_value = "see-all " + /*$themeColor*/ ctx[0] + " svelte-1wvax0i")) {
    				attr_dev(div9, "class", div9_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(div7);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div9);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('News', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<News> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class News extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "News",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/Rightbar/StockDetail.svelte generated by Svelte v3.59.2 */
    const file$5 = "src/Rightbar/StockDetail.svelte";

    function create_fragment$5(ctx) {
    	let div0;
    	let t0;
    	let div0_class_value;
    	let t1;
    	let div43;
    	let div3;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div2_class_value;
    	let t5;
    	let div6;
    	let div4;
    	let t7;
    	let div5;
    	let t8;
    	let div5_class_value;
    	let t9;
    	let div9;
    	let div7;
    	let t11;
    	let div8;
    	let t12;
    	let div8_class_value;
    	let t13;
    	let div12;
    	let div10;
    	let t15;
    	let div11;
    	let t16;
    	let div11_class_value;
    	let t17;
    	let div15;
    	let div13;
    	let t19;
    	let div14;
    	let t20;
    	let div14_class_value;
    	let t21;
    	let div18;
    	let div16;
    	let t23;
    	let div17;
    	let t24;
    	let div17_class_value;
    	let t25;
    	let div21;
    	let div19;
    	let t27;
    	let div20;
    	let t28;
    	let div20_class_value;
    	let t29;
    	let div24;
    	let div22;
    	let t31;
    	let div23;
    	let t32;
    	let div23_class_value;
    	let t33;
    	let div27;
    	let div25;
    	let t35;
    	let div26;
    	let t36;
    	let div26_class_value;
    	let t37;
    	let div30;
    	let div28;
    	let t39;
    	let div29;
    	let t40;
    	let div29_class_value;
    	let t41;
    	let div33;
    	let div31;
    	let t43;
    	let div32;
    	let t44;
    	let div32_class_value;
    	let t45;
    	let div36;
    	let div34;
    	let t47;
    	let div35;
    	let t48;
    	let div35_class_value;
    	let t49;
    	let div39;
    	let div37;
    	let t51;
    	let div38;
    	let t52;
    	let div38_class_value;
    	let t53;
    	let div42;
    	let div40;
    	let t55;
    	let div41;
    	let t56;
    	let div41_class_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("Stock Detail");
    			t1 = space();
    			div43 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			div1.textContent = "Prev Close";
    			t3 = space();
    			div2 = element("div");
    			t4 = text("47.73");
    			t5 = space();
    			div6 = element("div");
    			div4 = element("div");
    			div4.textContent = "Day’s Range";
    			t7 = space();
    			div5 = element("div");
    			t8 = text("47.71 - 48.87");
    			t9 = space();
    			div9 = element("div");
    			div7 = element("div");
    			div7.textContent = "Open";
    			t11 = space();
    			div8 = element("div");
    			t12 = text("47.68");
    			t13 = space();
    			div12 = element("div");
    			div10 = element("div");
    			div10.textContent = "52 wk Range";
    			t15 = space();
    			div11 = element("div");
    			t16 = text("46.3 - 68.48");
    			t17 = space();
    			div15 = element("div");
    			div13 = element("div");
    			div13.textContent = "Volume";
    			t19 = space();
    			div14 = element("div");
    			t20 = text("50,368,874");
    			t21 = space();
    			div18 = element("div");
    			div16 = element("div");
    			div16.textContent = "Market Cap";
    			t23 = space();
    			div17 = element("div");
    			t24 = text("198.8B");
    			t25 = space();
    			div21 = element("div");
    			div19 = element("div");
    			div19.textContent = "Avg. Vol.";
    			t27 = space();
    			div20 = element("div");
    			t28 = text("34,599,178");
    			t29 = space();
    			div24 = element("div");
    			div22 = element("div");
    			div22.textContent = "P/E Ratio";
    			t31 = space();
    			div23 = element("div");
    			t32 = text("9.82");
    			t33 = space();
    			div27 = element("div");
    			div25 = element("div");
    			div25.textContent = "1-Year Change";
    			t35 = space();
    			div26 = element("div");
    			t36 = text("-12.05%");
    			t37 = space();
    			div30 = element("div");
    			div28 = element("div");
    			div28.textContent = "Dividend";
    			t39 = space();
    			div29 = element("div");
    			t40 = text("1.46");
    			t41 = space();
    			div33 = element("div");
    			div31 = element("div");
    			div31.textContent = "Revenue";
    			t43 = space();
    			div32 = element("div");
    			t44 = text("79.02B");
    			t45 = space();
    			div36 = element("div");
    			div34 = element("div");
    			div34.textContent = "Beta";
    			t47 = space();
    			div35 = element("div");
    			t48 = text("0.55");
    			t49 = space();
    			div39 = element("div");
    			div37 = element("div");
    			div37.textContent = "EPS";
    			t51 = space();
    			div38 = element("div");
    			t52 = text("4.68");
    			t53 = space();
    			div42 = element("div");
    			div40 = element("div");
    			div40.textContent = "Next Earning Rate";
    			t55 = space();
    			div41 = element("div");
    			t56 = text("Apr 28");
    			attr_dev(div0, "class", div0_class_value = "detail-head " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div0, file$5, 4, 0, 63);
    			attr_dev(div1, "class", "prop svelte-1hw2pah");
    			add_location(div1, file$5, 7, 4, 183);
    			attr_dev(div2, "class", div2_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div2, file$5, 8, 4, 222);
    			attr_dev(div3, "class", "prev-close grid-elem svelte-1hw2pah");
    			add_location(div3, file$5, 6, 2, 144);
    			attr_dev(div4, "class", "prop svelte-1hw2pah");
    			add_location(div4, file$5, 11, 4, 317);
    			attr_dev(div5, "class", div5_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div5, file$5, 12, 4, 357);
    			attr_dev(div6, "class", "days-range grid-elem svelte-1hw2pah");
    			add_location(div6, file$5, 10, 2, 278);
    			attr_dev(div7, "class", "prop svelte-1hw2pah");
    			add_location(div7, file$5, 15, 4, 454);
    			attr_dev(div8, "class", div8_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div8, file$5, 16, 4, 487);
    			attr_dev(div9, "class", "open grid-elem svelte-1hw2pah");
    			add_location(div9, file$5, 14, 2, 421);
    			attr_dev(div10, "class", "prop svelte-1hw2pah");
    			add_location(div10, file$5, 19, 4, 586);
    			attr_dev(div11, "class", div11_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div11, file$5, 20, 4, 626);
    			attr_dev(div12, "class", "52-week-change grid-elem svelte-1hw2pah");
    			add_location(div12, file$5, 18, 2, 543);
    			attr_dev(div13, "class", "prop svelte-1hw2pah");
    			add_location(div13, file$5, 23, 4, 724);
    			attr_dev(div14, "class", div14_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div14, file$5, 24, 4, 759);
    			attr_dev(div15, "class", "volume grid-elem svelte-1hw2pah");
    			add_location(div15, file$5, 22, 2, 689);
    			attr_dev(div16, "class", "prop svelte-1hw2pah");
    			add_location(div16, file$5, 27, 4, 859);
    			attr_dev(div17, "class", div17_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div17, file$5, 28, 4, 898);
    			attr_dev(div18, "class", "market-cap grid-elem svelte-1hw2pah");
    			add_location(div18, file$5, 26, 2, 820);
    			attr_dev(div19, "class", "prop svelte-1hw2pah");
    			add_location(div19, file$5, 31, 4, 994);
    			attr_dev(div20, "class", div20_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div20, file$5, 32, 4, 1032);
    			attr_dev(div21, "class", "avg-volume grid-elem svelte-1hw2pah");
    			add_location(div21, file$5, 30, 2, 955);
    			attr_dev(div22, "class", "prop svelte-1hw2pah");
    			add_location(div22, file$5, 35, 4, 1131);
    			attr_dev(div23, "class", div23_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div23, file$5, 36, 4, 1169);
    			attr_dev(div24, "class", "p-e-ratio grid-elem svelte-1hw2pah");
    			add_location(div24, file$5, 34, 2, 1093);
    			attr_dev(div25, "class", "prop svelte-1hw2pah");
    			add_location(div25, file$5, 39, 4, 1273);
    			attr_dev(div26, "class", div26_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div26, file$5, 40, 4, 1315);
    			attr_dev(div27, "class", "year-changegrid-elem grid-elem svelte-1hw2pah");
    			add_location(div27, file$5, 38, 2, 1224);
    			attr_dev(div28, "class", "prop svelte-1hw2pah");
    			add_location(div28, file$5, 44, 4, 1411);
    			attr_dev(div29, "class", div29_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div29, file$5, 45, 4, 1448);
    			attr_dev(div30, "class", "dividend grid-elem svelte-1hw2pah");
    			add_location(div30, file$5, 43, 2, 1374);
    			attr_dev(div31, "class", "prop svelte-1hw2pah");
    			add_location(div31, file$5, 48, 4, 1539);
    			attr_dev(div32, "class", div32_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div32, file$5, 49, 4, 1575);
    			attr_dev(div33, "class", "revenue grid-elem svelte-1hw2pah");
    			add_location(div33, file$5, 47, 2, 1503);
    			attr_dev(div34, "class", "prop svelte-1hw2pah");
    			add_location(div34, file$5, 53, 4, 1666);
    			attr_dev(div35, "class", div35_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div35, file$5, 54, 4, 1699);
    			attr_dev(div36, "class", "beta grid-elem svelte-1hw2pah");
    			add_location(div36, file$5, 52, 2, 1633);
    			attr_dev(div37, "class", "prop svelte-1hw2pah");
    			add_location(div37, file$5, 57, 4, 1786);
    			attr_dev(div38, "class", div38_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div38, file$5, 58, 4, 1818);
    			attr_dev(div39, "class", "eps grid-elem svelte-1hw2pah");
    			add_location(div39, file$5, 56, 2, 1754);
    			attr_dev(div40, "class", "prop svelte-1hw2pah");
    			add_location(div40, file$5, 61, 4, 1919);
    			attr_dev(div41, "class", div41_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah");
    			add_location(div41, file$5, 62, 4, 1965);
    			attr_dev(div42, "class", "next-earning-date grid-elem svelte-1hw2pah");
    			add_location(div42, file$5, 60, 2, 1873);
    			attr_dev(div43, "class", "detail svelte-1hw2pah");
    			add_location(div43, file$5, 5, 0, 121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div43, anchor);
    			append_dev(div43, div3);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, t4);
    			append_dev(div43, t5);
    			append_dev(div43, div6);
    			append_dev(div6, div4);
    			append_dev(div6, t7);
    			append_dev(div6, div5);
    			append_dev(div5, t8);
    			append_dev(div43, t9);
    			append_dev(div43, div9);
    			append_dev(div9, div7);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div8, t12);
    			append_dev(div43, t13);
    			append_dev(div43, div12);
    			append_dev(div12, div10);
    			append_dev(div12, t15);
    			append_dev(div12, div11);
    			append_dev(div11, t16);
    			append_dev(div43, t17);
    			append_dev(div43, div15);
    			append_dev(div15, div13);
    			append_dev(div15, t19);
    			append_dev(div15, div14);
    			append_dev(div14, t20);
    			append_dev(div43, t21);
    			append_dev(div43, div18);
    			append_dev(div18, div16);
    			append_dev(div18, t23);
    			append_dev(div18, div17);
    			append_dev(div17, t24);
    			append_dev(div43, t25);
    			append_dev(div43, div21);
    			append_dev(div21, div19);
    			append_dev(div21, t27);
    			append_dev(div21, div20);
    			append_dev(div20, t28);
    			append_dev(div43, t29);
    			append_dev(div43, div24);
    			append_dev(div24, div22);
    			append_dev(div24, t31);
    			append_dev(div24, div23);
    			append_dev(div23, t32);
    			append_dev(div43, t33);
    			append_dev(div43, div27);
    			append_dev(div27, div25);
    			append_dev(div27, t35);
    			append_dev(div27, div26);
    			append_dev(div26, t36);
    			append_dev(div43, t37);
    			append_dev(div43, div30);
    			append_dev(div30, div28);
    			append_dev(div30, t39);
    			append_dev(div30, div29);
    			append_dev(div29, t40);
    			append_dev(div43, t41);
    			append_dev(div43, div33);
    			append_dev(div33, div31);
    			append_dev(div33, t43);
    			append_dev(div33, div32);
    			append_dev(div32, t44);
    			append_dev(div43, t45);
    			append_dev(div43, div36);
    			append_dev(div36, div34);
    			append_dev(div36, t47);
    			append_dev(div36, div35);
    			append_dev(div35, t48);
    			append_dev(div43, t49);
    			append_dev(div43, div39);
    			append_dev(div39, div37);
    			append_dev(div39, t51);
    			append_dev(div39, div38);
    			append_dev(div38, t52);
    			append_dev(div43, t53);
    			append_dev(div43, div42);
    			append_dev(div42, div40);
    			append_dev(div42, t55);
    			append_dev(div42, div41);
    			append_dev(div41, t56);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && div0_class_value !== (div0_class_value = "detail-head " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div2_class_value !== (div2_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div5_class_value !== (div5_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div8_class_value !== (div8_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div8, "class", div8_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div11_class_value !== (div11_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div11, "class", div11_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div14_class_value !== (div14_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div14, "class", div14_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div17_class_value !== (div17_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div17, "class", div17_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div20_class_value !== (div20_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div20, "class", div20_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div23_class_value !== (div23_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div23, "class", div23_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div26_class_value !== (div26_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div26, "class", div26_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div29_class_value !== (div29_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div29, "class", div29_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div32_class_value !== (div32_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div32, "class", div32_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div35_class_value !== (div35_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div35, "class", div35_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div38_class_value !== (div38_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div38, "class", div38_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div41_class_value !== (div41_class_value = "value " + /*$themeColor*/ ctx[0] + " svelte-1hw2pah")) {
    				attr_dev(div41, "class", div41_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div43);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('StockDetail', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<StockDetail> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class StockDetail extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "StockDetail",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/Rightbar/Recommendation.svelte generated by Svelte v3.59.2 */
    const file$4 = "src/Rightbar/Recommendation.svelte";

    function create_fragment$4(ctx) {
    	let div0;
    	let t0;
    	let div0_class_value;
    	let t1;
    	let div4;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div33;
    	let div11;
    	let div5;
    	let t8;
    	let div5_class_value;
    	let t9;
    	let div6;
    	let t11;
    	let div7;
    	let t12;
    	let div7_class_value;
    	let t13;
    	let div8;
    	let t15;
    	let div9;
    	let t17;
    	let div10;
    	let img0;
    	let img0_src_value;
    	let t18;
    	let div18;
    	let div12;
    	let t20;
    	let div13;
    	let t21;
    	let div13_class_value;
    	let t22;
    	let div14;
    	let t23;
    	let div14_class_value;
    	let t24;
    	let div15;
    	let t26;
    	let div16;
    	let t28;
    	let div17;
    	let img1;
    	let img1_src_value;
    	let t29;
    	let div25;
    	let div19;
    	let t31;
    	let div20;
    	let t32;
    	let div20_class_value;
    	let t33;
    	let div21;
    	let t34;
    	let div21_class_value;
    	let t35;
    	let div22;
    	let t37;
    	let div23;
    	let t39;
    	let div24;
    	let img2;
    	let img2_src_value;
    	let t40;
    	let div32;
    	let div26;
    	let t42;
    	let div27;
    	let t43;
    	let div27_class_value;
    	let t44;
    	let div28;
    	let t45;
    	let div28_class_value;
    	let t46;
    	let div29;
    	let t48;
    	let div30;
    	let t50;
    	let div31;
    	let img3;
    	let img3_src_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text("People Also Watch");
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "Name";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "Price";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "Change %";
    			t7 = space();
    			div33 = element("div");
    			div11 = element("div");
    			div5 = element("div");
    			t8 = text("QCOM");
    			t9 = space();
    			div6 = element("div");
    			div6.textContent = "Qualcomm Incorporate";
    			t11 = space();
    			div7 = element("div");
    			t12 = text("175.76");
    			t13 = space();
    			div8 = element("div");
    			div8.textContent = "+5.37%";
    			t15 = space();
    			div9 = element("div");
    			div9.textContent = "8.95%";
    			t17 = space();
    			div10 = element("div");
    			img0 = element("img");
    			t18 = space();
    			div18 = element("div");
    			div12 = element("div");
    			div12.textContent = "Texas Instrument";
    			t20 = space();
    			div13 = element("div");
    			t21 = text("TXN");
    			t22 = space();
    			div14 = element("div");
    			t23 = text("179.49");
    			t24 = space();
    			div15 = element("div");
    			div15.textContent = "+1.24%";
    			t26 = space();
    			div16 = element("div");
    			div16.textContent = "+2.20%";
    			t28 = space();
    			div17 = element("div");
    			img1 = element("img");
    			t29 = space();
    			div25 = element("div");
    			div19 = element("div");
    			div19.textContent = "Nvidia Corporation";
    			t31 = space();
    			div20 = element("div");
    			t32 = text("NVDA");
    			t33 = space();
    			div21 = element("div");
    			t34 = text("244.86");
    			t35 = space();
    			div22 = element("div");
    			div22.textContent = "+7.21%";
    			t37 = space();
    			div23 = element("div");
    			div23.textContent = "+9.01%";
    			t39 = space();
    			div24 = element("div");
    			img2 = element("img");
    			t40 = space();
    			div32 = element("div");
    			div26 = element("div");
    			div26.textContent = "Tesla Inc";
    			t42 = space();
    			div27 = element("div");
    			t43 = text("TSLA");
    			t44 = space();
    			div28 = element("div");
    			t45 = text("936.72");
    			t46 = space();
    			div29 = element("div");
    			div29.textContent = "+10.24%";
    			t48 = space();
    			div30 = element("div");
    			div30.textContent = "+12.20%";
    			t50 = space();
    			div31 = element("div");
    			img3 = element("img");
    			attr_dev(div0, "class", div0_class_value = "recom-head " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div0, file$4, 4, 0, 63);
    			attr_dev(div1, "class", "name");
    			add_location(div1, file$4, 6, 2, 158);
    			attr_dev(div2, "class", "recom-price svelte-l3etr4");
    			add_location(div2, file$4, 7, 2, 189);
    			attr_dev(div3, "class", "recom-change svelte-l3etr4");
    			add_location(div3, file$4, 8, 2, 228);
    			attr_dev(div4, "class", "recom-stock-info svelte-l3etr4");
    			add_location(div4, file$4, 5, 0, 125);
    			attr_dev(div5, "class", div5_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div5, file$4, 12, 4, 329);
    			attr_dev(div6, "class", "stockk-name svelte-l3etr4");
    			add_location(div6, file$4, 13, 4, 385);
    			attr_dev(div7, "class", div7_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div7, file$4, 14, 4, 441);
    			attr_dev(div8, "class", "stockk-change1 svelte-l3etr4");
    			add_location(div8, file$4, 15, 4, 498);
    			attr_dev(div9, "class", "stockk-change2 svelte-l3etr4");
    			add_location(div9, file$4, 16, 4, 543);
    			attr_dev(img0, "class", "star-3 star-3-select svelte-l3etr4");
    			attr_dev(img0, "alt", "Star");
    			if (!src_url_equal(img0.src, img0_src_value = ".//static/img/star-1-3.svg")) attr_dev(img0, "src", img0_src_value);
    			add_location(img0, file$4, 18, 6, 619);
    			attr_dev(div10, "class", "stockk-star");
    			add_location(div10, file$4, 17, 4, 587);
    			attr_dev(div11, "class", "stockk-info svelte-l3etr4");
    			add_location(div11, file$4, 11, 2, 299);
    			attr_dev(div12, "class", "stockk-name svelte-l3etr4");
    			add_location(div12, file$4, 26, 4, 782);
    			attr_dev(div13, "class", div13_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div13, file$4, 27, 4, 834);
    			attr_dev(div14, "class", div14_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div14, file$4, 28, 4, 889);
    			attr_dev(div15, "class", "stockk-change1 svelte-l3etr4");
    			add_location(div15, file$4, 29, 4, 946);
    			attr_dev(div16, "class", "stockk-change2 svelte-l3etr4");
    			add_location(div16, file$4, 30, 4, 991);
    			attr_dev(img1, "class", "star-3 svelte-l3etr4");
    			attr_dev(img1, "alt", "Star");
    			if (!src_url_equal(img1.src, img1_src_value = ".//static/img/Star.svg")) attr_dev(img1, "src", img1_src_value);
    			add_location(img1, file$4, 32, 6, 1068);
    			attr_dev(div17, "class", "stockk-star");
    			add_location(div17, file$4, 31, 4, 1036);
    			attr_dev(div18, "class", "stockk-info svelte-l3etr4");
    			add_location(div18, file$4, 25, 2, 752);
    			attr_dev(div19, "class", "stockk-name svelte-l3etr4");
    			add_location(div19, file$4, 36, 4, 1183);
    			attr_dev(div20, "class", div20_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div20, file$4, 37, 4, 1237);
    			attr_dev(div21, "class", div21_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div21, file$4, 38, 4, 1293);
    			attr_dev(div22, "class", "stockk-change1 svelte-l3etr4");
    			add_location(div22, file$4, 39, 4, 1350);
    			attr_dev(div23, "class", "stockk-change2 svelte-l3etr4");
    			add_location(div23, file$4, 40, 4, 1395);
    			attr_dev(img2, "class", "star-3 svelte-l3etr4");
    			attr_dev(img2, "alt", "Star");
    			if (!src_url_equal(img2.src, img2_src_value = ".//static/img/Star.svg")) attr_dev(img2, "src", img2_src_value);
    			add_location(img2, file$4, 42, 6, 1472);
    			attr_dev(div24, "class", "stockk-star");
    			add_location(div24, file$4, 41, 4, 1440);
    			attr_dev(div25, "class", "stockk-info svelte-l3etr4");
    			add_location(div25, file$4, 35, 2, 1153);
    			attr_dev(div26, "class", "stockk-name svelte-l3etr4");
    			add_location(div26, file$4, 46, 4, 1587);
    			attr_dev(div27, "class", div27_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div27, file$4, 47, 4, 1632);
    			attr_dev(div28, "class", div28_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4");
    			add_location(div28, file$4, 48, 4, 1688);
    			attr_dev(div29, "class", "stockk-change1 svelte-l3etr4");
    			add_location(div29, file$4, 49, 4, 1745);
    			attr_dev(div30, "class", "stockk-change2 svelte-l3etr4");
    			add_location(div30, file$4, 50, 4, 1791);
    			attr_dev(img3, "class", "star-3 svelte-l3etr4");
    			attr_dev(img3, "alt", "Star");
    			if (!src_url_equal(img3.src, img3_src_value = ".//static/img/Star.svg")) attr_dev(img3, "src", img3_src_value);
    			add_location(img3, file$4, 52, 6, 1869);
    			attr_dev(div31, "class", "stockk-star");
    			add_location(div31, file$4, 51, 4, 1837);
    			attr_dev(div32, "class", "stockk-info svelte-l3etr4");
    			add_location(div32, file$4, 45, 2, 1557);
    			attr_dev(div33, "class", "stockk svelte-l3etr4");
    			add_location(div33, file$4, 10, 0, 276);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, div33, anchor);
    			append_dev(div33, div11);
    			append_dev(div11, div5);
    			append_dev(div5, t8);
    			append_dev(div11, t9);
    			append_dev(div11, div6);
    			append_dev(div11, t11);
    			append_dev(div11, div7);
    			append_dev(div7, t12);
    			append_dev(div11, t13);
    			append_dev(div11, div8);
    			append_dev(div11, t15);
    			append_dev(div11, div9);
    			append_dev(div11, t17);
    			append_dev(div11, div10);
    			append_dev(div10, img0);
    			append_dev(div33, t18);
    			append_dev(div33, div18);
    			append_dev(div18, div12);
    			append_dev(div18, t20);
    			append_dev(div18, div13);
    			append_dev(div13, t21);
    			append_dev(div18, t22);
    			append_dev(div18, div14);
    			append_dev(div14, t23);
    			append_dev(div18, t24);
    			append_dev(div18, div15);
    			append_dev(div18, t26);
    			append_dev(div18, div16);
    			append_dev(div18, t28);
    			append_dev(div18, div17);
    			append_dev(div17, img1);
    			append_dev(div33, t29);
    			append_dev(div33, div25);
    			append_dev(div25, div19);
    			append_dev(div25, t31);
    			append_dev(div25, div20);
    			append_dev(div20, t32);
    			append_dev(div25, t33);
    			append_dev(div25, div21);
    			append_dev(div21, t34);
    			append_dev(div25, t35);
    			append_dev(div25, div22);
    			append_dev(div25, t37);
    			append_dev(div25, div23);
    			append_dev(div25, t39);
    			append_dev(div25, div24);
    			append_dev(div24, img2);
    			append_dev(div33, t40);
    			append_dev(div33, div32);
    			append_dev(div32, div26);
    			append_dev(div32, t42);
    			append_dev(div32, div27);
    			append_dev(div27, t43);
    			append_dev(div32, t44);
    			append_dev(div32, div28);
    			append_dev(div28, t45);
    			append_dev(div32, t46);
    			append_dev(div32, div29);
    			append_dev(div32, t48);
    			append_dev(div32, div30);
    			append_dev(div32, t50);
    			append_dev(div32, div31);
    			append_dev(div31, img3);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$themeColor*/ 1 && div0_class_value !== (div0_class_value = "recom-head " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div5_class_value !== (div5_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div5, "class", div5_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div7_class_value !== (div7_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div7, "class", div7_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div13_class_value !== (div13_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div13, "class", div13_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div14_class_value !== (div14_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div14, "class", div14_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div20_class_value !== (div20_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div20, "class", div20_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div21_class_value !== (div21_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div21, "class", div21_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div27_class_value !== (div27_class_value = "stockk-symbol " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div27, "class", div27_class_value);
    			}

    			if (dirty & /*$themeColor*/ 1 && div28_class_value !== (div28_class_value = "stockk-price " + /*$themeColor*/ ctx[0] + " svelte-l3etr4")) {
    				attr_dev(div28, "class", div28_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div4);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(div33);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Recommendation', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Recommendation> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ themeColor, $themeColor });
    	return [$themeColor];
    }

    class Recommendation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Recommendation",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Rightbar/Bar2.svelte generated by Svelte v3.59.2 */
    const file$3 = "src/Rightbar/Bar2.svelte";

    function create_fragment$3(ctx) {
    	let div0;
    	let intc;
    	let div0_class_value;
    	let t0;
    	let div1;
    	let overview;
    	let div1_class_value;
    	let t1;
    	let div2;
    	let news;
    	let t2;
    	let div3;
    	let stockdetail;
    	let div3_class_value;
    	let t3;
    	let div4;
    	let recommendation;
    	let div4_class_value;
    	let current;
    	intc = new INTC({ $$inline: true });
    	overview = new Overview({ $$inline: true });
    	news = new News({ $$inline: true });
    	stockdetail = new StockDetail({ $$inline: true });
    	recommendation = new Recommendation({ $$inline: true });

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			create_component(intc.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(overview.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(news.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(stockdetail.$$.fragment);
    			t3 = space();
    			div4 = element("div");
    			create_component(recommendation.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "INTC " + /*$themeColor*/ ctx[0] + " svelte-12ixxka");
    			add_location(div0, file$3, 9, 0, 285);
    			attr_dev(div1, "class", div1_class_value = "overview " + /*$themeColor*/ ctx[0] + " svelte-12ixxka");
    			add_location(div1, file$3, 13, 0, 337);
    			attr_dev(div2, "class", "news svelte-12ixxka");
    			add_location(div2, file$3, 17, 0, 397);
    			attr_dev(div3, "class", div3_class_value = "stockDetail " + /*$themeColor*/ ctx[0] + " svelte-12ixxka");
    			add_location(div3, file$3, 21, 0, 435);
    			attr_dev(div4, "class", div4_class_value = "recommendation " + /*$themeColor*/ ctx[0] + " svelte-12ixxka");
    			add_location(div4, file$3, 24, 0, 500);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			mount_component(intc, div0, null);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			mount_component(overview, div1, null);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);
    			mount_component(news, div2, null);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, div3, anchor);
    			mount_component(stockdetail, div3, null);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, div4, anchor);
    			mount_component(recommendation, div4, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$themeColor*/ 1 && div0_class_value !== (div0_class_value = "INTC " + /*$themeColor*/ ctx[0] + " svelte-12ixxka")) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*$themeColor*/ 1 && div1_class_value !== (div1_class_value = "overview " + /*$themeColor*/ ctx[0] + " svelte-12ixxka")) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*$themeColor*/ 1 && div3_class_value !== (div3_class_value = "stockDetail " + /*$themeColor*/ ctx[0] + " svelte-12ixxka")) {
    				attr_dev(div3, "class", div3_class_value);
    			}

    			if (!current || dirty & /*$themeColor*/ 1 && div4_class_value !== (div4_class_value = "recommendation " + /*$themeColor*/ ctx[0] + " svelte-12ixxka")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(intc.$$.fragment, local);
    			transition_in(overview.$$.fragment, local);
    			transition_in(news.$$.fragment, local);
    			transition_in(stockdetail.$$.fragment, local);
    			transition_in(recommendation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(intc.$$.fragment, local);
    			transition_out(overview.$$.fragment, local);
    			transition_out(news.$$.fragment, local);
    			transition_out(stockdetail.$$.fragment, local);
    			transition_out(recommendation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_component(intc);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_component(overview);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_component(news);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(div3);
    			destroy_component(stockdetail);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(div4);
    			destroy_component(recommendation);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Bar2', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Bar2> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Overview,
    		INTC,
    		News,
    		StockDetail,
    		Recommendation,
    		themeColor,
    		$themeColor
    	});

    	return [$themeColor];
    }

    class Bar2 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Bar2",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/Rightbar/RightBar.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/Rightbar/RightBar.svelte";

    function create_fragment$2(ctx) {
    	let div2;
    	let div0;
    	let bar1;
    	let div0_class_value;
    	let t;
    	let div1;
    	let bar2;
    	let current;
    	bar1 = new Bar1({ $$inline: true });
    	bar2 = new Bar2({ $$inline: true });

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			create_component(bar1.$$.fragment);
    			t = space();
    			div1 = element("div");
    			create_component(bar2.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "bar-1 " + /*$themeColor*/ ctx[0] + " svelte-1f6bswq");
    			add_location(div0, file$2, 7, 2, 163);
    			attr_dev(div1, "class", "bar-2 svelte-1f6bswq");
    			add_location(div1, file$2, 10, 2, 221);
    			attr_dev(div2, "class", "right-bar");
    			add_location(div2, file$2, 6, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			mount_component(bar1, div0, null);
    			append_dev(div2, t);
    			append_dev(div2, div1);
    			mount_component(bar2, div1, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$themeColor*/ 1 && div0_class_value !== (div0_class_value = "bar-1 " + /*$themeColor*/ ctx[0] + " svelte-1f6bswq")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(bar1.$$.fragment, local);
    			transition_in(bar2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(bar1.$$.fragment, local);
    			transition_out(bar2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_component(bar1);
    			destroy_component(bar2);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('RightBar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<RightBar> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Bar1, Bar2, themeColor, $themeColor });
    	return [$themeColor];
    }

    class RightBar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "RightBar",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/Light.svelte generated by Svelte v3.59.2 */
    const file$1 = "src/Light.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let sidebar;
    	let t;
    	let div0;
    	let rightbar;
    	let div0_class_value;
    	let current;
    	sidebar = new Sidebar({ $$inline: true });
    	rightbar = new RightBar({ $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			create_component(sidebar.$$.fragment);
    			t = space();
    			div0 = element("div");
    			create_component(rightbar.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "right-bar " + /*$themeColor*/ ctx[0] + " svelte-fgomt4");
    			add_location(div0, file$1, 8, 2, 205);
    			attr_dev(div1, "class", "div svelte-fgomt4");
    			add_location(div1, file$1, 6, 0, 171);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			mount_component(sidebar, div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(rightbar, div0, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*$themeColor*/ 1 && div0_class_value !== (div0_class_value = "right-bar " + /*$themeColor*/ ctx[0] + " svelte-fgomt4")) {
    				attr_dev(div0, "class", div0_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(sidebar.$$.fragment, local);
    			transition_in(rightbar.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(sidebar.$$.fragment, local);
    			transition_out(rightbar.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(sidebar);
    			destroy_component(rightbar);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $themeColor;
    	validate_store(themeColor, 'themeColor');
    	component_subscribe($$self, themeColor, $$value => $$invalidate(0, $themeColor = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Light', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Light> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		SideBar: Sidebar,
    		RightBar,
    		themeColor,
    		$themeColor
    	});

    	return [$themeColor];
    }

    class Light extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Light",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let div;
    	let light;
    	let current;
    	light = new Light({ $$inline: true });

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(light.$$.fragment);
    			attr_dev(div, "class", "light svelte-1hm16uh");
    			add_location(div, file, 15, 0, 231);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(light, div, null);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(light.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(light.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(light);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function uvaisFunction(node) {
    	console.log(node);

    	return {
    		destroy() {
    			console.log("Node is destroyed");
    		}
    	};
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let name = "world";
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Light, name, uvaisFunction });

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) name = $$props.name;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    var app = new App({
    	target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
