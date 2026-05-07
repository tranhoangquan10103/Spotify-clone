<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

type LoginStep = 'email' | 'code' | 'password';

const router = useRouter();
const authStore = useAuthStore();

const step = ref<LoginStep>('email');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const codeDigits = ref<string[]>(Array.from({ length: 6 }, () => ''));
const codeInputRefs = ref<HTMLInputElement[]>([]);
const touched = ref({ email: false, password: false });
const isEmailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim()));
const isPasswordValid = computed(() => password.value.trim().length > 0);
const isCodeValid = computed(() => codeDigits.value.every((digit) => /^\d$/.test(digit)));
const canLoginWithPassword = computed(() => isEmailValid.value && isPasswordValid.value);

const maskEmail = (rawEmail: string) => {
	const [user, domain] = rawEmail.split('@');
	if (!user || !domain) {
		return rawEmail;
	}

	const maskedUser =
		user.length <= 2
			? `${user[0]}*`
			: `${user[0]}${'*'.repeat(Math.max(1, user.length - 2))}${user[user.length - 1]}`;
	const domainParts = domain.split('.');
	const domainName = domainParts[0] ?? '';
	const tld = domainParts.slice(1).join('.') || '';
	const maskedDomain = domainName
		? `${domainName[0]}${'*'.repeat(Math.max(1, domainName.length - 1))}`
		: '';
	return tld ? `${maskedUser}@${maskedDomain}.${tld}` : `${maskedUser}@${maskedDomain}`;
};

const maskedEmail = computed(() => maskEmail(email.value.trim()));

const focusCodeInput = (index: number) => {
	const input = codeInputRefs.value[index];
	if (input) {
		input.focus();
		input.select();
	}
};

const OTPCode = async () => {
	codeDigits.value = Array.from({ length: 6 }, () => '');
	await nextTick();
	focusCodeInput(0);
};

const goToSignUp = () => {
	router.push('/signup');
};

const goBackHome = () => {
	router.push('/');
};

const goToEmail = () => {
	step.value = 'email';
};

const goToCode = async () => {
	step.value = 'code';
	await nextTick();
	focusCodeInput(0);
};

const goToPassword = () => {
	step.value = 'password';
};

const handleContinue = async () => {
	touched.value.email = true;
	if (!isEmailValid.value) {
		return;
	}

	step.value = 'code';
	await OTPCode();
};

const handleCodeInput = (index: number, event: Event) => {
	const target = event.target as HTMLInputElement;
	const digit = target.value.replace(/\D/g, '').slice(-1);
	codeDigits.value[index] = digit;

	if (digit && index < codeDigits.value.length - 1) {
		focusCodeInput(index + 1);
	}
};

const handleCodeKeydown = (index: number, event: KeyboardEvent) => {
	if (event.key === 'Backspace' && !codeDigits.value[index] && index > 0) {
		focusCodeInput(index - 1);
	}
};

const handleCodePaste = async (event: ClipboardEvent) => {
	const pasted = event.clipboardData?.getData('text') ?? '';
	const digits = pasted.replace(/\D/g, '').slice(0, 6).split('');
	if (digits.length === 0) {
		return;
	}

	codeDigits.value = Array.from({ length: 6 }, (_, index) => digits[index] ?? '');
	event.preventDefault();
	await nextTick();
	focusCodeInput(Math.min(digits.length, 6) - 1);
};

const handleResendCode = async () => {
	await OTPCode();
};

const handleCodeLogin = () => {
	if (!isCodeValid.value) {
		return;
	}

	authStore.logIn();
	router.push('/');
};

const handlePasswordLogin = () => {
	touched.value.email = true;
	touched.value.password = true;
	if (!canLoginWithPassword.value) {
		return;
	}

	authStore.logIn();
	router.push('/');
};
</script>

<template>
	<div class="auth-page auth-signin">
		<button
			v-if="step === 'email'"
			class="auth-back"
			type="button"
			aria-label="Back to home"
			@click="goBackHome"
		>
			<i class="pi pi-arrow-left"></i>
		</button>
		<div class="auth-card">
			<img class="auth-logo" src="../../assets/svg/logo.svg" alt="Spotify" />
			<h1 v-if="step === 'email'" class="auth-title">Welcome back</h1>
			<form v-if="step === 'email'" class="auth-form" @submit.prevent="handleContinue">
				<label class="auth-label" for="login-email">Email</label>
				<input
					id="login-email"
					v-model="email"
					class="auth-input"
					:class="{ 'is-invalid': touched.email && !isEmailValid }"
					type="email"
					autocomplete="email"
					@blur="touched.email = true"
				/>
				<p v-if="touched.email && !isEmailValid" class="auth-error">Enter a valid email address.</p>
				<button class="auth-primary" type="submit" :disabled="!isEmailValid">Continue</button>
			</form>

			<div v-else class="auth-step">
				<div class="auth-step-header">
					<button class="auth-step-back" type="button" aria-label="Back" @click="step === 'code' ? goToEmail() : goToCode()">
						<i class="pi pi-arrow-left"></i>
					</button>
					<div class="auth-step-meta">
						<h2 class="auth-step-title">{{ step === 'code' ? 'Enter the code' : 'Log in with a password' }}</h2>
					</div>
				</div>

				<form
					v-if="step === 'code'"
					class="auth-form auth-step-form auth-code"
					@submit.prevent="handleCodeLogin"
				>
					<p class="auth-helper">
						Enter the 6-digit code sent to <span class="auth-strong">{{ maskedEmail }}</span>.
					</p>
					<div class="auth-code-inputs" @paste="handleCodePaste">
						<input
							v-for="(digit, index) in codeDigits"
							:key="index"
							ref="codeInputRefs"
							class="auth-code-input"
							inputmode="numeric"
							maxlength="1"
							pattern="[0-9]*"
							:aria-label="`Code digit ${index + 1}`"
							:value="digit"
							@input="handleCodeInput(index, $event)"
							@keydown="handleCodeKeydown(index, $event)"
						/>
					</div>
					<button class="auth-secondary auth-code-action" type="button" @click="handleResendCode">
						Resend code
					</button>
					<button class="auth-primary" type="submit" :disabled="!isCodeValid">Log in</button>
					<button class="auth-link auth-inline" type="button" @click="goToPassword">
						Log in with a password
					</button>
				</form>

				<form v-else class="auth-form auth-step-form" @submit.prevent="handlePasswordLogin">
					<label class="auth-label" for="login-email-password">Email</label>
					<input
						id="login-email-password"
						v-model="email"
						class="auth-input"
						:class="{ 'is-invalid': touched.email && !isEmailValid }"
						type="email"
						autocomplete="email"
						@blur="touched.email = true"
					/>
					<p v-if="touched.email && !isEmailValid" class="auth-error">Enter a valid email address.</p>

					<label class="auth-label" for="login-password">Password</label>
					<div class="auth-input-wrap">
						<input
							id="login-password"
							v-model="password"
							class="auth-input"
							:class="{ 'is-invalid': touched.password && !isPasswordValid }"
							:type="showPassword ? 'text' : 'password'"
							autocomplete="current-password"
							@input="touched.password = true"
							@blur="touched.password = true"
						/>
						<button
							class="auth-visibility"
							type="button"
							:aria-label="showPassword ? 'Hide password' : 'Show password'"
							@click="showPassword = !showPassword"
						>
							<i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
						</button>
					</div>
					<p v-if="touched.password && !isPasswordValid" class="auth-error">Enter your password.</p>
					<button class="auth-primary" type="submit" :disabled="!canLoginWithPassword">Log in</button>
					<button class="auth-link auth-inline" type="button" @click="goToCode">
						Log in without password
					</button>
				</form>
			</div>

			<div v-if="step === 'email'" class="auth-divider"><span>or</span></div>
			<div v-if="step === 'email'" class="auth-social">
				<button class="auth-secondary" type="button">
					<img class="auth-icon" src="../../assets/svg/mobile.svg" alt="Mobile" />
					<span>Continue with phone number</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-google"></i>
					<span>Continue with Google</span>
				</button>
				<button class="auth-secondary" type="button">
					<i class="pi pi-apple"></i>
					<span>Continue with Apple</span>
				</button>
			</div>
			<div v-if="step === 'email'" class="auth-footer">
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
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Space+Grotesk:wght@400;600&display=swap');

:root {
	--auth-bg: #121212;
	--auth-surface: #121212;
	--auth-surface-strong: #1a1a1a;
	--auth-border: rgba(255, 255, 255, 0.12);
	--auth-text: #fdffff;
	--auth-muted: #8a8a8a;
	--auth-accent: #1ed760;
}

.auth-page {
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 2.5rem 1.5rem;
	background: var(--auth-bg);
	color: var(--auth-text);
	font-family: 'Outfit', 'Space Grotesk', 'Segoe UI', sans-serif;
	position: relative;
	overflow: hidden;
}

.auth-card {
	width: min(460px, 92vw);
	background: var(--auth-surface);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 28px;
	padding: 2.5rem 2.2rem;
	position: relative;
	z-index: 1;
	text-align: center;
}

.auth-back {
	position: absolute;
	top: 1.6rem;
	left: 1.6rem;
	width: 2.6rem;
	height: 2.6rem;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: #121212;
	color: var(--auth-text);
	display: inline-flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: transform 0.2s ease, background 0.2s ease, border-color 0.2s ease;
	z-index: 2;
}

.auth-back:hover {
	transform: translateY(-1px);
	background: #121212;
	border-radius: 999px;
}

.auth-back i {
	font-size: 1.1rem;
}

.auth-logo {
	width: 42px;
	height: 42px;
	margin: 0 auto 1.2rem;
	display: block;
	filter: brightness(0) invert(1);
}

.auth-title {
	font-size: clamp(2rem, 3.5vw, 2.8rem);
	font-weight: 700;
	letter-spacing: -0.02em;
	margin: 0 0 1.8rem;
    font-family: var(--encore-title-font-stack);
}

.auth-form {
	display: flex;
	flex-direction: column;
	gap: 0.7rem;
	text-align: left;
}

.auth-label {
	font-size: 0.9rem;
	color: var(--auth-text);
}

.auth-input, .auth-input-day, .auth-input-year {
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.18);
	background: #121212;
	color: var(--auth-text);
	padding: 0.8rem 1rem;
	font-size: 0.95rem;
}

.auth-input-year {
	max-width: 110px;
}

.auth-input-day {
	width: 110px;
}

.auth-input::placeholder, .auth-input-day::placeholder, .auth-input-year::placeholder {
	color: var(--auth-muted);
}

.auth-input:focus, .auth-input-day:focus, .auth-input-year:focus {
	outline: none;
	border-color: rgba(30, 215, 96, 0.6);
	box-shadow: 0 0 0 3px rgba(30, 215, 96, 0.15);
}

.auth-input.is-invalid, .auth-input-day.is-invalid, .auth-input-year.is-invalid {
	border-color: rgba(253, 255, 255, 0.4);
}

.auth-primary {
	margin-top: 0.6rem;
	background: var(--auth-accent);
	color: #121212;
	border: none;
	border-radius: 999px;
	padding: 0.9rem 1rem;
	font-weight: 700;
	cursor: pointer;
	transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.auth-primary:hover {
	transform: translateY(-1px);
	box-shadow: 0 10px 28px rgba(30, 215, 96, 0.3);
}

.auth-primary:disabled {
	opacity: 0.45;
	cursor: not-allowed;
	box-shadow: none;
	transform: none;
}

.auth-divider {
	display: flex;
	align-items: center;
	gap: 1rem;
	margin: 1.4rem 0 1rem;
	color: var(--auth-muted);
	font-size: 0.85rem;
}

.auth-divider::before,
.auth-divider::after {
	content: '';
	flex: 1;
	height: 1px;
	background: rgba(255, 255, 255, 0.12);
}

.auth-social {
	display: flex;
	flex-direction: column;
	gap: 0.7rem;
}

.auth-secondary {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.75rem;
	border-radius: 999px;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: transparent;
	color: var(--auth-text);
	padding: 0.75rem 1rem;
	font-weight: 600;
	cursor: pointer;
	transition: border-color 0.2s ease, background 0.2s ease;
}

.auth-secondary:hover {
	background: rgba(255, 255, 255, 0.06);
	border-color: rgba(255, 255, 255, 0.4);
    transform: scale(1.02);
    transition-duration: 0.2s;
}

.auth-icon {
	width: 18px;
	height: 18px;
	flex: 0 0 auto;
}

.auth-secondary i {
	font-size: 1.1rem;
}

.auth-footer {
	margin-top: 1.6rem;
	display: flex;
	flex-direction: column;
	gap: 0.4rem;
	color: var(--auth-muted);
	font-size: 0.9rem;
}

.auth-link {
	background: none;
	border: none;
	color: var(--auth-text);
	font-weight: 600;
	cursor: pointer;
}

.auth-link-inline {
	color: var(--auth-text);
	text-decoration: underline;
}

.auth-legal {
	margin-top: 1.6rem;
	font-size: 0.72rem;
	color: var(--auth-muted);
	line-height: 1.4;
}

.auth-step {
	display: flex;
	flex-direction: column;
	gap: 1.4rem;
	text-align: left;
}

.auth-step-progress {
	width: 100%;
	height: 2px;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 999px;
	overflow: hidden;
}

.auth-step-progress-fill {
	height: 100%;
	background: var(--auth-accent);
	transition: width 0.25s ease;
}

.auth-step-header {
	display: flex;
	align-items: flex-start;
	gap: 0.8rem;
}

.auth-step-back {
	width: 2.2rem;
	height: 2.2rem;
	border-radius: 50%;
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: transparent;
	color: var(--auth-text);
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	justify-content: center;
}

.auth-step-meta {
	display: flex;
	flex-direction: column;
	gap: 0.2rem;
}

.auth-step-count {
	color: var(--auth-muted);
	font-size: 0.85rem;
}

.auth-step-title {
	margin: 0;
	font-size: 1.35rem;
	color: var(--auth-text);
}

.auth-step-form {
	gap: 0.9rem;
}

.auth-helper {
	margin: 0;
	font-size: 0.82rem;
	color: var(--auth-muted);
}

.auth-error {
	margin: 0;
	font-size: 0.82rem;
	color: var(--auth-muted);
}

.auth-input-wrap {
	position: relative;
	display: flex;
	align-items: center;
}

.auth-input-wrap .auth-input {
	width: 100%;
	padding-right: 2.8rem;
}

.auth-visibility {
	position: absolute;
	right: 0.8rem;
	background: transparent;
	border: none;
	color: var(--auth-muted);
	cursor: pointer;
}

.auth-visibility:hover {
	color: var(--auth-text);
}

.auth-rules {
	list-style: none;
	padding: 0;
	margin: 0;
	display: grid;
	gap: 0.35rem;
	font-size: 0.85rem;
	color: var(--auth-muted);
}

.auth-rule.is-valid {
	color: var(--auth-accent);
}

.auth-code {
	gap: 1rem;
}

.auth-code-inputs {
	display: grid;
	grid-template-columns: repeat(6, minmax(0, 1fr));
	gap: 0.6rem;
}

.auth-code-input {
	height: 3.2rem;
	border-radius: 10px;
	border: 1px solid rgba(255, 255, 255, 0.18);
	background: #121212;
	color: var(--auth-text);
	text-align: center;
	font-size: 1.1rem;
}

.auth-code-input:focus {
	outline: none;
	border-color: rgba(30, 215, 96, 0.6);
	box-shadow: 0 0 0 3px rgba(30, 215, 96, 0.15);
}

.auth-code-action {
	align-self: center;
	padding: 0.5rem 1.2rem;
	font-size: 0.85rem;
}

.auth-inline {
	align-self: center;
	margin-top: 0.4rem;
}

.auth-strong {
	color: var(--auth-text);
	font-weight: 600;
}

@media (max-width: 520px) {
	.auth-code-inputs {
		gap: 0.4rem;
	}

	.auth-code-input {
		height: 2.8rem;
		font-size: 1rem;
	}
}

.auth-date-grid {
	display: grid;
	grid-template-columns: 1fr 1.4fr 1fr;
	gap: 0.6rem;
}

.auth-select {
	appearance: none;
	background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%238a8a8a"><path d="M7 10l5 5 5-5z"/></svg>');
	background-repeat: no-repeat;
	background-position: right 0.8rem center;
	background-size: 1rem;
}

.auth-radio-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
	gap: 0.6rem;
}

.auth-radio {
	display: flex;
	align-items: center;
	gap: 0.5rem;
	font-size: 0.9rem;
	color: var(--auth-text);
}

.auth-checkbox {
	display: flex;
	align-items: flex-start;
	gap: 0.6rem;
	font-size: 0.9rem;
	color: var(--auth-text);
}

.auth-checkbox input,
.auth-radio input {
	accent-color: var(--auth-accent);
}

.auth-terms {
	margin: 0;
	font-size: 0.8rem;
	color: var(--auth-muted);
}

@media (max-width: 600px) {
	.auth-card {
		padding: 2rem 1.6rem;
	}

	.auth-title {
		font-size: 2rem;
	}
}
</style>