为了提升页面响应速度，优化用户体验，可以适当的减轻页面首次加载的压力，可以使用图片懒加载。  
In order to improve the page response speed and optimize the user experience, it can reduce the pressure of the first page loading appropriately. You can use the image lazy loading.
</br>
[![https://img.shields.io/npm/v/vue-images-lazy-load.svg?label=vue-images-lazy-load](https://img.shields.io/npm/v/vue-images-lazy-load.svg?label=vue-images-lazy-load)](https://www.npmjs.com/package/vue-images-lazy-load)  ![总下载量](https://img.shields.io/npm/dt/vue-images-lazy-load.svg)
    
### 安装/Install
```bash
npm install vue-images-lazy-load --save
```
### 使用/Use
#### 全局注册/Global registration (main.js)
```javascript
import VueImgLazyLoad from 'vue-images-lazy-load';
// default
Vue.use(VueImgLazyLoader);
// options
Vue.use(VueImgLazyLoader, {
    observerOptions: {
	rootMargin: '0px 0px -400px 0px',
	threshold: 0.5
    },
    delayTime: 1000
});
```
##### options
* oberserOptions: 观察者参数配置。  
rootMargin：可以区域范围，比如："0px 0px -100px 0px",则为元素超出视窗底部100px被视为可见；默认'0px'  
threshold(0-1)： 元素达到视窗设置的rootMargin，还要加上自身的百分比被视为可见；默认0
#### tips
最开始的名字有冲突，所以使用了vue-images-lazy-load  
The initial name was conflicting, so vue-images-lazy-load was used.  
#### 局部注册/Partial registration (*.vue)
```javascript
import { directive } from 'vue-images-lazy-load';
directives: {
    'img-lazy-load': directive
}
```
#### *.vue
##### 使用默认配置/use default config
```bash
<img :src="baseUrl" v-img-lazy-load />
```
#### 参数配置/Parameter configuration
* url:替换插件默认的展位图，格式请用base64格式，或者提起解析好的(require,import)，或者cdn地址  
url: Replace the default booth map of the plug-in, in base64 format, or mention parsed(require,import) or CDN address.
```html
<img :src="baseUrl" v-img-lazy-load="{url: ''}" />
```
