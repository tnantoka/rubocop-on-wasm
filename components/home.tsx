import React from 'react';
import AceEditor from "react-ace";
import { Layout } from './layout';
import defaultMainRb from '../ruby/main.rb';
import defaultRubocopYml from '../ruby/.rubocop.yml';

import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';
import { initVM, runVM } from '../utils/wasm_helpers';

export const Home = () => {
  const [ready, setReady] = React.useState(false);
  const [vmWorker, setVMWorker] = React.useState<any | Worker>(null);
  const [output, setOutput] = React.useState<any>(null);
  const [mainRb, setMainRb] = React.useState(defaultMainRb);
  const [rubocopYml, setRubocopYml] = React.useState(defaultRubocopYml);
  const [tab, setTab] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const loaded = React.useRef(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (loaded.current) {
        return;
      }
    
      loaded.current = true;
    }

    const vmWorker = new Worker(new URL('../workers/vm-worker', import.meta.url));
    vmWorker.addEventListener('message', (e) => {
      switch (e.data.type) {
        case 'init':
          setReady(true);
          break;
        case 'run':
          setOutput(e.data.output);
          setRunning(false);
          break;
      }
    });

    vmWorker.postMessage({ type: 'init' });
    
    setVMWorker(vmWorker);
  
    return () => {
      if (loaded.current) {
        return;
      }

      vmWorker.terminate();
    };
  }, []);

  const run = React.useCallback(() => {
    setOutput(null);
    setRunning(true);
    if (process.env.NEXT_PUBLIC_DONT_USE_WORKER) {
      (async () => {
        const vm = await initVM();
        const output = runVM(vm, mainRb, rubocopYml);
        setOutput(output);
        setRunning(false);
      })();
    } else {
      vmWorker.postMessage({ type: 'run', mainRb, rubocopYml });
    }
  }, [vmWorker, mainRb, rubocopYml]);

  return (
    <Layout>
      {ready ? (
        <>
          <div className="row mt-3">
            <div className="col-sm d-flex justify-content-between">
              <ul className="nav nav-pills">
                <li className="nav-item">
                  <button className={`nav-link rounded-0 ${tab === 0 && 'active'}`} onClick={() => setTab(0)}>main.rb</button>
                </li>
                <li className="nav-item">
                  <button className={`nav-link rounded-0 ${tab === 1 && 'active'}`} onClick={() => setTab(1)}>.rubocop.yml</button>
                </li>
              </ul>
              <button
                onClick={run}
                className="btn btn-secondary"
                disabled={running}
              >
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
            <div className="col-sm">
              {output !== null && (
                <div className="d-flex align-items-center h-100">
                  {output.summary.offense_count} offenses
                </div>
              )}
            </div>
          </div>

          <div className="row mt-3">
            <div className="col-sm">
              <div className={`${tab !== 0 && 'd-none'}`}>
                <AceEditor
                  mode="ruby"
                  theme="github"
                  value={mainRb}
                  onChange={setMainRb}
                  name="main-rb"
                  fontSize={'1rem'}
                  className="border w-100"
                  setOptions={{
                    tabSize: 2,
                    useWorker: false,
                  }} 
                />
              </div>
              <div className={` ${tab !== 1 && 'd-none'}`}>
                <AceEditor
                  mode="yaml"
                  theme="github"
                  value={rubocopYml}
                  onChange={setRubocopYml}
                  name="rubocop-yml"
                  fontSize={'1rem'}
                  className="border w-100"
                  setOptions={{
                    tabSize: 2,
                    useWorker: false,
                  }}
                />
              </div>
            </div>
            <div className="col-sm">
              <ul className= "list-unstyled font-monospace bg-light p-3 small" >
                {output === null ? (
                  <li>
                    No output
                  </li>
                ) : (
                   // @ts-ignore
                   output.files.map(({ offenses }: any) => (
                     // @ts-ignore
                     offenses.map(({ message, location, severity, correctable }, i) => (
                       <li key={i}>
                        {location.line }:{location.column} {severity[0].toUpperCase()}
                        : {correctable && '[Correctable] '}{message}
                      </li>
                     ))
                   ))
                )}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <div className="d-flex align-items-center">
          <div className="spinner-grow" role="status" />
          <span className="ms-2">Loading...</span>
        </div>
      )}
    </Layout>
  );
};
