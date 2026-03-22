export default function Pagination({ meta = {}, onPageChange }) {
  const { page = 1, pages = 1, total = 0, limit = 10 } = meta;
  const from = (page - 1) * limit + 1;
  const to   = Math.min(page * limit, total);
  if (total === 0) return null;
  return (
    <div className="pagination">
      <span className="pagination-info">Showing {from}–{to} of {total.toLocaleString()}</span>
      <div className="pagination-btns">
        <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>&#8249;</button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = page <= 3 ? i + 1 : page - 2 + i;
          if (p < 1 || p > pages) return null;
          return (
            <button key={p} className={`btn btn-sm ${p === page ? 'btn-primary' : 'btn-secondary'}`} onClick={() => onPageChange(p)}>{p}</button>
          );
        })}
        <button className="btn btn-secondary btn-sm" onClick={() => onPageChange(page + 1)} disabled={page >= pages}>&#8250;</button>
      </div>
    </div>
  );
}
