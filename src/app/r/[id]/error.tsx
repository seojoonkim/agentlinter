'use client'
export default function Error({ error, reset }: { error: Error, reset: () => void }) {
  return <div><h2>{error.message}</h2><pre>{error.stack}</pre><button onClick={reset}>Retry</button></div>
}
