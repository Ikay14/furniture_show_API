import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EscrowService } from './escrow.service';

@Processor('payouts')
export class PayoutProcessor extends WorkerHost {
  private readonly logger = new Logger(PayoutProcessor.name);

  constructor(private readonly escrowService: EscrowService) {
    super();
  }

  async process(job: Job<{ escrowId: string }>): Promise<void> {
    this.logger.log(`Processing vendor payout job ${job.id} for escrow ${job.data.escrowId}`);
    await this.escrowService.processPayout(job.data.escrowId);
  }
}
