import replace from "rollup-plugin-replace";

export default [
  {
    input: "client/src/js/main.js",
    output: {
      file: "client/dist/js/main.js",
      format: "esm"
    },
    plugins: [
      replace({
        deliminters: ["{{", "}}"],
        PORT: 4000
      })
    ]
  },
  {
    input: "client/src/js/restaurant_info.js",
    output: {
      file: "client/dist/js/restaurant_info.js",
      format: "esm"
    },
    plugins: [
      replace({
        deliminters: ["{{", "}}"],
        PORT: 4000
      })
    ]
  }
];
