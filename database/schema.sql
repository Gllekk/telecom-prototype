-- Telecom Database Schema
-- Drop tables if they exist (for clean recreation)
DROP TABLE IF EXISTS PAYMENTS CASCADE;
DROP TABLE IF EXISTS BILLS CASCADE;
DROP TABLE IF EXISTS PAYMENT_METHODS CASCADE;
DROP TABLE IF EXISTS SERVICE_SUBSCRIPTIONS CASCADE;
DROP TABLE IF EXISTS PERS_PLANS CASCADE;
DROP TABLE IF EXISTS ACCOUNTS CASCADE;
DROP TABLE IF EXISTS CUSTOMERS CASCADE;
DROP TABLE IF EXISTS CUSTOMER_ADDRESSES CASCADE;
DROP TABLE IF EXISTS ADDRESSES CASCADE;
DROP TABLE IF EXISTS EMPLOYEES CASCADE;
DROP TABLE IF EXISTS USERS CASCADE;

-- USERS table
CREATE TABLE USERS (
    user_id CHAR(10) PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(20),
    phone_number VARCHAR(15),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    role_type VARCHAR(50) NOT NULL
);

-- ADDRESSES table
CREATE TABLE ADDRESSES (
    address_id CHAR(10) PRIMARY KEY,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    region_province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100) NOT NULL,
    address_type VARCHAR(20)
);

-- EMPLOYEES table
CREATE TABLE EMPLOYEES (
    employee_id CHAR(10) PRIMARY KEY,
    user_id CHAR(10) NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    department VARCHAR(100),
    hire_date DATE,
    manager_id INTEGER,
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- CUSTOMERS table
CREATE TABLE CUSTOMERS (
    customer_id CHAR(10) PRIMARY KEY,
    user_id CHAR(10) NOT NULL REFERENCES USERS(user_id) ON DELETE CASCADE,
    customer_type VARCHAR(20),
    preferred_contact_method VARCHAR(50),
    CONSTRAINT fk_customer_user FOREIGN KEY (user_id) REFERENCES USERS(user_id)
);

-- CUSTOMER_ADDRESSES junction table
CREATE TABLE CUSTOMER_ADDRESSES (
    customer_id CHAR(10) NOT NULL,
    address_id CHAR(10) NOT NULL,
    PRIMARY KEY (customer_id, address_id),
    CONSTRAINT fk_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON DELETE CASCADE,
    CONSTRAINT fk_address FOREIGN KEY (address_id) REFERENCES ADDRESSES(address_id) ON DELETE CASCADE
);

-- ACCOUNTS table
CREATE TABLE ACCOUNTS (
    account_id CHAR(10) PRIMARY KEY,
    customer_id CHAR(10) NOT NULL,
    account_type VARCHAR(20),
    debit DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'active',
    created_date DATE DEFAULT CURRENT_DATE,
    CONSTRAINT fk_account_customer FOREIGN KEY (customer_id) REFERENCES CUSTOMERS(customer_id) ON DELETE CASCADE
);

-- PERS_PLANS table
CREATE TABLE PERS_PLANS (
    plan_id CHAR(10) PRIMARY KEY,
    plan_name VARCHAR(100) NOT NULL,
    monthly_fee DECIMAL(10,2),
    data_limit_gb INTEGER,
    calls_min INTEGER,
    sms_count INTEGER,
    data_limit_roaming_gb INTEGER,
    international_calling_min INTEGER,
    international_sms_count INTEGER,
    status VARCHAR(20) DEFAULT 'active'
);

-- SERVICE_SUBSCRIPTIONS table
CREATE TABLE SERVICE_SUBSCRIPTIONS (
    subscription_id CHAR(10) PRIMARY KEY,
    account_id CHAR(10) NOT NULL,
    plan_id CHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    CONSTRAINT fk_subscription_account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES PERS_PLANS(plan_id) ON DELETE CASCADE
);

-- BILLS table
CREATE TABLE BILLS (
    bill_id CHAR(10) PRIMARY KEY,
    account_id CHAR(10) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    pdf_file_path VARCHAR(255),
    CONSTRAINT fk_bill_account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE
);

-- PAYMENT_METHODS table
CREATE TABLE PAYMENT_METHODS (
    method_id CHAR(10) PRIMARY KEY,
    account_id CHAR(10) NOT NULL,
    method_type VARCHAR(50),
    card_number VARCHAR(16),
    expiration_date DATE,
    is_default BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_payment_method_account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE
);

-- PAYMENTS table
CREATE TABLE PAYMENTS (
    payment_id CHAR(10) PRIMARY KEY,
    account_id CHAR(10) NOT NULL,
    bill_id CHAR(10) NOT NULL,
    payment_amount DECIMAL(10,2) NOT NULL,
    payment_date DATE DEFAULT CURRENT_DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'completed',
    CONSTRAINT fk_payment_account FOREIGN KEY (account_id) REFERENCES ACCOUNTS(account_id) ON DELETE CASCADE,
    CONSTRAINT fk_payment_bill FOREIGN KEY (bill_id) REFERENCES BILLS(bill_id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON USERS(email);
CREATE INDEX idx_users_role ON USERS(role_type);
CREATE INDEX idx_customers_user ON CUSTOMERS(user_id);
CREATE INDEX idx_employees_user ON EMPLOYEES(user_id);
CREATE INDEX idx_accounts_customer ON ACCOUNTS(customer_id);
CREATE INDEX idx_subscriptions_account ON SERVICE_SUBSCRIPTIONS(account_id);
CREATE INDEX idx_bills_account ON BILLS(account_id);
CREATE INDEX idx_payments_bill ON PAYMENTS(bill_id);
CREATE INDEX idx_payments_date ON PAYMENTS(payment_date);

-- Add comments for documentation
COMMENT ON TABLE USERS IS 'Stores all user accounts (customers and employees)';
COMMENT ON TABLE CUSTOMERS IS 'Customer-specific information linked to users';
COMMENT ON TABLE EMPLOYEES IS 'Employee-specific information linked to users';
COMMENT ON TABLE ACCOUNTS IS 'Customer accounts for telecom services';
COMMENT ON TABLE PERS_PLANS IS 'Available service plans with pricing and limits';
COMMENT ON TABLE SERVICE_SUBSCRIPTIONS IS 'Links accounts to their subscribed plans';
COMMENT ON TABLE BILLS IS 'Monthly bills generated for accounts';
COMMENT ON TABLE PAYMENTS IS 'Payment transactions for bills';