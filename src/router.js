import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Gym from './views/Gym.vue'
import Workshop from './views/Workshop.vue'
import About from './views/About.vue'
import Location from './views/Location.vue'
import Contacts from './views/Contacts.vue'

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/gym', name: 'Gym', component: Gym },
  { path: '/workshop', name: 'Workshop', component: Workshop },
  { path: '/about', name: 'About', component: About },
  { path: '/location', name: 'Location', component: Location },
  { path: '/contacts', name: 'Contacts', component: Contacts },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
