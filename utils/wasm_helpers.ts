
import { RubyVM } from "ruby-head-wasm-wasi";
import { WASI } from "@wasmer/wasi";
import { WasmFs } from "@wasmer/wasmfs";
import * as path from "path-browserify";

import init from '../ruby/init.rb';
import runRuboCop from '../ruby/run_rubocop.rb';

interface GlobalThis {
  mainRb: string;
  rubocopYml: string;
}
declare var globalThis: GlobalThis;

export const initVM = async () => {
  const vm = await createVM();
  vm.eval(init);
  return vm;
};

export const runVM = (vm: RubyVM, mainRb: string, rubocopYml: string) => {
  globalThis.mainRb = mainRb;
  globalThis.rubocopYml = rubocopYml;

  return JSON.parse(vm.eval(runRuboCop).toString());
};

const escapeCode = (code: string) => {
  return code.replace(/\\/g, '\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
};

// NOTE: https://github.com/kateinoigakukun/irb.wasm/blob/1d6696ea1c6fa5206b7e6a0eab3468c409545c8c/src/irb-worker.ts
// NOTE: https://github.com/ruby/ruby.wasm/blob/5b09c8b546e15048b58164e1314f5809bbb9c723/packages/npm-packages/ruby-wasm-wasi/src/browser.ts
const createVM = async () => {
  const res = await fetch('/rubocop.wasm');
  const buffer = new Uint8Array(await res.arrayBuffer());

  const wasmFs = new WasmFs();
  
  const originalWriteSync = wasmFs.fs.writeSync.bind(wasmFs.fs);
  // @ts-ignore
  const stdOutErrBuffers: any = { 1: "", 2: "" };
  wasmFs.fs.writeSync = function () {
    let fd: number = arguments[0];
    let text: string;
    if (arguments.length === 4) {
      text = arguments[1];
    } else {
      let buffer = arguments[1];
      text = new TextDecoder("utf-8").decode(buffer);
    }
    // @ts-ignore
    const handlers: any = {
      1: (line: string) => console.log(line),
      2: (line: string) => console.warn(line),
    };
    if (handlers[fd]) {
      text = stdOutErrBuffers[fd] + text;
      let i = text.lastIndexOf("\n");
      if (i >= 0) {
        handlers[fd](text.substring(0, i + 1));
        text = text.substring(i + 1);
      }
      stdOutErrBuffers[fd] = text;
    }
    // @ts-ignore
    return originalWriteSync(...arguments);
  };
  
  const args = [
    "rubocop.wasm", "-e_=0", "-I/gems/lib"
  ];
  const vm = new RubyVM();
  wasmFs.fs.mkdirSync("/home/me", { mode: 0o777, recursive: true });
  const wasi = new WASI({
    args,
    preopens: {
      "/home": "/home",
    },
    bindings: {
      ...WASI.defaultBindings,
      fs: wasmFs.fs,
      path,
    }
  });

  const imports = {
    wasi_snapshot_preview1: wasi.wasiImport,
  }
  vm.addToImports(imports)
  const { instance } = await WebAssembly.instantiate(buffer, imports);
  await vm.setInstance(instance);

  wasi.setMemory(instance.exports.memory as WebAssembly.Memory);
  (instance.exports._initialize as Function)();
  vm.initialize(args);

  return vm;
};
