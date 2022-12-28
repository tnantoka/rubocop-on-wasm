require 'bundler/inline'
gemfile do 
  source 'https://rubygems.org'

  gem 'ast', '2.4.2'
  gem 'json', '2.6.3'
  gem 'parallel', '1.22.1'
  gem 'parser', '3.1.3.0'
  gem 'rainbow', '3.1.1'
  gem 'regexp_parser', '2.6.1'
  gem 'rubocop', '1.41.1'
  gem 'rubocop-ast', '1.24.0'
  gem 'ruby-progressbar', '1.11.0'
  gem 'unicode-display_width', '2.3.0'
end

require 'rubocop'
