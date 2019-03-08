// 避免浏览器重排,文档请参照：https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver

import IntersectionOberserPolyfill from './intersection-observer-polyfill';
export interface ObserverOptions {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number | number[];
}
export type Callback = (entries: IntersectionObserverEntry[]) => any;
export default class ObserverInview {
	private options: ObserverOptions = {
		root: null,
		rootMargin: '0px',
		threshold: 0
	};
	public intersectionObserver: IntersectionObserver = {} as IntersectionObserver;
	public intersectionOberserPolyfill: IntersectionOberserPolyfill = {} as IntersectionOberserPolyfill;
	public root: any;
	public constructor(callback: Callback, options?: ObserverOptions) {
		Object.assign(this.options, options);
		this.createObserver(callback);
	}
	/**
	 * 创建观察者
	 * @param callback
	 */
	public createObserver(callback: Callback) {
		this.intersectionOberserPolyfill = new IntersectionOberserPolyfill();
		this.intersectionObserver = new IntersectionObserver(
			(entries: IntersectionObserverEntry[]) => {
				return callback(entries);
			},
			this.options
		);
	}
	/**
	 * 订阅观察者
	 */
	public subscribe(target: Element) {
		this.intersectionObserver.observe(target);
	}
	/**
	 * 取消单个订阅
	 */
	public unSubscribe(target: Element) {
		this.intersectionObserver.unobserve(target);
	}
	/**
	 * 清除所有订阅
	 */
	public remove() {
		this.intersectionObserver.disconnect();
		delete this.intersectionObserver;
		delete this.intersectionOberserPolyfill;
	}
}
