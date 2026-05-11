<script setup lang="ts">
import { ref } from 'vue';
import ScrollBar from '../../components/Scrollbar.vue';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import ArtistDialog from '../../components/ArtistDialog.vue';
import CreditsDialog from '../../components/CreditsDialog.vue';

const rhinestoneEyesVideo = new URL('../../songs/canvas/Rhinestone Eyes.mp4', import.meta.url).href;

const nowPlaying = {
    title: 'Rhinestone Eyes',
    artist: 'Gorillaz',
    videoSrc: rhinestoneEyesVideo,
    artistImage: 'https://i.scdn.co/image/ab67616d00001e02622aefd794f6fe4d8e714358',
    listeners: '55,456,379 Monthly Listeners',
};

const credits = [
    { name: 'Gorillaz', role: 'Main Artist • Producer • Bass', canFollow: true },
    { name: 'Shane Boose', role: 'Writer', canFollow: false },
    { name: 'Gregg White', role: 'Recording Engineer', canFollow: false },
];

const artistVisible = ref(false);
const creditsVisible = ref(false);
    
</script>

<template>
    <div class="content-wrapper">
        <ScrollBar style="width: 100%;" class="now-playing-scroll">
            <div class="now-playing-header">
                <p>Now Playing</p>
            </div>
            <div class="canvas-container">
                <p class="song-name">{{ nowPlaying.title }}</p>
                <p class="song-name artist-name">{{ nowPlaying.artist }}</p>
                <video autoplay loop muted class="canvas">
                    <source :src="nowPlaying.videoSrc" type="video/mp4" />
                </video>
                <div class="inline-shadow"></div>
            </div>
            <div class="artist-card" @click="artistVisible = true">
                <Dialog v-model:visible="artistVisible" modal class="artist-dialog" :closable="false" :showHeader="false">
                    <ArtistDialog @close="artistVisible = false" />
                </Dialog>
                <Dialog v-model:visible="creditsVisible" modal class="credits-dialog" :closable="false" :showHeader="false">
                    <CreditsDialog @close="creditsVisible = false" />
                </Dialog>
                <div class="artist-card-header">
                    <div class="image-header" :style="{ backgroundImage: `url('${nowPlaying.artistImage}')` }"></div>
                    <p class="image-badge">About the artist</p>
                </div>
                <div class="artist-card-body">
                    <div class="about-body-title">Artist Name</div>
                    <div class="about-body-content">
                        <div class="about-body-info">
                            <div class="revenue">
                                <p>{{ nowPlaying.listeners }}</p>
                            </div>
                            <Button label="Follow" class="follow-button" outlined />
                        </div>
                        <p class="m-0">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                            quas!
                        </p>
                    </div>
                </div>
            </div>

            <div class="credits">
                <div class="credits-header">
                    <p class="credits-title">Credits</p>
                    <Button class="show-button" link label="Show all" @click="creditsVisible = true" />
                </div>
                <div class="credits-body">
                    <div v-for="member in credits" :key="`${member.name}-${member.role}`" class="credits-member">
                        <div>
                            <p class="name credits-name">{{ member.name }}</p>
                            <p class="role">{{ member.role }}</p>
                        </div>
                        <Button v-if="member.canFollow" label="Follow" class="follow-button" outlined />
                    </div>
                </div>
            </div>
        </ScrollBar>
    </div>
</template>

<style>
.content-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    width: 100%;
    overflow: hidden;
}

.p-scrollpanel-wrapper .now-playing-header{
    height: 70px;
    padding: 0 1rem;
    color: #fff;
    display: flex;
    font-size: 18px;
    font-weight: 600;
    align-items: center;
    flex-shrink: 0;
    z-index: 2;
    top: 0;
    left: 0;
    width: 100%;
    background: transparent;
    border-radius: 9px 9px 0 0;
    box-sizing: border-box;
    position: absolute;
}

.canvas-container{
    width: 100%;
    margin: 0 0 30rem;
    z-index: -1;
}

.inline-shadow {
    position: absolute;
    inset: 0;
    background: #121212;
    background: linear-gradient(0deg, rgba(18, 18, 18, 1) 0%, rgba(255, 255, 255, 0) 23%, rgba(255, 255, 255, 0) 83%, rgba(18, 18, 18, 0.73) 100%);
    z-index: 0;
}

.canvas {
    position: absolute;
    height: 100%;
    width: 100%;
    z-index: 0;
    object-fit: cover;
    box-shadow: inset 0px 0px 20px 5px rgba(0,0,0,0.5);
}

.song-name{
    position: absolute;
    bottom: 0;
    margin: 0 0 6.4rem 1rem;
    color: #ffffff;
    font-size: 1.9rem;
    font-weight: 600;
    letter-spacing: 0.02em;
    z-index: 1;
}

.artist-name {
    margin: 0 0 4.9rem 1rem;
    font-size: 1.2rem;
    color: #b3b3b3;
}

.now-playing-scroll{
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
}

.now-playing-scroll .p-scrollpanel-content{
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    gap: 0rem;
}

.now-playing-scroll .p-scrollpanel-content > * {
    flex-shrink: 0;
}

.artist-card {
    width: calc(100% - 2rem);
    overflow: hidden;
    border-radius: 0.5rem;
    background-color: #1F1F1F;
    z-index: 1;
    margin: 0 1rem;
    cursor: pointer;
    margin-bottom: 1rem;
}

.artist-card-header {
    position: relative;
}

.image-header{
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem 0.5rem 0 0;
    background-size: cover;
    background-position: center;
    padding-top: 100%;
}

.image-header::after{
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.65) 10%, rgba(0, 0, 0, 0.2) 28%, rgba(0, 0, 0, 0) 58%);
    pointer-events: none;
}

.image-header img{
    display: block;
    width: 100%;
    height: auto;
}

.image-badge{
    position: absolute;
    top: 0;
    left: 0;
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

p.image-badge{
    margin: 0.8rem;
}

.artist-card-body {
    padding: 1rem;
}

.about-body-title {
    font-size: 1.1rem;
    color: white;
    margin-bottom: 0;
}

.about-body-content {
    padding: 0.2rem 0;
    color: white;
}

.about-body-content p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    color: #b3b3b3;
}

.about-body-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: nowrap;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.about-body-info .revenue {
    flex: 1 1 auto;
    min-width: 0;
}

.about-body-info .revenue p{
    margin: 0;
    color: #b3b3b3;
    font-size: 0.9rem;
    white-space: normal;
    overflow-wrap: anywhere;
}

.follow-button {
    border-color: #b3b3b3;
    color: white;
    border-radius: 999px;
    position: relative;
    right: 0px;
    margin: 0;
    flex: 0 0 auto;
    flex-shrink: 0;
}

.credits {
    width: calc(100% - 2rem);
    margin: 0 1rem 1rem;
    flex-flow: row wrap;
    flex-direction: column;
    background-color: #1F1F1F;
    border-radius: 0.5rem;
    padding: 0.5rem 1.2rem;
    z-index: 1;
}

.credits-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.5rem 0;
}

.credits-title{
    color: white;
    font-size: 1.1rem;
    margin: 1rem 0.2rem;
}

.credits-member{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0.2rem 0;
    min-width: 0;
}

.credits-member > div{
    flex: 1 1 auto;
    min-width: 0;
}

.credits-member .role{
    margin: 0.4rem 0 1rem;
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 100%;
}

.credits-name {
    color: white;
}

.p-button:hover {
    background: transparent;
    border-color: white;
    color: white;
    transform: scale(1.05);
    transition: transform 0.2s;
}

.p-button:focus {
    box-shadow: none;
    background: transparent;
}

.p-button.p-button-link{
    color: #b3b3b3;
}

.p-button.p-button-link:hover {
    color: white;
    text-decoration: underline;
}

.artist-dialog.p-dialog {
    width: min(1120px, calc(100vw - 2rem));
    border: 1px solid rgba(255, 255, 255, 0.06);
    border-radius: 1rem;
    background: #121212;
    box-shadow: 0 24px 80px rgba(0, 0, 0, 0.55);
    overflow: hidden;
}

.artist-dialog.p-dialog .p-dialog-content {
    padding: 0;
    background: transparent;
    overflow: hidden;
}

.credits-dialog.p-dialog .p-dialog-content {
    padding: 0;
    background: transparent;
    overflow: hidden;
    width: 450px;
}
</style>