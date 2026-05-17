import { X } from 'lucide-react';

export default function ImageModal({ imageUrl, onClose }) {
  if (!imageUrl) return null;
  
  return (
    <div className="modal-overlay" style={{ zIndex: 100 }} onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ padding: 0, overflow: 'hidden', maxWidth: '800px', width: 'auto', position: 'relative' }}
        onClick={(e) => e.stopPropagation()} // Prevent click from closing when clicking on the image container itself
      >
        <button 
          className="btn-icon" 
          onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--surface)', borderRadius: '50%', padding: '4px', boxShadow: 'var(--shadow-md)' }}
        >
          <X size={20} />
        </button>
        <img 
          src={imageUrl} 
          alt="Preview" 
          style={{ width: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block' }} 
        />
      </div>
    </div>
  );
}
