import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetEntity } from './domain/asset.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AssetEntity])],
  exports: [TypeOrmModule],
})
export class AssetModule {}
