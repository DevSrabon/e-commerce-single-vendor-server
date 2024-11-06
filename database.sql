ALTER TABLE `pksf_digital`.`e_customer`
ADD COLUMN `country_id` INT NULL AFTER `ec_status`,
ADD COLUMN `currency` ENUM('AED', 'USD', 'GBP') NULL AFTER `country_id`;


ALTER TABLE `pksf_digital`.`accounts`
ADD COLUMN `ac_opening_balance` DECIMAL(18,2) NULL AFTER `ac_bank_branch`;
