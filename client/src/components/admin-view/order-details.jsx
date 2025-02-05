import { useState } from "react";
import CommonForm from "../common/form";
import { DialogContent, DialogTitle  } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllOrdersForAdmin,
  getOrderDetailsForAdmin,
  updateOrderStatus,
} from "@/store/admin/order-slice";
import { useToast } from "@/hooks/use-toast";

const initialFormData = {
  status: "",
};

const AdminOrderDetailsView = ({ orderDetails }) => {
  const dispatch = useDispatch();
  const { toast } = useToast()
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateStatus = (event) => {
    event.preventDefault();
    const { status } = formData;

    setIsLoading(true)

    dispatch(
      updateOrderStatus({ id: orderDetails?._id, orderStatus: status })
    )
    .then((data) => {
      if (data?.payload?.success) {
        dispatch(getOrderDetailsForAdmin(orderDetails?._id));
        dispatch(getAllOrdersForAdmin());
        setFormData(initialFormData);
        toast({
          title: data?.payload?.message,
          variant: "success"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update order status.",
          variant: "destructive",
        });
      }
    })
    .finally(() => {
      setIsLoading(false);
    });
  }

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
    <DialogContent 
      className="sm:max-w-[800px]"
      aria-describedby={undefined}
    >
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        {/* Order Summary (Left Side) */}
        <div className="space-y-4">
          {/* <h3 className="text-lg font-semibold text-gray-800">Order Summary</h3> */}
          <DialogTitle>Order Summary</DialogTitle>
          <div className="py-1 px-4 bg-gray-50 rounded-lg shadow-md">
            <div className="space-y-2 text-sm flex flex-col gap-1">
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Order ID:</span>
                <span className="text-gray-600">{orderDetails?._id}</span>
              </div>
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Order Date:</span>
                <span className="text-gray-600">{orderDetails?.orderDate.split("T")[0]}</span>
              </div>
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Order Price:</span>
                <span className="text-gray-600">${orderDetails?.totalAmount}</span>
              </div>
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Payment Method:</span>
                <span className="text-gray-600">{orderDetails?.paymentMethod}</span>
              </div>
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Payment Status:</span>
                <span className="text-gray-600">{orderDetails?.paymentStatus}</span>
              </div>
              <div className="p-1 flex items-center justify-between">
                <span className="font-medium text-gray-700">Order Status</span>
                <span className="text-gray-600">
                  <Badge className={`py-1 px-3 ${bg} ${text}`}>
                    {label}
                  </Badge>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details (Right Side) */}
        <div className="space-y-4">
          {/* <h3 className="text-lg font-semibold text-gray-800">Order Details</h3> */}
          <DialogTitle>Order Details</DialogTitle>
          <div className="py-1 px-4 bg-gray-50 rounded-lg shadow-md">
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
          </div>
        </div>
      </div>

      <Separator />

      {/* Shipping Info (Single Container) */}
      <div className="space-y-4">
        {/* <h3 className="text-lg font-semibold text-gray-800">Shipping Info</h3>  */}
        <DialogTitle>Shipping Info</DialogTitle>
        <div className="bg-gray-50 p-4 rounded-lg shadow-md">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">Username:</span>
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
      </div>

      <Separator />

      {/* Update Order Status Form */}
      <div>
        <CommonForm
          formControls={[{
            label: "Order Status",
            name: "status",
            componentType: "select",
            options: [
              { id: "pending", label: "Pending" },
              { id: "inProcess", label: "In Process" },
              { id: "inShipping", label: "In Shipping" },
              { id: "delivered", label: "Delivered" },
              { id: "rejected", label: "Rejected" },
            ],
          }]}
          formData={formData}
          setFormData={setFormData}
          buttonText="Update Order Status"
          onSubmit={handleUpdateStatus}
          isBtnDisabled={isLoading}
          isLoading={isLoading}
        />
      </div>
    </DialogContent>
  );
}

export default AdminOrderDetailsView;
