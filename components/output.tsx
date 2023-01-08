import React from 'react';
import AceEditor from "react-ace";
import ReactDiffViewer from 'react-diff-viewer-continued';

type Props = {
  mainRb: string;
  output: any;
  error: string | null;
}

export const Output: React.FC<Props> = ({
  mainRb,
  output,
  error,
}) => {
  const [tab, setTab] = React.useState(0);

  return (
    <div className="col-sm">
      <div className="d-flex justify-content-between align-items-end">
        <ul className="nav nav-tabs border-0">
          {['Output', 'Corrected', 'Diff'].map((label, i) => (
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

        <div className="d-flex align-self-stretch align-items-center">
          {output !== null &&
            <p className="mb-0">
              {output.json.summary.offense_count} offenses
              <small className="ms-1 text-muted">(RuboCop {output.json.metadata.rubocop_version})</small>
            </p>
          }
        </div>
      </div>
      {output === null ? (
        <div className="position-relative z-1 font-monospace bg-light p-3 small border">
          {error === null ? (
            'No output'
          ) : (
            <span className="text-danger">{error}</span>
          )}
        </div>
      ) : (
        <>
          <div className={`${tab !== 0 && 'd-none'}`}>
            <ul className="list-unstyled position-relative z-1 font-monospace bg-light p-3 small border" >
              {// @ts-ignore
              output.json.files.map(({ offenses }: any) => (
                // @ts-ignore
                offenses.map(({ message, location, severity, correctable }, i) => (
                  <li key={i}>
                   {location.line }:{location.column} {severity[0].toUpperCase()}
                   : {correctable && '[Correctable] '}{message}
                 </li>
                ))
              ))}
            </ul>
          </div>
          <div className={`${tab !== 1 && 'd-none'}`}>
            <AceEditor
              mode="ruby"
              theme="github"
              value={output.corrected}
              name="main-rb"
              fontSize={'1rem'}
              className="border w-100"
              setOptions={{
                tabSize: 2,
                useWorker: false,
              }}
              readOnly
            />
          </div>
          <div className={`${tab !== 2 && 'd-none'} border position-relative z-1`}>
            <ReactDiffViewer
              oldValue={mainRb}
              newValue={output.corrected}
              splitView={false}
            />
          </div>
        </>
      )}
    </div>
  );
};
