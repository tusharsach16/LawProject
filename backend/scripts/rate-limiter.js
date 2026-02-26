const axios = require("axios");

const API = "https://lawproject-uis1.onrender.com/api/login";

async function testLoginLimiter() {
  console.log("🧪 Testing Login Rate Limiter\n");

  for (let i = 1; i <= 7; i++) {
    try {
      const res = await axios.post(API, {
        email: "parulc@gmail.com",
        password: "wrong"
      });
      console.log(`Attempt ${i}:`, res.status);
    } catch (err) {
      console.log(
        `Attempt ${i}:`,
        err.response?.status,
        err.response?.data?.message
      );
    }
  }
}

testLoginLimiter();
