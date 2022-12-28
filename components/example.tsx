import React from 'react';
import { RubyVM } from "ruby-head-wasm-wasi";
import { createVM, loadCompats } from '../utils/wasm_helpers';
import initVM from '../static/init_vm.rb';
import runRuboCop from '../static/run_rubocop.rb';

export const Example = () => {
  const [source, setSource] = React.useState(runRuboCop);
  const [vm, setVm] = React.useState<any | RubyVM>(null);

  React.useEffect(() => {
    (async () => {
      // @ts-ignore
      window.dontUseCache = process.env.NEXT_PUBLIC_DONT_USE_CACHE;
      const vm = await createVM();
      await loadCompats(vm);
      await vm.evalAsync(initVM);
      setVm(vm);
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
          disabled={vm === null}
        >
          Run
        </button>
      </p>
    </div>
  );
};
