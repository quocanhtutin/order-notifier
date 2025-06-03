
const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.TYPE,
  project_id: process.env.PROJECT_ID,
  private_key_id: process.env.PRIVATE_KEY_ID,
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.CLIENT_EMAIL,
  client_id: process.env.CLIENT_ID,
  auth_uri: process.env.AUTH_URI,
  token_uri: process.env.TOKEN_URI,
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.CLIENT_X509_CERT_URL
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://admin-food-ordering-app-b3f0e-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();
const ref = db.ref("OrderDetails");

console.log("🚀 Listening for new orders...");
console.log("🧪 send() exists:", typeof admin.messaging().send);


ref.on("child_added", async (snapshot) => {
  const order = snapshot.val();
  const orderId = snapshot.key;

  if (order.notified === true) return;

  console.log("🛒 New order:", orderId);

  const payload = {
    notification: {
      title: "Đơn hàng mới",
      body: `Khách ${order.customerName || "ẩn danh"} đặt tổng ${order.total || 0}₫`,
    },
    data: {
      orderId: orderId
    }
  };

  try {
    const response = await admin.messaging().send({
      topic: "admin",
      ...payload
    });
    console.log("✅ Notification sent:", response);
    await snapshot.ref.update({ notified: true });
  } catch (error) {
    console.error("❌ Error sending FCM:", error);
  }

});
