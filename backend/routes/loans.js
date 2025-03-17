const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const db = require('../config/database');

// Get all loans with member information
router.get('/', verifyToken, async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT l.*, m.first_name as member_first_name, m.last_name as member_last_name
      FROM loanagreement l
      JOIN member m ON l.member_id = m.member_id
      ORDER BY l.loan_id DESC
    `);
    
    res.json(loans);
  } catch (error) {
    console.error('Error fetching loans:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get loan by ID with member information
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT l.*, m.first_name as member_first_name, m.last_name as member_last_name
      FROM loanagreement l
      JOIN member m ON l.member_id = m.member_id
      WHERE l.loan_id = ?
    `, [req.params.id]);
    
    if (loans.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }
    
    const loan = loans[0];
    loan.borrower_name = `${loan.member_first_name} ${loan.member_last_name}`.trim();
    
    res.json(loan);
  } catch (error) {
    console.error('Error fetching loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new loan
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Received loan data:', req.body);

    // รับข้อมูลจาก FormData
    const total_amount = req.body.total_amount
    const member_id = req.body.member_id;
    const loan_balance= req.body.loan_balance;
    const interest_rate = req.body.interest_rate || 1; // ค่าเริ่มต้น 1%
    const repayment_period = req.body.repayment_period || 12; // ค่าเริ่มต้น 12 เดือน
    const start_date = req.body.start_date || new Date().toISOString().split('T')[0]; // วันที่ปัจจุบัน
    const end_date = req.body.end_date || new Date().toISOString().split('T')[0]; // วันที่ปัจจุบัน
    const guarantee_required = req.body.guarantee_required || 1;

    // แปลง guarantors จาก JSON string เป็น object
    let guarantors = [];
    try {
      if (req.body.guarantors) {
        guarantors = JSON.parse(req.body.guarantors);
      }
    } catch (error) {
      console.error('Error parsing guarantors JSON:', error);
    }

    // Validate required fields
    if (!member_id || !total_amount || !interest_rate || !repayment_period || !start_date || !end_date) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Insert loan data
    const [loanResult] = await db.query(
      `INSERT INTO loanagreement (
        member_id, loan_balance, interest_rate, repayment_period, 
        start_date, end_date, guarantee_required, created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        member_id, total_amount, interest_rate, repayment_period, 
        start_date, end_date, guarantee_required || 1, req.userId, req.userId
      ]
    );
    
    await db.query(
      `INSERT INTO transactions (
        member_id, transaction_status, amount, created_by, updated_by
      ) VALUES (?, 'loan_withdrawal', ?, ?, ?)`,

      [member_id, total_amount, req.userId, req.userId]
    );

    await db.query(
      `UPDATE deposit_balance 
       SET loan_balance = loan_balance + ? 
       WHERE member_id = ?`,
      [total_amount, member_id]
    );

    const loanId = loanResult.insertId;

    // Insert guarantors if provided
    if (guarantors && Array.isArray(guarantors) && guarantors.length > 0) {
      for (const guarantor of guarantors) {
        await db.query(
          `INSERT INTO guarantor (
            loan_id, member_id, guarantor_name, guarantor_id_card, guarantor_address,
            created_by, updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            loanId,
            guarantor.member_id || null,
            guarantor.name,
            guarantor.id_card,
            guarantor.address,
            req.userId,
            req.userId
          ]
        );
      }
    }

    res.status(201).json({ 
      message: 'Loan created successfully', 
      loan_id: loanId 
    });
  } catch (error) {
    console.error('Error creating loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update loan
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const {
      member_id,
      loan_balance,
      interest_rate,
      repayment_period,
      start_date,
      end_date,
      guarantee_required
    } = req.body;

    // Validate required fields
    if (!member_id || !loan_balance || !interest_rate || !repayment_period || !start_date || !end_date) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if loan exists
    const [existingLoans] = await db.query(
      'SELECT * FROM loanagreement WHERE loan_id = ?',
      [req.params.id]
    );

    if (existingLoans.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Update loan data
    await db.query(
      `UPDATE loanagreement SET 
        member_id = ?, 
        loan_balance = ?, 
        interest_rate = ?, 
        repayment_period = ?, 
        start_date = ?, 
        end_date = ?, 
        guarantee_required = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE loan_id = ?`,
      [
        member_id, 
        loan_balance, 
        interest_rate, 
        repayment_period, 
        start_date, 
        end_date, 
        guarantee_required || 1,
        req.userId,
        req.params.id
      ]
    );

    res.json({ message: 'Loan updated successfully' });
  } catch (error) {
    console.error('Error updating loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete loan
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if loan exists
    const [existingLoans] = await db.query(
      'SELECT * FROM loanagreement WHERE loan_id = ?',
      [req.params.id]
    );

    if (existingLoans.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Delete loan
    await db.query('DELETE FROM loanagreement WHERE loan_id = ?', [req.params.id]);

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting loan:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;