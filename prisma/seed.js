const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10)

    // Create admin user
    const user = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Administrador',
            password: hashedPassword,
            role: 'TRAINER'
        }
    })

    console.log('✅ Usuario admin creado:', user.email)

    // Create trainer profile
    const trainer = await prisma.trainer.create({
        data: {
            userId: user.id,
            specialization: 'Entrenamiento Personal'
        }
    })

    console.log('✅ Perfil de entrenador creado')
}

main()
    .catch((e) => {
        console.error('❌ Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
