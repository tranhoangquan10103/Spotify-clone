<script setup lang="ts">
import ScrollBar from '../../components/Scrollbar.vue';
import Card from 'primevue/card';
import Button from 'primevue/button';

</script>

<template>
    <div class="now-playing-header">
        <p>Now Playing</p>
    </div>
    <ScrollBar style="width: 100%;" class="now-playing-scroll">
        <div class="album-art">
            
        </div>

        <div class="about-artist">
            <Card class="artist-card">
                <template #header>
                    <div class="image-header">
                        <img alt="user header" src="https://i.scdn.co/image/ab67616d0000b27396e2549d594b828ccd598c07" width="100%"/>
                    </div>
                    <span class="image-badge">About the artist</span>
                </template>
                <template #title>Artist Name</template>
                <template #content>
                <div class="artist-info">
                    <div class="revenue">
                        <p>55,456,379 monthly listeners</p>
                    </div>
                    <Button label="Follow" class="follow-button" outlined />
                </div>
                <p class="m-0">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit. Inventore sed consequuntur error repudiandae numquam deserunt quisquam repellat libero asperiores earum nam nobis, culpa ratione quam perferendis esse, cupiditate neque
                    quas!
                </p>
                </template>
            </Card>
        </div>

        <div class="credits">
            <Card class="artist-card">
                <template #header>
                    <div class="credits-header">
                        <p class="credits-title">Credits</p>
                        <Button class="show-button" link>Show all</Button>
                    </div>
                </template>
                <template #title></template>
                <template #content>
                <div class="album-member">
                    <div>
                        <p style="color: white">sombr</p>
                        <p class="album-member-role" style="margin: 0.4rem 0 1rem;">Main Artist • Producer • Bass</p>
                    </div>
                    <Button label="Follow" class="follow-button" outlined />
                </div>
                <div class="album-member">
                    <div>
                        <p style="color: white">Shane Boose</p>
                        <p style="margin: 0.4rem 0 1rem;">Writer</p>
                    </div>
                </div>
                <div class="album-member">
                    <div>
                        <p style="color: white">Gregg White</p>
                        <p style="margin: 0.4rem 0 1rem;">Recording Engineer</p>
                    </div>
                </div>
                </template>
            </Card>
        </div>
    </ScrollBar>
</template>

<style>
.now-playing-header{
    height: 40px;
    margin: 0 1rem;
    color: #fff;
	display: flex;
    font-size: 18px;
    font-weight: 600;
    align-items: center;
}

.now-playing-scroll{
	flex: 1 1 auto;
	flex-direction: column;
	min-height: 0;
}

.now-playing-scroll .p-scrollpanel-content{
    display: flex;
    flex-direction: column;
    gap: 7px;
    box-sizing: border-box;
}

.about-artist{
    margin: 0;
    padding-bottom: 0.5rem;
}

.credits{
    margin: 0;
	display: flex;
	flex-flow: row wrap;
	position: relative;
}

.album-art{
    margin: 0;
}

.artist-card {
    width: 100%;
    overflow: hidden;
    border-radius: 0.5rem;
    background-color: #1F1F1F;
}

.image-header{
    position: relative;
    overflow: hidden;
    border-radius: 0.5rem 0.5rem 0 0;
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
    top: 1.4rem;
    left: 1.1rem;
    border-radius: 0.4rem;
    color: #ffffff;
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}

.artist-info {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 0.75rem;
}

.artist-info .revenue p{
    margin: 0;
    color: #b3b3b3;
    font-size: 0.9rem;
}

.follow-button {
    border-color: #b3b3b3;
    color: white;
    border-radius: 999px;
    position: relative;
    right: 0px;
    align-self: flex-start;
    margin: 10px;
    flex: 0 0 auto;
    flex-shrink: 0;
}

.credits-header{
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0 1rem;
}

.album-member{
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    margin: 0.2rem 0;
    min-width: 0;
}

.album-member > div{
    flex: 1 1 auto;
    min-width: 0;
}

.album-member-role{
    margin: 0.4rem 0 1rem;
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
    max-width: 100%;
}

.p-button.p-button-link{
    color: #b3b3b3;
}

.p-button.p-button-link:hover {
    color: white;
    text-decoration: underline;
}

.p-button:hover {
    background: transparent;
    border-color: white;
    color: white;
    transform: scale(1.05);
    transition: transform 0.2s;
}

.credits-title{
    color: white;
    font-size: 1.1rem;
    margin: 1rem 0.2rem;

}

.p-button:focus {
    box-shadow: none;
    background: transparent;
}

.p-card .p-card-body {
    padding: 1rem;
}

.p-card .p-card-title {
    font-size: 1.1rem;
    color: white;
    margin-bottom: 0;
}

.p-card .p-card-content {
    padding: 0.2rem 0;
    color: white;
}

.m-0 {
    text-align: center;
}

.m-1 {
    color: white;
}

.p-card .p-card-content p {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    color: #b3b3b3;
}
</style>