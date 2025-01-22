




// src/Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles.css';
import logo from './logo.png'; 

function Home() {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/categories', { name: newCategory });
      setCategories([...categories, response.data]); // Add new category to state
      setNewCategory('');
      setShowModal(false);
    } catch (error) {
      console.error('Error adding category:', error);
      alert('Failed to add category. Please try again.');
    }
  };

  return (
    <>
      <header className="header">
        <div className="logo">
        <img src={logo} alt="PeoplePixel Logo" />
        </div>
        <input type="text" placeholder="Search..." className="search-bar" />
       
      </header>
      <div className="container">
        {categories.map((category, index) => (
          <Link key={index} to={`/contacts?category=${category.name}`} className="card">
            <i className="bi bi-folder icon"></i>
            <p>{category.name}</p>
          </Link>
        ))}
        <button className="card add-category-card" onClick={() => setShowModal(true)}>
          <i className="bi bi-plus icon"></i>
          <p>Add Category</p>
        </button>
      </div>

      {/* Modal for Adding New Category */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add New Category</h2>
            <input
              type="text"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Category Name"
              required
            />
            <button onClick={handleAddCategory}>Save Category</button>
            <button onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-links">
          <Link to="#">About</Link>
          <Link to="#">Help</Link>
          <Link to="#">Privacy Policy</Link>
        </div>
        <p className="copyright">&copy; 2024 PeoplePixel. All rights reserved.</p>
      </footer>
    </>
  );
}

export default Home;

