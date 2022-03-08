# создание изначальных данных
CREATE DATABASE IF NOT EXISTS defaultdb;

USE defaultdb;

DROP TABLE IF EXISTS `account`;

CREATE TABLE `account` (
  `login` bigint(20) unsigned NOT NULL COMMENT 'account',
  `source` int(10) unsigned NOT NULL,
  `balance_usd` int DEFAULT 0 COMMENT 'account balance',
  `balance_usd_sub` int DEFAULT 0 COMMENT 'subscription network balance',
  `subscribers_count` int unsigned NOT NULL DEFAULT 0 COMMENT 'subscribers count',
  `to_refresh` TINYINT DEFAULT 0 COMMENT 'marked to refresh',
  PRIMARY KEY (`source`, `login`)
) ENGINE=InnoDB;

INSERT INTO `account` VALUES 
('60000000000060839', '203', 2000, 0, 0, 0),
('60000000000060840', '203', 1000, 0, 0, 0),
('60000000000061841', '203', 2000, 0, 0, 0),
('60000000000062842', '203', 3000, 0, 0, 0),
('60000000000063843', '203', 4000, 0, 0, 0),
('60000000000064844', '203', 5000, 0, 0, 0),
('60000000000065845', '203', 6000, 0, 0, 0),
('60000000000066847', '203', 7000, 0, 0, 0),
('60000000000067850', '203', 8000, 0, 0, 0),
('60000000000068851', '203', 9000, 0, 0, 0),
('60000000000069853', '203', 8000, 0, 0, 0),
('60000000000070854', '203', 7000, 0, 0, 0),
('60000000000071855', '203', 6000, 0, 0, 0),
('60000000000072854', '203', 5000, 0, 0, 0),
('60000000000073855', '203', 4000, 0, 0, 0);

DROP TABLE IF EXISTS `subscription`;

CREATE TABLE `subscription` (
  `login` bigint(20) unsigned NOT NULL COMMENT 'trader account',
  `source` int(10) unsigned NOT NULL COMMENT 'trader source',
  `r_login` bigint(20) unsigned NOT NULL COMMENT 'investor account',
  `r_source` int(10) unsigned NOT NULL COMMENT 'investor source',
  `removed` boolean NOT NULL DEFAULT 0 COMMENT 'remove flag',
  PRIMARY KEY (`source`,`login`,`r_source`,`r_login`),
  KEY `r_idx` (`r_source`,`r_login`,`source`,`login`)
) ENGINE=InnoDB;

INSERT INTO `subscription` VALUES 
# 1й треугольник
('60000000000060839', '203', '60000000000060840', '203', 0),
('60000000000060840', '203', '60000000000061841', '203', 0),
('60000000000061841', '203', '60000000000060839', '203', 0), 
# 2й треугольник
('60000000000062842', '203', '60000000000063843', '203', 0),
('60000000000062842', '203', '60000000000064844', '203', 0),
('60000000000064844', '203', '60000000000063843', '203', 0),
# ромб
('60000000000064844', '203', '60000000000065845', '203', 0),
('60000000000064844', '203', '60000000000066847', '203', 0),
('60000000000065845', '203', '60000000000067850', '203', 0),
('60000000000066847', '203', '60000000000067850', '203', 0),
# узлы 2го треугольника
('60000000000063843', '203', '60000000000068851', '203', 0),
('60000000000063843', '203', '60000000000069853', '203', 0),
# узлы ромба
('60000000000067850', '203', '60000000000070854', '203', 0),
('60000000000067850', '203', '60000000000071855', '203', 0);


DROP TABLE IF EXISTS `line_subscription`;

CREATE TABLE `line_subscription` (
  `login` bigint(20) unsigned NOT NULL COMMENT 'account',
  `parents` TEXT NOT NULL COMMENT 'traders subscribed to account',
  `children` TEXT NOT NULL COMMENT 'account subscriptions',
  PRIMARY KEY (`login`),
  KEY `r_idx` (`login`)
) ENGINE=InnoDB;