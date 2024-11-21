CREATE
VIEW `order_view` AS
    SELECT
        `eo`.`id` AS `id`,
        `eo`.`order_no` AS `order_no`,
        `eo`.`status` AS `status`,
        `eo`.`currency` AS `currency`,
        `eo`.`payment_status` AS `payment_status`,
        `eo`.`total` AS `total`,
        `eo`.`discount` AS `discount`,
        `eo`.`delivery_charge` AS `delivery_charge`,
        `eo`.`grand_total` AS `grand_total`,
        `eo`.`remarks` AS `remarks`,
        `eo`.`created_at` AS `created_at`,
        `eo`.`updated_at` AS `updated_at`,
        `ec`.`ec_id` AS `customer_id`,
        `ec`.`ec_name` AS `customer_name`,
        `ec`.`ec_phone` AS `customer_phone`,
        `ec`.`ec_email` AS `customer_email`,
        `esa`.`name` AS `address_name`,
        `esa`.`phone` AS `address_phone`,
        `esa`.`apt` AS `address_apt`,
        `esa`.`street_address` AS `address_street_address`,
        `esa`.`label` AS `address_label`,
        `esa`.`city` AS `address_city`,
        `esa`.`zip_code` AS `address_zip_code`,
        `esa`.`state` AS `address_state`,
        `esa`.`country_id` AS `address_country_id`,
        `c`.`c_name_en` AS `address_country_name_en`,
        `c`.`c_name_ar` AS `address_country_name_ar`,
        JSON_ARRAYAGG(JSON_OBJECT('order_detail_id',
                        `eod`.`id`,
                        'product_id',
                        `eod`.`ep_id`,
                        'product_name_en',
                        `eod`.`ep_name_en`,
                        'product_name_ar',
                        `eod`.`ep_name_ar`,
                        'price',
                        `eod`.`price`,
                        'quantity',
                        `eod`.`quantity`,
                        'variant_id',
                        `eod`.`v_id`,
                        'sku',
                        (SELECT
                                `p`.`sku`
                            FROM
                                `product` `p`
                            WHERE
                                (`p`.`p_id` = `eod`.`ep_id`)),
                        'slug',
                        (SELECT
                                `p`.`p_slug`
                            FROM
                                `product` `p`
                            WHERE
                                (`p`.`p_id` = `eod`.`ep_id`)),
                        'size',
                        JSON_OBJECT('size_id',
                                `eod`.`size_id`,
                                'size_name',
                                `sz`.`size`,
                                'height',
                                CONCAT(`sz`.`height`, `sz`.`attribute`),
                                'weight',
                                CONCAT(`sz`.`weight`, `sz`.`attribute`),
                                'details',
                                `sz`.`details`),
                        'color',
                        JSON_OBJECT('color_name_en',
                                `cl`.`color_en`,
                                'color_name_ar',
                                `cl`.`color_ar`,
                                'details_en',
                                `cl`.`details_en`,
                                'details_ar',
                                `cl`.`details_ar`,
                                'images',
                                (SELECT
                                        JSON_ARRAYAGG(`ci`.`image`)
                                    FROM
                                        `color_image` `ci`
                                    WHERE
                                        (`ci`.`p_color_id` = `eod`.`p_color_id`))),
                        'fabric',
                        JSON_OBJECT('fabric_name_en',
                                `f`.`name_en`,
                                'fabric_name_ar',
                                `f`.`name_ar`,
                                'fabric_details_en',
                                `f`.`details_en`,
                                'fabric_details_ar',
                                `f`.`details_ar`),
                        'created_at',
                        `eod`.`created_at`)) AS `order_details`,
        COALESCE((SELECT
                        JSON_ARRAYAGG(JSON_OBJECT('status',
                                            `eot`.`status`,
                                            'details',
                                            `eot`.`details`,
                                            'date_time',
                                            `eot`.`date_time`))
                    FROM
                        `e_order_tracking` `eot`
                    WHERE
                        (`eot`.`eo_id` = `eo`.`id`)),
                JSON_ARRAY()) AS `tracking_status`
    FROM
        (((((((((`e_order` `eo`
        LEFT JOIN `e_customer` `ec` ON ((`eo`.`ec_id` = `ec`.`ec_id`)))
        LEFT JOIN `ec_shipping_address` `esa` ON ((`eo`.`ecsa_id` = `esa`.`id`)))
        LEFT JOIN `country` `c` ON ((`esa`.`country_id` = `c`.`c_id`)))
        LEFT JOIN `e_order_details` `eod` ON ((`eo`.`id` = `eod`.`eo_id`)))
        LEFT JOIN `variant_product` `v` ON ((`eod`.`v_id` = `v`.`id`)))
        LEFT JOIN `fabric` `f` ON ((`v`.`fabric_id` = `f`.`id`)))
        LEFT JOIN'p_size' as 'ps' on (('ps.id'='eod.p_size_id'))
        LEFT JOIN `size` `sz` ON ((`ps`.`size_id` = `sz`.`id`)))
        LEFT JOIN `p_color` `pc` ON ((`eod`.`p_color_id` = `pc`.`id`)))
        LEFT JOIN `color` `cl` ON ((`pc`.`color_id` = `cl`.`id`)))
    GROUP BY `eo`.`id`


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
DROP EVENT IF EXISTS update_pending_orders;
CREATE EVENT IF NOT EXISTS update_pending_orders
ON SCHEDULE EVERY 30 MINUTE
DO
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE orderId INT;
    DECLARE productId INT;
    DECLARE quantity INT;
    DECLARE cur CURSOR FOR
        SELECT eo.id, eod.ep_id, eod.quantity
        FROM e_order AS eo
        JOIN e_order_details AS eod ON eo.id = eod.eo_id
        WHERE eo.status = 'pending'
          AND TIMESTAMPDIFF(MINUTE, eo.created_at, NOW()) >= 1;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Open the cursor
    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO orderId, productId, quantity;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Update the product's inventory
        UPDATE inventory
        SET i_quantity_available = i_quantity_available + quantity
        WHERE p_id = productId;
        UPDATE inventory
        SET i_quantity_available = i_quantity_sold - quantity
        WHERE p_id = productId;

        -- Update the order status to 'cancelled'
        UPDATE e_order
        SET status = 'cancelled'
        WHERE id = orderId;
    END LOOP;

    -- Close the cursor
    CLOSE cur;
END //

DELIMITER ;



CREATE TABLE `cart_items` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ec_id` int NOT NULL,
  `p_id` int NOT NULL,
  `p_color_id` int NOT NULL,
  `size_id` int NOT NULL,
  `v_id` int NOT NULL,
  `quantity` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `type` enum('cart','favourite') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


create table if not exists erp_like_dislike(
id int primary key,
review_id int not null,
customer_id int not null,
count int not null,
type enum('like','dislike'),
created_at timestamp default now(),
updated_at timestamp default CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)

ALTER TABLE `pksf_digital`.`erp_like_dislike`
ADD COLUMN `dislike` TINYINT NOT NULL DEFAULT 0 AFTER `like`,
CHANGE COLUMN `count` `like` TINYINT NOT NULL DEFAULT 0 ;


CREATE
VIEW `p_review_view` AS
    SELECT
        `r`.`id` AS `id`,
        `r`.`rating` AS `rating`,
        `r`.`parent_id` AS `parent_id`,
        `r`.`comment` AS `comment`,
        (SELECT
                JSON_ARRAYAGG(JSON_OBJECT('image_id',
                                    `ri`.`epri_image_id`,
                                    'image_name',
                                    `ri`.`epri_image`))
            FROM
                `epr_image` `ri`
            WHERE
                (`ri`.`epri_epr_id` = `r`.`id`)) AS `review_images`,
        `r`.`status` AS `status`,
        `r`.`created_at` AS `created_at`,
        `p`.`p_id` AS `product_id`,
        `p`.`p_name_en` AS `product_name_en`,
        `p`.`p_name_ar` AS `product_name_ar`,
        `p`.`p_slug` AS `product_slug`,
        `c`.`ec_id` AS `customer_id`,
        `c`.`ec_name` AS `customer_name`,
        `c`.`ec_image` AS `customer_image`
    FROM
        ((`e_product_review` `r`
        JOIN `product_view` `p` ON ((`r`.`p_id` = `p`.`p_id`)))
        LEFT JOIN `e_customer` `c` ON ((`r`.`ec_id` = `c`.`ec_id`)))