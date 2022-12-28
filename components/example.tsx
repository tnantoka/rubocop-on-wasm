import React from 'react';
import { RubyVM } from "ruby-head-wasm-wasi";
import { createVM } from '../utils/wasm_helpers';

const DEFAULT_SOURCE = `require 'bundler/inline'
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

tmp = '/home/me/tmp'
output = "#{tmp}/output"
input = "#{tmp}/input.rb"

FileUtils.mkdir_p(tmp)
File.write(input, "class Input\nend")

require 'rubocop'
options = { formatters: [['json', output]] } 
config_store = RuboCop::ConfigStore.new
runner = RuboCop::Runner.new(options, config_store)

retried = false 
begin
  runner.run([tmp])
rescue Errno::ENOENT
  unless retried
    retried = true
    retry
  end
  raise
end

puts JSON.pretty_generate(JSON.parse(File.read(output)))
`;

export const Example = () => {
  const [source, setSource] = React.useState(DEFAULT_SOURCE);
  const [vm, setVm] = React.useState<any | RubyVM>(null);

  React.useEffect(() => {
    (async () => {
      // @ts-ignore
      window.dontUseCache = process.env.NEXT_PUBLIC_DONT_USE_CACHE;
      setVm(await createVM());
    })();
  }, []);

  const run = React.useCallback(() => {
    (async () => {
      try {
        vm.evalAsync(source);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [vm, source]);

  return (
    <div>
      <p>
        <textarea
          value={source}
          onChange={(e) => setSource(e.target.value)}
          rows={20}
          cols={50}
        />
      </p>
      <p>
        <button
          onClick={run}
        >
          Run
        </button>
      </p>
    </div>
  );
};
