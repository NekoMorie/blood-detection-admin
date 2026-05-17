import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange, 
  onItemsPerPageChange 
}) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderTop: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Show rows:</span>
        <select 
          style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text-main)', outline: 'none' }}
          value={itemsPerPage}
          onChange={(e) => {
            onItemsPerPageChange(Number(e.target.value));
            onPageChange(1);
          }}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
        </select>
        
        <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
          Showing {totalItems === 0 ? 0 : startItem} to {endItem} of {totalItems} entries
        </span>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="btn-icon" 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
        >
          <ChevronLeft size={18} />
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button 
            key={page}
            className="btn-icon"
            style={{ 
              background: currentPage === page ? 'var(--primary)' : 'var(--background)',
              color: currentPage === page ? '#fff' : 'var(--text-muted)',
            }}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        ))}

        <button 
          className="btn-icon" 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages || totalPages === 0}
          style={{ opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
