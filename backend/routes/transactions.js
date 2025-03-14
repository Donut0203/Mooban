const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const db = require('../config/database');

// Get all transactions
router.get('/', verifyToken, async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT t.*, m.first_name, m.last_name, 
             CONCAT(m.first_name, ' ', m.last_name) as name
      FROM transactions t
      JOIN member m ON t.member_id = m.member_id
      ORDER BY t.transaction_date DESC
    `);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get transactions by member ID
router.get('/member/:memberId', verifyToken, async (req, res) => {
  try {
    const [transactions] = await db.query(`
      SELECT t.*, m.first_name, m.last_name, 
             CONCAT(m.first_name, ' ', m.last_name) as name
      FROM transactions t
      JOIN member m ON t.member_id = m.member_id
      WHERE t.member_id = ?
      ORDER BY t.transaction_date DESC
    `, [req.params.memberId]);
    
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching member transactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new deposit transaction
router.post('/deposit', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { member_id, amount } = req.body;
    
    if (!member_id || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    // Check if member exists
    const [members] = await connection.query(
      'SELECT * FROM member WHERE member_id = ?',
      [member_id]
    );
    
    if (members.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Create transaction record
    const [result] = await connection.query(
      `INSERT INTO transactions (
        member_id, transaction_status, amount, created_by, updated_by
      ) VALUES (?, 'deposit', ?, ?, ?)`,

      [member_id, amount, req.userId, req.userId]
    );
    
    // Update member balance
    const [balanceResult] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    if (balanceResult.length > 0) {
      // Update existing balance
      await connection.query(
        `UPDATE deposit_balance 
         SET deposit_balance = deposit_balance + ? 
         WHERE member_id = ?`,
        [amount, member_id]
      );
    } else {
      // Create new balance record
      await connection.query(
        `INSERT INTO deposit_balance (member_id, deposit_balance) 
         VALUES (?, ?)`,
        [member_id, amount]
      );
    }
    
    // Get updated balance
    const [updatedBalance] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    await connection.commit();
    
    res.status(201).json({
      message: 'Deposit successful',
      transaction_id: result.insertId,
      current_balance: updatedBalance[0].deposit_balance
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating deposit transaction:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Create a new withdrawal transaction
router.post('/withdraw', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { member_id, amount } = req.body;
    
    if (!member_id || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    // Check if member exists
    const [members] = await connection.query(
      'SELECT * FROM member WHERE member_id = ?',
      [member_id]
    );
    
    if (members.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if member has sufficient balance
    const [balanceResult] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    if (balanceResult.length === 0 || balanceResult[0].deposit_balance < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }
    
    // Create transaction record
    const [result] = await connection.query(
      `INSERT INTO transactions (
        member_id, transaction_status, amount, created_by, updated_by
      ) VALUES (?, 'withdraw', ?, ?, ?)`,

      [member_id, amount, req.userId, req.userId]
    );
    
    // Update member balance
    await connection.query(
      `UPDATE deposit_balance 
       SET deposit_balance = deposit_balance - ? 
       WHERE member_id = ?`,
      [amount, member_id]
    );
    
    // Get updated balance
    const [updatedBalance] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    await connection.commit();
    
    res.status(201).json({
      message: 'Withdrawal successful',
      transaction_id: result.insertId,
      current_balance: updatedBalance[0].deposit_balance
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating withdrawal transaction:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Create a new loan repayment transaction
router.post('/loan-repayment', verifyToken, async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const { member_id, loan_id, amount } = req.body;
    
    if (!member_id || !loan_id || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Invalid input data' });
    }
    
    // Check if member exists
    const [members] = await connection.query(
      'SELECT * FROM member WHERE member_id = ?',
      [member_id]
    );
    
    if (members.length === 0) {
      return res.status(404).json({ message: 'Member not found' });
    }
    
    // Check if loan exists and belongs to the member
    const [loans] = await connection.query(
      'SELECT * FROM loanagreement WHERE loan_id = ? AND member_id = ?',
      [loan_id, member_id]
    );
    
    if (loans.length === 0) {
      return res.status(404).json({ message: 'Loan not found or does not belong to this member' });
    }
    
    // Create transaction record
    const [result] = await connection.query(
      `INSERT INTO transactions (
        member_id, transaction_status, amount, created_by, updated_by
      ) VALUES (?, 'loan_repayment', ?, ?, ?)`,

      [member_id, amount, req.userId, req.userId]
    );
    
    // Update loan balance
    const [balanceResult] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    if (balanceResult.length > 0) {
      // Update existing balance
      await connection.query(
        `UPDATE deposit_balance 
         SET loan_balance = loan_balance - ? 
         WHERE member_id = ?`,
        [amount, member_id]
      );
    } else {
      // Create new balance record
      await connection.query(
        `INSERT INTO deposit_balance (member_id, loan_balance) 
         VALUES (?, ?)`,

        [member_id, -amount]
      );
    }
    
    // Get updated balance
    const [updatedBalance] = await connection.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [member_id]
    );
    
    await connection.commit();
    
    res.status(201).json({
      message: 'Loan repayment successful',
      transaction_id: result.insertId,
      current_loan_balance: updatedBalance[0].loan_balance
    });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating loan repayment transaction:', error);
    res.status(500).json({ message: 'Server error' });
  } finally {
    connection.release();
  }
});

// Get member balance
router.get('/balance/:memberId', verifyToken, async (req, res) => {
  try {
    const [balances] = await db.query(
      `SELECT * FROM deposit_balance WHERE member_id = ?`,
      [req.params.memberId]
    );
    
    if (balances.length === 0) {
      return res.json({
        member_id: parseInt(req.params.memberId),
        deposit_balance: 0,
        loan_balance: 0
      });
    }
    
    res.json(balances[0]);
  } catch (error) {
    console.error('Error fetching member balance:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
