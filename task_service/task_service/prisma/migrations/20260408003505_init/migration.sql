/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `tarefas` table. All the data in the column will be lost.
  - Added the required column `atualizado_em` to the `tarefas` table without a default value. This is not possible if the table is not empty.
  - Added the required column `usuario_id` to the `tarefas` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `tarefas` DROP FOREIGN KEY `tarefas_usuarioId_fkey`;

-- AlterTable
ALTER TABLE `tarefas` DROP COLUMN `usuarioId`,
    ADD COLUMN `atualizado_em` DATETIME(3) NOT NULL,
    ADD COLUMN `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `usuario_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `usuarios` ADD COLUMN `criado_em` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE `tarefas` ADD CONSTRAINT `tarefas_usuario_id_fkey` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
