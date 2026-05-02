import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <div className="container">
        <div className="navbar">
          <Link to="/" className="brand">ellectro.ma</Link>
          <nav>
            <ul>
              <li><NavLink to="/">Home</NavLink></li>
              <li><NavLink to="/category">Categories</NavLink></li>
              <li><NavLink to="/cart">Cart ({cartCount})</NavLink></li>
              {currentUser ? (
                <>
                  <li><NavLink to="/admin">Admin</NavLink></li>
                  <li><button className="link-button" onClick={logout}>Logout</button></li>
                </>
              ) : (
                <li><NavLink to="/login">Login</NavLink></li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
