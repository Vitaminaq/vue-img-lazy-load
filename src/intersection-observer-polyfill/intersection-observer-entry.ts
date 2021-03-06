/**
 * 构造IntersectionObserverEntry类
 */
export default class IntersectionObserverEntry {
	time;
	target;
	rootBounds;
	boundingClientRect;
	intersectionRect;
	isIntersecting;
	intersectionRatio;
	constructor(entry) {
		this.init(entry);
	}
	init(entry) {
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
		} else {
			this.intersectionRatio = this.isIntersecting ? 1 : 0;
		}
	}
}
