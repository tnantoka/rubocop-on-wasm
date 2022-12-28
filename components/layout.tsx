import React from 'react';
import Link from 'next/link';

type Props = {
  children: React.ReactNode;
};

export const Layout: React.FC<Props> = ({ children }) => {
  return (
    <>
      <nav className="navbar navbar-expand border-bottom">
        <div className="container-fluid">
          <Link className="navbar-brand" href="/">RuboCop on Wasm</Link>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <a className="nav-link" href="https://github.com/tnantoka/rubocop-on-wasm">GitHub</a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="mt-3 container-fluid">
        {children}

        <footer className="mt-5 mb-4">
          <a href="https://twitter.com/tnantoka">@tnantoka</a>
        </footer>
      </div>
    </>
  );
};
