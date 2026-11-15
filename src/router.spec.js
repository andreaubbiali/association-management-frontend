import { describe, it, expect } from 'vitest'
import router from './router.js'

describe('router (associate-renewal: route changes)', () => {
  it('has no route matching /associates/create (CreateAssociate removed)', () => {
    const match = router.resolve('/associates/create')
    expect(match.matched.length).toBe(0)
  })

  it('has no route named CreateAssociate', () => {
    const routes = router.getRoutes()
    expect(routes.find((r) => r.name === 'CreateAssociate')).toBeUndefined()
  })

  it('resolves /users/create to a route named AddUser (not the dynamic /users/:id route)', () => {
    const match = router.resolve('/users/create')
    expect(match.matched.length).toBeGreaterThan(0)
    expect(match.name).toBe('AddUser')
  })

  it('the /users/create route requires auth, same as every other route except /login', () => {
    const match = router.resolve('/users/create')
    expect(match.meta.requiresAuth).toBe(true)
  })

  it('adds no dedicated route for the "Associate for <year>" action or the History modal -- both live inline on /users/:id', () => {
    const routes = router.getRoutes()
    const paths = routes.map((r) => r.path)

    expect(paths).not.toContain('/users/:id/associates')
    expect(paths).not.toContain('/users/:id/history')
  })

  it('still resolves /users/:id to UserDetail, unaffected by the new /users/create route', () => {
    const match = router.resolve('/users/42')
    expect(match.name).toBe('UserDetail')
    expect(match.params.id).toBe('42')
  })
})
