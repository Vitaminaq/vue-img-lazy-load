为了提升页面响应速度，优化用户体验，可以适当的减轻页面首次加载的压力，可以使用图片懒加载。  
In order to improve the page response speed and optimize the user experience, it can reduce the pressure of the first page loading appropriately. You can use the image lazy loading.
</br>
![https://img.shields.io/npm/v/vue-images-lazy-load.svg?label=vue-images-lazy-load](https://img.shields.io/npm/v/vue-images-lazy-load.svg?label=vue-images-lazy-load)  ![总下载量](https://img.shields.io/npm/dt/vue-images-lazy-load.svg)
    
### 安装/Install
```bash
npm install vue-images-lazy-load --save
```
### 使用/Use
#### main.js
```bash
import VueImgLazyLoad from 'vue-images-lazy-load';
Vue.use(VueImgLazyLoader);
```
最开始的名字有冲突，所以使用了vue-images-lazy-load  
The initial name was conflicting, so vue-images-lazy-load was used.

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
* oberserOptions: 观察者参数配置。  
  root: 元素相对于哪个父节点可见,默认为整个视窗。  
  rootMargin：可以区域范围，比如："0px 0px 10px 0px",则为元素离root底部10px被视为可见。  
  threshold(0-1)： 元素达到root的百分比被视为可见。
* oberserOptions: Observer parameter configuration.  
  root: The element is visible relative to which parent node and defaults to the entire window.  
  rootMargin: You can have area scopes, such as "0px 0px 10px 0px", where the element is considered visible 10 px away from the bottom of the root.  
  threshold (0-1): The percentage of elements reaching root is considered visible.
```bash html
<img :src="baseUrl" v-img-lazy-load="{
    oberserOptions: {
        root: null,
		    rootMargin: '0px',
		    threshold: 0
    }}"
 />
```
