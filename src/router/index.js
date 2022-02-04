import { createWebHistory, createRouter } from 'vue-router'
import LandingPage from '@/views/LandingPage.vue'
import BillPage from '@/views/BillPage.vue'
import Products from '@/views/Products.vue'

const routes = [
	{
		path: '/',
		name: 'LandingPage',
		component: LandingPage,
	},
    {
        path: '/billPage',
        name: 'BillPage',
        component: BillPage
    },
    {
        path: '/products',
        name: 'products',
        component: Products
    }
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;