import React from 'react';

export default function Footer() {
  return (
    <footer className="footer mt-5">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        <div>
          <h5>Vega Instruments</h5>
          <div>Precision. Performance. Professional.</div>
        </div>
        <div className="text-md-end mt-3 mt-md-0">
          <div>Email: <a href="mailto:contact@vega.com" className="text-white">contact@vega.com</a></div>
          <div>Phone: <a href="tel:+911234567890" className="text-white">+91 12345 67890</a></div>
        </div>
      </div>
    </footer>
  );
}
