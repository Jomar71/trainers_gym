'use server'

import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export type CreateClientInput = {
    name: string
    email: string
    goal?: string
    notes?: string // Will be stored in Trainer's notes or Client specific field if schema updated
}

export async function createClient(data: CreateClientInput) {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!trainer) return { error: "Trainer profile not found" }

    try {
        // 1. Create User account for Client (or find existing)
        // For MVP, we presume new email = new user. 
        // In production, handle invites carefully.

        let user = await db.user.findUnique({ where: { email: data.email } })

        if (!user) {
            user = await db.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    role: "CLIENT",
                    // Password would be set via invite link in real app
                    // For MVP, we might leave it null or set a default
                }
            })
        }

        // 2. Create Client Profile linked to Trainer
        // Check if client profile already exists for this trainer
        const existingClient = await db.client.findFirst({
            where: {
                userId: user.id,
                trainerId: trainer.id
            }
        })

        if (existingClient) {
            return { error: "Client is already associated with you" }
        }

        await db.client.create({
            data: {
                userId: user.id,
                trainerId: trainer.id,
                goal: data.goal
            }
        })

        revalidatePath('/clients')
        return { success: true }
    } catch (error) {
        console.error("Create Client Error:", error)
        return { error: "Failed to create client" }
    }
}

export async function getClients() {
    const session = await auth()
    if (!session?.user?.id) return []

    const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } })
    if (!trainer) return []

    const clients = await db.client.findMany({
        where: { trainerId: trainer.id },
        include: {
            user: true, // to get name/email
            _count: {
                select: { routines: true }
            }
        },
        orderBy: { user: { name: 'asc' } }
    })

    return clients
}
