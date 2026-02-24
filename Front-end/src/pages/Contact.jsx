export default function PlaceholderPage({ title }) {
    return (
        <div style={{
            padding: '100px 20px',
            textAlignment: 'center',
            color: 'white',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)'
        }}>
            <h1 style={{ color: '#c9c3c3ff', fontSize: '3rem' }}>{title}</h1>
            <p style={{ color: '#000000ff', fontSize: '1.5rem', opacity: 0.7 }}>en desarrollo :)</p>
        </div>
    );
}