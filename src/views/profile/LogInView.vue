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
@import '../../assets/style/auth.css';
</style>