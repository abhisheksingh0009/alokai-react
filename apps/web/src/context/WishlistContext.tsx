import { createContext, useContext, useState, useEffect } from "react";
import { type Product } from '../middleware/api/client';

const WishlistContext = createContext<{
    wishlist: Product[],
    addToWishlist: (product: Product) => void,
} | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);

    // Load wishlist from localStorage on mount
    useEffect(() => {
        const savedWishlist = localStorage.getItem('wishlist');
        if (savedWishlist) {
            try {
                setWishlist(JSON.parse(savedWishlist));
            } catch (error) {
                console.error('Failed to parse wishlist from localStorage:', error);
            }
        }
    }, []);

    // Save wishlist to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    function addToWishlist(product: Product) {
        // console.log(product)
        setWishlist((prev) => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                return prev.filter((item) => item.id !== product.id);
            } else {
                return [{ ...product },...prev];
            }
        });
    }

    return (
        <WishlistContext.Provider value={{ wishlist, addToWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlist must be used within a WishlistProvider");
    }
    return context;
}