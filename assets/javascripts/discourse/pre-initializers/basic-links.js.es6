import Topic from 'discourse/models/topic';
import TopicController from 'discourse/controllers/topic';
import TopicRoute from 'discourse/routes/topic';
import ComposerController from 'discourse/controllers/composer';
import ComposerView from 'discourse/views/composer';
import Composer from 'discourse/models/composer';
import Post from 'discourse/models/post';
import { registerUnbound } from 'discourse-common/lib/helpers';
import { popupAjaxError } from 'discourse/lib/ajax-error';
import { withPluginApi } from 'discourse/lib/plugin-api';
import { ajax } from 'discourse/lib/ajax';

export default {
  name: 'basic-links',
  initialize(){

    withPluginApi('0.1', api => {
      api.includePostAttributes('rating')
    });

    TopicController.reopen({
      refreshAfterTopicEdit: false,

      showBasicLinksInput: function() {
        return true
      }.property('model.basic_links_url', 'buffered.category_id', 'buffered.tags'),

      refreshTopic: function() {
        if (!this.get('editingTopic') && this.get('refreshAfterTopicEdit')) {
          this.send('refreshTopic')
          this.set('refreshAfterTopicEdit', false)
        }
      }.observes('editingTopic')

    })

    TopicRoute.reopen({
      actions: {
        refreshTopic: function() {
          this.refresh();
        }
      }
    })

    Post.reopen({
      setRatingWeight: function() {
        if (!this.get('topic.show_ratings')) {return}
        var id = this.get('id'),
            weight = this.get('deleted') ? 0 : 1;
        ajax("/rating/weight", {
          type: 'POST',
          data: {
            id: id,
            weight: weight
          }
        }).catch(function (error) {
          popupAjaxError(error);
        });
      }.observes('deleted')
    })

    ComposerController.reopen({
      rating: null,
      refreshAfterPost: false,
      basicLinksPlaceholder: I18n.t("basic_links.placeholder"),

      actions: {

        save() {
          var show = this.get('showBasicLinksInput');
          var model = this.get('model'),
              topic = model.get('topic'),
              post = model.get('post');
          var url = this.get('basic_links_url');
          if (show && !url) {
            return bootbox.alert(I18n.t("basic_links.composer.missing_link"))
          }
          if (topic && post && post.get('firstPost') &&
              (model.get('action') === Composer.EDIT) && (topic.can_add_link !== show)) {
            this.set('refreshAfterPost', true)
          }
          this.save()
        }

      },

      close() {
        this.setProperties({ model: null, lastValidatedAt: null, basic_links_url: null });
        if (this.get('refreshAfterPost')) {
          this.send("refreshTopic")
          this.set('refreshAfterPost', false)
        }
      },

      showBasicLinksInput: function() {
        var model = this.get('model')
        if (!model) {return false}
        var topic = model.get('topic'),
            post = model.get('post'),
            firstPost = Boolean(post && post.get('firstPost'));
        if ((firstPost && topic.can_add_link) || !topic) {
          var category = this.site.categories.findProperty('id', model.get('categoryId'));
          return Boolean(category && category.basic_links_enabled);
        }
        if (topic.can_add_link && (model.get('action') !== Composer.REPLY)) {return true}
        if (model && model.get('categoryId') && (model.get('action') !== Composer.REPLY) && this.site.categories.findProperty('id', model.get('categoryId')).basic_links_enabled){return true}
        return Boolean(topic.can_add_link && (model.get('action') === Composer.EDIT))
      }.property('model.topic', 'model.categoryId', 'model.tags', 'model.post'),

      setBasicLinksURL: function() {
        var model = this.get('model');
        if (!model || this.get('model.action') !== Composer.EDIT) {return null}
        var topic = model.get('topic');
        if (topic && !this.get('basic_links_url') && this.get('showBasicLinksInput')) {
          this.set('basic_links_url', topic.basic_links_url);
        }
      }.observes('model.post', 'showBasicLinksInput'),

      saveLinkAfterCreating: function() {
        if (!this.get('showBasicLinksInput')) {return}
        var topic = this.get('model.topic');
        if (this.get('model.action') !== Composer.CREATE_TOPIC
            || this.get('model.composeState') !== Composer.CLOSED) {return}
        this.saveLink(this.get('model.createdPost.topic_id'), this.get('basic_links_url'))
      }.observes('model.createdPost'),

      saveLinkAfterEditing: function() {
        if (!this.get('showBasicLinksInput')
            || this.get('model.action') !== Composer.EDIT
            || this.get('model.composeState') !== Composer.SAVING) {return}
        var topic = this.get('model.topic');
        if (!topic) {return}
        var basic_links_url = this.get('basic_links_url');
        if (basic_links_url) {
          this.saveLink(topic.id, basic_links_url)
        }
      }.observes('model.composeState'),

      saveLink: function(topic_id, basic_links_url) {
        console.log("***********saveLink***********");
        var topic = this.topic;
        if (!topic){
          var topic_id = topic_id;
        }
        else{
          topic.set('basic_links_url', basic_links_url);
          var topic_id = topic.id;
        }
        console.log(topic_id);
        console.log(basic_links_url);
        ajax("/basic-links/link", {
          type: 'POST',
          data: {
            id: topic_id,
            url: basic_links_url
          }
        }).catch(function (error) {
          popupAjaxError(error);
        });
      }

    })

    ComposerView.reopen({
      resizeIfShowBasicLinksInput: function() {
        if (this.get('composeState') === Composer.OPEN) {
          this.resize()
        }
      }.observes('controller.showBasicLinksInput')
    })

  }
}
