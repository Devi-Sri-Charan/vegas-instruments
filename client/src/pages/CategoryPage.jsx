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
      <h2>{category ? category.name : 'Category'}</h2>
      <p className="text-muted">{category ? category.description : ''}</p>
      <div className="row">
        {instruments.map(inst => <InstrumentCard key={inst._id} inst={inst} />)}
      </div>

      <div className="d-flex justify-content-between mt-3">
        <button className="btn btn-outline-secondary" onClick={() => setPage(p => Math.max(1, p-1))}>Previous</button>
        <span>Page {page}</span>
        <button className="btn btn-outline-secondary" onClick={() => setPage(p => p+1)}>Next</button>
      </div>
    </div>
  );
}
