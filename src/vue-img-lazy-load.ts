import Vue, { VNode, VueConstructor } from 'vue';
import ObserverInview, { ObserverOptions } from './observer-inview';
import bitmap from './images/bitmap';

/**
 * v-img-lazy-load指令封装，用于图片懒加载
 */

export interface VueRoot extends Vue {
	$ObserverInview?: ObserverInview;
}
const timers:any = {};
const callback = (entire: IntersectionObserverEntry[]) => {
	entire.forEach((item: any, index: number) => {
		if (item.isIntersecting || item.intersectionRatio > 0) {
			const src = item.target.getAttribute('data-lazy');
			if (item.target.src === src) return;
			const key = `key${index + 1}${item.intersectionRect.top}
			    ${item.intersectionRect.y}${item.time}`;
			timers[key] = setTimeout(() => {
				item.target.src = src;
				clearTimeout(timers[key]);
				delete timers[key];
			}, 500 + Math.random() * 500);
		}
	});
	return;
}
/**
 * 观察者类，用于监听dom节点是否可见
 */
class OberserDom {
	public el: DirectiveHTMLElement;
	public vnode: VNode;
	public root: VueRoot = {} as VueRoot;
	private oberserOptions: ObserverOptions = {};
	public observerInview: ObserverInview = {} as ObserverInview;
	constructor(
		el: DirectiveHTMLElement,
		vnode: VNode,
		options: ObserverOptions,
		url: string
	) {
		this.saveDomMessage(el, url);
		this.el = el;
		this.vnode = vnode;
		this.oberserOptions = options;
		this.subscribeOberser();
	}
	public saveDomMessage(el: DirectiveHTMLElement, url: string): this {
		if (el.tagName !== 'IMG') throw new Error('this dom is not img');
		el.setAttribute('data-lazy', el.src);
		if (url) {
			el.src = url;
		} else {
			el.src = bitmap;
		}
		return this;
	}
	public subscribeOberser(): this {
		if (!this.vnode.context || !this.vnode.context.$root) return this;
		this.root = this.vnode.context.$root;
		if (!this.root.$ObserverInview) {
			this.root.$ObserverInview = new ObserverInview(
				callback,
				this.oberserOptions
			);
		}
		this.root.$ObserverInview.subscribe(this.el);
		this.observerInview = this.root.$ObserverInview;
		return this;
	}
	public destroy(): this {
		this.observerInview.unSubscribe(this.el);
		return this;
	}
}

export interface DirectiveHTMLElement extends HTMLImageElement {
	oberserDom?: OberserDom;
	'data-lazy': string;
}

export interface Value {
	oberserOptions?: ObserverOptions;
	url: string;
}
export interface Binding {
	value?: Value;
}

const polymerization = (
	el: DirectiveHTMLElement,
	binding: Binding,
	vnode: VNode
) => {
	if (!el.oberserDom) {
		let oberserOptions = {};
		let url = '';
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
const directive: any = {
	bind: function(
		el: DirectiveHTMLElement,
		binding: Binding,
		vnode: VNode
	) {
		polymerization(el, binding, vnode);
	},
	unbind(el: DirectiveHTMLElement) {
		if (!el.oberserDom) return;
		el.oberserDom.destroy();
		delete el.oberserDom;
	}
};

const VueImgLazyLoad = {
	install(Vue: VueConstructor) {
		Vue.directive('img-lazy-load', directive);
	}
};

export default VueImgLazyLoad;
