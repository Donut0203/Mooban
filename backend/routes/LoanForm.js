const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');

const db = require('../config/database');

// Create new loan
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      member_id,
      loan_amount,
      interest_rate,
      repayment_period,
      start_date,
      end_date,
      guarantee_required,
      guarantor_name,
      guarantor_id_card,
      guarantor_address,
    } = req.body;

    // Insert loan data
    const [loanResult] = await db.query(
      `INSERT INTO loan (member_id, loan_amount, interest_rate, repayment_period, start_date, end_date, guarantee_required, created_by, updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id, loan_amount, interest_rate, repayment_period, start_date, end_date, guarantee_required, req.userId, req.userId
      ]
    );

    const loanId = loanResult.insertId;

    if (guarantor_name) {
      // Insert guarantor data if provided
      await db.query(
        `INSERT INTO guarantor (loan_id, guarantor_name, guarantor_id_card, guarantor_address, created_by, updated_by)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          loanId, guarantor_name, guarantor_id_card, guarantor_address, req.userId, req.userId
        ]
      );
    }

    res.status(201).json({ message: 'Loan application submitted successfully', loan_id: loanId });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
