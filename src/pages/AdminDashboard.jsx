import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { deleteProduct, getAllProducts } from '../services/productService';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalOrders: 0,
    totalRevenue: 0
  }), [products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await getAllProducts();
        setProducts(productsData);
      } catch (fetchError) {
        console.error('Error loading admin products:', fetchError);
        setError(fetchError.message || 'Unable to load products. Check that the MySQL API server is running and connected.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDeleteProduct = async (productId) => {
    const confirmed = window.confirm('Delete this product?');
    if (!confirmed) return;

    try {
      await deleteProduct(productId);
      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
    } catch (deleteError) {
      console.error('Error deleting product:', deleteError);
      setError('Unable to delete this product.');
    }
  };

  return (
    <div>
      <Header />
      <main className="container admin-dashboard">
        <h1>Admin Dashboard</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Products</h3>
            <p>{stats.totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue}</p>
          </div>
        </div>

        <div className="products-management">
          <h2>Products</h2>
          <Link className="btn btn-primary" to="/add-product">Add Product</Link>
          {loading && <p className="page-status">Loading products...</p>}
          {error && <p className="page-status error">{error}</p>}
          {!loading && products.length === 0 && <p className="page-status">No products yet.</p>}
          {!loading && products.length > 0 && (
            <table className="products-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>${Number(product.price).toFixed(2)}</td>
                    <td>
                      <Link className="btn btn-sm btn-secondary" to={`/edit-product/${product.id}`}>Edit</Link>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
