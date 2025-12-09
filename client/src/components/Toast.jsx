import React from 'react';

/**
 * Defensive Toast component.
 * - Uses bootstrap Toast if available (window.bootstrap.Toast).
 * - Otherwise, falls back to a simple class-based show/hide implementation.
 *
 * Usage:
 * <Toast id="my-toast" title="Saved" message="Category added" onClose={() => ...} />
 */
export default function Toast({ id = 'toast', title = 'Notice', message = '', onClose }) {
  React.useEffect(() => {
    const el = document.getElementById(id);
    if (!el) return;

    // If bootstrap's Toast is available, use it
    try {
      if (window && window.bootstrap && window.bootstrap.Toast) {
        const bs = window.bootstrap.Toast.getOrCreateInstance(el);
        el.addEventListener('hidden.bs.toast', () => {
          if (onClose) onClose();
        });
        bs.show();
        return;
      }
    } catch (err) {
      // If bootstrap exists but something failed, fall back to manual
      console.warn('Bootstrap toast use failed, falling back to manual toast', err);
    }

    // Fallback behavior: show by adding classes and auto-hide after 3s
    el.classList.add('show');
    // ensure the element is visible (Bootstrap styles rely on .show)
    el.style.display = 'block';

    const hideTimer = setTimeout(() => {
      try {
        el.classList.remove('show');
        el.style.display = 'none';
      } catch (e) {}
      if (onClose) onClose();
    }, 3000);

    // cleanup if component unmounts early
    return () => {
      clearTimeout(hideTimer);
      if (el) {
        try { el.classList.remove('show'); el.style.display = 'none'; } catch (e) {}
      }
    };
  }, [id, onClose]);

  return (
    <div aria-live="polite" aria-atomic="true" style={{ position: 'fixed', top: 16, right: 16, zIndex: 2000 }}>
      <div id={id} className="toast" role="alert" data-bs-delay="3000" style={{ display: 'none' }}>
        <div className="toast-header">
          <strong className="me-auto">{title}</strong>
          <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"
            onClick={() => {
              const el = document.getElementById(id);
              if (el) {
                el.classList.remove('show');
                el.style.display = 'none';
              }
              if (onClose) onClose();
            }} />
        </div>
        <div className="toast-body">{message}</div>
      </div>
    </div>
  );
}
