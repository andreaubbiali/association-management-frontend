import { createRouter, createWebHistory } from 'vue-router'
import Associates from './views/Associates.vue'
import Users from './views/Users.vue'
import Courses from './views/Courses.vue'

const routes = [
  { path: '/', name: 'Associates', component: Associates },
  { path: '/user', name: 'Users', component: Users },
  { path: '/courses', name: 'Courses', component: Courses }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
