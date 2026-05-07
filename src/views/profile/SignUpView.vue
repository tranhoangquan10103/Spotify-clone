<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/useAuthStore';

type SignupStep = 'email' | 'password' | 'profile' | 'terms';

const router = useRouter();
const authStore = useAuthStore();

const step = ref<SignupStep>('email');
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const displayName = ref('');
const birthDay = ref('');
const birthMonth = ref('');
const birthYear = ref('');
const gender = ref('');
const marketingOptOut = ref(false);
const shareRegistrationData = ref(false);

const touched = ref({
	email: false,
	password: false,
	name: false,
	dob: false,
	gender: false,
});

const monthOptions = [
	{ value: '1', label: 'January' },
	{ value: '2', label: 'February' },
	{ value: '3', label: 'March' },
	{ value: '4', label: 'April' },
	{ value: '5', label: 'May' },
	{ value: '6', label: 'June' },
	{ value: '7', label: 'July' },
	{ value: '8', label: 'August' },
	{ value: '9', label: 'September' },
	{ value: '10', label: 'October' },
	{ value: '11', label: 'November' },
	{ value: '12', label: 'December' },
];

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isEmailValid = computed(() => emailRegex.test(email.value.trim()));

const passwordHasLetter = computed(() => /[A-Za-z]/.test(password.value));
const passwordHasNumberOrSpecial = computed(
	() => /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password.value),
);
const passwordHasLength = computed(() => password.value.length >= 10);
const isPasswordValid = computed(
	() => passwordHasLetter.value && passwordHasNumberOrSpecial.value && passwordHasLength.value,
);

const isNameValid = computed(() => displayName.value.trim().length >= 2);
const isDobComplete = computed(
	() => birthDay.value.trim() !== '' && birthMonth.value.trim() !== '' && birthYear.value.trim() !== '',
);
const currentYear = new Date().getFullYear();
const isDobValid = computed(() => {
	if (!isDobComplete.value) {
		return false;
	}

	const day = Number.parseInt(birthDay.value, 10);
	const month = Number.parseInt(birthMonth.value, 10);
	const year = Number.parseInt(birthYear.value, 10);
	if (!day || !month || !year) {
		return false;
	}

	if (year < 1900 || year > currentYear) {
		return false;
	}

	const candidate = new Date(year, month - 1, day);
	return (
		candidate.getFullYear() === year &&
		candidate.getMonth() === month - 1 &&
		candidate.getDate() === day
	);
});
const dobError = computed(() => {
	if (!touched.value.dob) {
		return '';
	}

	if (!isDobComplete.value) {
		return 'Please enter a complete date of birth.';
	}

	if (!isDobValid.value) {
		return 'Please enter a valid date of birth.';
	}

	return '';
});
const isGenderValid = computed(() => gender.value !== '');
const isProfileValid = computed(() => isNameValid.value && isDobValid.value && isGenderValid.value);

const stepIndex = computed(() => {
	if (step.value === 'password') {
		return 1;
	}
	if (step.value === 'profile') {
		return 2;
	}
	return 3;
});
const stepTitle = computed(() => {
	if (step.value === 'password') {
		return 'Create a password';
	}
	if (step.value === 'profile') {
		return 'Tell us about yourself';
	}
	return 'Terms & Conditions';
});
const stepProgress = computed(() => (stepIndex.value / 3) * 100);

const goToLogIn = () => {
	router.push('/login');
};

const goBackHome = () => {
	router.push('/');
};

const nextFromEmail = () => {
	touched.value.email = true;
	if (!isEmailValid.value) {
		return;
	}

	step.value = 'password';
};

const nextFromPassword = () => {
	touched.value.password = true;
	if (!isPasswordValid.value) {
		return;
	}

	step.value = 'profile';
};

const nextFromProfile = () => {
	touched.value.name = true;
	touched.value.dob = true;
	touched.value.gender = true;
	if (!isProfileValid.value) {
		return;
	}

	step.value = 'terms';
};

const goBackStep = () => {
	if (step.value === 'password') {
		step.value = 'email';
		return;
	}
	if (step.value === 'profile') {
		step.value = 'password';
		return;
	}
	if (step.value === 'terms') {
		step.value = 'profile';
	}
};

const finishSignUp = () => {
	authStore.logIn();
	router.push('/');
};

const clampDigits = (value: string, maxLength: number) =>
	value.replace(/\D/g, '').slice(0, maxLength);

const onBirthDayInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	birthDay.value = clampDigits(target.value, 2);
};

const onBirthYearInput = (event: Event) => {
	const target = event.target as HTMLInputElement;
	birthYear.value = clampDigits(target.value, 4);
};
</script>

<template>
	<div class="auth-page auth-signup">
		<button class="auth-back" type="button" aria-label="Back to home" @click="goBackHome">
			<i class="pi pi-arrow-left"></i>
		</button>
		<div class="auth-card">
			<img class="auth-logo" src="../../assets/svg/logo.svg" alt="Spotify" />
			<h1 v-if="step === 'email'" class="auth-title">Sign up to start listening</h1>
			<form v-if="step === 'email'" class="auth-form" @submit.prevent="nextFromEmail">
				<label class="auth-label" for="signup-email">Email address</label>
				<input
					id="signup-email"
					v-model="email"
					class="auth-input"
					:class="{ 'is-invalid': touched.email && !isEmailValid }"
					type="email"
					placeholder="name@domain.com"
					autocomplete="email"
					@blur="touched.email = true"
				/>
				<p v-if="touched.email && !isEmailValid" class="auth-error">Enter a valid email address.</p>
				<button class="auth-primary" type="submit" :disabled="!isEmailValid">Next</button>
			</form>

			<div v-else class="auth-step">
				<div class="auth-step-progress">
					<div class="auth-step-progress-fill" :style="{ width: `${stepProgress}%` }"></div>
				</div>
				<div class="auth-step-header">
					<button class="auth-step-back" type="button" aria-label="Back" @click="goBackStep">
						<i class="pi pi-arrow-left"></i>
					</button>
					<div class="auth-step-meta">
						<span class="auth-step-count">Step {{ stepIndex }} of 3</span>
						<h2 class="auth-step-title">{{ stepTitle }}</h2>
					</div>
				</div>

				<form
					v-if="step === 'password'"
					class="auth-form auth-step-form"
					@submit.prevent="nextFromPassword"
				>
					<label class="auth-label" for="signup-password">Password</label>
					<div class="auth-input-wrap">
						<input
							id="signup-password"
							v-model="password"
							class="auth-input"
							:class="{ 'is-invalid': touched.password && !isPasswordValid }"
							:placeholder="'Password'"
							:type="showPassword ? 'text' : 'password'"
							autocomplete="new-password"
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
					<p class="auth-helper">Your password must contain at least</p>
					<ul class="auth-rules">
						<li class="auth-rule" :class="{ 'is-valid': passwordHasLetter }">1 letter</li>
						<li class="auth-rule" :class="{ 'is-valid': passwordHasNumberOrSpecial }">
							1 number or special character (example: # ? ! &amp;)
						</li>
						<li class="auth-rule" :class="{ 'is-valid': passwordHasLength }">10 characters</li>
					</ul>
					<button class="auth-primary" type="submit" :disabled="!isPasswordValid">Next</button>
				</form>

				<form
					v-else-if="step === 'profile'"
					class="auth-form auth-step-form"
					@submit.prevent="nextFromProfile"
				>
					<label class="auth-label" for="signup-name">Name</label>
					<input
						id="signup-name"
						v-model="displayName"
						class="auth-input"
						:class="{ 'is-invalid': touched.name && !isNameValid }"
						type="text"
						autocomplete="name"
						@blur="touched.name = true"
					/>
					<p class="auth-helper">This name will appear on your profile</p>

					<label class="auth-label" for="signup-birth-day">Date of birth</label>
					<p class="auth-helper">
						Why do we need your date of birth?
						<a class="auth-link-inline" href="https://support.spotify.com/" target="_blank" rel="noreferrer">
							Learn more.
						</a>
					</p>
					<div class="auth-date-grid">
						<input
							id="signup-birth-day"
							v-model="birthDay"
							class="auth-input-day"
							:class="{ 'is-invalid': touched.dob && !isDobValid }"
							inputmode="numeric"
							placeholder="dd"
							@input="onBirthDayInput"
							@blur="touched.dob = true"
						/>
						<select
							v-model="birthMonth"
							class="auth-input auth-select"
							:class="{ 'is-invalid': touched.dob && !isDobValid }"
							@blur="touched.dob = true"
						>
							<option value="">Month</option>
							<option v-for="month in monthOptions" :key="month.value" :value="month.value">
								{{ month.label }}
							</option>
						</select>
						<input
							v-model="birthYear"
							class="auth-input-year"
							:class="{ 'is-invalid': touched.dob && !isDobValid }"
							inputmode="numeric"
							placeholder="yyyy"
							@input="onBirthYearInput"
							@blur="touched.dob = true"
						/>
					</div>
					<p v-if="dobError" class="auth-error">{{ dobError }}</p>

					<label class="auth-label">Gender</label>
					<div class="auth-radio-grid">
						<label class="auth-radio">
							<input v-model="gender" type="radio" value="man" @change="touched.gender = true" />
							<span>Man</span>
						</label>
						<label class="auth-radio">
							<input v-model="gender" type="radio" value="woman" @change="touched.gender = true" />
							<span>Woman</span>
						</label>
						<label class="auth-radio">
							<input v-model="gender" type="radio" value="non-binary" @change="touched.gender = true" />
							<span>Non-binary</span>
						</label>
						<label class="auth-radio">
							<input v-model="gender" type="radio" value="other" @change="touched.gender = true" />
							<span>Something else</span>
						</label>
						<label class="auth-radio">
							<input v-model="gender" type="radio" value="prefer-not" @change="touched.gender = true" />
							<span>Prefer not to say</span>
						</label>
					</div>
					<p v-if="touched.gender && !isGenderValid" class="auth-error">Select a gender option.</p>
					<button class="auth-primary" type="submit" :disabled="!isProfileValid">Next</button>
				</form>

				<form v-else class="auth-form auth-step-form" @submit.prevent="finishSignUp">
					<div class="auth-checkbox">
						<input id="signup-marketing" v-model="marketingOptOut" type="checkbox" />
						<label for="signup-marketing">
							I would prefer not to receive marketing messages from Spotify
						</label>
					</div>
					<div class="auth-checkbox">
						<input id="signup-share" v-model="shareRegistrationData" type="checkbox" />
						<label for="signup-share">
							Share my registration data with Spotify's content providers for marketing purposes.
						</label>
					</div>
					<p class="auth-helper">Spotify is a personalised service.</p>
					<p class="auth-terms">
						By clicking on sign-up, you agree to Spotify's
						<a class="auth-link-inline" href="https://www.spotify.com/legal/end-user-agreement/" target="_blank" rel="noreferrer">
							Terms and Conditions of Use
						</a>.
					</p>
					<p class="auth-terms">
						By clicking on sign-up, you confirm that you have read how we process your personal data in our
						<a class="auth-link-inline" href="https://www.spotify.com/legal/privacy-policy/" target="_blank" rel="noreferrer">
							Privacy Policy
						</a>.
					</p>
					<button class="auth-primary" type="submit">Sign up</button>
				</form>
			</div>

			<div v-if="step === 'email'" class="auth-divider"><span>or</span></div>
			<div v-if="step === 'email'" class="auth-social">
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
			<div v-if="step === 'email'" class="auth-footer">
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