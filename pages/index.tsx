import Head from 'next/head';
import dynamic from 'next/dynamic';

const Home = dynamic(
  () => import('../components/home').then((mod) => mod.Home),
  { ssr: false }
);

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
