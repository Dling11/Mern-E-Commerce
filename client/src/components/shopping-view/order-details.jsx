import { useSelector } from "react-redux";
import { Badge } from "../ui/badge";
import { DialogContent } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { useState } from "react";

const ShoppingOrderDetailsView =({ orderDetails }) => {
  const { user } = useSelector((state) => state.auth);
  const [openSections, setOpenSections] = useState({
    summary: true,
    details: false,
    shipping: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getStatusStyles = (status) => {
    const statusMap = {
      confirmed: { bg: "bg-green-500", text: "text-white", label: "Confirmed" },
      rejected: { bg: "bg-red-600", text: "text-white", label: "Rejected" },
      pending: { bg: "bg-yellow-500", text: "text-white", label: "Pending" },
      inProcess: { bg: "bg-blue-500", text: "text-white", label: "In Process" },
      inShipping: { bg: "bg-indigo-500", text: "text-white", label: "In Shipping" },
      delivered: { bg: "bg-gray-500", text: "text-white", label: "Delivered" },
    };

    return statusMap[status] || { bg: "bg-black", text: "text-white", label: '' };
  };
  
  const { bg, text, label } = getStatusStyles(orderDetails?.orderStatus);

  return (
    <DialogContent className="sm:max-w-[600px]">
      <div className="grid gap-4">
        {/* Order Summary */}
        <div className="grid gap-2">
          <button
            className="text-lg font-semibold text-gray-800 flex justify-between w-full"
            onClick={() => toggleSection("summary")}
          >
            Order Summary
            <span>{openSections.summary ? "−" : "+"}</span>
          </button>
          {openSections.summary && (
            <div className="py-1 px-4 bg-gray-50 rounded-lg shadow-md">
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Order ID:</span>
                  <span className="text-gray-600">{orderDetails?._id}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Order Date:</span>
                  <span className="text-gray-600">{orderDetails?.orderDate.split("T")[0]}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Order Price:</span>
                  <span className="text-gray-600">P{orderDetails?.totalAmount}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Payment Method:</span>
                  <span className="text-gray-600">{orderDetails?.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Payment Status:</span>
                  <span className="text-gray-600">{orderDetails?.paymentStatus}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Order Status:</span>
                  <Badge className={`py-1 px-3 ${bg} ${text}`}>
                    {label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Order Details */}
        <div className="grid gap-2">
          <button
            className="text-lg font-semibold text-gray-800 flex justify-between w-full"
            onClick={() => toggleSection("details")}
          >
            Order Details
            <span>{openSections.details ? "−" : "+"}</span>
          </button>
          {openSections.details && (
            <ul className="space-y-2 text-sm">
              {orderDetails?.cartItems && orderDetails?.cartItems.length > 0 ? (
                orderDetails?.cartItems.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md shadow-sm"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{item.title}</p>
                      <p className="text-xs text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      P{typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                    </span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-gray-500">No items in the order.</li>
              )}
            </ul>
          )}
        </div>

        <Separator />

        {/* Shipping Info */}
        <div className="grid gap-2">
          <button
            className="text-lg font-semibold text-gray-800 flex justify-between w-full"
            onClick={() => toggleSection("shipping")}
          >
            Shipping Info
            <span>{openSections.shipping ? "−" : "+"}</span>
          </button>
          {openSections.shipping && (
            <div className="p-2 bg-gray-50 rounded-lg shadow-md">
              <div className="grid gap-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Name:</span>
                  <span className="text-gray-600">{user.userName}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Address:</span>
                  <span className="text-gray-600">{orderDetails?.addressInfo?.address}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">City:</span>
                  <span className="text-gray-600">{orderDetails?.addressInfo?.city}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">ZIP Code:</span>
                  <span className="text-gray-600">{orderDetails?.addressInfo?.zipcode}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">Phone:</span>
                  <span className="text-gray-600">{orderDetails?.addressInfo?.phone}</span>
                </div>
                {orderDetails?.addressInfo?.notes && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <span className="text-gray-600">{orderDetails?.addressInfo?.notes}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

export default ShoppingOrderDetailsView;
