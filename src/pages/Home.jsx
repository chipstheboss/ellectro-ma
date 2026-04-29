import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    // Fetch products from Firebase/service
    // Temporary mock data
    setProducts([
      { id: 1, name: 'Product 1', price: 29.99, description: 'Description 1', image: '' },
      { id: 2, name: 'Product 2', price: 39.99, description: 'Description 2', image: '' },
    ]);
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Welcome to ellectro.ma</h1>
        <div className="products-grid">
          {products.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
