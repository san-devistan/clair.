export function AuthBackground() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-auth-glow" />
      <div className="pointer-events-none absolute inset-0 bg-auth-grid opacity-35" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-primary/10 to-transparent" />
    </>
  )
}
