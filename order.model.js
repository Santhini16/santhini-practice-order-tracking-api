import dynamoose from 'dynamoose';
import { v4 as uuidv4 } from 'uuid';

const deliveryHistorySchema = new dynamoose.Schema({
  deliveryDate: {
    type: String,
    default: () => new Date().toISOString()
  },
  deliveryStatus: {
    type: String,
    enum: ['SCHEDULED','SHIPPED','OUT FOR DELIVERY', 'MISSED','CANCELLED'],
    default: 'SCHEDULED'
  },
  notes: {
    type: String
  }
  
});

const paymentHistorySchema = new dynamoose.Schema(
  {
    paymentDate: {
      type: String,
      default: () => new Date().toISOString()
    },
    amount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
    },
    paymentId: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING', 'REFUNDED'],
      default: "PENDING",
    },
    vpa: { type: String }
  }
)

const addressSchema = new dynamoose.Schema(
  {
    id:{
      type:String,
      default: uuidv4,
    },
    name: {
      type: String,
      
    },
    phoneNo: {
      type: String,
      
    },
    houseNo: {
      type: String,
      
    },
    streetName: {
      type: String,
      
    },
    city: {
      type: String,
      
    },
    pincode: {
      type: String,
      
    },
    addressType: {
      type: String,
      enum: ['home', 'office'], // Only allow specific types
    },
  }
);


// Define the schema for product details
const productDetailsSchema = new dynamoose.Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productType: {
    type: String,
    enum: ['madeToOrder', 'readyToShip']
  },
  quantity: {
    type: Number,
  },
  reserveQuantity: {
    type: Number
  },
  price: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
  },
  gst: {
    type: Number,
  },
  imageUrl:{
    type: String
  }

});

const trackingDetailsSchema = new dynamoose.Schema({
  trackingId: {
    type: String
  },
  courierName: {
    type: String
  }
});


// Define the schema for orders
const orderSchema = new dynamoose.Schema({
  orderId: {
    type: String,
    hashKey: true, // Primary key
    default: uuidv4
  },
  userEmail: {
    type: String,
    required: false,
  },
  userName: {
    type: String,
    required: false,
  },
  address: {
    type: Array,
    schema: [addressSchema]
  },
  products: {
    type: Array,
    schema: [productDetailsSchema],
    required: true,
  },
  trackingDetails: {
  type: Object,
  schema: trackingDetailsSchema,
  default: {}
  },
  totalPrice: {
    type: Number,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'CREATED',
      'PLACED',
      'SHIPPED',
      'DELIVERED',
      'CANCELED'
    ],
    default: 'CREATED',
  },
  deliveryDate:{
    type: String
  },
  paymentPlan: {
    type: String,
    enum: ['ONETIME', 'PERDELIVERY']
  },
  paymentHistory: {
    type: Array,
    schema: [paymentHistorySchema],
    default: []
  },
  deliveryHistory: {
    type: Array,
    schema: [deliveryHistorySchema],
    default: []
  },
  subscriptionStatus: {
    type: String,
    enum: ['ACTIVE', 'PAUSED', 'CANCELLED'],
  },
  subscriptionMode: {
    type: Boolean,
    default: false,
  },
  parentSubscriptionId: {
    type: String
  },
  subscriptionFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly']
  },
  deliveryFrom:{
    type: String
  },
  deliveryTo:{
    type: String
  },
  createdOn: {
    type: String, // Define `createdOn` as Date type
    default: () => new Date().toISOString(), // Use Date.now as default value
  },
  razorPaymentId: {
    type: String,
  },
  paymentStatus: {
    type: String,
    enum: ['INITIATED', 'PAID', 'FAILED'],
    default: 'INITIATED',
  }

})


// Create the model for orders
const OrderModel = dynamoose.model('order', orderSchema, { tableName: 'siddha_order' });

export { OrderModel };
