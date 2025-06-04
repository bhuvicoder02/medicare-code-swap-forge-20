
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

const HealthCard = require('../models/HealthCard');
const User = require('../models/User');
const Loan = require('../models/Loan');

// Generate health card number
const generateCardNumber = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HC-${timestamp.slice(-8)}-${random}`;
};

// @route   GET api/health-cards
// @desc    Get all health cards for a user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const healthCards = await HealthCard.find({ user: req.user.id }).sort({ issueDate: -1 });
    res.json(healthCards);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/health-cards/apply
// @desc    Apply for a health card
// @access  Private
router.post('/apply', [
  auth,
  [
    check('uhid', 'UHID is required').not().isEmpty(),
    check('planType', 'Plan type is required').isIn(['basic', 'silver', 'gold', 'platinum'])
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { uhid, planType, initialCredit } = req.body;

    // Verify user exists and KYC is completed
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (user.kycStatus !== 'completed') {
      return res.status(400).json({ msg: 'KYC must be completed before applying for health card' });
    }

    if (user.uhid !== uhid) {
      return res.status(400).json({ msg: 'UHID does not match user record' });
    }

    // Check if user already has an active health card
    const existingCard = await HealthCard.findOne({ 
      user: req.user.id, 
      status: { $in: ['active', 'pending'] } 
    });

    if (existingCard) {
      return res.status(400).json({ msg: 'You already have an active or pending health card application' });
    }

    // Set credit limits based on plan type
    const creditLimits = {
      basic: 25000,
      silver: 50000,
      gold: 100000,
      platinum: 200000
    };

    const cardNumber = generateCardNumber();
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 3); // 3 years validity

    const newHealthCard = new HealthCard({
      cardNumber,
      user: req.user.id,
      availableCredit: initialCredit || creditLimits[planType],
      usedCredit: 0,
      status: 'pending', // Requires admin approval
      planType,
      expiryDate
    });

    const healthCard = await newHealthCard.save();
    res.json(healthCard);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/health-cards/topup
// @desc    Top up health card balance
// @access  Private
router.post('/topup', [
  auth,
  [
    check('cardId', 'Card ID is required').not().isEmpty(),
    check('amount', 'Amount must be a positive number').isFloat({ min: 1 }),
    check('paymentMethod', 'Payment method is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { cardId, amount, paymentMethod } = req.body;

    const healthCard = await HealthCard.findById(cardId);
    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    // Verify user owns the card
    if (healthCard.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (healthCard.status !== 'active') {
      return res.status(400).json({ msg: 'Card must be active to top up' });
    }

    // Simulate payment processing
    const paymentSuccess = Math.random() > 0.1; // 90% success rate

    if (!paymentSuccess) {
      return res.status(400).json({ msg: 'Payment failed. Please try again.' });
    }

    // Update card balance
    healthCard.availableCredit += amount;
    await healthCard.save();

    // Create transaction record (you would implement Transaction model)
    const transaction = {
      id: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardId: healthCard._id,
      type: 'topup',
      amount,
      description: `Top-up via ${paymentMethod}`,
      status: 'completed',
      date: new Date(),
      balanceAfter: healthCard.availableCredit
    };

    res.json({
      message: 'Top-up successful',
      healthCard,
      transaction
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/health-cards/transfer-loan
// @desc    Transfer approved loan amount to health card
// @access  Private
router.post('/transfer-loan', [
  auth,
  [
    check('loanId', 'Loan ID is required').not().isEmpty(),
    check('cardId', 'Card ID is required').not().isEmpty()
  ]
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { loanId, cardId } = req.body;

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ msg: 'Loan not found' });
    }

    if (loan.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (loan.status !== 'approved') {
      return res.status(400).json({ msg: 'Loan must be approved to transfer funds' });
    }

    const healthCard = await HealthCard.findById(cardId);
    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    if (healthCard.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    if (healthCard.status !== 'active') {
      return res.status(400).json({ msg: 'Health card must be active to receive funds' });
    }

    // Transfer loan amount to health card
    const transferAmount = loan.loanDetails.approvedAmount || loan.loanDetails.requestedAmount;
    healthCard.availableCredit += transferAmount;
    await healthCard.save();

    // Update loan status to indicate funds transferred
    loan.status = 'disbursed';
    await loan.save();

    res.json({
      message: 'Loan amount transferred to health card successfully',
      transferAmount,
      healthCard,
      loan
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/health-cards/:id
// @desc    Get health card by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const healthCard = await HealthCard.findById(req.params.id);

    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    // Make sure user owns health card or is admin
    if (healthCard.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    res.json(healthCard);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Health card not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/health-cards/:id/approve
// @desc    Approve health card (admin only)
// @access  Private
router.put('/:id/approve', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(401).json({ msg: 'Not authorized to approve health cards' });
  }

  try {
    const healthCard = await HealthCard.findById(req.params.id);
    if (!healthCard) {
      return res.status(404).json({ msg: 'Health card not found' });
    }

    healthCard.status = 'active';
    await healthCard.save();

    res.json({ message: 'Health card approved successfully', healthCard });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
