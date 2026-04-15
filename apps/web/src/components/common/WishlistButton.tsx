import { SfIconFavorite } from "@storefront-ui/react";
import { useWishlist } from "../../context/WishlistContext";
import type { Product } from "../../middleware/api/client";

interface Prop {
    product: Product;
}

export default function WishlistButton({product}:Prop) {
    const { wishlist, addToWishlist } = useWishlist();

    const isWishlisted = wishlist.find(item => item.id === product?.id) !== undefined;

    return (
        <button
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            style={{ border: '1px solid #E2E8F0' , backgroundColor:isWishlisted?'red':'white'}}
            aria-label="Add to wishlist" onClick={()=>{addToWishlist(product)}}>
            <SfIconFavorite size="sm" className="text-[#1B3A6B]" />
        </button>
    )
}