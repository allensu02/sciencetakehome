type ConsentScreenProps = {
  onContinue: () => void;
};

export function ConsentScreen({ onContinue }: ConsentScreenProps): JSX.Element {
  return (
    <main className="panel consent">
      <div className="brand-lockup" aria-label="Science Corporation">
        <span className="science-mark" aria-hidden="true" />
        <span>Science</span>
      </div>
      <p className="eyebrow">Research consent</p>
      <h1>BCI bit-rate typing study</h1>
      <p>
        This task records only the data needed to score and analyze the 60-second session.
        Participation is voluntary.
      </p>
      <div className="consent-grid">
        <section>
          <h2>Recorded</h2>
          <ul>
            <li>Keystrokes typed in the task</li>
            <li>Event timestamps from performance.now()</li>
            <li>Name</li>
            <li>Selected condition and generated targets</li>
            <li>Final score metrics</li>
          </ul>
        </section>
        <section>
          <h2>Not recorded by this app</h2>
          <ul>
            <li>No IP address in the payload</li>
            <li>No browser fingerprinting</li>
            <li>No user agent in the payload</li>
            <li>No audio</li>
            <li>No video</li>
            <li>No free-form text outside the subject ID field</li>
          </ul>
        </section>
      </div>
      <p className="muted">
        Data is used only for this research project and will be deleted afterward.
      </p>
      <button className="primary" onClick={onContinue}>I understand, continue</button>
    </main>
  );
}
