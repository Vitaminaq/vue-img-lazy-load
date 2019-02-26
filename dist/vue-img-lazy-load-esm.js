/**
 * 构造IntersectionObserverEntry类
 */
var IntersectionObserverEntry = function IntersectionObserverEntry(entry) {
    this.init(entry);
};
IntersectionObserverEntry.prototype.init = function init (entry) {
    this.time = entry.time;
    this.target = entry.target;
    this.rootBounds = entry.rootBounds;
    this.boundingClientRect = entry.boundingClientRect;
    this.intersectionRect = entry.intersectionRect || {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0
    };
    this.isIntersecting = !!entry.intersectionRect;
    var targetRect = this.boundingClientRect;
    var targetArea = targetRect.width * targetRect.height;
    var intersectionRect = this.intersectionRect;
    var intersectionArea = intersectionRect.width * intersectionRect.height;
    if (targetArea) {
        this.intersectionRatio = intersectionArea / targetArea;
    }
    else {
        this.intersectionRatio = this.isIntersecting ? 1 : 0;
    }
};

var IntersectionObserverPrototype = function IntersectionObserverPrototype() {
    this.THROTTLE_TIMEOUT = 100;
    this.POLL_INTERVAL = null;
    this.USE_MUTATION_OBSERVER = true;
};
/**
 * 构造IntersectionObserver类
 */
var IntersectionObserver$1 = /*@__PURE__*/(function (IntersectionObserverPrototype) {
    function IntersectionObserver(callback, opt_options) {
        IntersectionObserverPrototype.call(this);
        this.registry = [];
        this.init(callback, opt_options);
        this.options = opt_options || {};
        this._callback = callback;
        this._observationTargets = [];
        this._queuedEntries = [];
        this._rootMarginValues = this._parseRootMargin(this.options.rootMargin);
        this.thresholds = this._initThresholds(this.options.threshold);
        this.root = this.options.root || null;
        this.rootMargin = this._rootMarginValues
            .map(function (margin) {
            return margin.value + margin.unit;
        })
            .join(' ');
        this._checkForIntersections = this.throttle(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);
    }

    if ( IntersectionObserverPrototype ) IntersectionObserver.__proto__ = IntersectionObserverPrototype;
    IntersectionObserver.prototype = Object.create( IntersectionObserverPrototype && IntersectionObserverPrototype.prototype );
    IntersectionObserver.prototype.constructor = IntersectionObserver;
    IntersectionObserver.prototype.init = function init (callback, options) {
        if (typeof callback != 'function') {
            throw new Error('callback must be a function');
        }
        if (options.root && options.root.nodeType != 1) {
            throw new Error('root must be an Element');
        }
    };
    IntersectionObserver.prototype.observe = function observe (target) {
        var isTargetAlreadyObserved = this._observationTargets.some(function (item) {
            return item.element == target;
        });
        if (isTargetAlreadyObserved) {
            return this;
        }
        if (!(target && target.nodeType == 1)) {
            throw new Error('target must be an Element');
        }
        this._registerInstance();
        this._observationTargets.push({ element: target, entry: null });
        this._monitorIntersections();
        this._checkForIntersections();
        return this;
    };
    IntersectionObserver.prototype._registerInstance = function _registerInstance () {
        if (this.registry.indexOf(this) < 0) {
            this.registry.push(this);
        }
        return this;
    };
    IntersectionObserver.prototype.unobserve = function unobserve (target) {
        this._observationTargets = this._observationTargets.filter(function (item) {
            return item.element != target;
        });
        if (!this._observationTargets.length) {
            this._unmonitorIntersections();
            this._unregisterInstance();
        }
        return this;
    };
    IntersectionObserver.prototype.disconnect = function disconnect () {
        this._observationTargets = [];
        this._unmonitorIntersections();
        this._unregisterInstance();
        return this;
    };
    IntersectionObserver.prototype.takeRecords = function takeRecords () {
        var records = this._queuedEntries.slice();
        this._queuedEntries = [];
        return records;
    };
    IntersectionObserver.prototype._initThresholds = function _initThresholds (opt_threshold) {
        var threshold = opt_threshold || [0];
        if (!Array.isArray(threshold))
            { threshold = [threshold]; }
        return threshold.sort().filter(function (t, i, a) {
            if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
                throw new Error('threshold must be a number between 0 and 1 inclusively');
            }
            return t !== a[i - 1];
        });
    };
    IntersectionObserver.prototype._parseRootMargin = function _parseRootMargin (opt_rootMargin) {
        var marginString = opt_rootMargin || '0px';
        var margins = marginString.split(/\s+/).map(function (margin) {
            var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
            if (!parts) {
                throw new Error('rootMargin must be specified in pixels or percent');
            }
            return { value: parseFloat(parts[1]), unit: parts[2] };
        });
        margins[1] = margins[1] || margins[0];
        margins[2] = margins[2] || margins[0];
        margins[3] = margins[3] || margins[1];
        return margins;
    };
    IntersectionObserver.prototype._monitorIntersections = function _monitorIntersections () {
        if (!this._monitoringIntersections) {
            this._monitoringIntersections = true;
            if (this.POLL_INTERVAL) {
                this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL);
            }
            else {
                this.addEvent(window, 'resize', this._checkForIntersections, true);
                this.addEvent(document, 'scroll', this._checkForIntersections, true);
                if (this.USE_MUTATION_OBSERVER &&
                    'MutationObserver' in window) {
                    this._domObserver = new MutationObserver(this._checkForIntersections);
                    this._domObserver.observe(document, {
                        attributes: true,
                        childList: true,
                        characterData: true,
                        subtree: true
                    });
                }
            }
        }
        return this;
    };
    IntersectionObserver.prototype._unmonitorIntersections = function _unmonitorIntersections () {
        if (this._monitoringIntersections) {
            this._monitoringIntersections = false;
            clearInterval(this._monitoringInterval);
            this._monitoringInterval = null;
            this.removeEvent(window, 'resize', this._checkForIntersections, true);
            this.removeEvent(document, 'scroll', this._checkForIntersections, true);
            if (this._domObserver) {
                this._domObserver.disconnect();
                this._domObserver = null;
            }
        }
        return this;
    };
    IntersectionObserver.prototype._checkForIntersections = function _checkForIntersections () {
        var this$1 = this;

        var rootIsInDom = this._rootIsInDom();
        var rootRect = rootIsInDom
            ? this._getRootRect()
            : this.getEmptyRect();
        this._observationTargets.forEach(function (item) {
            var target = item.element;
            var targetRect = this$1.getBoundingClientRect(target);
            var rootContainsTarget = this$1._rootContainsTarget(target);
            var oldEntry = item.entry;
            var intersectionRect = rootIsInDom &&
                rootContainsTarget &&
                this$1._computeTargetAndRootIntersection(target, rootRect);
            var newEntry = (item.entry = new IntersectionObserverEntry({
                time: this$1.now(),
                target: target,
                boundingClientRect: targetRect,
                rootBounds: rootRect,
                intersectionRect: intersectionRect
            }));
            if (!oldEntry) {
                this$1._queuedEntries.push(newEntry);
            }
            else if (rootIsInDom && rootContainsTarget) {
                if (this$1._hasCrossedThreshold(oldEntry, newEntry)) {
                    this$1._queuedEntries.push(newEntry);
                }
            }
            else {
                if (oldEntry && oldEntry.isIntersecting) {
                    this$1._queuedEntries.push(newEntry);
                }
            }
        }, this);
        if (this._queuedEntries.length) {
            this._callback(this.takeRecords(), this);
        }
        return;
    };
    IntersectionObserver.prototype._computeTargetAndRootIntersection = function _computeTargetAndRootIntersection (target, rootRect) {
        if (window.getComputedStyle(target).display == 'none')
            { return; }
        var targetRect = this.getBoundingClientRect(target);
        var intersectionRect = targetRect;
        var parent = this.getParentNode(target);
        var atRoot = false;
        while (!atRoot) {
            var parentRect = null;
            var parentComputedStyle = parent.nodeType == 1 ? window.getComputedStyle(parent) : {};
            if (parentComputedStyle.display == 'none')
                { return; }
            if (parent == this.root || parent == document) {
                atRoot = true;
                parentRect = rootRect;
            }
            else {
                if (parent != document.body &&
                    parent != document.documentElement &&
                    parentComputedStyle.overflow != 'visible') {
                    parentRect = this.getBoundingClientRect(parent);
                }
            }
            if (parentRect) {
                intersectionRect = this.computeRectIntersection(parentRect, intersectionRect);
                if (!intersectionRect)
                    { break; }
            }
            parent = this.getParentNode(parent);
        }
        return intersectionRect;
    };
    IntersectionObserver.prototype._getRootRect = function _getRootRect () {
        var rootRect;
        if (this.root) {
            rootRect = this.getBoundingClientRect(this.root);
        }
        else {
            var html = document.documentElement;
            var body = document.body;
            rootRect = {
                top: 0,
                left: 0,
                right: html.clientWidth || body.clientWidth,
                width: html.clientWidth || body.clientWidth,
                bottom: html.clientHeight || body.clientHeight,
                height: html.clientHeight || body.clientHeight
            };
        }
        return this._expandRectByRootMargin(rootRect);
    };
    IntersectionObserver.prototype._expandRectByRootMargin = function _expandRectByRootMargin (rect) {
        var margins = this._rootMarginValues.map(function (margin, i) {
            return margin.unit == 'px'
                ? margin.value
                : (margin.value * (i % 2 ? rect.width : rect.height)) / 100;
        });
        var newRect = {
            top: rect.top - margins[0],
            right: rect.right + margins[1],
            bottom: rect.bottom + margins[2],
            left: rect.left - margins[3],
            width: 0,
            height: 0
        };
        newRect.width = newRect.right - newRect.left;
        newRect.height = newRect.bottom - newRect.top;
        return newRect;
    };
    IntersectionObserver.prototype._hasCrossedThreshold = function _hasCrossedThreshold (oldEntry, newEntry) {
        var oldRatio = oldEntry && oldEntry.isIntersecting
            ? oldEntry.intersectionRatio || 0
            : -1;
        var newRatio = newEntry.isIntersecting
            ? newEntry.intersectionRatio || 0
            : -1;
        if (oldRatio === newRatio)
            { return; }
        for (var i = 0; i < this.thresholds.length; i++) {
            var threshold = this.thresholds[i];
            if (threshold == oldRatio ||
                threshold == newRatio ||
                threshold < oldRatio !== threshold < newRatio) {
                return true;
            }
        }
    };
    IntersectionObserver.prototype._rootIsInDom = function _rootIsInDom () {
        return !this.root || this.containsDeep(document, this.root);
    };
    IntersectionObserver.prototype._rootContainsTarget = function _rootContainsTarget (target) {
        return this.containsDeep(this.root || document, target);
    };
    IntersectionObserver.prototype._unregisterInstance = function _unregisterInstance () {
        var index = this.registry.indexOf(this);
        if (index != -1)
            { this.registry.splice(index, 1); }
    };
    // 类上方法
    IntersectionObserver.prototype.now = function now () {
        return window.performance && performance.now && performance.now();
    };
    IntersectionObserver.prototype.throttle = function throttle (fn, timeout) {
        var timer = null;
        return function () {
            if (!timer) {
                timer = setTimeout(function () {
                    fn();
                    timer = null;
                }, timeout);
            }
        };
    };
    IntersectionObserver.prototype.addEvent = function addEvent (node, event, fn, opt_useCapture) {
        if (typeof node.addEventListener == 'function') {
            node.addEventListener(event, fn, opt_useCapture || false);
        }
        else if (typeof node.attachEvent == 'function') {
            node.attachEvent('on' + event, fn);
        }
    };
    IntersectionObserver.prototype.removeEvent = function removeEvent (node, event, fn, opt_useCapture) {
        if (typeof node.removeEventListener == 'function') {
            node.removeEventListener(event, fn, opt_useCapture || false);
        }
        else if (typeof node.detatchEvent == 'function') {
            node.detatchEvent('on' + event, fn);
        }
    };
    IntersectionObserver.prototype.computeRectIntersection = function computeRectIntersection (rect1, rect2) {
        var top = Math.max(rect1.top, rect2.top);
        var bottom = Math.min(rect1.bottom, rect2.bottom);
        var left = Math.max(rect1.left, rect2.left);
        var right = Math.min(rect1.right, rect2.right);
        var width = right - left;
        var height = bottom - top;
        return (width >= 0 &&
            height >= 0 && {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            width: width,
            height: height
        });
    };
    IntersectionObserver.prototype.getBoundingClientRect = function getBoundingClientRect (el) {
        var rect;
        try {
            rect = el.getBoundingClientRect();
        }
        catch (err) {
            // Ignore Windows 7 IE11 "Unspecified error"
            // https://github.com/w3c/IntersectionObserver/pull/205
        }
        if (!rect)
            { return this.getEmptyRect(); }
        if (!(rect.width && rect.height)) {
            rect = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        }
        return rect;
    };
    IntersectionObserver.prototype.getEmptyRect = function getEmptyRect () {
        return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
        };
    };
    IntersectionObserver.prototype.containsDeep = function containsDeep (parent, child) {
        var node = child;
        while (node) {
            if (node == parent)
                { return true; }
            node = this.getParentNode(node);
        }
        return false;
    };
    IntersectionObserver.prototype.getParentNode = function getParentNode (node) {
        var parent = node.parentNode;
        if (parent && parent.nodeType == 11 && parent.host) {
            return parent.host;
        }
        return parent;
    };

    return IntersectionObserver;
}(IntersectionObserverPrototype));

/**
 * IntersectionObserver的polyfill-ts-class版
 * 文档请参照：https://github.com/w3c/IntersectionObserver/tree/master/polyfill#configuring-the-polyfill
 * 如不生效，请提bug,或者去文档地址获取原版
 */
var IntersectionOberserPolyfill = function IntersectionOberserPolyfill() {
    this.initPolyfill();
};
IntersectionOberserPolyfill.prototype.initPolyfill = function initPolyfill () {
    // 如果浏览器支持IntersectionObserver,则无需兼容
    if (window &&
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in
            window.IntersectionObserverEntry.prototype &&
        'isIntersecting' in
            window.IntersectionObserverEntry.prototype)
        { return this; }
    // 如果浏览器支持IntersectionObserver，但是不存在isIntersecting属性
    if (window &&
        'IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in
            window.IntersectionObserverEntry.prototype) {
        if (!('isIntersecting' in
            window.IntersectionObserverEntry.prototype)) {
            this.polyfillIsIntersecting();
        }
        return this;
    }
    // 如果全不支持，则需要去构建此API
    this.polyfillAll();
    return this;
};
IntersectionOberserPolyfill.prototype.polyfillIsIntersecting = function polyfillIsIntersecting () {
    console.log('无isIntersecting属性，低级兼容模式开启');
    Object.defineProperty(window.IntersectionObserverEntry.prototype, 'isIntersecting', {
        get: function () {
            return this.intersectionRatio > 0;
        }
    });
    return this;
};
IntersectionOberserPolyfill.prototype.polyfillAll = function polyfillAll () {
    console.log('当前浏览器不支持IntersectionObserver，高级兼容模式开启');
    this.injectWindow();
};
IntersectionOberserPolyfill.prototype.injectWindow = function injectWindow () {
    window.IntersectionObserver = IntersectionObserver$1;
    window.IntersectionObserverEntry = IntersectionObserverEntry;
};

// 避免浏览器重排,文档请参照：https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver
var ObserverInview = function ObserverInview(callback, options) {
    this.options = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };
    this.intersectionObserver = {};
    Object.assign(this.options, options);
    this.createObserver(callback);
};
/**
 * 创建观察者
 * @param callback
 */
ObserverInview.prototype.createObserver = function createObserver (callback) {
    if (typeof IntersectionObserver === 'undefined') {
        new IntersectionOberserPolyfill();
    }
    this.intersectionObserver = new IntersectionObserver(function (entries) {
        return callback(entries);
    }, this.options);
};
/**
 * 订阅观察者
 */
ObserverInview.prototype.subscribe = function subscribe (target) {
    this.intersectionObserver.observe(target);
};
/**
 * 取消单个订阅
 */
ObserverInview.prototype.unSubscribe = function unSubscribe (target) {
    this.intersectionObserver.unobserve(target);
};
/**
 * 清除所有订阅
 */
ObserverInview.prototype.remove = function remove () {
    this.intersectionObserver.disconnect();
    delete this.intersectionObserver;
};

var bitmap = "data:image/png;base64,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";

var timers = {};
var callback = function (entire) {
    entire.forEach(function (item, index) {
        if (item.isIntersecting || item.intersectionRatio > 0) {
            var src = item.target.getAttribute('data-lazy');
            if (item.target.src === src)
                { return; }
            var key = "key" + (index + 1);
            timers[key] = setTimeout(function () {
                item.target.src = src;
                clearTimeout(timers[key]);
                delete timers[key];
            }, 500 + Math.random() * 500);
        }
    });
    return;
};
/**
 * 观察者类，用于监听dom节点是否可见
 */
var OberserDom = function OberserDom(el, vnode, options, url) {
    this.root = {};
    this.oberserOptions = {};
    this.observerInview = {};
    this.saveDomMessage(el, url);
    this.el = el;
    this.vnode = vnode;
    this.oberserOptions = options;
    this.subscribeOberser();
};
OberserDom.prototype.saveDomMessage = function saveDomMessage (el, url) {
    if (el.tagName !== 'IMG')
        { throw new Error('this dom is not img'); }
    el.setAttribute('data-lazy', el.src);
    if (url) {
        el.src = url;
    }
    else {
        el.src = bitmap;
    }
    return this;
};
OberserDom.prototype.subscribeOberser = function subscribeOberser () {
    if (!this.vnode.context || !this.vnode.context.$root)
        { return this; }
    this.root = this.vnode.context.$root;
    if (!this.root.$ObserverInview) {
        this.root.$ObserverInview = new ObserverInview(callback, this.oberserOptions);
    }
    this.root.$ObserverInview.subscribe(this.el);
    this.observerInview = this.root.$ObserverInview;
    return this;
};
OberserDom.prototype.destroy = function destroy () {
    this.observerInview.unSubscribe(this.el);
    return this;
};
var polymerization = function (el, binding, vnode) {
    if (!el.oberserDom) {
        var oberserOptions = {};
        var url = '';
        if (binding.value) {
            if (binding.value.oberserOptions) {
                oberserOptions = binding.value.oberserOptions;
            }
            if (binding.value.url) {
                url = binding.value.url;
            }
        }
        el.oberserDom = new OberserDom(el, vnode, oberserOptions, url);
    }
};
var directive = {
    bind: function (el, binding, vnode) {
        polymerization(el, binding, vnode);
    },
    unbind: function unbind(el) {
        if (!el.oberserDom)
            { return; }
        el.oberserDom.destroy();
        delete el.oberserDom;
    }
};
var VueImgLazyLoad = {
    install: function install(Vue) {
        Vue.directive('img-lazy-load', directive);
    }
};

export default VueImgLazyLoad;
