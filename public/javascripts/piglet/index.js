$(document).ready(function () {

    var dynatable = '';
    var filetable = '',
        playlisttable = '';
    var currentPlaylist = [];
    var currentlyPlaying = {};
    currentlyPlaying.position = 0;
    var myPlayer = videojs('mainVideo');
    videojs("mainVideo").ready(function () {
        this.on("ended", function () {
            playNext(currentPlaylist, currentlyPlaying, this)
        });
        this.on("play", function () {
            console.log('Playing file');
        });
    });
    // var url = '/api/1.0/media/list/L21lZGlhL21hcmN1cy9FbGVtZW50cy9tZHQ=';
    // var url = '/api/1.0/media/list/L2RhdGE=';
    var path = '/media/marcus/Elements/mdt/mp3';
    var encPath = 'L21lZGlhL21hcmN1cy9FbGVtZW50cy9tZHQvbXAz';
    var url = '/api/1.0/media/list/' + encPath;

    $('body').delegate('[data-role="doLogin"]', 'click', function () {
        var username = $('[data-role="username"]').val();
        doLogin(username);
    });

    $.getJSON(url, function (res) {
        dynatable = $('#mediaTable').dynatable({
            features: {
                paginate: false,
                search: false,
                sort: false,
                recordCount: false,
                perPageSelect: false
            },
            dataset: {
                records: res.dirRecords,
                perPageDefault: 100
            }
        }).data('dynatable');
        filetable = $('#fileTable').dynatable({
            features: {
                paginate: false,
                search: false,
                sort: false,
                recordCount: false,
                perPageSelect: false
            },
            dataset: {
                records: res.fileRecords,
                perPageDefault: 100
            }
        }).data('dynatable');
        playlisttable = $('#playlistTable').dynatable({
            features: {
                paginate: false,
                search: false,
                sort: false,
                recordCount: false,
                perPageSelect: false
            },
            dataset: {
                records: [],
                perPageDefault: 100
            }
        }).data('dynatable');


    });

    $('#mediaTable').delegate('[data-role="selectDir"]', 'click', function () {
        var selectedDir = $(this).attr('data-dir');
        var parentDir = $(this).attr('data-parent');
        var url = '/api/1.0/media/list/' + selectedDir + '/' + parentDir;
        loadMediaTable(dynatable, filetable, url);
    });
    $('body').delegate('[data-role="selectSection"]', 'click', function () {
        var section = $(this).attr('data-section');
        $('[data-role="pane"]').hide();
        $('[data-pane="'+section+'"]').show();
        $('[data-role="selectSection"]').addClass('button-transparent');
        $(this).removeClass('button-transparent');
    });

    $('body').delegate('[data-role="selectFile"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        playFile(selectedFile, myPlayer, currentlyPlaying);
    });

    $('body').delegate('[data-role="selectFileFromList"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        currentlyPlaying.position = $(this).attr('data-list-index');
        playFileFromList(selectedFile, myPlayer, currentlyPlaying);
    });


    $('body').delegate('[data-role="startPlaylist"]', 'click', function () {
        playPlaylist(currentPlaylist, currentlyPlaying, myPlayer);
    });

    $('body').delegate('[data-role="stopPlaylist"]', 'click', function () {
        stopPlaylist(myPlayer);
    });

    $('body').delegate('[data-role="savePlaylist"]', 'click', function () {
        savePlaylist(currentPlaylist);
    });


    $('body').delegate('[data-role="nextPlaylist"]', 'click', function () {
        playNext(currentPlaylist, currentlyPlaying, myPlayer);
    });

    $('body').delegate('[data-role="previousPlaylist"]', 'click', function () {
        playPrevious(currentPlaylist, currentlyPlaying, myPlayer);
    });


    $('#fileTable').delegate('[data-role="addToPlaylist"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        var selectedFilename = $(this).attr('data-filename');
        var fileObject = {};
        fileObject.file = selectedFile;
        fileObject.filename = selectedFilename;
        currentPlaylist.push(fileObject);
        loadPlaylistTable(playlisttable, currentPlaylist);
        $('[data-file="' + selectedFile + '"]').addClass('bold');

    });
    var playlistUrl = '/api/1.0/playlists/list';
    $.getJSON(playlistUrl, function (res) {
        var playDrop = $('[data-role="listPlaylists"]');
        for (var i = 0; i < res.length; i++) {
            console.log(res[i]);
            playDrop.append($("<option></option>")
                .attr("value", res[i]._id)
                .text(res[i].name));

        }
        // console.log(res.playlists);
    });
    $('[data-role="listPlaylists"]').change(function () {
        var playlistId = $(this).val();
        loadPlaylist(playlistId, currentPlaylist, playlisttable, function (newCurrentPlaylist) {
            currentPlaylist = newCurrentPlaylist;
        });
    });
    /*
     setInterval(function() {
     console.log(currentlyPlaying);
     console.log(currentPlaylist);
     },1000);
     */
});
loadPlaylist = function (playlistId, currentPlaylist, playlisttable, callback) {
    var url = '/api/1.0/playlists/load/' + playlistId;
    $.getJSON(url, function (res) {
        $('[data-role="playlistName"]').val(res.name);
        currentPlaylist = res.files;
        loadPlaylistTable(playlisttable, currentPlaylist);
        callback(currentPlaylist);
        console.log(res);
    });

};
loadPlaylistTable = function (playlisttable, currentPlaylist) {
    if (currentPlaylist.length > 0) {
        var tableData = [];
        for (var i = 0; i < currentPlaylist.length; i++) {
            var thisFile = currentPlaylist[i];
            var tableRow = {};
            tableRow.file = '<span data-file-type="list" data-list-index="' + i + '" data-role="selectFileFromList" data-file="' + thisFile.file + '"> ' +
            thisFile.filename + '</span><input type="hidden" name="filenames" value="' + thisFile.filename + '" /><input type="hidden" name="files" value="' + thisFile.file + '" />';
            tableRow.details = '<i class=icon ion-minus-circle></i> Remove'
            tableData.push(tableRow);
        }
        playlisttable.settings.dataset.originalRecords = tableData;
        playlisttable.process();
    }
}

loadMediaTable = function (dynatable, filetable, url) {
    $.getJSON(url, function (res) {
        dynatable.settings.dataset.originalRecords = res.dirRecords;
        dynatable.process();
        filetable.settings.dataset.originalRecords = res.fileRecords;
        filetable.process();
    });

};
playFile = function (file, myPlayer, currentlyPlaying) {
    var url = 'http://127.0.0.1:1337/?path=' + file;
    currentlyPlaying.file = file;
    myPlayer.src({src: url});
    myPlayer.play();
    var url = '/api/1.0/music/filedata/'+file;
    $.getJSON(url, function (res) {
        console.log(res);
    });


    $('[data-file-type="fileList"]').removeClass('bold');
    $('[data-file="' + file + '"]').addClass('bold');
};
playFileFromList = function (file, myPlayer, currentlyPlaying) {
    var url = 'http://127.0.0.1:1337/?path=' + file;
    currentlyPlaying.file = file;
    myPlayer.src({src: url});
    myPlayer.play();
    $('[data-file-type="list"]').removeClass('bold');
    $('[data-list-index="' + currentlyPlaying.position + '"]').addClass('bold');
};
playPlaylist = function (currentPlaylist, currentlyPlaying, myPlayer) {
    var file = currentPlaylist[currentlyPlaying.position].file;
    currentlyPlaying.file = file;
    playFile(file, myPlayer, currentlyPlaying);
};
stopPlaylist = function (myPlayer) {
    myPlayer.pause();
};
playNext = function (currentPlaylist, currentlyPlaying, myPlayer) {
    var nextPosition = currentlyPlaying.position + 1;
    if (nextPosition >= currentPlaylist.length) {
        console.log('Playlist ended');

    } else {
        $('[data-file-type="list"]').removeClass('bold');
        $('[data-list-index="' + nextPosition + '"]').addClass('bold');
        var file = currentPlaylist[nextPosition].file;
        currentlyPlaying.file = file;
        currentlyPlaying.position = nextPosition;
        playFile(file, myPlayer, currentlyPlaying);
    }
};
playPrevious = function (currentPlaylist, currentlyPlaying, myPlayer) {
    if (currentlyPlaying.position !== 0) {
        var nextPosition = currentlyPlaying.position - 1;
        var file = currentPlaylist[nextPosition].file;
        currentlyPlaying.file = file;
        currentlyPlaying.position = nextPosition;
        playFile(file, myPlayer, currentlyPlaying);
        $('[data-file-type="list"]').removeClass('bold');
        $('[data-list-index="' + nextPosition + '"]').addClass('bold');
    }
};

savePlaylist = function () {
    var url = '/api/1.0/playlists/save';
    var formData = $('#savePlaylistForm').serialize();
    console.log(formData);
    $.post(url, formData, function (res) {
        alert(res);
    });
};


function doLogin(username) {

    var login = {};
    login.username = username;

    $.post('/login', login, function (data) {
        alert(data);
    })


}

