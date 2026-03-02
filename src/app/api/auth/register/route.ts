import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();

    // Validar campos requeridos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos: nombre, email o contraseña' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El usuario con este email ya existe' },
        { status: 409 }
      );
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear nuevo usuario
    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role === 'trainer' ? 'TRAINER' : 'CLIENT',
      },
    });

    // Si el rol es entrenador, crear perfil de entrenador
    if (role === 'trainer') {
      await db.trainer.create({
        data: {
          userId: newUser.id,
        },
      });
    } 
    // Si el rol es cliente, crear perfil de cliente
    else if (role === 'client') {
      // Buscar un entrenador disponible (el primero por ahora)
      const firstTrainer = await db.trainer.findFirst({});
      
      if (!firstTrainer) {
        // Si no hay entrenadores, no podemos crear el cliente aún
        // Eliminamos el usuario creado y devolvemos error
        await db.user.delete({ where: { id: newUser.id } });
        return NextResponse.json(
          { message: 'No hay entrenadores disponibles. Por favor, contacta al administrador.' },
          { status: 400 }
        );
      }

      await db.client.create({
        data: {
          userId: newUser.id,
          trainerId: firstTrainer.id,
        },
      });
    }

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en el registro:', error);
    // Si hubo un error, eliminar el usuario creado para evitar usuarios huérfanos
    try {
      await db.user.delete({ where: { id: newUser?.id } });
    } catch (deleteError) {
      // Ignorar errores al eliminar si el usuario no fue creado
    }
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}