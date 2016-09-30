import { withPluginApi } from 'discourse/lib/plugin-api';

function  startLinking(api){
	api.decorateWidget('header-topic-info:after', h => {
		return h.attach('basic-link-url', h.attrs);
	});
}

export default {
  name: 'basic_links',
  initialize: function() {
    withPluginApi('0.1', api => startLinking(api));
  }
}