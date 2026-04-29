import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const Category = () => {
  const [categoryProducts, setCategoryProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch category products
    setCategoryProducts([]);
  }, []);

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Category Products</h1>
        <div className="products-grid">
          {categoryProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={addToCart}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Category;
