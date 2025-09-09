import { DataSource } from 'typeorm';
import { CreateSystemAdminSeed } from './001-create-system-admin.seed';
import { CreateDefaultMembershipsSeed } from './002-create-default-memberships.seed';
import { CreateDemoTenantSeed } from './003-create-demo-tenant.seed';

export async function runSeeds(dataSource: DataSource) {
  console.log('🌱 Running database seeds...');

  try {
    const systemAdminSeed = new CreateSystemAdminSeed();
    await systemAdminSeed.run(dataSource);

    const membershipsSeed = new CreateDefaultMembershipsSeed();
    await membershipsSeed.run(dataSource);

    const demoTenantSeed = new CreateDemoTenantSeed();
    await demoTenantSeed.run(dataSource);

    console.log('✅ All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    throw error;
  }
}

// CLI execution
if (require.main === module) {
  // Load environment variables
  require('dotenv').config();

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT!, 10) || 5433,
    username: process.env.DB_USERNAME || 'valnut_user',
    password: process.env.DB_PASSWORD || 'valnut_password',
    database: process.env.DB_NAME || 'valnut_db',
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
    logging: false,
  });

  const main = async () => {
    try {
      await dataSource.initialize();
      await runSeeds(dataSource);
      await dataSource.destroy();
      process.exit(0);
    } catch (error) {
      console.error('❌ Seed execution failed:', error);
      await dataSource.destroy();
      process.exit(1);
    }
  };

  main();
}
