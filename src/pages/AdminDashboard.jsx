import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    // Fetch admin data
    setProducts([]);
    setStats({
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    });
  }, []);

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
          <button className="btn btn-primary"><a href="/add-product">Add Product</a></button>
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
                  <td>${product.price}</td>
                  <td>
                    <button><a href={`/edit-product/${product.id}`}>Edit</a></button>
                    <button>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
