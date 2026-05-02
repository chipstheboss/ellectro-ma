import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { createProduct } from '../services/productService';

const AddProduct = () => {
  const maxImageSizeMb = 5;
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: ''
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitStatus, setSubmitStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [canSaveWithoutImages, setCanSaveWithoutImages] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      setImageFiles([]);
      setImagePreviews([]);
      return;
    }

    const oversizedFile = files.find((file) => file.size > maxImageSizeMb * 1024 * 1024);

    if (oversizedFile) {
      setImageFiles([]);
      setImagePreviews([]);
      setError(`"${oversizedFile.name}" is too large. Please use images under ${maxImageSizeMb} MB.`);
      return;
    }

    setError('');
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setCanSaveWithoutImages(false);
    setSubmitStatus('Uploading product images...');
    setUploadProgress(0);

    try {
      await createProduct({
        ...formData,
        price: Number(formData.price)
      }, imageFiles, (progressDetails) => {
        setUploadProgress(progressDetails.progress);
        setSubmitStatus('Uploading images and saving product...');
      });
      alert('Product added successfully');
      navigate('/admin');
    } catch (error) {
      console.error('Error adding product:', error);
      setError(error.message || 'Unable to add product. Please check the MySQL API server.');
      setCanSaveWithoutImages(imageFiles.length > 0);
    } finally {
      setSubmitting(false);
      setSubmitStatus('');
      setUploadProgress(0);
    }
  };

  const handleSaveWithoutImages = async () => {
    setSubmitting(true);
    setError('');
    setSubmitStatus('Saving product details without images...');

    try {
      await createProduct({
        ...formData,
        price: Number(formData.price)
      }, []);
      alert('Product added without images. MySQL is connected.');
      navigate('/admin');
    } catch (saveError) {
      console.error('Error saving product without images:', saveError);
      setError(saveError.message || 'Unable to save product. MySQL may not be connected.');
    } finally {
      setSubmitting(false);
      setSubmitStatus('');
    }
  };

  return (
    <div>
      <Header />
      <main className="container form-container">
        <h1>Add Product</h1>
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
          <div className="form-group">
            <label htmlFor="image">Product Image</label>
            <input 
              type="file" 
              id="image"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <p className="field-hint">You can select multiple images. Max {maxImageSizeMb} MB each.</p>
            {imagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {imagePreviews.map((preview, index) => (
                  <img
                    className="image-preview"
                    src={preview}
                    alt={`Product preview ${index + 1}`}
                    key={preview}
                  />
                ))}
              </div>
            )}
          </div>
          {submitStatus && (
            <div className="upload-status">
              <p>{submitStatus}</p>
              <div className="upload-progress">
                <span style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
          {error && <p className="form-error">{error}</p>}
          {canSaveWithoutImages && (
            <button
              type="button"
              className="btn btn-secondary fallback-button"
              disabled={submitting}
              onClick={handleSaveWithoutImages}
            >
              Save Product Without Images
            </button>
          )}
          <button type="submit" className="btn btn-success" disabled={submitting}>
            {submitting ? 'Adding Product...' : 'Add Product'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default AddProduct;
