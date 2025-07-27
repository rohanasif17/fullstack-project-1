import React, { useEffect, useState } from 'react';
import { getCategories } from '../services/api';
import './CategoryFilter.css';

const CategoryFilter = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState(['All']);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategories();
        const fetchedCategories = response.data?.data || [];
        setCategories(['All', ...fetchedCategories]);
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        // Fallback to default categories if API fails
        setCategories([
          "All",
          "Education",
          "Gaming", 
          "Music",
          "Vlogs",
          "Tech",
          "Entertainment",
          "News",
          "Sports",
          "Comedy",
          "Beauty & Fashion"
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="category-filter-container">
        <div className="category-filter-scroll">
          <div className="category-filter-loading">Loading categories...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="category-filter-container">
      <div className="category-filter-scroll">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-filter-button ${
              selectedCategory === category ? 'category-filter-active' : ''
            }`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter; 