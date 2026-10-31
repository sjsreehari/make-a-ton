import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class SequenceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates next sequential integer atomically using MySQL LAST_INSERT_ID mechanics.
   * Can accept an optional Prisma transaction client.
   */
  async getNext(key: string, tx?: any): Promise<number> {
    const client = tx || this.prisma;

    await client.$executeRawUnsafe(
      'INSERT INTO `SequenceCounter` (`key`, `value`) VALUES (?, 1) ON DUPLICATE KEY UPDATE `value` = LAST_INSERT_ID(`value` + 1)',
      key,
    );

    const rows: Array<{ n: bigint | number }> = await client.$queryRawUnsafe(
      'SELECT LAST_INSERT_ID() as n'
    );

    let val = Number(rows?.[0]?.n || 0);

    // Handle LAST_INSERT_ID() returning 0 on the first insert path
    if (val === 0) {
      const current: Array<{ value: number }> = await client.$queryRawUnsafe(
        'SELECT `value` FROM `SequenceCounter` WHERE `key` = ?',
        key,
      );
      val = current?.[0]?.value || 1;
    }

    return val;
  }
}
