export default function Loader({ fullScreen = false, size = 38 }) {
  const spinner = (
    <div
      className="loader-spinner"
      style={{ width: size, height: size }}
    />
  );

  if (fullScreen) {
    return (
      <div className="loader-fullscreen">
        <div style={{ textAlign: 'center' }}>
          {spinner}
          <p style={{ marginTop: 16, color: 'var(--text-muted)', fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-center" style={{ padding: '40px' }}>
      {spinner}
    </div>
  );
}
