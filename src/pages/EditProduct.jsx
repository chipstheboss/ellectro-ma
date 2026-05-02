import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  addProductImages,
  deleteProductImage,
  getProductById,
  updateProduct,
  updateProductImagesOrder
} from '../services/productService';

const maxImageSizeMb = 5;

const normalizeImageItems = (product) => {
  if (Array.isArray(product.imageItems) && product.imageItems.length > 0) {
    return product.imageItems;
  }

  return (product.images || []).map((url, index) => ({
    id: `legacy-${index}`,
    url,
    sortOrder: index
  }));
};

const EditProduct = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });
  const [imageItems, setImageItems] = useState([]);
  const [newImageFiles, setNewImageFiles] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const orderedImageIds = useMemo(
    () => imageItems.filter((image) => typeof image.id === 'number').map((image) => image.id),
    [imageItems]
  );

  const refreshProduct = useCallback(async () => {
    const product = await getProductById(productId);

    setFormData({
      name: product.name || '',
      price: product.price || '',
      description: product.description || '',
      category: product.category || ''
    });
    setImageItems(normalizeImageItems(product));
  }, [productId]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        await refreshProduct();
      } catch (fetchError) {
        console.error('Error fetching product:', fetchError);
        setError(fetchError.message || 'Unable to load product.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [refreshProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setNewImageFiles([]);
      setNewImagePreviews([]);
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxImageSizeMb * 1024 * 1024);

    if (oversizedFile) {
      setError(`"${oversizedFile.name}" is too large. Please use images under ${maxImageSizeMb} MB.`);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      return;
    }

    setError('');
    setNewImageFiles(files);
    setNewImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const moveImage = (fromIndex, direction) => {
    const toIndex = fromIndex + direction;

    if (toIndex < 0 || toIndex >= imageItems.length) return;

    setImageItems((prevImages) => {
      const nextImages = [...prevImages];
      const [movedImage] = nextImages.splice(fromIndex, 1);
      nextImages.splice(toIndex, 0, movedImage);
      return nextImages;
    });
  };

  const handleDeleteImage = async (imageId) => {
    const confirmed = window.confirm('Delete this image?');
    if (!confirmed) return;

    setSubmitting(true);
    setError('');
    setStatus('Deleting image...');

    try {
      await deleteProductImage(productId, imageId);
      await refreshProduct();
    } catch (deleteError) {
      console.error('Error deleting image:', deleteError);
      setError(deleteError.message || 'Unable to delete image.');
    } finally {
      setSubmitting(false);
      setStatus('');
    }
  };

  const handleSaveImageOrder = async () => {
    setSubmitting(true);
    setError('');
    setStatus('Saving image order...');

    try {
      await updateProductImagesOrder(productId, orderedImageIds);
      await refreshProduct();
      setStatus('Image order saved.');
      window.setTimeout(() => setStatus(''), 1500);
    } catch (orderError) {
      console.error('Error updating image order:', orderError);
      setError(orderError.message || 'Unable to update image order.');
      setStatus('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadNewImages = async () => {
    if (newImageFiles.length === 0) return;

    setSubmitting(true);
    setError('');
    setStatus('Uploading new images...');
    setUploadProgress(0);

    try {
      await addProductImages(productId, newImageFiles, ({ progress }) => {
        setUploadProgress(progress);
      });
      setNewImageFiles([]);
      setNewImagePreviews([]);
      await refreshProduct();
      setStatus('Images added.');
      window.setTimeout(() => setStatus(''), 1500);
    } catch (uploadError) {
      console.error('Error adding images:', uploadError);
      setError(uploadError.message || 'Unable to upload images.');
      setStatus('');
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setStatus('Saving product...');

    try {
      await updateProduct(productId, {
        ...formData,
        price: Number(formData.price)
      });
      alert('Product updated successfully');
      navigate('/admin');
    } catch (updateError) {
      console.error('Error updating product:', updateError);
      setError(updateError.message || 'Unable to update product.');
    } finally {
      setSubmitting(false);
      setStatus('');
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <main className="container form-container">
          <p className="page-status">Loading product...</p>
        </main>
        <Footer />
      </div>
    );
  }

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

          <section className="image-manager">
            <h2>Product Images</h2>
            {imageItems.length === 0 ? (
              <p className="page-status">No images added yet.</p>
            ) : (
              <div className="image-manager-grid">
                {imageItems.map((image, index) => (
                  <div className="image-manager-item" key={image.id}>
                    <img src={image.url} alt={`Product ${index + 1}`} />
                    <div className="image-manager-actions">
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        disabled={submitting || index === 0}
                        onClick={() => moveImage(index, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary"
                        disabled={submitting || index === imageItems.length - 1}
                        onClick={() => moveImage(index, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-danger"
                        disabled={submitting || typeof image.id !== 'number'}
                        onClick={() => handleDeleteImage(image.id)}
                      >
                        Delete
                      </button>
                    </div>
                    {index === 0 && <span className="primary-image-badge">Main</span>}
                  </div>
                ))}
              </div>
            )}

            {imageItems.length > 1 && (
              <button
                type="button"
                className="btn btn-primary"
                disabled={submitting}
                onClick={handleSaveImageOrder}
              >
                Save Image Order
              </button>
            )}

            <div className="form-group add-images-field">
              <label htmlFor="newImages">Add More Images</label>
              <input
                type="file"
                id="newImages"
                accept="image/*"
                multiple
                onChange={handleNewImagesChange}
              />
              <p className="field-hint">You can select multiple images. Max {maxImageSizeMb} MB each.</p>
            </div>

            {newImagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {newImagePreviews.map((preview, index) => (
                  <img
                    className="image-preview"
                    src={preview}
                    alt={`New product preview ${index + 1}`}
                    key={preview}
                  />
                ))}
              </div>
            )}

            {newImageFiles.length > 0 && (
              <button
                type="button"
                className="btn btn-success"
                disabled={submitting}
                onClick={handleUploadNewImages}
              >
                Upload New Images
              </button>
            )}
          </section>

          {status && (
            <div className="upload-status">
              <p>{status}</p>
              {uploadProgress > 0 && (
                <div className="upload-progress">
                  <span style={{ width: `${uploadProgress}%` }} />
                </div>
              )}
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Updating Product...' : 'Update Product Details'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default EditProduct;
