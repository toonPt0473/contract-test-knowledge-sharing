const { Verifier } = require("@pact-foundation/pact");
const { server } = require("./provider");
require("dotenv").config();
console.log(process.env.PACT_BROKER_BASE_URL);
describe("Pact Verification", () => {
  // (1) Starting the Provider API

  before((done) => server.listen(8081, done));

  it("validates the expectations of Provider service", () => {
    // (2) Telling Pact to use the contracts stored in PactFlow and where the Product API will be running
    const opts = {
      logLevel: "INFO",
      providerBaseUrl: "http://localhost:8081",
      providerVersion: "1.0.0",
      provider: "toonpt-provider",
      providerVersionBranch: "main",
      consumerVersionSelectors: [{ branch: "main" }],
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,

      // pactUrls: [
      // `${process.env.PWD}/pacts/katacoda-consumer-katacoda-provider.json`,
      // ],
      publishVerificationResult: true,
      // enablePending: true,
    };

    // (3) Running the Provider verification task
    return new Verifier(opts).verifyProvider().then((output) => {
      console.log("Pact Verification Complete!");
      console.log(output);
    });
  });
});
