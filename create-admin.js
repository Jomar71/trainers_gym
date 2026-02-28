const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdminUser() {
    try {
        // Check if user exists
        const existing = await prisma.user.findUnique({
            where: { email: 'admin@example.com' }
        })

        if (existing) {
            console.log('⚠️  Usuario ya existe. Actualizando password...')

            // Update password
            const hashedPassword = await bcrypt.hash('admin', 10)
            await prisma.user.update({
                where: { email: 'admin@example.com' },
                data: { password: hashedPassword }
            })

            console.log('✅ Password actualizado')
            return
        }

        // Create new user
        const hashedPassword = await bcrypt.hash('admin', 10)

        const user = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                name: 'Administrador',
                password: hashedPassword,
                role: 'TRAINER'
            }
        })

        console.log('✅ Usuario creado:', user.email)

        // Create trainer profile
        const trainer = await prisma.trainer.create({
            data: {
                userId: user.id,
                specialization: 'Entrenamiento Personal'
            }
        })

        console.log('✅ Perfil de entrenador creado')
        console.log('\n📧 Email: admin@example.com')
        console.log('🔑 Password: admin')

    } catch (error) {
        console.error('❌ Error:', error.message)
    } finally {
        await prisma.$disconnect()
    }
}

createAdminUser()
