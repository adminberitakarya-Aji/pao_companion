export default function HomePage() {
  return (
    <main style={{ padding: "3rem", fontFamily: "sans-serif" }}>
      <h1>PAO Companion</h1>
      <p>Web app skeleton — Phase 0 bootstrap.</p>
      <p>
        API health check:{" "}
        <code>{process.env.NEXT_PUBLIC_API_URL}/health</code>
      </p>
    </main>
  );
}
