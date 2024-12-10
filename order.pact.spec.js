// (1) Import the pact library and matching methods
const { Pact } = require("@pact-foundation/pact");
const { OrderClient } = require("./api");
const { Order } = require("./order");
const { Matchers } = require("@pact-foundation/pact");
const { like, regex } = Matchers;
const chai = require("chai");
const expect = chai.expect;

// (2) Configure our Pact library
const mockProvider = new Pact({
  consumer: "toonpt-consumer-order",
  provider: "toonpt-provider",
  logLevel: "info",
});

describe("Order API test", () => {
  // (3) Setup Pact lifecycle hooks
  before(() => mockProvider.setup());
  afterEach(() => mockProvider.verify());
  after(() => mockProvider.finalize());

  it("get order by ID", async () => {
    // (4) Arrange
    const expectedOrder = {
      id: 10,
      type: "pizza",
      name: "Margharita",
      active: true,
    };

    await mockProvider.addInteraction({
      state: "order consumer state",
      uponReceiving: "a request to get a order",
      withRequest: {
        method: "GET",
        path: "/orders/10",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: like(expectedOrder),
      },
    });

    // (5) Act
    const api = new OrderClient(mockProvider.mockService.baseUrl);
    const order = await api.getOrder(10);

    // (6) Assert that we got the expected response
    expect(order).to.deep.equal(
      new Order(10, "Margharita", "pizza", expectedOrder)
    );
  });
});
