import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBookingPrice } from '../src/services/pricing.js';

const silver = { name: 'Silver', pricePaise: 18000 };
const gold = { name: 'Gold', pricePaise: 28000 };
const recliner = { name: 'Recliner', pricePaise: 45000 };

test('calculates one Silver ticket without offers', () => {
  const result = calculateBookingPrice({ tier: silver, quantity: 1 });
  assert.equal(result.ticketSubtotalPaise, 18000);
  assert.equal(result.convenienceFeePaise, 2500);
  assert.equal(result.gstPaise, 3690);
  assert.equal(result.finalTotalPaise, 24190);
});

test('calculates multiple Gold tickets and festival discount', () => {
  const result = calculateBookingPrice({ tier: gold, quantity: 2, festivalOffer: true });
  assert.equal(result.ticketSubtotalPaise, 56000);
  assert.equal(result.festivalDiscountPaise, 10000);
  assert.equal(result.finalTotalPaise, 60180);
});

test('calculates Recliner member pricing', () => {
  const result = calculateBookingPrice({ tier: recliner, quantity: 1, member: true });
  assert.equal(result.memberDiscountPaise, 4500);
  assert.equal(result.finalTotalPaise, 50740);
});

test('caps member discount and applies both offers sequentially', () => {
  const result = calculateBookingPrice({ tier: recliner, quantity: 2, member: true, festivalOffer: true });
  assert.equal(result.memberDiscountPaise, 8000);
  assert.equal(result.totalDiscountPaise, 18000);
});

test('never creates a negative discounted subtotal', () => {
  const result = calculateBookingPrice({ tier: { name: 'Silver', pricePaise: 10 }, quantity: 1, member: true, festivalOffer: true });
  assert.equal(result.discountedSubtotalPaise, 0);
  assert.equal(result.finalTotalPaise, 2950);
});

test('rejects zero, negative, fractional, and missing quantities', () => {
  for (const quantity of [0, -1, 1.5, undefined]) {
    assert.throws(() => calculateBookingPrice({ tier: silver, quantity }), /valid tier|positive whole-number/);
  }
});
