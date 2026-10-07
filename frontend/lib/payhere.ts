
export type PayHerePayload = Record<string, string>;

export interface PayHerePaymentResponse {
  checkout_url: string;
  payload: PayHerePayload;
}

export function redirectToPayHere(
  payment: PayHerePaymentResponse
) {
  const { checkout_url, payload } = payment;

  if (
    checkout_url !== "https://sandbox.payhere.lk/pay/checkout" &&
    checkout_url !== "https://www.payhere.lk/pay/checkout"
  ) {
    throw new Error("Invalid PayHere checkout URL");
  }

  const form = document.createElement("form");

  form.method = "POST";
  form.action = checkout_url;
  form.style.display = "none";

  Object.entries(payload).forEach(([key, value]) => {
    const input = document.createElement("input");

    input.type = "hidden";
    input.name = key;
    input.value = String(value);

    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
}


