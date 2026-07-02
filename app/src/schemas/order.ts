import { z } from "zod"

const moneySchema = z
  .object({
    orderProductsCost: z.number(),
    orderDeliveryCost: z.number(),
    orderPayformCost: z.number(),
    orderInsuranceCost: z.number(),
  })
  .partial()

const orderCurrencySchema = moneySchema
  .extend({
    currencyId: z.string(),
    orderCurrencyValue: z.number(),
    billingCurrencyRate: z.number(),
  })
  .partial()

const orderBaseCurrencySchema = moneySchema
  .extend({
    orderDeliveryVat: z.number(),
    orderPayformVat: z.number(),
    orderInsuranceVat: z.number(),
    billingCurrency: z.string(),
  })
  .partial()

const paymentsSchema = z
  .object({
    orderPaymentDays: z.number(),
    orderPaymentType: z.string(),
    orderRebatePercent: z.number(),
    orderWorthCalculateType: z.string(),
    orderVatExists: z.string(),
    orderCurrency: orderCurrencySchema,
    orderBaseCurrency: orderBaseCurrencySchema,
  })
  .partial()

const dispatchSchema = z
  .object({
    courierWebserviceOnly: z.boolean(),
    deliveryWeight: z.number(),
    courierName: z.string(),
    courierId: z.number(),
    deliveryPackageId: z.string(),
    deliveryDate: z.string(),
    estimatedDeliveryDate: z.string(),
    deliveryDateAdditional: z.string(),
  })
  .partial()

const prepaidSchema = z
  .object({
    voucherNumber: z.string().optional(),
    prepaidId: z.number(),
    paymentOrdinalNumber: z.number(),
    paymentNumber: z.string(),
    paymentAddDate: z.string(),
    paymentModifiedDateByClient: z.string(),
    paymentModifiedDateByShop: z.string(),
    paymentStatus: z.string(),
    payformId: z.number(),
    payformName: z.string(),
    payformAccount: z.string(),
    paymentValue: z.number(),
    currencyId: z.string(),
    paymentType: z.string(),
  })
  .partial()

const preorderSourceDetailsSchema = z
  .object({
    orderSourceTypeId: z.number(),
    orderSourceType: z.string(),
    orderSourceName: z.string(),
    orderSourceId: z.number(),
    entryDate: z.string(),
  })
  .partial()

const orderSourceDetailsSchema = z
  .object({
    fresh: z.string(),
    fulfillment: z.string(),
    sourcePageUrl: z.string().optional(),
    orderSourceName: z.string(),
    orderSourceTypeId: z.number(),
    orderSourceType: z.string(),
    orderSourceId: z.number(),
    orderExternalId: z.string().nullable(),
  })
  .partial()

const orderSourceResultsSchema = z
  .object({
    preorderSourcesDetails: z.array(preorderSourceDetailsSchema),
    orderSourceType: z.string(),
    shopId: z.number(),
    auctionsServiceName: z.string(),
    orderSourceDetails: orderSourceDetailsSchema,
  })
  .partial()

const productResultSchema = z
  .object({
    productOrderPriceBaseCurrency: z.number(),
    productOrderPriceNetBaseCurrency: z.number(),
    label: z.string().nullable(),
    productOrderAdditional: z.string(),
    basketPosition: z.number(),
    productPriceLog: z.string(),
    productId: z.number(),
    productName: z.string(),
    productCode: z.string(),
    sizeId: z.string(),
    sizePanelName: z.string(),
    productSizeCodeExternal: z.string(),
    stockId: z.number(),
    productQuantity: z.number(),
    productWeight: z.number(),
    productVat: z.number(),
    productPanelPrice: z.number(),
    productPanelPriceNet: z.number(),
    remarksToProduct: z.string(),
    productSerialNumbers: z.unknown().nullable(),
    bundleId: z.number(),
    productOrderPrice: z.number(),
    productOrderPriceNet: z.number(),
    orderSalesMode: z.string(),
    versionName: z.string(),
  })
  .partial()

const orderDetailsSchema = z
  .object({
    orderChangeDate: z.string(),
    receivedDate: z.string(),
    payments: paymentsSchema,
    dispatch: dispatchSchema,
    prepaids: z.array(prepaidSchema),
    purchaseDate: z.string(),
    subscriptionId: z.number(),
    orderStatus: z.string(),
    transactionType: z.string().nullable(),
    orderOperatorLogin: z.string(),
    orderPackingPersonLogin: z.string().nullable(),
    splitPayment: z.boolean(),
    apiFlag: z.string(),
    orderConfirmation: z.string(),
    orderAddDate: z.string(),
    orderDispatchDate: z.string().nullable(),
    orderPrepareTime: z.number().nullable(),
    clientNoteToOrder: z.string(),
    clientNoteToCourier: z.string(),
    orderNote: z.string(),
    stockId: z.number(),
    clientRequestInvoice: z.string(),
    clientDeliveryAddressId: z.number(),
    productRemovedInStock: z.string(),
    orderSourceResults: orderSourceResultsSchema,
    auctionInfo: z.record(z.string(), z.unknown()),
    productsResults: z.array(productResultSchema),
    dropshippingOrderStatus: z.string(),
  })
  .partial()

const accountSchema = z
  .object({
    clientId: z.number(),
    clientLogin: z.string(),
    clientEmail: z.string(),
    clientPhone1: z.string(),
    clientPhone2: z.string(),
    clientCodeExternal: z.string(),
  })
  .partial()

const clientBillingAddressSchema = z
  .object({
    clientFirstName: z.string(),
    clientLastName: z.string(),
    clientNip: z.string(),
    clientFirm: z.string(),
    clientAdditional: z.string().optional(),
    clientStreet: z.string(),
    clientZipCode: z.string(),
    clientCity: z.string(),
    clientCountryId: z.string(),
    clientPhone1: z.string(),
    clientPhone2: z.string(),
    clientProvinceId: z.string(),
    clientProvince: z.string(),
    clientNipUeVerified: z.string().nullable(),
    clientCountryName: z.string(),
  })
  .partial()

const clientDeliveryAddressSchema = z
  .object({
    clientDeliveryAddressFirm: z.string(),
    clientDeliveryAddressType: z.string(),
    clientDeliveryAddressPickupPointInternalId: z.number(),
    clientDeliveryAddressId: z.string(),
    clientDeliveryAddressFirstName: z.string(),
    clientDeliveryAddressLastName: z.string(),
    clientDeliveryAddressStreet: z.string(),
    clientDeliveryAddressZipCode: z.string(),
    clientDeliveryAddressCity: z.string(),
    clientDeliveryAddressCountry: z.string(),
    clientDeliveryAddressCountryId: z.string(),
    clientDeliveryAddressPhone1: z.string(),
    clientDeliveryAddressPhone2: z.string(),
    clientDeliveryAddressProvinceId: z.string(),
    clientDeliveryAddressProvince: z.string(),
  })
  .partial()

const clientResultSchema = z
  .object({
    endClientAccount: accountSchema,
    clientBillingAddress: clientBillingAddressSchema,
    clientDeliveryAddress: clientDeliveryAddressSchema,
    clientAccount: accountSchema,
  })
  .partial()

export const idosellOrderSchema = z.object({
  errors: z.array(z.unknown()),
  orderId: z.string(),
  orderSerialNumber: z.number(),
  orderType: z.enum(["p", "t", "n", "r"]),
  orderDetails: orderDetailsSchema,
  clientResult: clientResultSchema,
  orderBridgeNote: z.string(),
})

export type IdosellOrder = z.infer<typeof idosellOrderSchema>
