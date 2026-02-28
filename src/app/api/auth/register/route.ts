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
      // Para clientes, necesitamos asociarlos con un entrenador existente
      // Por defecto, asociaremos al cliente con el primer entrenador disponible
      // En una implementación real, esto podría ser seleccionado por el administrador
      let trainerId = '';
      
      // Buscar un entrenador disponible (el primero por ahora)
      const firstTrainer = await db.trainer.findFirst({});
      if (firstTrainer) {
        trainerId = firstTrainer.id;
      } else {
        // Si no hay entrenadores, el cliente queda sin asignar temporalmente
        // Esto es válido si primero se registra un entrenador
        trainerId = ''; // Será asignado más adelante
      }

      await db.client.create({
        data: {
          userId: newUser.id,
          trainerId: trainerId,
        },
      });
    }

    return NextResponse.json(
      { message: 'Usuario registrado exitosamente' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error en el registro:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}