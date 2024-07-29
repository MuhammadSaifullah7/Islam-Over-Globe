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
    let a = await fetch(`http://127.0.0.1:3000/${currFolder}/`);
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
    let audioUrl = `http://127.0.0.1:3000/${currFolder}/` + encodedMusic + ".mp3";
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
    let response = await fetch('http://127.0.0.1:3000/songs/');
    let text = await response.text();
    let div = document.createElement("div");
    div.innerHTML = text;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer"); // Fixed selector

    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            // Get the meta data of the folder
            let folderResponse = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let folderData = await folderResponse.json();
            console.log(folderData);
            let description = folderData.description;
            let maxlength = 78;
            if (description.length > maxlength) {
                description = description.substring(0, maxlength) + "...";
            }
            cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
            <div class="img">
                <img src="/songs/${folder}/cover.jpg" alt="">
            </div>
                <h3>${folderData.title}</h3>
                <!-- <p class="font-thin">${description}</p> -->
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
    await loadSongs("songs/");

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
        else {
            e.target.src = e.target.src.replace("img/mute.svg", "img/volume.svg")
            currentsong.volume = 0.10
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

    // script.js
    window.addEventListener('scroll', function () {
        const navbar = document.querySelector('.header');
        if (window.scrollY > 10) {
            navbar.classList.add('shadow');
        } else {
            navbar.classList.remove('shadow');
        }
    });

    const bysurah = document.querySelector(".by-surah")
    const byparah = document.querySelector(".by-parah")
    const mostrecitedsurahs = document.querySelector(".mostrecitedsurahs")
    const animation = document.querySelector(".animation")

    bysurah.addEventListener("click", () => {
        animation.style.width = 100 + "px"
        animation.style.translate = 0 + "px"
    })

    byparah.addEventListener("click", () => {
        animation.style.width = 95 + "px"
        animation.style.translate = 110 + "px"
    })

    mostrecitedsurahs.addEventListener("click", () => {
        animation.style.width = 180 + "px"
        animation.style.translate = 217.5 + "px"
    })

    let surahcont = document.querySelector(".surahcont")
    let parahcont = document.querySelector(".parahcont")
    let mostrecitedcont = document.querySelector(".mostrecitedcont")

    
    function closeCurrentOpenNext(current, next) {
        current.style.transition = "left 0.5s ease-in-out, opacity 0.5s ease-in-out";
        current.style.opacity = "0.3";
        current.style.left = "90%";
        setTimeout(() => {
            current.style.left = "100%";
            next.style.transition = "left 0.5s ease-in-out";
            next.style.left = "0";
            setTimeout(() => {
                next.style.transition = "opacity 1s ease-in-out";
                next.style.opacity = "1";
            }, 500); // wait for the slide to move in before changing opacity
        }, 500); // delay for the transition of closing to 90%
    }

    function resetInitialStates() {
        surahcont.style.left = "0";
        surahcont.style.opacity = "1";
        parahcont.style.left = "100%";
        parahcont.style.opacity = "0";
        mostrecitedcont.style.left = "100%";
        mostrecitedcont.style.opacity = "0";
    }

    byparah.addEventListener("click", () => {
        if (surahcont.style.left === "0px" || mostrecitedcont.style.left === "0px") {
            closeCurrentOpenNext(surahcont.style.left === "0px" ? surahcont : mostrecitedcont, parahcont);
        } else {
            parahcont.style.transition = "left 0.5s ease-in-out";
            parahcont.style.left = "0";
            setTimeout(() => {
                parahcont.style.transition = "opacity 1s ease-in-out";
                parahcont.style.opacity = "1";
            }, 500); // wait for the slide to move in before changing opacity
        }
    });

    mostrecitedsurahs.addEventListener("click", () => {
        if (parahcont.style.left === "0px" || surahcont.style.left === "0px") {
            closeCurrentOpenNext(parahcont.style.left === "0px" ? parahcont : surahcont, mostrecitedcont);
        } else {
            mostrecitedcont.style.transition = "left 0.5s ease-in-out";
            mostrecitedcont.style.left = "0";
            setTimeout(() => {
                mostrecitedcont.style.transition = "opacity 1s ease-in-out";
                mostrecitedcont.style.opacity = "1";
            }, 500); // wait for the slide to move in before changing opacity
        }
    });

    bysurah.addEventListener("click", () => {
        if (parahcont.style.left === "0px" || mostrecitedcont.style.left === "0px") {
            closeCurrentOpenNext(parahcont.style.left === "0px" ? parahcont : mostrecitedcont, surahcont);
        } else {
            surahcont.style.transition = "left 0.5s ease-in-out";
            surahcont.style.left = "0";
            setTimeout(() => {
                surahcont.style.transition = "opacity 1s ease-in-out";
                surahcont.style.opacity = "1";
            }, 500); // wait for the slide to move in before changing opacity
        }
    });

    // Initialize the states when the page loads
    window.addEventListener("load", resetInitialStates);
}


document.addEventListener("DOMContentLoaded", main);


