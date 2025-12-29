export const ActorType = {
  USER: "USER",
  SYSTEM: "SYSTEM",
} as const;

export type ActorType = (typeof ActorType)[keyof typeof ActorType];

export interface UserActor {
  type: typeof ActorType.USER;
  userId: string;
}

export interface SystemActor {
  type: typeof ActorType.SYSTEM;
  service: string;
}

export type Actor = UserActor | SystemActor;

// Type guards
export function isUserActor(actor: Actor): actor is UserActor {
  return actor.type === ActorType.USER;
}

export function isSystemActor(actor: Actor): actor is SystemActor {
  return actor.type === ActorType.SYSTEM;
}

// Factory functions
export function userActor(userId: string): UserActor {
  return { type: ActorType.USER, userId };
}

export function systemActor(service: string): SystemActor {
  return { type: ActorType.SYSTEM, service };
}

