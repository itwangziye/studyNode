-- Baseline migration:把关 9 手动建的 tasks 表"登记"给 Prisma
-- 这不是新执行的操作,只是告诉 Prisma:"这个表已经存在,从此刻开始你接管"
-- Prisma 看到 _prisma_migrations 表里记录了这个 baseline,就知道 tasks 表是"自己人"

CREATE TABLE IF NOT EXISTS `tasks` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(200) NOT NULL,
  `done` BOOLEAN NOT NULL DEFAULT false,
  `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
);
