const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testLogin() {
    const email = 'admin@example.com'
    const password = 'admin'

    console.log('🔍 Buscando usuario:', email)

    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        console.log('❌ Usuario NO encontrado')
        return
    }

    console.log('✅ Usuario encontrado:')
    console.log('  - ID:', user.id)
    console.log('  - Email:', user.email)
    console.log('  - Name:', user.name)
    console.log('  - Role:', user.role)
    console.log('  - Tiene password:', !!user.password)

    if (user.password) {
        console.log('\n🔐 Verificando password...')
        const isValid = await bcrypt.compare(password, user.password)
        console.log('  - Password válido:', isValid ? '✅ SÍ' : '❌ NO')

        if (!isValid) {
            console.log('\n⚠️  El password en la BD no coincide con "admin"')
            console.log('   Actualizando password...')

            const newHash = await bcrypt.hash('admin', 10)
            await prisma.user.update({
                where: { email },
                data: { password: newHash }
            })

            console.log('✅ Password actualizado correctamente')
        }
    }

    await prisma.$disconnect()
}

testLogin().catch(console.error)
