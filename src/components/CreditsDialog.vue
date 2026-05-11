<script setup lang="ts">
import ScrollBar from './Scrollbar.vue';

const emit = defineEmits<{
	(event: 'close'): void;
}>();
</script>

<template>
	<div class="credits-dialog-shell">
		<header class="credits-header-top">
			<div class="credits-title-wrap">
				<h2 class="credits-title">Credits</h2>
				<div class="credits-sub">Fire Again</div>
			</div>
			<button class="credits-close" type="button" aria-label="Close credits" @click="emit('close')">
				<i class="pi pi-times"></i>
			</button>
		</header>

		<ScrollBar class="credits-scroll">
			<div class="credits-body">
				<section class="credits-section">
					<h3 class="credits-section-title">Artist</h3>

					<div class="credits-item">
						<div>
							<div class="credits-item-name">VALORANT</div>
							<div class="credits-item-role">Main Artist</div>
						</div>
						<button class="follow-pill">Follow</button>
					</div>

					<div class="credits-item">
						<div>
							<div class="credits-item-name">Ashnikko</div>
							<div class="credits-item-role">Featured Artist</div>
						</div>
						<button class="follow-pill">Follow</button>
					</div>
				</section>

				<section class="credits-section">
					<h3 class="credits-section-title">Composition &amp; Lyrics</h3>

					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Ashton Casey</div>
							<div class="credits-item-role">Composer • Lyricist</div>
						</div>
					</div>

					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Nicholas Chiari</div>
							<div class="credits-item-role">Composer • Lyricist</div>
						</div>
					</div>

					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Thomas Slinger</div>
							<div class="credits-item-role">Composer • Lyricist</div>
						</div>
					</div>
				</section>

				<section class="credits-section">
					<h3 class="credits-section-title">Production &amp; Engineering</h3>

					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Grabbitz</div>
							<div class="credits-item-role">Producer</div>
						</div>
					</div>

					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Slinger</div>
							<div class="credits-item-role">Producer</div>
						</div>
					</div>
				</section>

				<section class="credits-section">
					<h3 class="credits-section-title">Sources</h3>
					<div class="credits-item small">
						<div>
							<div class="credits-item-name">Riot Games</div>
						</div>
					</div>
				</section>

				<div class="credits-report">
					<a href="#" class="report-link">Report error</a>
				</div>
			</div>
		</ScrollBar>
	</div>
</template>

<style scoped>
.credits-dialog-shell {
	width: 100%;
	color: #ffffff;
	background: #121212;
	border-radius: 0.6rem;
	overflow: hidden;
}

.credits-header-top {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.1rem 1.25rem;
	border-bottom: 1px solid rgba(255,255,255,0.04);
}

.credits-title {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 800;
}

.credits-sub {
    margin-top: 4px;
    color: #b3b3b3;
    font-weight: 700;
}

.credits-close {
	background: transparent;
	border: none;
	color: #b3b3b3;
	width: 36px;
    height: 36px;
    border-radius: 999px;
	display: inline-flex;
    align-items: center;
    justify-content: center;
	cursor: pointer;
}
.credits-close:hover {
    color: #fff;
    background: rgba(255,255,255,0.04);
}

.credits-scroll {
    width: 100%;
    height: min(66vh, 640px);
}

.credits-scroll :deep(.p-scrollpanel-wrapper) {
    height: 100%;
}

.credits-scroll :deep(.p-scrollpanel-content) {
    padding: 1.25rem;
    box-sizing: border-box;
}

.credits-body {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.credits-section-title {
    font-size: 1.1rem;
    margin: 0 0 0.75rem 0;
    font-weight: 800;
}

.credits-item { 
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem;
    margin-right: 1rem;
    cursor: pointer;
}

.credits-item:hover {
    background: #3F3F3F;
    border-radius: 0.4rem;
}

.credits-item:hover .credits-item-name {
    text-decoration: underline;
}

.credits-item.small {
    padding: 1rem;
}

.credits-item-name {
    font-weight: 800;
    font-size: 1rem;
}

.credits-item-role {
    color: #b3b3b3;
    font-size: 0.92rem;
    margin-top: 0.15rem;
}

.follow-pill {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.507);
    color: #fff;
    padding: 0.8rem 1.5rem;
    border-radius: 999px;
    cursor: pointer;
}

.follow-pill:hover {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255, 255, 255, 0.993);
    transform: scale(1.05);
    transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;
}

.credits-report {
    padding: 0.5rem 1.25rem 2rem;
}

.report-link {
    color: #b3b3b3; 
    text-decoration: none;
    font-weight: 700;
}

.report-link:hover {
    text-decoration: underline;
    color: #fff;
}

@media (max-width: 640px) {
	.credits-scroll { height: min(56vh, 520px); }
}
</style>

