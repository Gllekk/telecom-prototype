-- Sample Data for Telecom Database

-- Insert Test Users
INSERT INTO USERS (user_id, email, password_hash, first_name, last_name, gender, phone_number, status, role_type) VALUES
('USR0000001', 'john.doe@email.com', '$2b$10$QVGf5XVlf0lslI.fYwo3Y.xIHjNixb1lo/8YH8cREqJgv.NB8dkGm', 'John', 'Doe', 'male', '+37120123456', 'active', 'customer'),
('USR0000002', 'jane.smith@email.com', '$2b$10$QVGf5XVlf0lslI.fYwo3Y.xIHjNixb1lo/8YH8cREqJgv.NB8dkGm', 'Jane', 'Smith', 'female', '+37120234567', 'active', 'customer'),
('USR0000003', 'alice.jones@email.com', '$2b$10$QVGf5XVlf0lslI.fYwo3Y.xIHjNixb1lo/8YH8cREqJgv.NB8dkGm', 'Alice', 'Jones', 'not_specified', NULL, 'active', 'customer');

-- Note: The password_hash above is for password "password123":


-- Insert Customers
INSERT INTO CUSTOMERS (customer_id, user_id, customer_type, preferred_contact_method) VALUES
('CUS0000001', 'USR0000001', 'individual', 'email'),
('CUS0000002', 'USR0000002', 'individual', 'phone'),
('CUS0000003', 'USR0000003', 'individual', 'email');

-- Insert Mobile Plans
INSERT INTO PERS_PLANS (plan_id, plan_name, monthly_fee, data_limit_gb, calls_min, sms_count, data_limit_roaming_gb, international_calling_min, international_sms_count, status) VALUES
('PLN0000001', 'Mobile LIGHT', 15.00, 40, 500, 300, 5, 60, 30, 'active'),
('PLN0000002', 'Mobile COOL', 25.00, 90, 999999, 999999, 15, 120, 90, 'active'),
('PLN0000003', 'Mobile UNLIMITED', 40.00, 999999, 999999, 999999, 30, 180, 150, 'active'),
('PLN0000004', 'Residential LIGHT', 25.00, 999999, 0, 0, 0, 0, 0, 'active'),
('PLN0000005', 'Residential COOL', 40.00, 999999, 0, 0, 0, 0, 0, 'active'),
('PLN0000006', 'Residential MAX', 70.00, 999999, 0, 0, 0, 0, 0, 'active');

-- Insert Account for John (has subscription)
INSERT INTO ACCOUNTS (account_id, customer_id, account_type, debit, status) VALUES
('ACC0000001', 'CUS0000001', 'mobile', 0.00, 'active');

-- Insert Subscription for John
INSERT INTO SERVICE_SUBSCRIPTIONS (subscription_id, account_id, plan_id, status) VALUES
('SUB0000001', 'ACC0000001', 'PLN0000002', 'active');

-- Insert Bills for John (showing different statuses)
INSERT INTO BILLS (bill_id, account_id, issue_date, due_date, total_amount, status) VALUES
('BIL0000001', 'ACC0000001', '2025-07-01', '2025-07-15', 25.00, 'paid'),
('BIL0000002', 'ACC0000001', '2025-08-01', '2025-08-15', 25.00, 'paid'),
('BIL0000003', 'ACC0000001', '2025-09-01', '2025-09-15', 25.00, 'paid'),
('BIL0000004', 'ACC0000001', '2025-10-01', '2025-10-15', 25.00, 'pending');

-- Alice has no subscription yet (for testing "no bills" scenario)

-- Jane has account but no subscription
INSERT INTO ACCOUNTS (account_id, customer_id, account_type, debit, status) VALUES
('ACC0000002', 'CUS0000002', 'mobile', 0.00, 'active');