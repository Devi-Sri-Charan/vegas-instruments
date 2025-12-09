import React, { useEffect, useState } from 'react';
import api from '../api/api';
import CategoryCard from '../components/CategoryCard';
import InstrumentCard from '../components/InstrumentCard';
import { Link } from 'react-router-dom';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [cRes, iRes] = await Promise.all([
          api.get('/categories'),
          api.get('/instruments?limit=6&page=1')
        ]);
        setCategories(cRes.data);
        setFeatured(iRes.data.items || []);
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
              <p className="lead">Professional instruments with industry-grade accuracy. Explore product categories and detailed specs with demo videos.</p>
              <div className="mt-3">
                {categories.slice(0, 3).map(c => (
                  <Link key={c._id} className="btn btn-light btn-sm me-2" to={`/category/${c._id}`}>{c.name}</Link>
                ))}
              </div>
            </div>
            <div className="col-md-5 text-center">
              <img src="https://via.placeholder.com/360x220?text=Vega+Instruments" alt="hero" className="img-fluid rounded" />
            </div>
          </div>
        </div>
      </section>

      <section className="mb-4">
        <h3 className="mb-3">Categories</h3>
        <div className="card-grid">
          {categories.map(c => (
            <CategoryCard key={c._id} category={c} />
          ))}
        </div>

      </section>

      {/* <section>
        <h3 className="mb-3">Featured Instruments</h3>
        <div className="card-grid">
          {featured.map(inst => <InstrumentCard key={inst._id} inst={inst} />)}
        </div>
      </section> */}
    </div>
  );
}
