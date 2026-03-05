'use client'
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  return (
    <html><body>
      <h2>Error: {error.message}</h2>
      <pre style={{whiteSpace:'pre-wrap',wordBreak:'break-word'}}>{error.stack}</pre>
      <button onClick={reset}>Try again</button>
    </body></html>
  )
}
