import React from 'react';
import { RubyVM } from "ruby-head-wasm-wasi";
import { initVM, runVM } from '../utils/wasm_helpers';
import { Layout } from './layout';
import defaultMainRb from '../static/main.rb';
import defaultRubocopYml from '../static/.rubocop.yml';

export const Home = () => {
  const [vm, setVm] = React.useState<any | RubyVM>(null);
  const [output, setOutput] = React.useState<any>(null);
  const [mainRb, setMainRb] = React.useState(defaultMainRb);
  const [rubocopYml, setRubocopYml] = React.useState(defaultRubocopYml);
  const [tab, setTab] = React.useState(0);
  const loaded = React.useRef(false);

  React.useEffect(() => {
    (async () => {
      if (process.env.NODE_ENV === 'development') {
        if (loaded.current) {
          return;
        }
      
        loaded.current = true;
      }

      // @ts-ignore
      window.dontUseCache = process.env.NEXT_PUBLIC_DONT_USE_CACHE;
      setVm(await initVM());
    })();
  }, []);

  const run = React.useCallback(() => {
    (async () => {
      try {
        setOutput(await runVM(vm));
      } catch (e) {
        console.error(e);
      }
    })();
  }, [vm]);

  return (
    <Layout>
      {vm === null ? (
        <div className="spinner-grow" role="status" />
      ) : (
        <>
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button className={`nav-link rounded-0 ${tab === 0 && 'active'}`} onClick={() => setTab(0)}>main.rb</button>
            </li>
            <li className="nav-item">
              <button className={`nav-link rounded-0 ${tab === 1 && 'active'}`} onClick={() => setTab(1)}>.rubocop.yml</button>
            </li>
          </ul>

          <div className="row mt-3">
            <div className="col">
              <p>
                <textarea
                  value={mainRb}
                  onChange={(e) => setMainRb(e.target.value)}
                  rows={20}
                  cols={50}
                  className={`main-rb ${tab !== 0 && 'd-none'}`}
                />
                <textarea
                  value={rubocopYml}
                  onChange={(e) => setRubocopYml(e.target.value)}
                  rows={20}
                  cols={50}
                  className={`rubocop-yml ${tab !== 1 && 'd-none'}`}
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
            <div className="col">
              {output !== null && (
                <ul className="list-unstyled font-monospace bg-light p-3 small">
                  {output.files.map(({ offenses }) => (
                    offenses.map(({ message, location, severity }, i) => (
                      <li key={i}>{location.line}:{location.column} {severity[0].toUpperCase()}: {message}</li>
                    ))
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </Layout>
  );
};
