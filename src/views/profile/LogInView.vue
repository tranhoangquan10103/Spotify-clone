<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const handleLogIn = () => {
	authStore.logIn();
	router.push('/');
};

const goToSignUp = () => {
	router.push('/signup');
};

const goBackHome = () => {
	router.push('/');
};
</script>

<template>
	<div class="auth-page auth-signin">
		<button class="auth-back" type="button" aria-label="Back to home" @click="goBackHome">
			<i class="pi pi-arrow-left"></i>
		</button>
		<div class="auth-card">
			<img class="auth-logo" src="../../assets/svg/logo.svg" alt="Spotify" />
			<h1 class="auth-title">Welcome back</h1>
			<form class="auth-form">
				<label class="auth-label" for="login-email">Email</label>
				<input
					id="login-email"
					class="auth-input"
					type="email"
					autocomplete="email"
				/>
				<button class="auth-primary" type="button" @click="handleLogIn">Continue</button>
			</form>
			<div class="auth-divider"><span>or</span></div>
			<div class="auth-social">
				<button class="auth-secondary" type="button">
					<img class="auth-icon" src="../../assets/svg/mobile.svg" alt="Mobile" />
					<span>Continue with phone number</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-google"></i>
					<span>Continue with Google</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-facebook"></i>
					<span>Continue with Facebook</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-apple"></i>
					<span>Continue with Apple</span>
				</button>
			</div>
			<div class="auth-footer">
				<span>Don't have an account?</span>
				<button class="auth-link" type="button" @click="goToSignUp">Sign up</button>
			</div>
			<p class="auth-legal">
				This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of
				Service apply.
			</p>
		</div>
	</div>
</template>

<style>
@import '../../assets/style/auth.css';
</style>