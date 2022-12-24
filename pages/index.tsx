import Head from 'next/head'
import { Example } from '../components/example'

export default function Home() {
  return (
    <>
      <Head>
        <title>Rubocop on Wasm</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Example />
      </main>
    </>
  )
}
