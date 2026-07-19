import { NextRequest, NextResponse } from "next/server";
import { confirmOrderPayment } from "@/lib/orders";
import { createSession } from "@/lib/auth";

/**
 * Webhook fictício de pagamento, usado enquanto Stripe/Mercado Pago não
 * estão conectados. Tem a mesma forma que um webhook real vai ter (recebe
 * a notificação, confirma o pedido de forma idempotente via WebhookEvent) —
 * a diferença é que aqui quem "notifica" é o próprio comprador clicando em
 * "simular pagamento aprovado", em vez de um gateway com assinatura
 * verificada. Trocar pelo provedor real significa validar a assinatura do
 * provedor aqui e extrair o orderId dos metadados da sessão de checkout;
 * o restante do fluxo (confirmOrderPayment) não muda.
 */
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const orderId = String(formData.get("orderId") ?? "");

  if (!orderId) {
    return NextResponse.json({ error: "orderId ausente" }, { status: 400 });
  }

  const order = await confirmOrderPayment(orderId, {
    provider: "MANUAL",
    providerEventId: `manual-${orderId}`,
  });

  // Nesse fluxo fictício quem chama o "webhook" é o próprio navegador do
  // comprador (num provedor real seria uma chamada servidor-a-servidor sem
  // contexto de sessão) — aproveitamos isso para já deixar a pessoa logada.
  await createSession(order.userId);

  return NextResponse.redirect(new URL(`/pedido/${orderId}`, request.url), 303);
}
