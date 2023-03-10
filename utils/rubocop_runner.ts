import { RubyVM } from "ruby-head-wasm-wasi";

import { initVM, runVM } from '../utils/wasm_helpers';

type Props = {
  setReady: (readly: boolean) => void;
  setOutput: (output: any) => void;
  setRunning: (running: boolean) => void;
  setError: (error: string | null) => void;
}

export class RubocopRunner {
  private vm: RubyVM | null = null;
  private vmWorker: Worker | null = null;
  private props: Props;
 
  constructor(props: Props) {
    this.props = props;

    if (this.withWorker) {
      this.initWithWorker();
    } else {
      // FIXME: Safari
      //        Unhandled Promise Rejection: RangeError: Maximum call stack size exceeded.
      this.initWithoutWorker();
    }
  }

  terminate() {
    this.vmWorker?.terminate(); 
  }

  private get isSafari() {
    const { userAgent } = navigator;
    return userAgent.indexOf('Safari') !== -1 && navigator.userAgent.indexOf('Chrome') === -1;
  }

  private get withWorker() {
    return !this.isSafari;
  }

  private initWithWorker() {
    const vmWorker = new Worker(new URL('../workers/vm-worker', import.meta.url));
    vmWorker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'init':
          this.props.setReady(true);
          this.props.setError(null);
          break;
        case 'run':
          this.props.setOutput(e.data.output);
          this.props.setRunning(false);
          this.props.setError(null);
          break;
        case 'error':
          this.props.setRunning(false);
          this.props.setError(e.data.error);
          break;
      }
    });

    vmWorker.postMessage({ type: 'init' });
    this.vmWorker = vmWorker;
  }

  private async initWithoutWorker() {
    try {
      const vm = await initVM();
      this.vm = vm;
      this.props.setReady(true);
    } catch (error) {
      // @ts-ignore
      this.props.setError(error);
    }
  }

  async run(mainRb: string, rubocopYml: string) {
    this.props.setOutput(null);
    this.props.setRunning(true);
    if (this.withWorker) {
      this.vmWorker?.postMessage({ type: 'run', mainRb, rubocopYml });
    } else {
      console.info('Running without worker...');
      try {
        if (this.vm) {
          const output = runVM(this.vm, mainRb, rubocopYml);
          this.props.setOutput(output);
          this.props.setRunning(false);
        }
      } catch (error) {
        this.props.setRunning(false);
        // @ts-ignore
        this.props.setError(error);
      }
    }
  }
}

