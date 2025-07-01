import { Module } from '@nestjs/common';
import { AnnouncementModule } from './modules/announcement/announcement.module';
import { ClassPromotionModule } from './modules/class-promotion/class-promotion.module';
import { NotificationModule as NotificationSubModule } from './modules/notification/notification.module';
import { NotificationRecipientModule } from './modules/notification-recipient/notification-recipient.module';

@Module({
    imports: [
        AnnouncementModule,
        ClassPromotionModule,
        NotificationSubModule,
        NotificationRecipientModule
    ],
    exports: [
        AnnouncementModule,
        ClassPromotionModule,
        NotificationSubModule,
        NotificationRecipientModule
    ],
})
export class NotificationModule {}
