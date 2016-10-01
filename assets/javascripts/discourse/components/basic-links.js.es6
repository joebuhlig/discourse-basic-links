import computed from 'ember-addons/ember-computed-decorators';
import { observes, on } from 'ember-addons/ember-computed-decorators';
import StringBuffer from 'discourse/mixins/string-buffer';
import { selectedText } from 'discourse/lib/utilities';

// hack startsWith
function startsWith(string, searchString, position) {
  var position = position || 0;
  return string.substr(position, searchString.length) === searchString;
}

export default Ember.Component.extend(StringBuffer, {
  tagName: 'a',
  classNameBindings: ['url:basic-link:invisible'],
  attributeBindings: ['url:href', 'target', 'rel'],
  rel: 'nofollow',

  renderString(buffer) {
    buffer.push(this.get('domain'));
  },

  @computed('topic.basicLink', 'link')
  url(basicLink, link) {
    return basicLink || link;
  },

  @computed('url')
  domain(url) {
    if (!url) return '';

    if (url.indexOf("://") > -1) {
      url = url.split('/')[2];
    } else {
      url = url.split('/')[0];
    }

    url = url.split(':')[0];

    // www is too frequent, truncate it
    if (url && startsWith(url, 'www.')) {
      url = url.replace('www\.', '');
    }

    return url;
  },

  @computed('url')
  target(url) {
    return this.siteSettings.basic_links_open_in_external_tab ? '_blank' : null;
  }
});