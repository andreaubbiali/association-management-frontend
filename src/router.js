import { createRouter, createWebHistory } from 'vue-router'
import Associates from './views/Associates.vue'
import AssociateManage from './views/AssociateManage.vue'
import Users from './views/Users.vue'
import Courses from './views/Courses.vue'
import Login from './views/Login.vue'
import Reports from './views/Reports.vue'

const routes = [
  { path: '/login', name: 'Login', component: Login },
  { path: '/', name: 'Associates', component: Associates, meta: { requiresAuth: true } },
  { path: '/associates', name: 'AssociatesPage', component: Associates, meta: { requiresAuth: true } },
  { path: '/associates/:id/manage', name: 'AssociateManage', component: AssociateManage, meta: { requiresAuth: true } },
  { path: '/users', name: 'Users', component: Users, meta: { requiresAuth: true } },
  { path: '/courses', name: 'Courses', component: Courses, meta: { requiresAuth: true } },
  { path: '/reports', name: 'Reports', component: Reports, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  console.log('Navigation guard - to:', to.path, 'from:', from.path)
  
  const token = localStorage.getItem('authToken')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  console.log('Token exists:', !!token, 'Requires auth:', requiresAuth)
  
  if (requiresAuth && !token) {
    // Redirect to login if route requires auth and user is not authenticated
    console.log('Redirecting to login - no token')
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
  } else if (to.path === '/login' && token) {
    // Redirect to dashboard if user is already logged in and tries to access login
    console.log('Redirecting to associates - already logged in')
    next('/associates')
  } else {
    console.log('Navigation allowed')
    next()
  }
})

export default router
