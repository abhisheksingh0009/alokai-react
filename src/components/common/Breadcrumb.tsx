import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SfDropdown, SfButton, SfIconMoreHoriz, SfIconChevronRight } from '@storefront-ui/react';

export type BreadcrumbItem = {
  name: string;
  link?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const [dropdownOpened, setDropdownOpened] = useState(false);

  return (
    <nav className="flex items-center text-sm" style={{ fontFamily: 'inherit' }}>
      <ol className="flex w-auto leading-none group md:flex-wrap">
        {/* Mobile: collapsed items in dropdown */}
        <li className="flex items-center sm:hidden" style={{ color: '#6B7280' }}>
          <SfDropdown
            trigger={
              <SfButton
                className="relative w-5 h-5 !p-0 rounded-xs hover:bg-transparent active:bg-transparent"
                aria-label="More breadcrumbs"
                variant="tertiary"
                slotPrefix={
                  <SfIconMoreHoriz size="sm" style={{ color: '#6B7280' }} />
                }
                square
                onClick={() => setDropdownOpened(v => !v)}
              />
            }
            open={dropdownOpened}
            strategy="absolute"
            placement="bottom-start"
            onClose={() => setDropdownOpened(false)}
          >
            <div className="px-4 py-2 rounded-md shadow-md" style={{ background: '#fff', border: '1px solid #E2E8F0' }}>
              {items.map(({ name, link }) => (
                <li className="py-2 last-of-type:hidden" key={name}>
                  {link ? (
                    <Link
                      to={link}
                      className="leading-5 no-underline hover:underline whitespace-nowrap"
                      style={{ color: '#6B7280' }}
                    >
                      {name}
                    </Link>
                  ) : (
                    <span className="leading-5 whitespace-nowrap" style={{ color: '#111827' }}>{name}</span>
                  )}
                </li>
              ))}
            </div>
          </SfDropdown>
        </li>

        {/* Desktop: full breadcrumb trail */}
        {items.map((item, index) => (
          <li
            className="hidden sm:flex items-center last-of-type:flex"
            key={item.name}
          >
            {index !== 0 && <SfIconChevronRight size="sm" className="mx-1" style={{ color: '#9CA3AF' }} />}
            {index < items.length - 1 && item.link ? (
              <Link
                to={item.link}
                className="no-underline hover:underline whitespace-nowrap"
                style={{ color: '#6B7280' }}
              >
                {item.name}
              </Link>
            ) : (
              <span className="font-medium whitespace-nowrap" style={{ color: '#111827' }}>{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
