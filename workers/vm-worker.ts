import { RubyVM } from 'ruby-head-wasm-wasi';
import { initVM, runVM } from '../utils/wasm_helpers';

export {};

let vm: RubyVM;

self.addEventListener('message', async (e) => {
  switch (e.data.type) {
    case 'init':
      try {
        vm = await initVM();
        self.postMessage({ ...e.data });
      } catch (error) {
        console.error(error);
        self.postMessage({ type: 'error', error });
      }
      break;
    case 'run':
      try {
        const output = runVM(vm, e.data.mainRb, e.data.rubocopYml);
        self.postMessage({ ...e.data, output });
      } catch (error) {
        console.error(error);
        self.postMessage({ type: 'error', error });
      }
      break;
  }
});
