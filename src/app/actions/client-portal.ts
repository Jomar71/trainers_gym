'use server'

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"

export async function getClientDashboardData() {
    const session = await auth()
    if (!session?.user?.id) return null

    // Find the Client profile linked to this User
    const client = await db.client.findUnique({
        where: { userId: session.user.id },
        include: {
            user: true,
            trainer: { include: { user: true } }
        }
    })

    if (!client) return { error: "Client profile not found" }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 1. Get Today's Appointments
    const appointments = await db.appointment.findMany({
        where: {
            clientId: client.id,
            startTime: {
                gte: today,
                lt: tomorrow
            }
        },
        orderBy: { startTime: 'asc' }
    })

    // 2. Get Assigned Routines (All active for now, in Future filter by "Assigned for Today")
    const routines = await db.routine.findMany({
        where: {
            clientId: client.id,
            completed: false // Only show incomplete routines
        },
        include: {
            exercises: true
        }
    })

    return {
        client,
        appointments,
        routines
    }
}

export async function markRoutineComplete(routineId: string) {
    // Basic implementation
    await db.routine.update({
        where: { id: routineId },
        data: { completed: true }
    })
    return { success: true }
}
