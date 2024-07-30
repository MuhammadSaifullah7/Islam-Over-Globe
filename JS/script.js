console.log("Writing Java Script");
let currFolder;
let currentsong = new Audio();
let currentSongIndex = 0;
let songs = [];

function convertSecondsToMinutes(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getsongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`);
    let response = await a.text();
    console.log(response);
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

let playMusic = (music) => {
    let encodedMusic = encodeURIComponent(music.trim());
    let audioUrl = `/${currFolder}/` + encodedMusic + ".mp3";
    console.log("Playing music from URL: " + audioUrl);
    currentsong.src = audioUrl;
    currentsong.play();
    play.src = "img/pause.svg";
    document.querySelector(".playbar .songinfo").innerHTML = decodeURI(music);
}

function extractSongName(url) {
    let songName = url.substring(url.lastIndexOf("/") + 1, url.lastIndexOf(".mp3"));
    return decodeURIComponent(songName.replaceAll("%20", " "));
}

async function loadSongs(folder) {
    songs = await getsongs(folder);
    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        let songName = extractSongName(song);
        let li = document.createElement("li");

        let music_img = document.createElement("img");
        music_img.classList.add("invert");
        music_img.src = "img/music.svg";
        music_img.alt = "Music Icon";

        let playnow_div = document.createElement("div");
        playnow_div.classList.add("playnow");

        let musicinfo = document.createElement("div");
        musicinfo.classList.add("musicinfo");

        let playnow_img = document.createElement("img");
        playnow_img.classList.add("playnowicon", "invert");
        playnow_img.src = "img/playnow.svg";

        let playnow_span = document.createElement("span");
        playnow_span.textContent = "Play Now";

        let infoDiv = document.createElement("div");
        infoDiv.classList.add("info");

        let songNameDiv = document.createElement("div");
        songNameDiv.textContent = songName;

        let artistNameDiv = document.createElement("div");
        artistNameDiv.textContent = "Unknown Artist";

        infoDiv.append(songNameDiv);
        infoDiv.append(artistNameDiv);

        musicinfo.append(music_img);
        musicinfo.append(infoDiv);

        playnow_div.append(playnow_span);
        playnow_div.append(playnow_img);

        li.append(musicinfo);
        li.append(playnow_div);

        songul.append(li);
    }

    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
            currentSongIndex = songs.findIndex(song => extractSongName(song) === e.querySelector(".info").firstElementChild.innerHTML.trim());
        });
    });
}

async function displayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer"); // Fixed selector

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg width="16px" height="16px" viewBox="0 0 24 24" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                    stroke-linejoin="round"></path>
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p class="font-thin">${response.description}</p>
                    </div>`;
        }
    }

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = `songs/${item.currentTarget.dataset.folder}`;
            await loadSongs(folder);
        });
    });
}


    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            let folder = `songs/${item.currentTarget.dataset.folder}`;
            await loadSongs(folder);
        });
    });


async function main() {
    await loadSongs("songs/cs");

    //Display all the albums on the page
    displayAlbums()


    play = document.querySelector(".songbuttons img[src='img/play.svg']");
    previous = document.getElementById("previous");
    next = document.getElementById("next");

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "img/play.svg";
        }
    });

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertSecondsToMinutes(Math.floor(currentsong.currentTime))} / ${convertSecondsToMinutes(Math.floor(currentsong.duration))}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    document.querySelector(".seekbar").addEventListener("click", (e) => {
        let seekbar = e.target;
        let rect = seekbar.getBoundingClientRect();
        let offsetX = e.clientX - rect.left;
        let percent = (offsetX / rect.width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration * percent) / 100;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-200%";
    });

    next.addEventListener("click", () => {
        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playMusic(extractSongName(songs[currentSongIndex]));
        }
    });

    previous.addEventListener("click", () => {
        if (currentSongIndex > 0) {
            currentSongIndex--;
            playMusic(extractSongName(songs[currentSongIndex]));
        }
    });

    document.querySelector(".range input").addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    //Adding event listner to mute the track
    document.querySelector(".volume img").addEventListener("click", e => {
        console.log(e.target);
        console.log("changing", e.target.src);
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentsong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = 0.10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

    
}

document.addEventListener("DOMContentLoaded", main);