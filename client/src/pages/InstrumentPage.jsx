// client/src/pages/InstrumentPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import api from '../api/api';
import { useParams } from 'react-router-dom';

/**
 * youtubeEmbedUrl(url)
 * - Accepts many YouTube formats:
 *   - https://www.youtube.com/watch?v=VIDEOID
 *   - https://youtu.be/VIDEOID
 *   - https://www.youtube.com/embed/VIDEOID
 *   - https://www.youtube.com/shorts/VIDEOID
 *   - may include extra query params (e.g. &t=10s) — they are ignored
 *
 * Returns: "https://www.youtube.com/embed/VIDEOID" or null if not recognized
 */
function youtubeEmbedUrl(url) {
  if (!url) return null;
  try {
    const u = url.trim();

    // 1) direct embed already
    const embedMatch = u.match(/youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/);
    if (embedMatch) return `https://www.youtube.com/embed/${embedMatch[1]}`;

    // 2) youtu.be short link: https://youtu.be/VIDEOID
    const shortMatch = u.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`;

    // 3) watch?v=VIDEOID or &v=VIDEOID
    const watchMatch = u.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;

    // 4) shorts URL: /shorts/VIDEOID
    const shortsMatch = u.match(/\/shorts\/([A-Za-z0-9_-]{6,})/);
    if (shortsMatch) return `https://www.youtube.com/embed/${shortsMatch[1]}`;

    // 5) fallback: try to find last path segment that looks like id
    const pathMatch = u.match(/\/([A-Za-z0-9_-]{6,})(?:[?&]|$)/);
    if (pathMatch) return `https://www.youtube.com/embed/${pathMatch[1]}`;

    return null;
  } catch (e) {
    return null;
  }
}

export default function InstrumentPage() {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const descBoxRef = useRef(null);

  useEffect(() => {
    async function fetchOne() {
      try {
        const res = await api.get(`/instruments/${id}`);
        setInstrument(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchOne();
  }, [id]);

  // overflow fade logic (same as you had)
  useEffect(() => {
    function updateOverflow() {
      const el = descBoxRef.current;
      if (!el) return;
      if (el.scrollHeight > el.clientHeight) el.classList.add('has-overflow');
      else el.classList.remove('has-overflow');
    }
    updateOverflow();
    window.addEventListener('resize', updateOverflow);
    const ro = new MutationObserver(updateOverflow);
    if (descBoxRef.current) ro.observe(descBoxRef.current, { childList: true, subtree: true, characterData: true });
    return () => {
      window.removeEventListener('resize', updateOverflow);
      ro.disconnect();
    };
  }, [instrument]);

  if (!instrument) return <div>Loading...</div>;

  const embedUrl = youtubeEmbedUrl(instrument.videoUrl);

  return (
    <div className="row">
      <div className="col-md-6">
        <img
          loading="lazy"
          src={instrument.image || 'https://via.placeholder.com/600x400?text=Instrument'}
          alt={instrument.name}
          className="img-fluid rounded"
        />
      </div>

      <div className="col-md-6">
        <h2>{instrument.name}</h2>

        <div className="mb-3">
          <h5>Description</h5>
          <div ref={descBoxRef} className="desc-box text-muted">{instrument.description || ''}</div>
        </div>
      </div>

      {embedUrl && (
        <div className="col-6 mt-4">
          <h5>Demo Video</h5>
          <div className="ratio ratio-16x9">
            <iframe
              src={embedUrl}
              title="Demo Video"
              allowFullScreen
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}

      {instrument.pdf && (
        <div className="col-6 mt-4">
          <h5>Datasheet / Manual</h5>
          <div style={{ border: '1px solid #e6eefb', padding: 8, borderRadius: 6 }}>
            <a href={instrument.pdf} target="_blank" rel="noreferrer" className="d-block mb-2">Open PDF in new tab / Download</a>
            {/* <div style={{ width: '100%', height: 500 }}>
              <iframe src={instrument.pdf} title="Instrument PDF" width="100%" height="100%" style={{ border: 'none' }} />
            </div> */}
          </div>
        </div>
      )}
    </div>
  );
}
