# name: discourse-basic-links
# about: Adds the ability to add links to topics
# version: 0.1
# author: Joe Buhlig joebuhlig.com
# url: https://github.com/joebuhlig/discourse-basic-links

enabled_site_setting :basic_links_enabled


after_initialize do

	class ::Category
		after_save :reset_basic_link_cache

		protected
		def reset_basic_link_cache
			::Guardian.reset_basic_link_cache
		end
	end

	class ::Guardian

		@@allowed_basic_link_cache = DistributedCache.new("allowed_basic_links")

		def self.reset_basic_link_cache
			@@allowed_voting_cache["allowed"] =
			begin
				Set.new(
				CategoryCustomField
				.where(name: "enable_basic_links", value: "true")
				.pluck(:category_id)
				)
			end
		end
	end

	require_dependency 'topic'
    class ::Topic

    	def can_add_basic_link
			self.category.respond_to?(:custom_fields) and SiteSetting.basic_links_enabled and self.category.custom_fields["enable_basic_links"].eql?("true")
		end

		def basic_link_url
			self.custom_fields["basic_link_url"]
		end

    end

	require_dependency 'topic_view_serializer'
	class ::TopicViewSerializer
		attributes :basic_link_url, :can_add_basic_link

		def basic_link_url
			object.topic.basic_link_url
		end

		def can_add_basic_link
			object.topic.can_add_basic_link
		end

	end

	add_to_serializer(:topic_list_item, :basic_link_url) { object.basic_link_url }
	add_to_serializer(:topic_list_item, :can_add_basic_link) { object.can_add_basic_link }

    TopicList.preloaded_custom_fields << "basic_link_url" if TopicList.respond_to? :preloaded_custom_fields

end