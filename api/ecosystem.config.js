module.exports = {
  apps : [
      {
        name: "mudita-api",
        script: "./dist/main.js",
        watch: true,
        env: {
          "GOOGLE_APPLICATION_CREDENTIALS": "./sentiment.json",
        }
      }
  ]
}