const CategoryCard = ({ category, onClick }) => {
  return (
    <div className="category-card" onClick={onClick} style={{ cursor: 'pointer' }}>
      <img src={category.image} alt={category.name} className="category-image" />
      <h3>{category.name}</h3>
      <p>{category.productCount} products</p>
    </div>
  );
};

export default CategoryCard;
