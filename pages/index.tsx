import Head from 'next/head';
import { Home } from '../components/home';

export default function HomePage() {
  return (
    <>
      <Head>
        <title>Rubocop on Wasm</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Home />
      </main>
    </>
  );
}
