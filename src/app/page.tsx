import Link from "next/link";

export default function HomePage() {
  return (
    <main className="gimme-landing">
      <div className="gimme-shell">
        <header className="gimme-header">
          <Link href="/" className="gimme-logo" aria-label="Gimmee home">
            Gimmee
          </Link>
          <p className="mono gimme-kicker">Claim travel compensation</p>
        </header>

        <section className="gimme-intro" aria-labelledby="gimme-title">
          <p className="mono gimme-eyebrow">Choose your journey</p>
          <h1 id="gimme-title">What are you travelling by?</h1>
          <p>We&apos;ll make it simple to get what you&apos;re owed.</p>
        </section>

        <section className="travel-choices" aria-label="Choose travel type">
          <Link href="/trains" className="travel-choice travel-choice-train">
            <div className="choice-art train-art" aria-hidden="true">
              <span className="train-cloud train-cloud-one" />
              <span className="train-cloud train-cloud-two" />
              <span className="train-sun" />
              <span className="train-track" />
              <span className="train-carriage">
                <span className="train-window train-window-one" />
                <span className="train-window train-window-two" />
                <span className="train-window train-window-three" />
                <span className="train-door" />
                <span className="train-light" />
                <span className="train-wheel train-wheel-one" />
                <span className="train-wheel train-wheel-two" />
              </span>
            </div>
            <div className="choice-copy">
              <span className="mono choice-number">01</span>
              <h2>Trains</h2>
              <span className="choice-action">Find a delayed journey <b>→</b></span>
            </div>
          </Link>

          <Link href="/flights" className="travel-choice travel-choice-flight">
            <div className="choice-art plane-art" aria-hidden="true">
              <span className="plane-cloud plane-cloud-one" />
              <span className="plane-cloud plane-cloud-two" />
              <span className="plane-sun" />
              <span className="plane-contrail plane-contrail-one" />
              <span className="plane-contrail plane-contrail-two" />
              <span className="plane-body">
                <span className="plane-wing" />
                <span className="plane-tail" />
                <span className="plane-window plane-window-one" />
                <span className="plane-window plane-window-two" />
                <span className="plane-window plane-window-three" />
              </span>
            </div>
            <div className="choice-copy">
              <span className="mono choice-number">02</span>
              <h2>Flights</h2>
              <span className="choice-action">Start a flight claim <b>→</b></span>
            </div>
          </Link>
        </section>
      </div>
    </main>
  );
}
