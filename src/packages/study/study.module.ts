import { Module } from '@nestjs/common';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { GradeLevelModule } from './modules/grade-level/grade-level.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ClassModule } from './modules/class/class.module';
import { ClassTeacherModule } from './modules/class-teacher/class-teacher.module';

@Module({
    imports: [AcademicYearModule, GradeLevelModule, ScheduleModule, ClassModule, ClassTeacherModule],
    exports: [AcademicYearModule, GradeLevelModule, ScheduleModule, ClassModule, ClassTeacherModule],
})
export class StudyModule {}
