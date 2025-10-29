require('dotenv').config();

module.exports = {
  expo: {
    name: "mvp_community",
    slug: "mvp_community",
    extra: {
      EXPO_PUBLIC_API_BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL
    }
  }
};
