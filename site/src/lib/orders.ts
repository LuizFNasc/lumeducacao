import { prisma } from "@/lib/prisma";
import type { PaymentProvider } from "@/generated/prisma/client";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

export async function getOrCreateCustomer(email: string, name?: string) {
  const role = ADMIN_EMAILS.includes(email.toLowerCase()) ? "ADMIN" : "CUSTOMER";

  return prisma.user.upsert({
    where: { email },
    update: { ...(name ? { name } : {}), role },
    create: { email, name, role },
  });
}

interface CreateOrderInput {
  productSlug: string;
  email: string;
  name?: string;
}

export async function createOrder({ productSlug, email, name }: CreateOrderInput) {
  const product = await prisma.product.findFirst({
    where: { slug: productSlug, status: "PUBLISHED" },
  });

  if (!product) {
    throw new Error("Produto não encontrado ou indisponível para compra.");
  }

  const customer = await getOrCreateCustomer(email, name);

  return prisma.order.create({
    data: {
      userId: customer.id,
      status: "PENDING",
      // Provedor real (Stripe/Mercado Pago) entra em uma etapa futura;
      // por enquanto o checkout é fictício e usa um "webhook" simulado.
      provider: "MANUAL",
      totalCents: product.priceCents,
      customerEmail: email,
      items: {
        create: [
          {
            productId: product.id,
            unitPriceCents: product.priceCents,
            quantity: 1,
          },
        ],
      },
    },
  });
}

interface ConfirmPaymentInput {
  provider: PaymentProvider;
  providerEventId: string;
  providerPaymentId?: string;
}

/**
 * Núcleo do processamento de confirmação de pagamento — pensado para ser
 * chamado por um handler de webhook real (Stripe/Mercado Pago) no futuro,
 * sem mudar essa lógica. Idempotente via WebhookEvent: reenviar o mesmo
 * evento não duplica entitlements nem reprocessa o pedido.
 */
export async function confirmOrderPayment(orderId: string, input: ConfirmPaymentInput) {
  return prisma.$transaction(async (tx) => {
    const eventKey = { provider_eventId: { provider: input.provider, eventId: input.providerEventId } };

    const existingEvent = await tx.webhookEvent.findUnique({ where: eventKey });
    if (existingEvent?.processedAt) {
      return tx.order.findUniqueOrThrow({ where: { id: orderId } });
    }

    await tx.webhookEvent.upsert({
      where: eventKey,
      update: { processedAt: new Date() },
      create: {
        provider: input.provider,
        eventId: input.providerEventId,
        payload: {},
        processedAt: new Date(),
      },
    });

    const order = await tx.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: { include: { product: { include: { bundleItems: true } } } } },
    });

    if (order.status !== "PAID") {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paidAt: new Date(),
          providerPaymentId: input.providerPaymentId,
        },
      });

      for (const item of order.items) {
        await tx.entitlement.upsert({
          where: { userId_productId: { userId: order.userId, productId: item.productId } },
          update: {},
          create: {
            userId: order.userId,
            productId: item.productId,
            orderId: order.id,
            source: "PURCHASE",
          },
        });

        // Comprar um pacote (BUNDLE) libera também cada item que o compõe.
        for (const bundleItem of item.product.bundleItems) {
          await tx.entitlement.upsert({
            where: {
              userId_productId: { userId: order.userId, productId: bundleItem.itemProductId },
            },
            update: {},
            create: {
              userId: order.userId,
              productId: bundleItem.itemProductId,
              orderId: order.id,
              source: "PURCHASE",
            },
          });
        }
      }
    }

    return tx.order.findUniqueOrThrow({ where: { id: order.id } });
  });
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      user: true,
    },
  });
}
