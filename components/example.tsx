import React from 'react';
import { RubyVM } from "ruby-head-wasm-wasi";
import { createVM } from '../utils/wasm_helpers';

const DEFAULT_SOURCE = `require 'bundler/inline'
gemfile do 
  source 'https://rubygems.org'
  gem 'rubocop', '1.41.1'
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
