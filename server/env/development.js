module.exports = {
  "DATABASE_URI": "mongodb://localhost:27017/capstone",
  "SESSION_SECRET": "three people in a tree",
  // "TWITTER": {
  //   "consumerKey": "INSERT_TWITTER_CONSUMER_KEY_HERE",
  //   "consumerSecret": "INSERT_TWITTER_CONSUMER_SECRET_HERE",
  //   "callbackUrl": "INSERT_TWITTER_CALLBACK_HERE"
  // },
  "FACEBOOK": {
    "clientID": "569676436533097",
    "clientSecret": "7bffea01bd532e6b5f35081b137f718f",
    "callbackURL": "http://127.0.0.1:1337/auth/facebook/callback"
  },
  "GOOGLE": {
    "clientID": "639827950694-bnuqcu2fdticck9na71q8a2ic8msv4sm.apps.googleusercontent.com",
    "clientSecret": "yHE2WpHvC0q0Bj6Bi3zXwk-A",
    "callbackURL": "http://127.0.0.1:1337/auth/google/callback"
  }
};