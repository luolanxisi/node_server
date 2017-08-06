


CREATE TABLE `tbl_platform` (
  `id` bigint unsigned,
  `roleId` int(11) not null,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_roleId` (`roleId`)
) ENGINE=innodb DEFAULT CHARSET=utf8 COMMENT='平台账号对应角色';

CREATE TABLE `tbl_role` (
  `id` int(11) NOT NULL auto_increment,
  `name` varchar(64),
  `rank` int(11) not null DEFAULT 0 COMMENT '积分',
  `money` int(11) not null DEFAULT 0 COMMENT '金钱',
  `gem` int(11) not null DEFAULT 0 COMMENT '宝石',
  `p2pPort` int(11) not null DEFAULT 8081 COMMENT 'P2P端口',
  `regTime` int(11) not null COMMENT '注册时间',
  `lastLogin` int(11) not null COMMENT '最后登录时间',
  `missionData` text NOT NULL,
  `robotData` text NOT NULL,
  `itemData` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=innodb DEFAULT CHARSET=utf8 COMMENT='角色信息表';


