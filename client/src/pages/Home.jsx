import React, { useEffect, useState } from 'react';
import api from '../api/api';
import CategoryCard from '../components/CategoryCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const cRes = await api.get('/categories');
        setCategories(cRes.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchData();
  }, []);

  return (
    <div>
      <section className="hero mb-4">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1>Vegas Instruments</h1>
              <p className="lead">
                Professional instruments with industry-grade accuracy. Explore product categories and detailed specs with demo videos.
              </p>
              <div className="mt-4">
                {categories.slice(0, 3).map(c => (
                  <Link 
                    key={c._id} 
                    className="btn btn-light" 
                    to={`/category/${c._id}`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="col-md-5 text-center mt-4 mt-md-0">
              <img 
                src="https://via.placeholder.com/400x250?text=Vega+Instruments" 
                alt="hero" 
                className="img-fluid rounded" 
                style={{ border: '1px solid var(--border-color)' }}
              />
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Product Categories</h3>
        <div className="card-grid">
          {categories.map(c => (
            <CategoryCard key={c._id} category={c} />
          ))}
        </div>
      </section>
    </div>
  );
}