import { createWidget } from 'discourse/widgets/widget';
import { h } from 'virtual-dom';

export default createWidget('basic-link-url', {
  tagName: 'div.basic-link-wrapper',
  buildKey: () => 'basic-link-url',

  html(attrs, state){
    var link = h('div.basic-link', attrs.basic_link_url.toString());
    return [link];
  }
});