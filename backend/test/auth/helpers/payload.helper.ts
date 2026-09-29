/**
 * Builds a valid registration payload with unique username/email on every call,
 * so tests don't collide with each other when hitting the same database.
 */
export const buildValidPayload = () => ({
  username: `user_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
  email: `user_${Date.now()}_${Math.floor(Math.random() * 10000)}@example.com`,
  password: 'Str0ng!Pass',
});
