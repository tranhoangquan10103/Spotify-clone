<script setup lang="ts">
import ScrollBar from '../../components/scrollbar.vue';
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
@import url('../../assets/style/tabs/nowplayingtab.css');
</style>