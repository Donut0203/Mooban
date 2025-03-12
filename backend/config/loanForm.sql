-- Table for Loan Applications
CREATE TABLE `loan` (
  `loan_id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `member_id` INT(11) NOT NULL,
  `loan_amount` DECIMAL(15,2) NOT NULL,
  `interest_rate` DECIMAL(5,2) NOT NULL,
  `repayment_period` INT(11) NOT NULL,
  `start_date` DATE NOT NULL,
  `end_date` DATE NOT NULL,
  `guarantee_required` TINYINT(1) DEFAULT 1,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT(11) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table for Guarantors
CREATE TABLE `guarantor` (
  `guarantor_id` INT(11) AUTO_INCREMENT PRIMARY KEY,
  `loan_id` INT(11) NOT NULL,
  `guarantor_name` VARCHAR(255) NOT NULL,
  `guarantor_id_card` VARCHAR(20) NOT NULL,
  `guarantor_address` TEXT NOT NULL,
  `borrower_id_card` VARCHAR(20) NOT NULL,
  `borrower_house_register` VARCHAR(20) NOT NULL,
  `guarantor1_id_card` VARCHAR(20) NOT NULL,
  `guarantor1_house_register` VARCHAR(20) NOT NULL,
  `guarantor2_id_card` VARCHAR(20) NOT NULL,
  `guarantor2_house_register` VARCHAR(20) NOT NULL,
  `created_by` INT(11) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_by` INT(11) DEFAULT NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
