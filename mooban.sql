-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 11, 2025 at 06:17 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mooban`
--

-- --------------------------------------------------------

--
-- Table structure for table `guarantor`
--

CREATE TABLE `guarantor` (
  `guarantor_id` int(11) NOT NULL,
  `loan_id` int(11) NOT NULL,
  `guarantor_name` varchar(255) NOT NULL,
  `guarantor_id_card` varchar(20) NOT NULL,
  `guarantor_address` text NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loanagreement`
--

CREATE TABLE `loanagreement` (
  `loan_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `loan_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,2) NOT NULL,
  `repayment_period` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `guarantee_required` tinyint(1) DEFAULT 1,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loanpayment`
--

CREATE TABLE `loanpayment` (
  `payment_id` char(36) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `principal_amount` decimal(15,2) DEFAULT NULL,
  `monthly_interest` decimal(10,2) DEFAULT NULL,
  `transaction_type` enum('deposit','withdraw') NOT NULL,
  `payment_amount` decimal(15,2) DEFAULT NULL,
  `remaining_principal` decimal(15,2) DEFAULT NULL,
  `remaining_interest` decimal(15,2) DEFAULT NULL,
  `member_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loanrepayment`
--

CREATE TABLE `loanrepayment` (
  `repayment_id` int(11) NOT NULL,
  `loan_payment_id` char(36) NOT NULL,
  `repayment_date` date DEFAULT NULL,
  `repayment_amount` decimal(15,2) DEFAULT NULL,
  `remaining_principal` decimal(15,2) DEFAULT NULL,
  `remaining_interest` decimal(15,2) DEFAULT NULL,
  `member_id` int(11) NOT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member`
--

CREATE TABLE `member` (
  `member_id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `bank_name` varchar(100) NOT NULL,
  `bank_account` varchar(50) NOT NULL,
  `national_id` varchar(20) NOT NULL,
  `address_line1` text NOT NULL,
  `subdistrict` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `id_card_copy` varchar(255) NOT NULL,
  `house_registration_copy` varchar(255) NOT NULL,
  `balance` decimal(15,2) DEFAULT 0.00,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_by` int(11) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `member`
--

INSERT INTO `member` (`member_id`, `first_name`, `last_name`, `phone`, `bank_name`, `bank_account`, `national_id`, `address_line1`, `subdistrict`, `district`, `province`, `postal_code`, `id_card_copy`, `house_registration_copy`, `balance`, `created_by`, `created_at`, `updated_by`, `updated_at`) VALUES
(1, 'ณัชชา', 'บุญมี', '0812345678', 'กรุงเทพ', '12345689', '1234567891234', 'rmutt', 'rmutt', 'rmutt', 'rmutt', '12345', '/uploads/file-1741702850460.jpg', '/uploads/file-1741702852839.jpg', 0.00, 30, '2025-03-11 14:20:53', 30, '2025-03-11 14:20:53'),
(2, 'กช', 'พร', '0812345678', 'กรุงไทย', '12345689', '1234567891234', 'rmutt', 'rmutt', 'rmutt', 'rmutt', '12345', '/uploads/file-1741704588150.jpg', '/uploads/file-1741704590587.jpg', 0.00, 30, '2025-03-11 14:49:51', 30, '2025-03-11 14:49:51'),
(3, 'ณัชชา', 'บุญมี', '0835364833', 'ออมสิน', '12345689', '1234567891234', 'rmutt', 'rmutt', 'rmutt', 'rmutt', '12345', '/uploads/file-1741705242075.jpg', '/uploads/file-1741705244528.jpg', 0.00, 30, '2025-03-11 15:00:46', 30, '2025-03-11 15:00:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_password` varchar(10) NOT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('headman','assistant','villager','pending','approved','rejected') DEFAULT 'villager',
  `is_approved` tinyint(1) DEFAULT 0,
  `approved_by` varchar(255) DEFAULT NULL,
  `approval_date` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `login_attempts` int(11) DEFAULT 0,
  `locked_until` datetime DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `user_email`, `user_password`, `first_name`, `last_name`, `phone`, `address`, `status`, `is_approved`, `approved_by`, `approval_date`, `created_at`, `updated_at`, `login_attempts`, `locked_until`, `profile_picture`) VALUES
(29, 'adminma@gmail.com', 'Adminma02', 'Adminma', 'Prang', '0812345678', 'Rmutt', 'assistant', 1, '26', '2025-03-08 02:02:25', '2025-03-07 18:58:13', '2025-03-10 11:18:10', 0, NULL, '/uploads/profile_29_1741605489253.jpg'),
(30, 'admindo@gmail.com', 'Admindo02', 'Admindo', 'Donut12', '0835364833', 'Rmutt1234', 'headman', 1, '26', '2025-03-08 02:07:25', '2025-03-07 19:06:45', '2025-03-11 17:10:14', 0, NULL, '/uploads/profile_30_1741693150281.jpg'),
(31, 'gg01@gmail.com', 'Gg123', 'Admingg', 'Gloy', '0658266128', 'Rmutt 123', 'headman', 1, '26', '2025-03-08 12:50:04', '2025-03-07 19:15:27', '2025-03-11 11:38:55', 0, NULL, '/uploads/profile_31_1741693134191.jpg'),
(32, 'natcha0910377296@gmail.com', 'Donut0203', 'Superadmindo', 'Donut', '0835364833', 'Rmutt', 'assistant', 1, '29', '2025-03-08 13:55:57', '2025-03-08 06:54:27', '2025-03-09 21:06:26', 0, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `guarantor`
--
ALTER TABLE `guarantor`
  ADD PRIMARY KEY (`guarantor_id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `loanagreement`
--
ALTER TABLE `loanagreement`
  ADD PRIMARY KEY (`loan_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `loanpayment`
--
ALTER TABLE `loanpayment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `loanrepayment`
--
ALTER TABLE `loanrepayment`
  ADD PRIMARY KEY (`repayment_id`),
  ADD KEY `loan_payment_id` (`loan_payment_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `member`
--
ALTER TABLE `member`
  ADD PRIMARY KEY (`member_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `updated_by` (`updated_by`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `user_email` (`user_email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `guarantor`
--
ALTER TABLE `guarantor`
  MODIFY `guarantor_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loanagreement`
--
ALTER TABLE `loanagreement`
  MODIFY `loan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loanrepayment`
--
ALTER TABLE `loanrepayment`
  MODIFY `repayment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member`
--
ALTER TABLE `member`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `guarantor`
--
ALTER TABLE `guarantor`
  ADD CONSTRAINT `guarantor_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loanagreement` (`loan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `guarantor_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `guarantor_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `loanagreement`
--
ALTER TABLE `loanagreement`
  ADD CONSTRAINT `loanagreement_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loanagreement_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loanagreement_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `loanpayment`
--
ALTER TABLE `loanpayment`
  ADD CONSTRAINT `loanpayment_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loanpayment_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loanpayment_ibfk_3` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `loanrepayment`
--
ALTER TABLE `loanrepayment`
  ADD CONSTRAINT `loanrepayment_ibfk_1` FOREIGN KEY (`loan_payment_id`) REFERENCES `loanpayment` (`payment_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loanrepayment_ibfk_2` FOREIGN KEY (`member_id`) REFERENCES `member` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loanrepayment_ibfk_3` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `loanrepayment_ibfk_4` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `member`
--
ALTER TABLE `member`
  ADD CONSTRAINT `member_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `member_ibfk_2` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
