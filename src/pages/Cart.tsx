import { SfButton, SfIconRemove, SfLink, SfIconAdd, SfIconDelete } from '@storefront-ui/react';
import { useId, ChangeEvent } from 'react';
import { clamp } from '@storefront-ui/shared';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { cart, removeFromCart } = useCart()!;
  const inputId = useId();
  const min = 1;
  const max = 10;

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="p-6 max-w-[700px] mx-auto">
      <h1 className="text-3xl mb-6 font-bold">Your Cart</h1>

      {cart.length === 0 && <p className="text-neutral-500">Your cart is empty.</p>}

      {cart.map((item, index) => (
        <CartItem
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          inputId={`${inputId}-${index}`}
          min={min}
          max={max}
          onRemove={removeFromCart}
        />
      ))}

      {cart.length > 0 && (
        <div className="mt-6 text-xl font-bold text-right">
          Grand Total: ${total.toFixed(2)}
        </div>
      )}
    </div>
  );
}

function CartItem({
  item,
  index,
  inputId,
  min,
  max,
  onRemove,
}: {
  item: { id: number; title: string; price: number; quantity: number; thumbnail: string };
  index: number;
  inputId: string;
  min: number;
  max: number;
  onRemove: (index: number) => void;
}) {
  const { cart, addToCart } = useCart()!;

  const quantity = item.quantity;

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const next = clamp(parseFloat(e.target.value), min, max);
    const diff = next - quantity;
    if (diff !== 0) addToCart(item, diff);
  }

  function inc() {
    if (quantity < max) addToCart(item, 1);
  }

  function dec() {
    if (quantity > min) addToCart(item, -1);
  }

  // keep cart in sync — find current quantity from cart
  const currentItem = cart[index];

  return (
    <div className="relative flex border-b-[1px] border-neutral-200 hover:shadow-lg min-w-[320px] max-w-[640px] p-4">
      <div className="relative overflow-hidden rounded-xl w-[100px] sm:w-[176px]">
        <SfLink href="#">
          <img
            className="w-full h-auto border rounded-xl border-neutral-200 object-cover"
            src={currentItem.thumbnail}
            alt={currentItem.title}
            width="300"
            height="300"
          />
        </SfLink>
      </div>
      <div className="flex flex-col pl-4 min-w-[180px] flex-1">
        <SfLink href="#" variant="secondary" className="no-underline typography-text-sm sm:typography-text-lg">
          {currentItem.title}
        </SfLink>
        <div className="items-center sm:mt-auto sm:flex mt-2">
          <span className="font-bold sm:ml-auto sm:order-1 typography-text-sm sm:typography-text-lg">
            ${(currentItem.price * currentItem.quantity).toFixed(2)}
          </span>
          <div className="flex items-center justify-between mt-4 sm:mt-0">
            <div className="flex border border-neutral-300 rounded-full">
              <SfButton
                variant="tertiary"
                square
                className="rounded-r-none"
                disabled={currentItem.quantity <= min}
                aria-controls={inputId}
                aria-label="Decrease value"
                onClick={dec}
              >
                <SfIconRemove />
              </SfButton>
              <input
                id={inputId}
                type="number"
                className="appearance-none mx-2 w-8 text-center bg-transparent font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield] focus-visible:outline focus-visible:outline-offset focus-visible:rounded-xs"
                min={min}
                max={max}
                value={currentItem.quantity}
                onChange={handleChange}
              />
              <SfButton
                variant="tertiary"
                square
                className="rounded-l-none"
                disabled={currentItem.quantity >= max}
                aria-controls={inputId}
                aria-label="Increase value"
                onClick={inc}
              >
                <SfIconAdd />
              </SfButton>
            </div>
            <button
              aria-label="Remove"
              type="button"
              className="text-neutral-500 text-xs font-light ml-auto flex items-center px-3 py-1.5"
              onClick={() => onRemove(index)}
            >
              <SfIconDelete />
              <span className="hidden ml-1.5 sm:block">Remove</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
