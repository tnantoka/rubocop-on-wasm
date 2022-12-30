import { RubyVM } from 'ruby-head-wasm-wasi';
import { initVM, runVM } from '../utils/wasm_helpers';

export {};

let vm: RubyVM;

self.addEventListener('message', async (e) => {
  switch (e.data.type) {
    case 'init':
      vm = await initVM();
      self.postMessage({ ...e.data });
      break;
    case 'run':
      // @ts-ignore
      self.mainRb = e.data.mainRb;
      // @ts-ignore
      self.rubocopYml = e.data.rubocopYml;

      const output = runVM(vm);
      self.postMessage({ ...e.data, output });
      break;
  }
});
