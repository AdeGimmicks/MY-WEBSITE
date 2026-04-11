let wavesurfer;

function playBeat(id) {
    if (!wavesurfer) {
        wavesurfer = WaveSurfer.create({
            container: '#waveform',
            waveColor: '#45506D',
            progressColor: '#FFD34D',
            height: 48,
            barWidth: 2,
        });

        wavesurfer.load('audio/gratify.mp3');
    }

    wavesurfer.play();
    document.getElementById("player-play").innerHTML =
        '<i class="fas fa-pause"></i>';
}

function togglePlay() {
    if (!wavesurfer) return;

    wavesurfer.playPause();

    document.getElementById("player-play").innerHTML =
        wavesurfer.isPlaying()
            ? '<i class="fas fa-pause"></i>'
            : '<i class="fas fa-play"></i>';
}

function togglePrices() {
    const box = document.getElementById("price-boxes");
    box.classList.toggle("hidden");
}
