import Vue, { VNode, VueConstructor } from 'vue';
import { DirectiveBinding } from 'vue/types/options';
import ObserverInview, { ObserverOptions } from './observer-inview';
import bitmap from './images/bitmap';

/**
 * v-img-lazy-load指令封装，用于图片懒加载
 */

export interface VueRoot extends Vue {
	$ObserverInview?: ObserverInview;
}
export interface Options {
	observerOptions: ObserverOptions;
	delayTime: number;
}
const timers: any = {};
let observerOptions: ObserverOptions;
let delayTime: number;

const callback = (entire: IntersectionObserverEntry[]) => {
	entire.forEach((item: any, index: number) => {
		if (
			item.isIntersecting ||
			(item.intersectionRatio > observerOptions &&
				observerOptions.threshold) ||
			0
		) {
			const src = item.target.getAttribute('data-lazy');
			if (item.target.src === src) return;
			const key = `key${index + 1}${item.intersectionRect.top}
				${item.intersectionRect.bottom}${item.time}`;
			timers[key] = setTimeout(() => {
				item.target.src = src;
				clearTimeout(timers[key]);
				delete timers[key];
			}, delayTime || Math.random() * 500);
		}
	});
	return;
};
/**
 * 观察者类，用于监听dom节点是否可见
 */
class OberserDom {
	public el: DirectiveHTMLElement;
	public vnode: VNode;
	public root: VueRoot = {} as VueRoot;
	public observerInview: ObserverInview = {} as ObserverInview;
	constructor(el: DirectiveHTMLElement, vnode: VNode, url: string) {
		this.saveDomMessage(el, url);
		this.el = el;
		this.vnode = vnode;
		this.subscribeOberser();
	}
	public saveDomMessage(el: DirectiveHTMLElement, url: string): this {
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
		let options = {};
		Object.assign(options, observerOptions, {
			root: this.vnode.context.$root.$el
		});
		if (!this.root.$ObserverInview) {
			this.root.$ObserverInview = new ObserverInview(
				callback,
				observerOptions
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
	url: string;
}
export interface Binding {
	value?: Value;
}

const polymerization = (
	el: DirectiveHTMLElement,
	binding: DirectiveBinding,
	vnode: VNode
) => {
	if (!el.oberserDom) {
		const url = (binding.value && binding.value.url) || '';
		el.oberserDom = new OberserDom(el, vnode, url);
	}
};

export const directive: any = {
	inserted: function(
		el: DirectiveHTMLElement,
		binding: DirectiveBinding,
		vnode: VNode
	) {
		if (!/.(jpg|gif|png|jepg)/g.test(el.src)) {
			console.warn('this src is not img address');
			return;
		}
		if (el.tagName.toLocaleLowerCase() !== 'img')
			throw new Error('this dom is not img');
		polymerization(el, binding, vnode);
	},
	unbind(el: DirectiveHTMLElement) {
		if (!el.oberserDom) return;
		el.oberserDom.destroy();
		delete el.oberserDom;
	}
};

const VueImgLazyLoad = {
	install(Vue: VueConstructor, options: Options) {
		observerOptions = options && options.observerOptions;
		delayTime = options && options.delayTime;
		Vue.directive('img-lazy-load', directive);
	}
};

export default VueImgLazyLoad;
