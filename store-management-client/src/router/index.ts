import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../store/auth';
import MainLayout from '../layout/MainLayout.vue';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true }, // This route and its children require authentication
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: Home,
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('../views/Members.vue'),
      },
      {
        path: 'members/new',
        name: 'MemberNew',
        component: () => import('../views/members/MemberForm.vue'),
      },
      {
        path: 'members/edit/:id',
        name: 'MemberEdit',
        component: () => import('../views/members/MemberForm.vue'),
      },
      {
        path: 'employees',
        name: 'Employees',
        component: () => import('../views/Employees.vue'),
      },
      {
        path: 'employees/new',
        name: 'EmployeeNew',
        component: () => import('../views/employees/EmployeeForm.vue'),
      },
      {
        path: 'employees/edit/:id',
        name: 'EmployeeEdit',
        component: () => import('../views/employees/EmployeeForm.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    // If the route requires auth and the user is not authenticated,
    // redirect to the login page.
    next({ name: 'Login' });
  } else {
    next(); // Otherwise, proceed as normal.
  }
});

export default router;
