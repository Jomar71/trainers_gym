'use server'

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type CreateAppointmentInput = {
    clientId: string
    date: string // ISO string
    time: string // HH:mm
    duration: number // minutes, default 60
    notes?: string
}

export async function createAppointment(data: CreateAppointmentInput) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!trainer) return { error: "Trainer profile not found" }

    try {
        const startTime = new Date(`${data.date}T${data.time}:00`)
        const endTime = new Date(startTime.getTime() + data.duration * 60000)

        // Basic conflict check (optional for MVP but good)
        const conflict = await db.appointment.findFirst({
            where: {
                trainerId: trainer.id,
                OR: [
                    {
                        startTime: { lte: startTime },
                        endTime: { gt: startTime }
                    },
                    {
                        startTime: { lt: endTime },
                        endTime: { gte: endTime }
                    }
                ]
            }
        })

        if (conflict) {
            return { error: "Time slot overlap detected" }
        }

        await db.appointment.create({
            data: {
                trainerId: trainer.id,
                clientId: data.clientId,
                startTime,
                endTime,
                notes: data.notes
            }
        })

        revalidatePath('/calendar')
        return { success: true }
    } catch (error) {
        console.error("Create Appointment Error:", error)
        return { error: "Failed to create appointment" }
    }
}

export async function getAppointments(startDate?: Date, endDate?: Date) {
    const session = await auth()
    if (!session?.user?.id) return []

    const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!trainer) return []

    // Default to current month if no range
    const now = new Date()
    const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
    const end = endDate || new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return await db.appointment.findMany({
        where: {
            trainerId: trainer.id,
            startTime: {
                gte: start,
                lte: end
            }
        },
        include: {
            client: {
                include: { user: true }
            }
        },
        orderBy: { startTime: 'asc' }
    })
}
