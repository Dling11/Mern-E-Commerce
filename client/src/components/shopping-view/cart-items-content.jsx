import { Loader2, Minus, Plus, Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { deleteCartItem, updateCartQuantity } from "@/store/shop/cart-slice";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const UserCartItemsContent = ({ cartItem }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { user } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const { productList } = useSelector((state) => state.shopProducts);

  const [pendingDelete, setPendingDelete] = useState({});
  const [pendingUpdate, setPendingUpdate] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateQuantity = (getCartItem, typeOfAction) => {
    const key = `${getCartItem.productId}-${typeOfAction}`;
    setPendingUpdate((prev) => ({
      ...prev,
      [key]: true,
    }));
    setIsUpdating(true);

    if (typeOfAction == "plus") {
      let getCartItems = cartItems.items || [];

      if (getCartItems.length) {
        const indexOfCurrentCartItem = getCartItems.findIndex(
          (item) => item.productId === getCartItem?.productId
        );

        const getCurrentProductIndex = productList.findIndex(
          (product) => product._id === getCartItem?.productId
        );
        const getTotalStock = productList[getCurrentProductIndex].totalStock;

        if (indexOfCurrentCartItem > -1) {
          const getQuantity = getCartItems[indexOfCurrentCartItem].quantity;
          if (getQuantity + 1 > getTotalStock) {
            toast({
              title: `Only ${getQuantity} quantity can be added for this item`,
              variant: "destructive",
            });
            setPendingUpdate((prev) => ({
              ...prev,
              [key]: false,
            }));
            setIsUpdating(false);
            return;
          }
        }
      }
    }

    dispatch(
      updateCartQuantity({
        userId: user?.id,
        productId: getCartItem?.productId,
        quantity:
          typeOfAction === "plus"
            ? getCartItem?.quantity + 1
            : getCartItem?.quantity - 1,
      })
    ).then((data) => {
      setPendingUpdate((prev) => ({
        ...prev,
        [key]: false,
      }));
      setIsUpdating(false);
      if (data?.payload?.success) {
        toast({
          title: "Cart item is updated successfully",
        });
      }
    });
  };

  const handleCartItemDelete = (getCartItem) => {
    setPendingDelete((prev) => ({
      ...prev,
      [getCartItem.productId]: true,
    }));

    dispatch(
      deleteCartItem({ userId: user?.id, productId: getCartItem?.productId })
    ).then((data) => {
      setPendingDelete((prev) => ({
        ...prev,
        [getCartItem.productId]: false,
      }));
      if (data?.payload?.success) {
        toast({
          title: "Cart item is deleted successfully",
        });
      }
    });
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="w-20 h-20 rounded overflow-hidden group cursor-pointer">
        {cartItem?.image ? (
          <img
            src={cartItem?.image}
            alt={cartItem?.title}
            className="w-20 h-20 object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
          />
        ) : (
          <div className="w-20 h-20 flex items-center justify-center bg-gray-200 text-gray-500 transition-transform duration-300 ease-in-out group-hover:scale-110">
            <span className="text-sm">No Image</span>
          </div>
        )}
      </div>
      <div className="flex-1">
        <h3 className="font-extrabold">{cartItem?.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {/* decrease */}
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={cartItem?.quantity === 1 || pendingUpdate[`${cartItem.productId}-minus`] || isUpdating}
            onClick={() => handleUpdateQuantity(cartItem, "minus")}
          >
            {pendingUpdate[`${cartItem.productId}-minus`] ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            <span className="sr-only">Decrease</span>
          </Button>
          <span className="font-semibold">{cartItem?.quantity}</span>
          {/* Increase */}
          <Button
            variant="outline"
            className="h-8 w-8 rounded-full"
            size="icon"
            disabled={
              pendingUpdate[`${cartItem.productId}-plus`] || 
              isUpdating ||
              (cartItem?.quantity >= productList.find(product => product._id === cartItem.productId)?.totalStock)
            }
            onClick={() => handleUpdateQuantity(cartItem, "plus")}
          >
            {pendingUpdate[`${cartItem.productId}-plus`] ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            <span className="sr-only">Increase</span>
          </Button>

        </div>
      </div>
      <div className="flex flex-col items-end">
        <p className="font-semibold">
          P
          {(
            (cartItem?.salePrice > 0 ? cartItem?.salePrice : cartItem?.price) *
            cartItem?.quantity
          ).toFixed(2)}
        </p>
        <div className="relative mt-1">
          {pendingDelete[cartItem.productId] ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Trash
              onClick={() => handleCartItemDelete(cartItem)}
              className="cursor-pointer"
              size={20}
              disabled={pendingDelete[cartItem.productId]}
            />
          )}
        </div>

      </div>
    </div>
  );
};

export default UserCartItemsContent;
