import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('increment', { comment: 'Auto-incremented primary key' })
  id: number;

  @CreateDateColumn({ type: 'timestamptz', comment: 'Timestamp when the record was created' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', comment: 'Timestamp when the record was last updated' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true, default: null, comment: 'Soft delete timestamp, NULL if active' })
  deletedAt?: Date;
}
