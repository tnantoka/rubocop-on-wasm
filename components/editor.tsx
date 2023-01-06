import React from 'react';
import AceEditor from "react-ace";

type Props = {
  setMainRb: (mainRb: string) => void;
  setRubocopYml: (rubocopYml: string) => void;
  run: () => void;
  mainRb: string;
  rubocopYml: string;
  running: boolean;
}

export const Editor: React.FC<Props> = ({
  setMainRb,
  setRubocopYml,
  run,
  mainRb,
  rubocopYml,
  running,
}) => {
  const [tab, setTab] = React.useState(0);

  return (
    <div className="col-sm">
      <div className="d-flex justify-content-between align-items-end">
        <ul className="nav nav-tabs border-0">
          {['main.rb', '.rubocop.yml'].map((label, i) => (
            <li key={label} className="nav-item">
              <button
                className={`nav-link ${tab === i ? 'active bg-light' : 'text-dark'}`}
                onClick={() => setTab(i)}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <button
          onClick={run}
          className="btn btn-dark"
          disabled={running}
        >
          {running ? 'Running...' : 'Run'}
        </button>
      </div>

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
  );
};
