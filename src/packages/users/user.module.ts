import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teachers/teacher.module';
import { StudentModule } from './modules/students/student.module';
import { ParentModule } from './modules/parents/parent.module';

@Module({
    imports: [TeacherModule, StudentModule, ParentModule],
    exports: [TeacherModule, StudentModule, ParentModule],
})
export class UserModule {}
