import React from 'react';
import { RubyVM } from "ruby-head-wasm-wasi";
import { DefaultRubyVM } from 'ruby-head-wasm-wasi/dist/browser.umd';

const DEFAULT_SOURCE = `puts 'hello'
puts 'world'
`;

export const Example = () => {
  const [source, setSource] = React.useState(DEFAULT_SOURCE);
  const [vm, setVm] = React.useState<any>(null);

  React.useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://cdn.jsdelivr.net/npm/ruby-head-wasm-wasi@0.5.0/dist/ruby+stdlib.wasm"
      );
      const buffer = await response.arrayBuffer();
      const mod = await WebAssembly.compile(buffer);

      const { vm } = await DefaultRubyVM(mod);
      setVm(vm);
    })();
  }, []);

  const run = React.useCallback(() => {
    (async () => {
      try {
        vm.eval(source);
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
          rows={10}
          cols={30}
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
