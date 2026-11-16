import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProductionStage } from 'src/modules/orders/model/order.model';

export class RecordMilestoneDto {
  @ApiProperty({ enum: ProductionStage, example: ProductionStage.IN_CARPENTRY })
  @IsEnum(ProductionStage)
  stage: ProductionStage;

  @ApiPropertyOptional({ example: 'Kiln-dried oak frame assembled and sanded.' })
  @IsOptional()
  @IsString()
  notes?: string;
}
