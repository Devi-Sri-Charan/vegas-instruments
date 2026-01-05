import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useParams } from 'react-router-dom';
import InstrumentCard from '../components/InstrumentCard';

export default function CategoryPage() {
  const { id } = useParams();
  const [instruments, setInstruments] = useState([]);
  const [category, setCategory] = useState(null);
  const [page, setPage] = useState(1);
  const limit = 9;

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, instRes] = await Promise.all([
          api.get('/categories'),
          api.get(`/instruments?category=${id}&page=${page}&limit=${limit}`)
        ]);
        const cat = catRes.data.find(c => c._id === id);
        setCategory(cat);
        setInstruments(instRes.data.items || []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, [id, page]);

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>
        {category ? category.name : 'Category'}
      </h2>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>
        {category ? category.description : ''}
      </p>
      
      <div className="instrument-grid">
        {instruments.map(inst => (
          <InstrumentCard key={inst._id} inst={inst} />
        ))}
      </div>

      <div className="d-flex justify-content-between align-items-center mt-4">
        <button 
          className="btn btn-secondary" 
          onClick={() => setPage(p => Math.max(1, p-1))}
          disabled={page === 1}
        >
          Previous
        </button>
        <span style={{ color: 'var(--text-grey)' }}>Page {page}</span>
        <button 
          className="btn btn-secondary" 
          onClick={() => setPage(p => p+1)}
          disabled={instruments.length < limit}
        >
          Next
        </button>
      </div>
    </div>
  );
}