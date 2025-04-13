import { generateAccessToken, paypal } from "../lib/paypal";


// Test to generate access token from paypal

test("generateAccessToken", async () => {
  const tokenResponse = await generateAccessToken();

  console.log(tokenResponse);
  expect(typeof tokenResponse).toBe("string");
  expect(tokenResponse.length).toBeGreaterThan(0);
});


// Test to create order from paypal

test("createOrder", async () => {
 
  const price = 10.0;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);
  expect(orderResponse).toHaveProperty("id");
  expect(orderResponse).toHaveProperty("status");
  expect(orderResponse.status).toBe("CREATED");
});

// Test to capture payment with a mock order

test("capturePayment", async () => {
  const orderId = "1234567890";
  const mockCapturePaymer = jest
  .spyOn(paypal, "capturePayment").mockResolvedValue({
    status: "COMPLETED",
  });

  const captureResponse = await paypal.capturePayment(orderId);
  expect(captureResponse).toHaveProperty("status");
  expect(captureResponse.status).toBe("COMPLETED");

  mockCapturePaymer.mockRestore();
});

