import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FxqlEntry } from './entities/fxql.entity';
import { FxqlService } from './fxql.service';
import { FxqlController } from './fxql.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FxqlEntry])],
  providers: [FxqlService],
  controllers: [FxqlController],
  exports: [TypeOrmModule],
})
export class FxqlModule {}
