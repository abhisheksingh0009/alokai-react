import { Fragment } from 'react';
import { SfButton, SfIconChevronLeft, SfIconChevronRight, usePagination } from '@storefront-ui/react';
import { PAGE_SIZE } from '../../hooks/useProducts';

interface Props {
  totalItems: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export default function ProductListPagination({ totalItems, currentPage, onPageChange }: Props) {
  const { totalPages, pages, selectedPage, startPage, endPage, next, prev, setPage } =
    usePagination({ totalItems, currentPage, pageSize: PAGE_SIZE, maxPages: 5 });

  if (totalPages <= 1) return null;

  function goTo(page: number) {
    setPage(page);
    onPageChange(page);
  }

  return (
    <nav
      className="mt-10 flex justify-between items-center pt-5"
      style={{ borderTop: '1px solid #E2E8F0' }}
      role="navigation"
      aria-label="pagination"
    >
      <SfButton
        size="base"
        className="gap-2 !px-4 !font-semibold !rounded-xl"
        aria-label="Previous page"
        disabled={selectedPage <= 1}
        variant="tertiary"
        slotPrefix={<SfIconChevronLeft />}
        onClick={() => { prev(); onPageChange(Math.max(1, currentPage - 1)); }}
        style={{ color: '#1B3A6B' }}
      >
        <span className="hidden sm:inline">Previous</span>
      </SfButton>

      <ul className="flex items-center gap-1">
        {!pages.includes(1) && (
          <li>
            <button
              type="button"
              onClick={() => goTo(1)}
              className="min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors"
              style={selectedPage === 1 ? { background: '#1B3A6B', color: '#fff' } : { color: '#374151' }}
            >
              1
            </button>
          </li>
        )}
        {startPage > 2 && <li className="px-1 text-sm" style={{ color: '#9CA3AF' }}>…</li>}
        {pages.map((page: number) => (
          <Fragment key={page}>
            <li>
              <button
                type="button"
                onClick={() => goTo(page)}
                className="min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors"
                style={selectedPage === page ? { background: '#1B3A6B', color: '#fff' } : { color: '#374151' }}
                aria-current={selectedPage === page}
              >
                {page}
              </button>
            </li>
          </Fragment>
        ))}
        {endPage < totalPages - 1 && <li className="px-1 text-sm" style={{ color: '#9CA3AF' }}>…</li>}
        {!pages.includes(totalPages) && (
          <li>
            <button
              type="button"
              onClick={() => goTo(totalPages)}
              className="min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-colors"
              style={selectedPage === totalPages ? { background: '#1B3A6B', color: '#fff' } : { color: '#374151' }}
            >
              {totalPages}
            </button>
          </li>
        )}
      </ul>

      <SfButton
        size="base"
        aria-label="Next page"
        disabled={selectedPage >= totalPages}
        variant="tertiary"
        slotSuffix={<SfIconChevronRight />}
        className="gap-2 !px-4 !font-semibold !rounded-xl"
        onClick={() => { next(); onPageChange(Math.min(totalPages, currentPage + 1)); }}
        style={{ color: '#1B3A6B' }}
      >
        <span className="hidden sm:inline">Next</span>
      </SfButton>
    </nav>
  );
}
