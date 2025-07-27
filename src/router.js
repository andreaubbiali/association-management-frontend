import { createRouter, createWebHistory } from 'vue-router'
import Associates from './views/Associates.vue'
import Users from './views/Users.vue'
import Courses from './views/Courses.vue'
import Login from './views/Login.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Associates', component: Associates, meta: { requiresAuth: true } },
  { path: '/associates', name: 'AssociatesPage', component: Associates, meta: { requiresAuth: true } },
  { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true } },
  { path: '/courses', name: 'Courses', component: Courses, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('authToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  if (requiresAuth && !token) {
    // Redirect to login if route requires auth and user is not authenticated
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && token) {
    // Redirect to dashboard if user is already logged in and tries to access login
    next('/associates')
  } else {
    next()
  }
})

export default router
