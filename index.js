const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://admin-food-ordering-app-b3f0e-default-rtdb.asia-southeast1.firebasedatabase.app/"
});

const db = admin.database();
const ref = db.ref("orders");

console.log("🚀 Listening for new orders...");

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
    const response = await admin.messaging().sendToTopic("admin", payload);
    console.log("✅ Notification sent:", response);
    await snapshot.ref.update({ notified: true });
  } catch (error) {
    console.error("❌ Error sending FCM:", error);
  }
});
