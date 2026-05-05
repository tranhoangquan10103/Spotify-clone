<script setup lang="ts">
import ScrollBar from '../../components/scrollbar.vue';
</script>

<template>
    <ScrollBar style="width: 100%;" class="now-playing-scroll">
        <div class="now-playing-header">
            <p>Now Playing</p>
        </div>

        <div class="album-art">
            
        </div>

        <div class="about-artist">
            <div class="about-upper" >
                <h1 class="header-2">About the artist</h1>
            </div>
            <div class="about-lower">
                <h1 class="header-2">蒋雪儿</h1>
                <h2 class="header-3">Pop Artist</h2>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc.</p>
            </div>
        </div>

        <div class="credits">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc. Donec auctor, nisl eget ultricies lacinia, nunc nisl aliquam nisl, eget aliquam nunc nisl eget nunc.</p>

        </div>
    </ScrollBar>
</template>

<style>
@import url('../../assets/style/tabs/nowplayingtab.css');
</style>