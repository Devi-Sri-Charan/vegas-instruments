// client/src/components/CategoryCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { makePublicUrl } from '../utils/url';

export default function CategoryCard(props) {
  const category = props.category || props.cat || {};
  const img = makePublicUrl(category.image || '');
  const displayImg = img || 'https://via.placeholder.com/400x220?text=Category';
  const name = category.name || 'Untitled Category';
  const description = category.description || '';

  const cardBody = (
    <div className="card category-card card-hover h-100">
      <img src={displayImg} className="card-img-top" alt={name} style={{ height: 180, objectFit: 'cover' }} />
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">{name}</h5>
        <p className="card-text text-muted">{description}</p>
      </div>
    </div>
  );

  if (category._id) {
    return (
      <Link to={`/category/${category._id}`} className="text-decoration-none text-reset">
        {cardBody}
      </Link>
    );
  } else {
    return cardBody;
  }
}
