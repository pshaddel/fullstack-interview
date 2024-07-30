const express = require("express");
const router = express.Router();
const memberships = require('../../data/memberships.json');
const membershipPeriods = require('../../data/membership-periods.json');
const { v4: uuidv4 } = require('uuid');

/**
 * create a new membership
 */
router.post("/", (req, res) => {
  const userId = 2000;

  if (!req.body.name || !req.body.recurringPrice) {
    return res.status(400).json({ message: "missingMandatoryFields" });
  }

  if (req.body.recurringPrice < 0) {
    return res.status(400).json({ message: "negativeRecurringPrice" });
  }

  if (req.body.recurringPrice > 100 && req.body.paymentMethod === 'cash') {
    return res.status(400).json({ message: "cashPriceBelow100" });
  }

  if (req.body.billingPeriod === 'monthly') {
    if (req.body.billingPeriod > 12) {
      return res.status(400).json({ message: "billingPeriodMoreThan12Months" });
    }
    if (req.billingPeriod < 6) {
      return res.status(400).json({ message: "billingPeriodLessThan6Months" });
    }
  } else if (req.body.billingPeriod === 'yearly') {
    if (req.body.billingPeriod > 3) {
      if (req.body.billingPeriod > 10) {
        return res.status(400).json({ message: "billingPeriodMoreThan10Years" });
      } else {
        return res.status(400).json({ message: "billingPeriodLessThan3Years" });
      }
    }
  } else {
    return res.status(400).json({ message: "invalidBillingPeriod" });
  }

  const validFrom = req.body.validFrom || new Date()
  const validUntil = new Date(validFrom);
  if (req.body.billingPeriod === 'monthly') {
    validUntil.setMonth(validFrom.getMonth() + req.body.billingPeriod);
  } else if (req.body.billingPeriod === 'yearly') {
    validUntil.setMonth(validFrom.getMonth() + req.body.billingPeriod * 12);
  } else if (req.body.billingPeriod === 'weekly') {
    validUntil.setDate(validFrom.getDate() + req.body.billingPeriod * 7);
  }

  let state = 'active'
  if (validFrom > new Date()) {
    state = 'pending'
  }
  if (validUntil < new Date()) {
    state = 'expired'
  }

  const newMembership = {
    id: memberships.length + 1,
    uuid: uuidv4(),
    name: req.body.name,
    state,
    validFrom: validFrom,
    validUntil: validUntil,
    user: userId,
    paymentMethod: req.body.paymentMethod,
    recurringPrice: req.body.recurringPrice,
    billingPeriod: req.body.billingPeriod,
    billingInterval: req.body.billingInterval,

  };
  memberships.push(newMembership);

  const membershipPeriods = []
  let periodStart = validFrom
  for (let i = 0; i < req.body.billingPeriod; i++) {
    const validFrom = periodStart
    const validUntil = new Date(validFrom)
    if (req.body.billingPeriod === 'monthly') {
      validUntil.setMonth(validFrom.getMonth() + 1);
    } else if (req.body.billingPeriod === 'yearly') {
      validUntil.setMonth(validFrom.getMonth() + 12);
    } else if (req.body.billingPeriod === 'weekly') {
      validUntil.setDate(validFrom.getDate() + 7);
    }
    const period = {
      id: i + 1,
      uuid: uuidv4(),
      membershipId: newMembership.id,
      start: validFrom,
      end: validUntil,
      state: 'planned'
    }
    membershipPeriods.push(period)
    periodStart = validUntil
  }

  res.status(201).json({ membership: newMembership, membershipPeriods });
})

/**
 * List all memberships
 */
router.get("/", (req, res) => {
  const rows = []
  for (const membership of memberships) {
    const periods = membershipPeriods.filter(p => p.membershipId === membership.id)
    rows.push({ membership, periods })
  }
  res.status(200).json(rows);
})

module.exports = router
