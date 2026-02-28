import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin', 10)

    // Check if user already exists
    const existing = await prisma.user.findUnique({
        where: { email: 'admin@example.com' }
    })

    if (existing) {
        console.log('⚠️  Usuario admin ya existe')
        return
    }

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
        console.error('❌ Error:', e.message)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
