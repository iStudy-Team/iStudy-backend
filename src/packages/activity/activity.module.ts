import { Module } from '@nestjs/common';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';

@Module({
    imports: [ActivityLogModule],
    exports: [ActivityLogModule],
})
export class ActivityModule {}
