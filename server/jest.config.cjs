module.exports = {
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "./",
        outputName: "server-test-results.xml",
      },
    ],
  ],
};
