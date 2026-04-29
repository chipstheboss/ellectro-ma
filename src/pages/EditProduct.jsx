import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { updateProduct, getProductById } from '../services/productService';

const EditProduct = ({ productId }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: ''
  });

  useEffect(() => {
    // Fetch product data
    const fetchProduct = async () => {
      try {
        const product = await getProductById(productId);
        setFormData(product);
      } catch (error) {
        console.error('Error fetching product:', error);
      }
    };
    fetchProduct();
  }, [productId]);

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
      await updateProduct(productId, formData);
      alert('Product updated successfully');
      // Navigate back
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h1>Edit Product</h1>
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
          <button type="submit" className="btn btn-success">Update Product</button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditProduct;
