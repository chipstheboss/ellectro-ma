import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/useCart';
import { getAllProducts, getProductsByCategory } from '../services/productService';

const Category = () => {
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { addToCart } = useCart();
  const { categoryName } = useParams();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const productsData = categoryName
          ? await getProductsByCategory(categoryName)
          : await getAllProducts();

        setCategoryProducts(productsData);
        setError('');
      } catch (fetchError) {
        console.error('Error loading category products:', fetchError);
        setError(fetchError.message || 'Unable to load this category. Check that the MySQL API server is running and connected.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName]);

  return (
    <div>
      <Header />
      <main className="container">
        <h1>{categoryName ? `${categoryName} Products` : 'All Categories'}</h1>
        {loading && <p className="page-status">Loading products...</p>}
        {error && <p className="page-status error">{error}</p>}
        {!loading && !error && categoryProducts.length === 0 && (
          <p className="page-status">No products found.</p>
        )}
        {!loading && !error && categoryProducts.length > 0 && (
          <div className="products-grid">
            {categoryProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Category;
