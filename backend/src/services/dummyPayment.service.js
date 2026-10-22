import { randomBytes } from 'node:crypto';

// Stand-in for a real payment gateway (Paystack, Hubtel, ...). No money moves;
// it just decides PAID or PENDING and hands back a made-up reference, the same
// shape a real gateway call would return. Swap this file out once a real
// provider is wired up — nothing else needs to change.
//
// - CASH is settled in person, so it's never "paid" at checkout time.
// - Mobile money always succeeds here. A real gateway would call out to MTN /
//   Telecel / AirtelTigo and could come back declined; callers should still
//   treat a PENDING result as possible.
export async function chargeDummyPayment({ method, amount }) {
  if (method === 'CASH') {
    return { status: 'PENDING', reference: null };
  }

  void amount; // a real gateway would submit this; the dummy one doesn't need it
  const reference = `DUMMY-${randomBytes(4).toString('hex').toUpperCase()}`;
  return { status: 'PAID', reference };
}
