import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/useCart';
import { getAllProducts } from '../services/productService';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (fetchError) {
        console.error('Error loading products:', fetchError);
        setError(fetchError.message || 'Unable to load products. Check that the MySQL API server is running and connected.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  return (
    <div>
      <Header />
      <main className="container">
        <h1>Welcome to ellectro.ma</h1>
        {loading && <p className="page-status">Loading products...</p>}
        {error && <p className="page-status error">{error}</p>}
        {!loading && !error && products.length === 0 && (
          <p className="page-status">No products available yet.</p>
        )}
        {!loading && !error && products.length > 0 && (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Home;
