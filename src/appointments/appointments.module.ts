import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { User } from 'src/users/entities/user.entity';
import { UserRole } from 'src/roles/entities/user-role.entity';
import { Role } from 'src/roles/entities/role.entity';
import { CoreModule } from 'src/core/core.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Appointment, User, UserRole, Role]),
    CoreModule,
  ],
  providers: [AppointmentsService],
  controllers: [AppointmentsController],
  exports: [AppointmentsService],
})
export class AppointmentsModule {}
