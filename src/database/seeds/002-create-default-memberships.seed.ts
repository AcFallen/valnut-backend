import { DataSource } from 'typeorm';
import { Membership } from '../../memberships/entities/membership.entity';

export class CreateDefaultMembershipsSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const membershipRepository = dataSource.getRepository(Membership);

    // Check if memberships already exist
    const existingMemberships = await membershipRepository.count();
    if (existingMemberships > 0) {
      console.log('Memberships already exist, skipping...');
      return;
    }

    const memberships = [
      {
        name: 'Plan Básico',
        description:
          'Perfect for small practices starting with nutrition management',
        price: 29.99,
        durationMonths: 1,
        maxUsers: 2,
        maxPatients: 50,
        features: {
          patientManagement: true,
          appointmentScheduling: true,
          basicReports: true,
          mealPlans: false,
          advancedReports: false,
          apiAccess: false,
        },
      },
      {
        name: 'Plan Profesional',
        description: 'Ideal for growing practices with multiple nutritionists',
        price: 79.99,
        durationMonths: 1,
        maxUsers: 5,
        maxPatients: 200,
        features: {
          patientManagement: true,
          appointmentScheduling: true,
          basicReports: true,
          mealPlans: true,
          advancedReports: true,
          apiAccess: false,
          customTemplates: true,
        },
      },
      {
        name: 'Plan Empresarial',
        description: 'For large clinics with advanced needs',
        price: 149.99,
        durationMonths: 1,
        maxUsers: 15,
        maxPatients: 1000,
        features: {
          patientManagement: true,
          appointmentScheduling: true,
          basicReports: true,
          mealPlans: true,
          advancedReports: true,
          apiAccess: true,
          customTemplates: true,
          whiteLabel: true,
          prioritySupport: true,
        },
      },
      {
        name: 'Plan Anual Básico',
        description: 'Basic plan with annual discount',
        price: 299.99,
        durationMonths: 12,
        maxUsers: 2,
        maxPatients: 50,
        features: {
          patientManagement: true,
          appointmentScheduling: true,
          basicReports: true,
          mealPlans: false,
          advancedReports: false,
          apiAccess: false,
        },
      },
      {
        name: 'Plan Anual Profesional',
        description: 'Professional plan with annual discount',
        price: 799.99,
        durationMonths: 12,
        maxUsers: 5,
        maxPatients: 200,
        features: {
          patientManagement: true,
          appointmentScheduling: true,
          basicReports: true,
          mealPlans: true,
          advancedReports: true,
          apiAccess: false,
          customTemplates: true,
        },
      },
    ];

    for (const membershipData of memberships) {
      const membership = membershipRepository.create(membershipData);
      await membershipRepository.save(membership);
    }

    console.log(`✅ Created ${memberships.length} default membership plans`);
  }
}
