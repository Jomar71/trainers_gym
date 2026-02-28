'use server'

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type ExerciseInput = {
    name: string
    sets?: number
    reps?: number
    weight?: number
    restTime?: number
    videoUrl?: string
    notes?: string
}

export type CreateRoutineInput = {
    name: string
    description?: string
    exercises: ExerciseInput[]
    clientId?: string
}

export async function createRoutine(data: CreateRoutineInput) {
    const session = await auth()

    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    // Ensure user has a Trainer profile
    const trainer = await db.trainer.findUnique({
        where: { userId: session.user.id }
    })

    if (!trainer) {
        // Auto-create trainer profile for MVP loop if it doesn't exist
        // In a real app, this would be part of onboarding
        await db.trainer.create({
            data: { userId: session.user.id }
        })
        // Re-fetch or just return specific error
        // return { error: "Trainer profile not found" }
    }

    const currentTrainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!currentTrainer) return { error: "Failed to resolve trainer profile" }

    try {
        const routine = await db.routine.create({
            data: {
                name: data.name,
                description: data.description,
                trainerId: currentTrainer.id,
                clientId: data.clientId || undefined,
                exercises: {
                    create: data.exercises.map(ex => ({
                        name: ex.name,
                        sets: ex.sets || 0,
                        reps: ex.reps || 0,
                        weight: ex.weight || 0,
                        restTime: ex.restTime || 0,
                        videoUrl: ex.videoUrl,
                        notes: ex.notes
                    }))
                }
            }
        })

        revalidatePath('/routines')
        return { success: true, routine }
    } catch (error) {
        console.error(error)
        return { error: "Failed to create routine" }
    }
}

export async function getRoutines() {
    const session = await auth()
    if (!session?.user?.id) return []

    const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!trainer) return []

    return await db.routine.findMany({
        where: { trainerId: trainer.id },
        include: { exercises: true, client: true },
        orderBy: { createdAt: 'desc' }
    })
}
