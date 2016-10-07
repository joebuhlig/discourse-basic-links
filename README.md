# discourse-basic-links

A Discourse plugin that lets you add a link to a topic. [Read more about this plugin on Discourse Meta](https://meta.discourse.org/t/basic-links-plugin/51222).
## Installation

To install using docker, add the following to your app.yml in the plugins section:

```
hooks:
  after_code:
    - exec:
        cd: $home/plugins
        cmd:
          - mkdir -p plugins
          - git clone https://github.com/joebuhlig/discourse-basic-links.git
```

and rebuild docker via

```
cd /var/discourse
./launcher rebuild app
```
