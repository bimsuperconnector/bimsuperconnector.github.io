export function PhasePlaceholder({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="rounded-md border border-hairline p-xl">
      <h1 className="text-title-lg text-ink">{title}</h1>
      <p className="mt-sm text-body-md text-body">
        This section is part of the SuperConnector routing shell. Its real
        functionality is built in {phase}.
      </p>
    </div>
  );
}
