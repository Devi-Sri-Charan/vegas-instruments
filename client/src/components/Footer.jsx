import React from 'react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row">
          <div className="col-md-6 mb-3 mb-md-0">
            <h5 style={{ color: 'var(--text-white)', fontWeight: 600, marginBottom: '0.75rem' }}>
              Vegas Instruments
            </h5>
            <p style={{ color: 'var(--text-grey)', marginBottom: 0 }}>
              Precision. Performance. Professional.
            </p>
          </div>
          <div className="col-md-6 text-md-end">
            <div style={{ marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-grey)' }}>Email: </span>
              <a 
                href="mailto:contact@vega.com" 
                style={{ color: 'var(--accent-green)', textDecoration: 'none' }}
              >
                contact@vega.com
              </a>
            </div>
            <div>
              <span style={{ color: 'var(--text-grey)' }}>Phone: </span>
              <a 
                href="tel:+911234567890" 
                style={{ color: 'var(--accent-green)', textDecoration: 'none' }}
              >
                +91 12345 67890
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}