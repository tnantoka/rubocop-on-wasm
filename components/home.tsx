import React from 'react';
import { Layout } from './layout';
import defaultMainRb from '../ruby/main.rb';
import defaultRubocopYml from '../ruby/.rubocop.yml';

import { RubocopRunner } from '../utils/rubocop_runner';
import { Editor } from './editor';
import { Output } from './output';

import 'ace-builds/src-noconflict/mode-ruby';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-github';

export const Home = () => {
  const [ready, setReady] = React.useState(false);
  const [rubocopRunner, setRubocopRunner] = React.useState<any | RubocopRunner>(null);
  const [output, setOutput] = React.useState<any>(null);
  const [mainRb, setMainRb] = React.useState(defaultMainRb);
  const [rubocopYml, setRubocopYml] = React.useState(defaultRubocopYml);
  const [tab, setTab] = React.useState(0);
  const [running, setRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const loaded = React.useRef(false);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (loaded.current) {
        return;
      }
    
      loaded.current = true;
    }

    const rubocopRunner = new RubocopRunner({ setReady, setOutput, setRunning, setError });
    setRubocopRunner(rubocopRunner);
  
    return () => {
      if (loaded.current) {
        return;
      }

      rubocopRunner.terminate();
    };
  }, []);

  const run = React.useCallback(() => {
    (async () => {
      await rubocopRunner.run(mainRb, rubocopYml);
    })();
  }, [rubocopRunner, mainRb, rubocopYml]);

  return (
    <Layout>
      {ready ? (
        <div className="row mt-3">
          <Editor
            setMainRb={setMainRb}
            setRubocopYml={setRubocopYml}
            run={run}
            mainRb={mainRb}
            rubocopYml={rubocopYml}
            running={running}
          />
          <Output
            output={output}
            error={error}
            mainRb={mainRb}
          />
        </div>
      ) : (
        <div className="d-flex align-items-center">
          {error === null ? (
            <>
              <div className="spinner-grow" role="status" />
              <span className="ms-2">Loading...</span>
            </>
          ) : (
            <div className="text-danger">{error}</div>
          )}
        </div>
      )}
    </Layout>
  );
};
