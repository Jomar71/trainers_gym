const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { email: 'admin@example.com' },
        include: { trainer: true }
    })

    if (!user) {
        console.log('❌ Usuario NO existe')
        return
    }

    console.log('✅ Usuario encontrado:')
    console.log('  ID:', user.id)
    console.log('  Email:', user.email)
    console.log('  Name:', user.name)
    console.log('  Role:', user.role)
    console.log('  Password (primeros 20 chars):', user.password?.substring(0, 20) + '...')
    console.log('  Tiene perfil Trainer:', user.trainer ? 'SÍ' : 'NO')

    if (user.trainer) {
        console.log('  Trainer ID:', user.trainer.id)
        console.log('  Specialization:', user.trainer.specialization)
    }

    await prisma.$disconnect()
}

checkUser()
