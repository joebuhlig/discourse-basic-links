# name: discourse-basic-links
# about: A Discourse plugin that lets you add links to topics
# version: 0.1
# authors: Joe Buhlig
# url: https://www.github.com/joebuhlig/discourse-basic-links

register_asset 'stylesheets/basic-links.scss'

enabled_site_setting :basic_links_enabled

after_initialize do

	Category.register_custom_field_type('basic_links_enabled', :boolean)

	module ::DiscourseBasicLinks
		class Engine < ::Rails::Engine
			engine_name "discourse_basic_links"
			isolate_namespace DiscourseBasicLinks
		end
	end

	require_dependency "application_controller"
	class DiscourseBasicLinks::LinksController < ::ApplicationController
		def link
			topic = Topic.find(params[:id].to_i)
			topic.custom_fields["basic_links_url"] = params[:url].to_s
			topic.save!
			render json: success_json
		end

	end

	DiscourseBasicLinks::Engine.routes.draw do
		post "/link" => "links#link"
	end

	Discourse::Application.routes.append do
		mount ::DiscourseBasicLinks::Engine, at: "basic-links"
	end

	TopicList.preloaded_custom_fields << "basic_links_url" if TopicList.respond_to? :preloaded_custom_fields

	require 'topic_view_serializer'
	class ::TopicViewSerializer
		attributes :basic_links_url, :can_add_link, :basic_links_domain

		def basic_links_url
			object.topic.custom_fields["basic_links_url"]
		end

		def can_add_link
			return false if !scope.current_user

			return object.topic.category.respond_to?(:custom_fields) ? object.topic.category.custom_fields["basic_links_enabled"] : false 
		end

		def basic_links_domain
			basic_links_url = object.topic.respond_to?(:custom_fields) ? object.topic.custom_fields["basic_links_url"] : nil
			if basic_links_url
				uri = URI.parse(object.topic.custom_fields["basic_links_url"])
				return uri.host
			end
		end

	end

	require 'topic_list_item_serializer'
	class ::TopicListItemSerializer
		attributes :basic_links_url, :can_add_link, :basic_links_domain

		def basic_links_url
			object.custom_fields["basic_links_url"]
		end

		def can_add_link
			return false if !scope.current_user
			basic_links_enabled = CategoryCustomField.where(category_id: object.category_id, name: "basic_links_enabled").pluck('value')
			return basic_links_enabled.first == "true"
		end

		def basic_links_domain
			basic_links_url = object.respond_to?(:custom_fields) ? object.custom_fields["basic_links_url"] : nil
			if basic_links_url
				uri = URI.parse(object.custom_fields["basic_links_url"])
				return uri.host
			end
		end

	end

	## Add the new fields to the serializers
	add_to_serializer(:basic_category, :basic_links_enabled) {object.custom_fields["basic_links_enabled"]}

end
