const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/auth');
const db = require('../config/database');

// Get guarantors by loan ID
router.get('/loan/:loanId', verifyToken, async (req, res) => {
  try {
    const [guarantors] = await db.query(
      'SELECT * FROM guarantor WHERE loan_id = ?',
      [req.params.loanId]
    );

    res.json(guarantors);
  } catch (error) {
    console.error('Error fetching guarantors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get guarantor by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const [guarantors] = await db.query(
      'SELECT * FROM guarantor WHERE guarantor_id = ?',
      [req.params.id]
    );

    if (guarantors.length === 0) {
      return res.status(404).json({ message: 'Guarantor not found' });
    }

    res.json(guarantors[0]);
  } catch (error) {
    console.error('Error fetching guarantor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new guarantor
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      loan_id,
      member_id,
      guarantor_name,
      guarantor_id_card,
      guarantor_address,
      borrower_id_card,
      borrower_house_register,
      guarantor1_id_card,
      guarantor1_house_register,
      guarantor2_id_card,
      guarantor2_house_register
    } = req.body;

    // Validate required fields
    if (!loan_id || !guarantor_name || !guarantor_id_card || !guarantor_address) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if loan exists
    const [existingLoans] = await db.query(
      'SELECT * FROM loanagreement WHERE loan_id = ?',
      [loan_id]
    );

    if (existingLoans.length === 0) {
      return res.status(404).json({ message: 'Loan not found' });
    }

    // Insert guarantor data
    const [result] = await db.query(
      `INSERT INTO guarantor (
        loan_id, member_id, guarantor_name, guarantor_id_card, guarantor_address,
        borrower_id_card, borrower_house_register,
        guarantor1_id_card, guarantor1_house_register,
        guarantor2_id_card, guarantor2_house_register,
        created_by, updated_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        loan_id,
        member_id || null,
        guarantor_name,
        guarantor_id_card,
        guarantor_address,
        borrower_id_card || '',
        borrower_house_register || '',
        guarantor1_id_card || '',
        guarantor1_house_register || '',
        guarantor2_id_card || '',
        guarantor2_house_register || '',
        req.userId,
        req.userId
      ]
    );

    res.status(201).json({
      message: 'Guarantor created successfully',
      guarantor_id: result.insertId
    });
  } catch (error) {
    console.error('Error creating guarantor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update guarantor
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const {
      loan_id,
      member_id,
      guarantor_name,
      guarantor_id_card,
      guarantor_address,
      borrower_id_card,
      borrower_house_register,
      guarantor1_id_card,
      guarantor1_house_register,
      guarantor2_id_card,
      guarantor2_house_register
    } = req.body;

    // Validate required fields
    if (!loan_id || !guarantor_name || !guarantor_id_card || !guarantor_address) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    // Check if guarantor exists
    const [existingGuarantors] = await db.query(
      'SELECT * FROM guarantor WHERE guarantor_id = ?',
      [req.params.id]
    );

    if (existingGuarantors.length === 0) {
      return res.status(404).json({ message: 'Guarantor not found' });
    }

    // Update guarantor data
    await db.query(
      `UPDATE guarantor SET
        loan_id = ?,
        member_id = ?,
        guarantor_name = ?,
        guarantor_id_card = ?,
        guarantor_address = ?,
        borrower_id_card = ?,
        borrower_house_register = ?,
        guarantor1_id_card = ?,
        guarantor1_house_register = ?,
        guarantor2_id_card = ?,
        guarantor2_house_register = ?,
        updated_by = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE guarantor_id = ?`,
      [
        loan_id,
        member_id || null,
        guarantor_name,
        guarantor_id_card,
        guarantor_address,
        borrower_id_card || '',
        borrower_house_register || '',
        guarantor1_id_card || '',
        guarantor1_house_register || '',
        guarantor2_id_card || '',
        guarantor2_house_register || '',
        req.userId,
        req.params.id
      ]
    );

    res.json({ message: 'Guarantor updated successfully' });
  } catch (error) {
    console.error('Error updating guarantor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete guarantor
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    // Check if guarantor exists
    const [existingGuarantors] = await db.query(
      'SELECT * FROM guarantor WHERE guarantor_id = ?',
      [req.params.id]
    );

    if (existingGuarantors.length === 0) {
      return res.status(404).json({ message: 'Guarantor not found' });
    }

    // Delete guarantor
    await db.query('DELETE FROM guarantor WHERE guarantor_id = ?', [req.params.id]);

    res.json({ message: 'Guarantor deleted successfully' });
  } catch (error) {
    console.error('Error deleting guarantor:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;