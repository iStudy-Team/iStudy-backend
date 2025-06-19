import { Module } from '@nestjs/common';
import { AcademicYearModule } from './modules/academic-year/academic-year.module';
import { GradeLevelModule } from './modules/grade-level/grade-level.module';
import { ScheduleModule } from './modules/schedule/schedule.module';
import { ClassModule } from './modules/class/class.module';
import { ClassTeacherModule } from './modules/class-teacher/class-teacher.module';
import { ClassEnrollmentModule } from './modules/class-enrollment/class-enrollment.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { ClassSessionModule } from './modules/class-session/class-session.module';

@Module({
    imports: [
        AcademicYearModule,
        GradeLevelModule,
        ScheduleModule,
        ClassModule,
        ClassTeacherModule,
        ClassEnrollmentModule,
        AttendanceModule,
        ClassSessionModule,
    ],
    exports: [
        AcademicYearModule,
        GradeLevelModule,
        ScheduleModule,
        ClassModule,
        ClassTeacherModule,
        ClassEnrollmentModule,
        AttendanceModule,
        ClassSessionModule,
    ],
})
export class StudyModule {}
