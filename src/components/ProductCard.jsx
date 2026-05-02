import { useMemo, useRef, useState } from 'react';

const ProductCard = ({ product, onAddToCart }) => {
  const price = Number(product.price || 0).toFixed(2);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const touchStartX = useRef(null);
  const images = useMemo(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }

    return product.image ? [product.image] : [];
  }, [product.image, product.images]);

  const hasMultipleImages = images.length > 1;

  const showPreviousImage = () => {
    setCurrentImageIndex((index) => (
      index === 0 ? images.length - 1 : index - 1
    ));
  };

  const showNextImage = () => {
    setCurrentImageIndex((index) => (
      index === images.length - 1 ? 0 : index + 1
    ));
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || !hasMultipleImages) return;

    const touchEndX = event.changedTouches[0].clientX;
    const swipeDistance = touchStartX.current - touchEndX;

    if (swipeDistance > 35) {
      showNextImage();
    }

    if (swipeDistance < -35) {
      showPreviousImage();
    }

    touchStartX.current = null;
  };

  return (
    <div className="product-card">
      {images.length > 0 ? (
        <div
          className="product-gallery"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img src={images[currentImageIndex]} alt={product.name} className="product-image" />
          {hasMultipleImages && (
            <>
              <button
                className="gallery-button gallery-button-prev"
                type="button"
                aria-label="Previous image"
                onClick={showPreviousImage}
              >
                &lsaquo;
              </button>
              <button
                className="gallery-button gallery-button-next"
                type="button"
                aria-label="Next image"
                onClick={showNextImage}
              >
                &rsaquo;
              </button>
              <div className="gallery-dots" aria-label="Product image position">
                {images.map((image, index) => (
                  <button
                    className={`gallery-dot ${index === currentImageIndex ? 'active' : ''}`}
                    type="button"
                    aria-label={`Show image ${index + 1}`}
                    key={image}
                    onClick={() => setCurrentImageIndex(index)}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="product-image product-image-placeholder">No image</div>
      )}
      <h3>{product.name}</h3>
      <p className="price">${price}</p>
      <p className="description">{product.description}</p>
      <button
        className="btn btn-primary"
        onClick={() => onAddToCart(product)}
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;
