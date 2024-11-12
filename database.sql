ALTER TABLE `pksf_digital`.`e_customer`
ADD COLUMN `country_id` INT NULL AFTER `ec_status`,
ADD COLUMN `currency` ENUM('AED', 'USD', 'GBP') NULL AFTER `country_id`;


ALTER TABLE `pksf_digital`.`accounts`
ADD COLUMN `ac_ac_opening_balance` DECIMAL(18,2) NULL AFTER `ac_bank_branch`;


ALTER TABLE `pksf_digital`.`currency`
CHANGE COLUMN `aed` `aed` DECIMAL(10,3) NOT NULL ,
CHANGE COLUMN `usd` `usd` DECIMAL(10,3) NOT NULL ,
CHANGE COLUMN `gbp` `gbp` DECIMAL(10,3) NOT NULL ;

SET GLOBAL event_scheduler = ON;


DELIMITER //

CREATE EVENT IF NOT EXISTS update_pending_orders
ON SCHEDULE EVERY 30 MINUTE
DO
BEGIN
    UPDATE e_order
    SET status = 'cancelled'  -- or any other status you want to set after 1 hour
    WHERE status = 'pending'
      AND TIMESTAMPDIFF(MINUTE, created_at, NOW()) >= 60;
END //

DELIMITER ;