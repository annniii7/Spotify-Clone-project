let currsong = new Audio();
let songs;
let currfolder;

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    //show all the songs in playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = "";
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `
         <li>
         <img class="invert" src="music.svg" alt="">
         <div class="info">
             <div>${song}</div>
             <div>Anirudh</div>
         </div>
         <div class="playnow">
             <span>Play Now</span>
             <img class="invert"  src="playbtn.svg" alt="">
         </div>
        </li>`;
    }
    //attach an event listener to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    });
    return songs;


}

const playMusic = (track, pause = false) => {
    currsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}
async function main() {
    //get list of all the songs
    await getsongs("/songs/ncs");
    playMusic(songs[0], true)


    //add event listener to song buttons

    play.addEventListener("click", element => {
        if (currsong.paused) {
            currsong.play();
            play.src = "pause.svg"
        }
        else {
            currsong.pause();
            play.src = "playbtn.svg";

        }
    })
    // listen for time update events

    currsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currsong.currentTime)}/${secondsToMinutesSeconds(currsong.duration)}`;
        document.querySelector(".circle").style.left = (currsong.currentTime / currsong.duration) * 100 + "%";

    })

    //add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currsong.currentTime = ((currsong.duration) * percent) / 100;
    })

    //add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    })

    //Add an event listener to close 
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    })

    //Adding event listeners to previous 
    prev.addEventListener("click", () => {
        // console.log('previous clicked');
        console.log(currsong.src.split("/").slice("-1"[0]));
        let index = songs.indexOf(currsong.src.split("/").slice("-1")[0]);
        console.log(songs, index);
        if (index + 1 <= 0) {
            playMusic(songs[index - 1])

        }
    })
    //Adding event listener for next button
    next.addEventListener("click", () => {
        // console.log('previous clicked');
        // console.log(currsong.src.split("/").slice("-1"[0]));
        let index = songs.indexOf(currsong.src.split("/").slice("-1")[0]);
        console.log(songs, index);
        if (index + 1 < songs.length) {
            playMusic(songs[index + 1])

        }
    })

    // add an event to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to:", e.target.value);
        currsong.volume = parseInt(e.target.value) / 100;

    })

    // load the playlist whenever the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            playMusic(songs[0]);
        })

    })

}
main()