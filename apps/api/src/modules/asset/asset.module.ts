import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './domain/asset.entity';
import { AssetService } from './application/asset.service';
import { AssetController } from './http/asset.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity])],
  controllers: [AssetController],
  providers: [AssetService],
  exports: [AssetService],
})
export class AssetModule {}
