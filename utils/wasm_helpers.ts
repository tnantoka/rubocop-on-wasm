
import { RubyVM } from "ruby-head-wasm-wasi";
import { WASI } from "@wasmer/wasi";
import { WasmFs } from "@wasmer/wasmfs";
import * as path from "path-browserify";

import bundle from '../static/bundle.rb';
import runRuboCop from '../static/run_rubocop.rb';
import stdlibCompat from '../static/irb.wasm/stdlib_compat.rb';
import rubygemsCompat from '../static/irb.wasm/rubygems_compat.rb';
import bundlerCompat from '../static/irb.wasm/bundler_compat.rb';

export const initVM = async () => {
  const vm = await createVM();
  await loadCompats(vm);
  await vm.evalAsync(bundle);
  return vm;
};

export const runVM = async (vm: RubyVM) => {
  return JSON.parse((await vm.evalAsync(runRuboCop)).toString());
};

const escapeCode = (code: string) => {
  return code.replace(/\\/g, '\\').replace(/\n/g, '\\n').replace(/"/g, '\\"');
};

const createVM = async () => {
  const res = await fetch('/irb.wasm');
  const buffer = new Uint8Array(await res.arrayBuffer());

  const wasmFs = new WasmFs();
  
  const originalWriteSync = wasmFs.fs.writeSync.bind(wasmFs.fs);
  const stdOutErrBuffers = { 1: "", 2: "" };
  wasmFs.fs.writeSync = function () {
    let fd: number = arguments[0];
    let text: string;
    if (arguments.length === 4) {
      text = arguments[1];
    } else {
      let buffer = arguments[1];
      text = new TextDecoder("utf-8").decode(buffer);
    }
    const handlers = {
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
    return originalWriteSync(...arguments);
  };
  
  const args = [
    "irb.wasm", "-e_=0", "-I/gems/lib"
  ];
  const vm = new RubyVM();
  wasmFs.fs.mkdirSync("/home/me", { mode: 0o777, recursive: true });
  wasmFs.fs.mkdirSync("/home/me/.gem/specs", { mode: 0o777, recursive: true });
  wasmFs.fs.writeFileSync("/dev/null", new Uint8Array(0));
  const wasi = new WASI({
    args,
    env: {
      "GEM_PATH": "/gems:/home/me/.gem/ruby/3.2.0+2",
      "GEM_SPEC_CACHE": "/home/me/.gem/specs",
      "RUBY_FIBER_MACHINE_STACK_SIZE": String(1024 * 1024 * 20),
    },
    preopens: {
      "/home": "/home",
      "/dev": "/dev",
    },
    bindings: {
      ...WASI.defaultBindings,
      fs: wasmFs.fs,
      path,
    }
  });

  const wrapWASI = (wasiObject) => {
    const original_clock_res_get = wasiObject.wasiImport["clock_res_get"];
    wasiObject.wasiImport["clock_res_get"] = (clockId, resolution) => {
      wasiObject.refreshMemory();
      return original_clock_res_get(clockId, resolution)
    };
    wasiObject.wasiImport["fd_fdstat_set_flags"] = (fd, flags) => {
      return 0;
    };
    return wasiObject.wasiImport;
  }
  const imports = {
    wasi_snapshot_preview1: wrapWASI(wasi),
  }
  vm.addToImports(imports)
  const { instance } = await WebAssembly.instantiate(buffer, imports);
  await vm.setInstance(instance);

  wasi.setMemory(instance.exports.memory as WebAssembly.Memory);
  (instance.exports._initialize as Function)();
  vm.initialize(args);

  return vm;
};

const loadCompats = async (vm: RubyVM) => {
  await vm.evalAsync(stdlibCompat);
  await vm.evalAsync(rubygemsCompat);
  await vm.evalAsync(bundlerCompat);
};
