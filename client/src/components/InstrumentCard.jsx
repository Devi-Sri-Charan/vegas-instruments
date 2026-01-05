import React from 'react';
import { Link } from 'react-router-dom';
import { makePublicUrl } from '../utils/url';

export default function InstrumentCard(props) {
  const inst = props.inst || props.instrument || {};
  const id = inst._id || inst.id || '';
  const name = inst.name || 'Untitled Instrument';
  const img = makePublicUrl(inst.image || '');
  const displayImg = img || 'https://via.placeholder.com/400x250?text=Instrument';
  const desc = (inst.description || '').replace(/\n/g, ' ');
  const excerpt = desc.length > 120 ? desc.slice(0, 120).trim() + '...' : desc;

  const card = (
    <div className="card card-hover h-100">
      <img 
        loading="lazy" 
        src={displayImg} 
        className="card-img-top" 
        alt={name} 
        style={{ height: 220, objectFit: 'cover' }} 
      />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title" style={{ marginBottom: '0.75rem' }}>{name}</h5>
        <p className="card-text text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
          {excerpt}
        </p>
        <div className="mt-auto">
          <Link 
            to={id ? `/instrument/${id}` : '#'} 
            className="btn btn-primary btn-sm w-100"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );

  return card;
}