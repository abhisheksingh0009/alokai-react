import { useWishlist } from '../../context/WishlistContext';
import ProductCard from '../ProductCard/ProductCard';
import { SfButton } from '@storefront-ui/react';


export default function Wishlist() {
    const { wishlist } = useWishlist();

    return (
        <div className="min-h-[60vh] flex flex-col" style={{ background: '#F9FAFB' }}>
            <div className="px-4 sm:px-8 py-10 max-w-7xl mx-auto w-full flex-1">

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#111827' }}>
                        My Wishlist {wishlist.length > 0 && (
                            <span className="text-xl font-semibold" style={{ color: '#6B7280' }}>
                                ({wishlist.length})
                            </span>
                        )}
                    </h1>
                    <SfButton
                        as="a"
                        href="/products"
                        variant="secondary"
                        size="sm"
                        className="rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2"
                        style={{ border: "1.5px solid #1B3A6B", color: "#1B3A6B", background: "transparent" }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "#1B3A6B";
                            (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                            (e.currentTarget as HTMLButtonElement).style.color = "#1B3A6B";
                        }}>
                        Continue Shopping
                    </SfButton>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.isArray(wishlist) ? (
                        wishlist.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))
                    ) : (
                        <p>No products found in your wishlist.</p>
                    )}
                </div>
            </div>
        </div>
    );
}