import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createProduct } from '../services/productService';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProduct(formData);
      alert('Product added successfully');
      // Reset form or navigate
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h1>Add Product</h1>
        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label htmlFor="name">Product Name</label>
            <input 
              type="text" 
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="price">Price</label>
            <input 
              type="number" 
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea 
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <input 
              type="text" 
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="image">Image URL</label>
            <input 
              type="text" 
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-success">Add Product</button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProduct;
