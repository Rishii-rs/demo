export const PRICING_RULES = Object.freeze({
  festivalDiscountPaise: 10000,
  memberDiscountPercent: 10,
  memberDiscountCapPaise: 15000,
  convenienceFeePaise: 2500,
  gstPercent: 18
});

const roundPaise = (value) => Math.round(value);

export function calculateBookingPrice({ tier, quantity, member = false, festivalOffer = false, rules = PRICING_RULES }) {
  if (!tier || !Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('A valid tier and a positive whole-number quantity are required.');
  }
  const unitPricePaise = Number(tier.pricePaise);
  if (!Number.isSafeInteger(unitPricePaise) || unitPricePaise < 0) {
    throw new Error('Tier price must be a non-negative integer amount in paise.');
  }

  const ticketSubtotalPaise = unitPricePaise * quantity;
  const festivalDiscountPaise = festivalOffer
    ? Math.min(rules.festivalDiscountPaise, ticketSubtotalPaise)
    : 0;
  const afterFestivalPaise = ticketSubtotalPaise - festivalDiscountPaise;
  const uncappedMemberDiscountPaise = member
    ? roundPaise(afterFestivalPaise * rules.memberDiscountPercent / 100)
    : 0;
  const memberDiscountPaise = Math.min(uncappedMemberDiscountPaise, rules.memberDiscountCapPaise, afterFestivalPaise);
  const totalDiscountPaise = festivalDiscountPaise + memberDiscountPaise;
  const discountedSubtotalPaise = ticketSubtotalPaise - totalDiscountPaise;
  const convenienceFeePaise = rules.convenienceFeePaise * quantity;
  const taxablePaise = discountedSubtotalPaise + convenienceFeePaise;
  const gstPaise = roundPaise(taxablePaise * rules.gstPercent / 100);
  const finalTotalPaise = taxablePaise + gstPaise;

  return {
    currency: 'INR',
    quantity,
    unitPricePaise,
    ticketSubtotalPaise,
    festivalDiscountPaise,
    memberDiscountPaise,
    totalDiscountPaise,
    discountedSubtotalPaise,
    convenienceFeePaise,
    taxablePaise,
    gstPaise,
    finalTotalPaise,
    breakdown: [
      { label: `${tier.name} tickets (${quantity} x ${unitPricePaise} paise)`, amountPaise: ticketSubtotalPaise },
      ...(festivalDiscountPaise ? [{ label: 'Festival discount', amountPaise: -festivalDiscountPaise }] : []),
      ...(memberDiscountPaise ? [{ label: 'Member discount', amountPaise: -memberDiscountPaise }] : []),
      { label: 'Subtotal after discounts', amountPaise: discountedSubtotalPaise },
      { label: `Convenience fee (${quantity} x ${rules.convenienceFeePaise} paise)`, amountPaise: convenienceFeePaise },
      { label: `GST (${rules.gstPercent}%)`, amountPaise: gstPaise },
      { label: 'Final payable', amountPaise: finalTotalPaise }
    ]
  };
}
