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
@import '../../assets/style/auth.css';
</style>