import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SignUpView from '../views/profile/SignUpView.vue';
import LogInView from '../views/profile/LogInView.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{ path: '/', name: 'home', component: HomeView },
		{ path: '/signup', name: 'signup', component: SignUpView },
		{ path: '/login', name: 'login', component: LogInView },
	],
	scrollBehavior: () => ({ top: 0 }),
});

export default router;
