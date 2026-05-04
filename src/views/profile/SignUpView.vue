<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();

const handleSignUp = () => {
	authStore.logIn();
	router.push('/');
};

const goToLogIn = () => {
	router.push('/login');
};

const goBackHome = () => {
	router.push('/');
};
</script>

<template>
	<div class="auth-page auth-signup">
		<button class="auth-back" type="button" aria-label="Back to home" @click="goBackHome">
			<i class="pi pi-arrow-left"></i>
		</button>
		<div class="auth-card">
			<img class="auth-logo" src="../../assets/svg/logo.svg" alt="Spotify" />
			<h1 class="auth-title">Sign up to start listening</h1>
			<form class="auth-form">
				<label class="auth-label" for="signup-email">Email address</label>
				<input
					id="signup-email"
					class="auth-input"
					type="email"
                    placeholder="name@domain.com"
					autocomplete="email"
				/>
				<button class="auth-primary" type="button" @click="handleSignUp">Next</button>
			</form>
			<div class="auth-divider"><span>or</span></div>
			<div class="auth-social">
				<button class="auth-secondary" type="button">
					<img class="auth-icon" src="../../assets/svg/mobile.svg" alt="Mobile" />
					<span>Sign up with phone number</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-google"></i>
					<span>Sign up with Google</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-apple"></i>
					<span>Sign up with Apple</span>
				</button>
			</div>
			<div class="auth-footer">
				<span>Already have an account?</span>
				<button class="auth-link" type="button" @click="goToLogIn">Log in</button>
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