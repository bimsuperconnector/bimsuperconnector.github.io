import { Container } from '../components/ui/Container';

export function PendingPage() {
  return (
    <section className="py-section">
      <Container className="flex justify-center">
        <div className="w-full max-w-[480px] rounded-md border border-hairline p-xl text-center">
          <h1 className="text-title-lg text-ink">Your account is pending review</h1>
          <p className="mt-sm text-body-md text-body">
            An admin needs to confirm your alumni status before you can see
            the private directory. This usually doesn't take long — check
            back soon.
          </p>
        </div>
      </Container>
    </section>
  );
}
