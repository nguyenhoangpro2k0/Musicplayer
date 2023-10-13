// 1. Render song
// 2. Scroll top
// 3. Play / Pause / Seek
// 4. CD rotate
// 5. Next / prev
// 6. Random
// 7. Next / Repeat when ended
// 8. Active song
// 9. Scroll active song into view
// 10. Play song when click

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const heading = $('header h2')
const headingSinger = $('header h5')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const cd = $('.cd')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const currentTimeRunSong = $('.current-time')
const sumTimeSong = $('.duration')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    //Parse: Chuyển đổi giá trị lưu trữ từ JSON sang JavaScript
    // Đọc giá trị lưu trữ trong localStorage dựa trên khóa PLAYER_STORAGE_KEY (trong trường hợp này là 'F8PLAYER').
    //Nếu giá trị lưu trữ không phải là chuỗi JSON hợp lệ hay không có giá trị lưu trữ cho khoá PLAYER_STORAGE_KEY thì trả về đối tượng {}
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name:'Chiếc khăn gió ấm',
            singer: 'Khánh Phương',
            path: 'assets/music/Chiec-Khan-Gio-Am-Khanh-Phuong.mp3',
            image:'assets/img/chieckhangioam.jpg'
        },
        {
            name:'Anh khác hay em khác',
            singer: 'Khắc Việt',
            path: 'assets/music/Anh-Khac-Hay-Em-Khac-Khac-Viet.mp3',
            image:'assets/img/anhkhachayemkhac.jpg'
        },
        {
            name:'Phố đã lên đèn',
            singer: 'Huyền Tâm Môn',
            path: 'assets/music/Pho-Da-Len-Den-Cukak-Remix-Huyen-Tam-Mon.mp3',
            image:'assets/img/phodalenden.jpg'
        },
        {
            name:'Ước gì',
            singer: 'Mỹ Tâm',
            path: 'assets/music/Uoc-Gi-My-Tam.mp3',
            image:'assets/img/uocgi.jpg'
        },
        {
            name:'Đơn Côi',
            singer: 'Trương Quỳnh Anh',
            path: 'assets/music/Don-Coi-Truong-Quynh-Anh.mp3',
            image:'assets/img/doncoi.jpg'
        },
        {
            name:'Răng Khôn',
            singer: 'Phí Phương Anh',
            path: 'assets/music/Rang-Khon-Phi-Phuong-Anh-RIN9.mp3',
            image:'assets/img/rangkhon.jpg'
        },
        {
            name:'Chắc Ai Đó Sẽ Về',
            singer: 'Sơn Tùng M-TP',
            path: 'assets/music/Chac-Ai-Do-Se-Ve.mp3',
            image:'assets/img/chacaidoseve.jpg'
        },
        {
            name:'Dằm trong tim',
            singer: 'Lương Bích Hữu',
            path: 'assets/music/Dam-Trong-Tim-Luong-Bich-Huu.mp3',
            image:'assets/img/damtrongtim.jpg'
        },
        {
            name:'Có nhau trọn đời',
            singer: 'Hồ Quỳnh Hương',
            path: 'assets/music/Co-Nhau-Tron-Doi-Ho-Quynh-Huong.mp3',
            image:'assets/img/conhautrondoi.jpg'
        },
    ],
    setConfig: function(key,value){
        //Giá trị của key sẽ được sử dụng làm tên thuộc tính của đối tượng config, còn giá trị của value sẽ được gán cho thuộc tính đó
        this.config[key] = value;
        //Stringify: Chuyển đổi từ Javascript thành JSON
        // Đối tượng config sẽ được chuyển đổi thành chuỗi JSON và lưu vào localStorage bằng cách sử dụng phương thức setItem.
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) =>{
            return `
                <div class="song ${index === this.currentIndex ? 'active' :''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}');">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                
                </div>
            `
        })
        playlist.innerHTML = htmls.join('');
    },
    defineProperties: function(){
        Object.defineProperty(this, 'currentSong',{
            get: function(){
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function(){
        const _this = this;
        const cdWidth = cd.offsetWidth
        //Xử lý CD quay/ dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{duration: 10000, //10 giây
            iterations: Infinity // lặp vô hạn
        })
        //Mặc định là dừng
        cdThumbAnimate.pause()
        //Xử lý phóng to / thu nhỏ CD
        document.onscroll = function(){
            //Khi không kéo nó hiện hệ số 0, càng kéo xuống nó càng tăng hệ số
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;
            //Nếu newCdWidth là âm nó sẽ không chạy nữa, nếu kéo nhanh quá sẽ ko bị thu nhỏ nên có dòng này
            cd.style.width = newCdWidth > 0 ? newCdWidth +'px' : 0;
            //Kích thước mới chia kích thước cũ ra tỷ lệ, nên ảnh càng nhỏ nó càng mờ
            cd.style.opacity = newCdWidth / cdWidth;
        }
        //Xử lý khi click play
        playBtn.onclick = function(){
            //Nếu dùng this luôn nó sẽ trỏ tới playBtn
            //Còn _this đã định nghĩa ở trên handleEvents, nó trỏ tới app
            if(_this.isPlaying){
                audio.pause();
            } else {
                audio.play();
            }
        }
        //Khi song được play
        audio.onplay = function(){
            _this.isPlaying = true;
            //Phát bài hát trong audio
            player.classList.add('playing')
            cdThumbAnimate.play()
        }
        //Khi song bị pause
        audio.onpause = function(){
            _this.isPlaying = false;
            //Dừng bài hát trong radio
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }
        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function(){
            if(audio.duration){
                //audio.currentTime là số giây khi bài hát thay đổi, audio.duration là thời lượng audio
                //audio.currentTime / audio.duration * 100 là tính ra phần trăm(%)
                //Math.floor là làm tròn dưới
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                //Cài đặt giá trị value trong progress(đây là thẻ input có id = progress)
                progress.value = progressPercent;
                // Tính toán thời gian hiện tại ở định dạng phút và giây
              const currentMinutes = Math.floor(audio.currentTime / 60);
              const currentSeconds = Math.floor(audio.currentTime % 60);
              //Thời gian bài hát ở định dạng phút và giây
              const durationMinutes = Math.floor(audio.duration / 60);
              const durationSeconds = Math.floor(audio.duration % 60);

              // Hiển thị thời gian hiện tại trên trang web
              currentTimeRunSong.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;
              // Hiển thị thời gian bài hát trên trang web
              sumTimeSong.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
            }
        }
        //Xử lý khi tua song
        progress.onclick = function(e){
            //Thời lượng * số % / 100 = số giây
            const seekTime = audio.duration * e.target.value /100;
            // audio.currentTime: Thiết lập thời gian hiện tại audio
            audio.currentTime = seekTime;
        }
        //Khi next song
        nextBtn.onclick = function(){
            //Nếu bấm random, _this.isRandom từ false sang true hoặc ngược lại(chỗ xử lý bật tắt random)
            //Nếu đã có random , bấm next, sẽ xuất hiện bài hát ngẫu nhiên, ngược lại sẽ xuất hiện bài hát tiếp theo
            if(_this.isRandom){
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        //Khi prev song
        prevBtn.onclick = function(){
            //Tương tự nextsong
            if(_this.isRandom){
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }
        //Xử lý bật / tắt random song
        randomBtn.onclick = function(e){
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom',_this.isRandom)
            //Trong toggle, đối số thứ 2 boolean là true thì sẽ add class, là false sẽ remove class(thêm/bớt màu mặc định)
            randomBtn.classList.toggle('active',this.isRandom)
        }
        //Xử lý lặp lại một bài hát
        repeatBtn.onclick = function(e){
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat',_this.isRepeat)
            repeatBtn.classList.toggle('active',this.isRepeat)
        }
        //Xử lý next song khi audio ended
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }
            else{
                nextBtn.onclick()
            }
        }
        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e){
            //Chọn thẻ có class = 'song' không có 'active'
            const songNode = e.target.closest('.song:not(.active)')
            //e.target.closest('.option'): Chọn thẻ có class = 'option'
            if (songNode || e.target.closest('.option')){
                //Xử lý khi click vào song
                if(songNode){
                    //Đặt data-index, để gọi giá trị index bên trong gọi songNode.dataset.index
                    //Get từ element nó thành chuỗi nên convert sang Number
                    //Có thể thay index bằng từ khác cũng được miễn là đổi class thành 'data-(gì đó)'
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
                //Xử lý khi click vào song option
                if(e.target.closest('.option')){

                }
            }
        }
    },
    scrollToActiveSong: function(){
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior:'smooth', //Cuộn sẽ tạo hiệu ứng mượt mà
                block:'nearest' //Xác định căn chỉnh dọc
            })
        },300)
    },
    loadCurrentSong: function(){
        headingSinger.textContent = this.currentSong.singer;
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function(){
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length){
            this.currentIndex = 0;
        }
        this.loadCurrentSong()
    },
    prevSong: function(){
        this.currentIndex--;
        if(this.currentIndex < 0){
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong()
    },
    playRandomSong: function(){
        let newIndex;
        do {
            //newIndex là giá trị từ 0 tới this.songs.length - 1
            newIndex = Math.floor(Math.random()*this.songs.length)
        } while(newIndex === this.currentIndex) //Loại bỏ trường hợp bằng cái cũ(trùng lặp bài hát)
        this.currentIndex = newIndex;
        this.loadCurrentSong()
    },
    start: function(){
        //Gán cấu hình từ config vào ứng dụng
        this.loadConfig()
        //ĐỊnh nghĩa các thuộc tính cho Object
        this.defineProperties()
        //Lắng nghe / xử lý các sự kiện(DOM Event)
        this.handleEvents()
        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong()
        //Render playlist
        this.render()
        //Hiển thị trạng thái ban đầu của button random & repeat
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    }
}
app.start();


            

