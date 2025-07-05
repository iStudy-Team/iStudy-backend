import { Module } from '@nestjs/common';
import { TeacherModule } from './modules/teachers/teacher.module';
import { StudentModule } from './modules/students/student.module';
import { ParentModule } from './modules/parents/parent.module';
import { RelationModule } from './modules/relation/relation.module';
import { UsersModule } from './modules/users/users.module';

@Module({
    imports: [TeacherModule, StudentModule, ParentModule, RelationModule, UsersModule],
    exports: [TeacherModule, StudentModule, ParentModule, RelationModule, UsersModule],
})
export class UserModule {}
