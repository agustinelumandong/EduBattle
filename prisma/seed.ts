import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create a test user (optional - remove in production)
  if (process.env.NODE_ENV === 'development') {
    const testUser = await prisma.user.upsert({
      where: { email: 'test@example.com' },
      update: {},
      create: {
        email: 'test@example.com',
        username: 'TestUser',
        authMethod: 'email',
        passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/h4Wl4R7DS', // password: "test123"
      },
    })
    console.log('✅ Created test user:', testUser)
  }

  console.log('🌱 Database seed completed!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Database seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
