<script setup lang="ts">
import ScrollBar from './Scrollbar.vue';

const cityStats = [
    { name: 'Sydney, AU', listeners: '265,591 listeners' },
    { name: 'Chicago, US', listeners: '249,650 listeners' },
    { name: 'Los Angeles, US', listeners: '239,334 listeners' },
    { name: 'London, GB', listeners: '237,482 listeners' },
    { name: 'Melbourne, AU', listeners: '226,797 listeners' },
];

const socials = [
    { label: 'Facebook', icon: 'pi pi-facebook' },
    { label: 'Instagram', icon: 'pi pi-instagram' },
    { label: 'X', icon: 'pi pi-twitter' },
    { label: 'Wikipedia', icon: 'pi pi-external-link' },
];

const emit = defineEmits<{
    (event: 'close'): void;
}>();
</script>

<template>
    <div class="artist-dialog-shell">
        <button class="artist-dialog-close" type="button" aria-label="Close dialog" @click="emit('close')">
            <i class="pi pi-times" aria-hidden="true"></i>
        </button>
        <ScrollBar class="artist-dialog-scroll">
            <div class="artist-dialog-card-content">
                <aside class="artist-sidebar">
                    <div class="artist-rank-badge">
                        <span class="artist-rank-number">#456</span>
                        <span class="artist-rank-label">in the world</span>
                    </div>

                    <section class="artist-metric artist-metric-highlight">
                        <div class="artist-metric-value">6,260,502</div>
                        <div class="artist-metric-label">Followers</div>
                    </section>

                    <section class="artist-metric">
                        <div class="artist-metric-value">19,802,578</div>
                        <div class="artist-metric-label">Monthly Listeners</div>
                    </section>

                    <section class="artist-city-list">
                        <article v-for="city in cityStats" :key="city.name" class="artist-city-item">
                            <div class="artist-city-name">{{ city.name }}</div>
                            <div class="artist-city-listeners">{{ city.listeners }}</div>
                        </article>
                    </section>

                    <nav class="artist-social-list" aria-label="Artist social links">
                        <a v-for="social in socials" :key="social.label" href="#" class="artist-social-link">
                            <i :class="['artist-social-icon', social.icon]" aria-hidden="true"></i>
                            <span>{{ social.label }}</span>
                        </a>
                    </nav>
                </aside>

                <section class="artist-about">  
                    <p class="artist-bio">
                        Multi-platinum, GRAMMY® Award-winning artist Zedd made his debut with “Clarity” after signing with Interscope in 2012 and has been breaking down barriers surrounding music genres ever since. Throughout his career, Zedd has worked with a diverse range of artists to create hits, including Foxes on “Clarity” (which earned Zedd a 2014 GRAMMY® “Best Dance Recording”), Hayley Williams on RIAA platinum-certified hit, “Stay The Night” (which racked up more than 1.3 billion streams), and Selena Gomez on the platinum-certified track, “I Want You To Know,” which spent four weeks at #1 on Billboard’s “Hot Dance/Electronic Songs” chart. He’s also collaborated with Alessia Cara on their hit single “Stay” which held the #1 spot at Top 40 radio for six consecutive weeks and earned Zedd his second GRAMMY® Award nomination, and with Maren Morris and Grey on the monster hit “The Middle,” which earned Zedd his second #1 at Top 40 radio and held for seven consecutive weeks. Digitally, the song has over 6 billion streams worldwide and earned Zedd three GRAMMY® nominations including “Record Of The Year,” “Song Of The Year,” and “Best Pop Duo or Group Performance.” Most recently, Zedd released his third studio album, the GRAMMY®-nominated Telos. The 10-song masterwork featured a diverse cast of collaborators: rock monarchs John Mayer and Muse, alt-pop stars Remi Wolf, Dora Jar and Bea Miller, modern Irish folk virtuosos the olllam, and the iconic voice of the late, great Jeff Buckley.
                    </p>

                    <div class="artist-author-row">
                        <div class="artist-author-avatar" aria-hidden="true">
                            <img src="https://i.scdn.co/image/ab6761610000101feefa05f0b8fcafd4beb19d31" alt="avatar" />
                        </div>
                        <p class="artist-author-text">Posted By Zedd</p>
                    </div>

                    <div class="artist-status-card artist-verified-card">
                        <div class="artist-status-icon">
                            <i class="pi pi-check"></i>
                        </div>
                        <div class="artist-status-copy">
                            <div class="artist-status-title">Verified by Spotify</div>
                            <p>
                                This artist has grown an active fanbase to be eligible for review and has met Spotify's criteria for profile authenticity. <a href="#">Learn more</a>
                            </p>
                        </div>
                    </div>

                    <div class="artist-status-card artist-registered-card">
                        <div class="artist-status-copy">
                            <div class="artist-status-title">Registered artist</div>
                            <p>This artist has a claimed profile in Spotify for Artists.</p>
                        </div>
                    </div>
                </section>
            </div>
        </ScrollBar>
    </div>
</template>

<style scoped>
.artist-dialog-shell {
    width: 100%;
    color: #ffffff;
    position: relative;
}

.artist-dialog-close {
    position: absolute;
    top: 0.6rem;
    right: 0.6rem;
    z-index: 6;
    width: 36px;
    height: 36px;
    border-radius: 999px;
    border: none;
    background: rgba(18, 18, 18, 0.75);
    color: #b3b3b3;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.2s, color 0.2s;
}

.artist-dialog-close:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
}

.artist-dialog-close:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.35);
    outline-offset: 2px;
}

.artist-dialog-close i {
    font-size: 1rem;
}

.artist-dialog-scroll {
    width: 100%;
    height: min(78vh, 760px);
}

.artist-dialog-scroll :deep(.p-scrollpanel-wrapper) {
    height: 100%;
}

.artist-dialog-scroll :deep(.p-scrollpanel-content) {
    padding-right: 0.65rem;
    box-sizing: border-box;
}

.artist-dialog-card-content {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    gap: 2rem;
    align-items: start;
    padding: 2rem;
    background: #121212;
    color: #ffffff;
}

.artist-sidebar {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    min-width: 0;
}

.artist-rank-badge {
    width: 78px;
    height: 78px;
    border-radius: 50%;
    background: linear-gradient(180deg, #2d8cff 0%, #1760e8 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
}

.artist-rank-number {
    display: block;
    font-size: 1.55rem;
    line-height: 1;
    font-weight: 800;
    letter-spacing: -0.04em;
}

.artist-rank-label {
    display: block;
    margin-top: 0.1rem;
    font-size: 0.74rem;
    line-height: 1;
    font-weight: 700;
}

.artist-metric {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
}

.artist-metric-value {
    font-size: 2.2rem;
    line-height: 1.02;
    font-weight: 800;
    letter-spacing: -0.05em;
}

.artist-metric-label {
    font-size: 1rem;
    line-height: 1.1;
    color: #b3b3b3;
}

.artist-metric-highlight {
    margin-top: 0.1rem;
}

.artist-city-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.artist-city-item {
    display: flex;
    flex-direction: column;
    gap: 0.18rem;
}

.artist-city-name {
    font-size: 0.96rem;
    line-height: 1.1;
    font-weight: 700;
    color: #f7f7f7;
}

.artist-city-listeners {
    font-size: 0.9rem;
    line-height: 1.1;
    color: #b3b3b3;
}

.artist-social-list {
    display: flex;
    flex-direction: column;
    gap: 1.1rem;
    margin-top: 0.2rem;
}

.artist-social-link {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    width: fit-content;
    color: #ffffff;
    text-decoration: none;
    font-size: 0.98rem;
    font-weight: 700;
}

.artist-social-link:hover {
    text-decoration: underline;
}

.artist-social-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 22px;
    height: 22px;
    font-size: 1.05rem;
}

.artist-about {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-width: 0;
    padding-right: 0.25rem;
}

.artist-bio {
    margin: 0;
    color: #b3b3b3;
    font-size: 1rem;
    line-height: 1.33;
    letter-spacing: -0.01em;
}

.artist-author-row {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    margin-top: 0.05rem;
}

.artist-author-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    overflow: hidden;
    flex: 0 0 auto;
    background: #333;
}

.artist-author-avatar img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.artist-author-text {
    margin: 0;
    color: #b3b3b3;
    font-size: 0.98rem;
    line-height: 1.2;
}

.artist-status-card {
    display: flex;
    gap: 0.85rem;
    align-items: flex-start;
    padding: 0.95rem 1rem;
    border-radius: 0.45rem;
    background: #2b2b2b;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

.artist-verified-card {
    margin-top: 0.35rem;
}

.artist-registered-card {
    padding-top: 1rem;
    padding-bottom: 1rem;
    margin-top: -0.1rem;
}

.artist-status-icon {
    width: 26px;
    height: 26px;
    border-radius: 0.35rem;
    background: #c7f0c9;
    color: #202020;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
    margin-top: 0.05rem;
}

.artist-status-icon i {
    font-size: 0.9rem;
    font-weight: 900;
}

.artist-status-copy {
    min-width: 0;
}

.artist-status-title {
    margin: 0 0 0.3rem;
    color: #ffffff;
    font-size: 1rem;
    line-height: 1.2;
    font-weight: 800;
}

.artist-status-copy p {
    margin: 0;
    color: #b3b3b3;
    font-size: 0.94rem;
    line-height: 1.35;
}

.artist-status-copy a {
    color: inherit;
    font-weight: 400;
    text-underline-offset: 0.16em;
}

@media (max-width: 900px) {
    .artist-dialog-card-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .artist-sidebar {
        order: 2;
    }

    .artist-about {
        order: 1;
    }
}
</style>