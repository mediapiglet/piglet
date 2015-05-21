$(document).ready(function () {

    var dynatable = '';
    var filetable = '',
        playlisttable = '';
    var currentPlaylist = [];
    var currentlyPlaying = {};
    currentlyPlaying.position = 0;
    var myPlayer = videojs('mainVideo');
    var selectedDir = [];
    var currentDir = [];
    var selectedFiles = [];
    videojs("mainVideo").ready(function () {
        this.hostAddress = '192.168.0.14';
        this.on("ended", function () {
            if (currentlyPlaying.type === 'file') {
                var nextPosition = parseFloat(currentlyPlaying.position) + 1;
                var nextFile = $('[data-file-index="' + nextPosition + '"]').attr('data-file');
                currentlyPlaying.position = nextPosition;
                playFile(nextFile, this, currentlyPlaying);
            } else {
                playNext(currentPlaylist, currentlyPlaying, this)
            }
        });
        this.on("play", function () {
            console.log('Playing file');
        });
    });
    myPlayer.ready(function () {
        var playEl = $('#mainVideo');
        playEl.append('<div class="vjs-overlay"><span data-role="meta-title"></span> - <span data-role="meta-album"></span> - <span data-role="meta-artist"></span></div>');
        console.log('Player ready');
    });
    /*.overlay({
     overlays: [
     {
     content: '<span data-role="overley-title">Bob Marley</span>',
     start: 'play',
     end: 'pause'
     }
     ]
     });
     */
    //var encPath = 'L21lZGlhL21hcmN1cy9FbGVtZW50cy9tZHQvbXAz'; // /media/marcus/Elements/mdt/mp3'
    var url = '/api/1.0/media/list/base';

    $('body').keypress(function (e) {
        if ($('input:focus').length === 0) {

            var key = $(e.which);
            var keyPressed = key[0];
            switch (keyPressed) {
                case 112:
                    myPlayer.play();
                    break;
                case 32:
                    e.preventDefault();
                    var isPlaying = myPlayer.paused();
                    if (isPlaying) {
                        myPlayer.play();
                    } else {
                        myPlayer.pause();
                    }
                    break;
                case 102:
                    var isFullscreen = myPlayer.isFullscreen();
                    if (isFullscreen) {
                        myPlayer.exitFullscreen();
                    } else {
                        myPlayer.requestFullscreen();
                    }
                    break;
                default:
                    break;

            }
        }
    });

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
    context.init({
        fadeSpeed: 100,
        filter: function ($obj) {
        },
        above: 'auto',
        preventDoubleContext: false,
        compress: false
    });
    context.attach('#mediaTable', [
        {
            text: '<i class="icon icon-menu ion-play"> </i> Play all',
            action: function (e) {
                e.preventDefault();

                var url = '/api/1.0/playlists/addfolder/';
                var formData = {};
                currentPlaylist = [];
                formData.path = selectedDir[0].path;
                $.post(url, formData, function (res) {
                    var resJSON = JSON.parse(res);
                    resJSON.folderFiles.forEach(function (fileRow) {
                        var fileObject = {};
                        fileObject.file = fileRow.path;
                        fileObject.filename = fileRow.name;
                        currentPlaylist.push(fileObject);
                    });
                    loadPlaylistTable(playlisttable, currentPlaylist);
                    // var selectedFile =
                    currentlyPlaying.position = 0; //
                    currentlyPlaying.type = 'playlist';
                    var selectedFile = $('[data-list-index="0"]').attr('data-file');
                    playFileFromList(selectedFile, myPlayer, currentlyPlaying);
                });

            }
        },
        {
            text: '<i class="icon icon-menu ion-plus"> </i> Add folder to playlist',
            action: function (e) {
                e.preventDefault();

                var url = '/api/1.0/playlists/addfolder/';
                var formData = {};
                formData.path = selectedDir[0].path;
                $.post(url, formData, function (res) {
                    var resJSON = JSON.parse(res);
                    resJSON.folderFiles.forEach(function (fileRow) {
                        var fileObject = {};
                        fileObject.file = fileRow.path;
                        fileObject.filename = fileRow.name;
                        currentPlaylist.push(fileObject);
                    });
                    loadPlaylistTable(playlisttable, currentPlaylist);
                });
            }
        }
    ]);
    context.attach('#fileTable', [
        {
            text: '<i class="icon icon-menu ion-play"> </i> Play file',
            action: function (e) {
                e.preventDefault();

                var url = '/api/1.0/playlists/addfolder/';
                var formData = {};
                currentPlaylist = [];
                currentlyPlaying.position = 0; //
                currentlyPlaying.type = 'playlist';
                var selectedFile = $('[data-list-index="0"]').attr('data-file');
                formData.path = selectedFile;
                $.post(url, formData, function (res) {
                    var resJSON = JSON.parse(res);
                    resJSON.folderFiles.forEach(function (fileRow) {
                        var fileObject = {};
                        fileObject.file = fileRow.path;
                        fileObject.filename = fileRow.name;
                        currentPlaylist.push(fileObject);
                    });
                    loadPlaylistTable(playlisttable, currentPlaylist);
                    // var selectedFile =
                    playFileFromList(selectedFile, myPlayer, currentlyPlaying);
                });

            }
        },
        {
            text: '<i class="icon icon-menu ion-plus"> </i> Add file to playlist',
            action: function (e) {
                e.preventDefault();

                var url = '/api/1.0/playlists/addfolder/';
                var formData = {};
                formData.path = selectedDir[0].path;
                $.post(url, formData, function (res) {
                    var resJSON = JSON.parse(res);
                    resJSON.folderFiles.forEach(function (fileRow) {
                        var fileObject = {};
                        fileObject.file = fileRow.path;
                        fileObject.filename = fileRow.name;
                        currentPlaylist.push(fileObject);
                    });
                    loadPlaylistTable(playlisttable, currentPlaylist);
                });
            }
        }
    ]);
    $('body').delegate('[data-role="search-top"]', 'input', function () {
        var numberChars = this.value.length;
        if (numberChars >= 3) {
            selectSection('collection')
            searchCollection();
        } else {
            clearSelection();
        }
    });

    $('#mediaTable').delegate('[data-role="span-dir"]', 'dblclick', function () {
        var isBack = $(this).attr('data-back');
        if (isBack == 1) {
            currentDir.pop();
            currentDir.back = 1;
        }
        var thisDir = $(this).attr('data-dir');
        var parentDir = $(this).attr('data-parent');
        var url = '/api/1.0/media/list/' + thisDir + '/' + parentDir;
        loadMediaTable(dynatable, filetable, url, currentDir);
    });
    $('#mediaTable').delegate('[data-role="selectDir"]', 'click', function () {
        var isBack = $(this).attr('data-back');
        if (isBack == 1) {
            currentDir.pop();
            currentDir.back = 1;
        }
        var thisDir = $(this).attr('data-dir');
        var parentDir = $(this).attr('data-parent');
        var url = '/api/1.0/media/list/' + thisDir + '/' + parentDir;
        loadMediaTable(dynatable, filetable, url, currentDir);
    });
    $('body').delegate('[data-role="selectSection"]', 'click', function () {
        var section = $(this).attr('data-section');
        selectSection(section);
    });
    $('body').delegate('[data-role="collection-section"]', 'click', function () {
        var section = $(this).attr('data-collection-section');
        selectCollectionSection(section);
    });


    $('body').delegate('[data-role="removeFileFromPlaylist"]', 'click', function () {
        var playIndex = $(this).attr('data-list-index');
        removeFileFromPlaylist(playIndex, currentPlaylist, playlisttable);
    });
    $('body').delegate('[data-role="selectAlbum"]', 'click', function () {
    });
    $('body').delegate('[data-role="selectFile"]', 'dblclick', function (e) {
        if (e.ctrlKey) {
            alert('You wanna select');

        } else {

            var selectedFile = $(this).attr('data-file');
            var listIndex = $(this).attr('data-file-index');
            currentlyPlaying.type = 'file';
            currentlyPlaying.position = listIndex;
            playFile(selectedFile, myPlayer, currentlyPlaying);
        }
    });
    $('body').delegate('[data-role="selectFileFromList"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        currentlyPlaying.type = 'playlist';
        currentlyPlaying.position = $(this).attr('data-list-index');
        playFileFromList(selectedFile, myPlayer, currentlyPlaying);
    });


    $('body').delegate('[data-role="selectFileFromCollection"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        playFile(selectedFile, myPlayer, currentlyPlaying);
    });
    $('body').delegate('[data-role="startPlaylist"]', 'click', function () {
        playPlaylist(currentPlaylist, currentlyPlaying, myPlayer);
    });

    $('body').delegate('[data-role="stopPlaylist"]', 'click', function () {
        stopPlaylist(myPlayer);
    });

    $('body').delegate('[data-role="savePlaylist"]', 'click', function () {
        if (currentPlaylist.length < 2) {
            alert('Please add at least two files to the playlist');
        } else {
            savePlaylist(currentPlaylist);

        }
    });


    $('body').delegate('[data-role="nextPlaylist"]', 'click', function () {
        switch (currentlyPlaying.type) {
            case 'playlist':
                playNext(currentPlaylist, currentlyPlaying, myPlayer);
                break;
            default:
                var nextPosition = parseInt(currentlyPlaying.position) + 1;
                currentlyPlaying.position = parseInt(nextPosition);
                var file = $('[data-file-index="' + nextPosition + '"]').attr('data-file');
                playFile(file, myPlayer, currentlyPlaying);
                break;
        }
    });

    $('body').delegate('[data-role="previousPlaylist"]', 'click', function () {

        switch (currentlyPlaying.type) {
            case 'playlist':
                if (currentlyPlaying.position === 0) {
                    currentlyPlaying.position = 1;
                }
                playPrevious(currentPlaylist, currentlyPlaying, myPlayer);
                break;
            default:

                var nextPosition = 0;
                if (currentlyPlaying.position !== 0) {
                    nextPosition = currentlyPlaying.position - 1;
                }
                currentlyPlaying.position = nextPosition;
                console.log(currentlyPlaying);
                var file = $('[data-file-index="' + nextPosition + '"]').attr('data-file');
                playFile(file, myPlayer, currentlyPlaying);
                break;
        }
    });


    $('body').delegate('[data-role="addToPlaylist"]', 'click', function () {
        var selectedFile = $(this).attr('data-file');
        var selectedFilename = $(this).attr('data-filename');
        var fileObject = {};
        fileObject.file = selectedFile;
        fileObject.filename = selectedFilename;
        currentPlaylist.push(fileObject);
        console.log(currentPlaylist);

        loadPlaylistTable(playlisttable, currentPlaylist);
        $(this).addClass('bold');

    });


    $('#mediaTable').delegate('td', 'mouseover', function () {
        if (selectedDir.length === 0) {
            var thisDir = {};
            thisDir.path = $(this).find('span').attr('data-dir');
            selectedDir.push(thisDir);
        }

        if (!context.isActive()) {
            $(this).addClass('highlight');
        }
    });

    $('#fileTable').delegate('td', 'mouseover', function () {
        if (selectedFiles.length === 0) {
            /*
            var thisDir = {};
            thisDir.path = $(this).find('span').attr('data-dir');
            selectedDir.push(thisDir);
            */
        }

        if (!context.isActive()) {
            $(this).addClass('highlight');
        }
    });
    $('#mediaTable').delegate('td', 'mouseout', function () {
        if (!context.isActive()) {
            $(this).removeClass('highlight');
            selectedDir = [];
        }
    });
    $('#fileTable').delegate('td', 'mouseout', function () {
        if (!context.isActive()) {
            $(this).removeClass('highlight');
            selectedDir = [];
        }
    });

    $('[data-role="listPlaylists"]').change(function () {
        var playlistId = $(this).val();
        loadPlaylist(playlistId, currentPlaylist, playlisttable, function (newCurrentPlaylist) {
            currentPlaylist = newCurrentPlaylist;
        });
    });
    $('[data-role="artists-result-table"]').hide();
    $('[data-role="albums-result-table"]').hide();

    loadPlaylistSelect();
    /*
     setInterval(function () {
     console.log(currentlyPlaying);
     console.log(currentPlaylist);
     }, 1000);
     */
})
;
removeFileFromPlaylist = function (fileIndex, currentPlaylist, playlisttable) {
    currentPlaylist.splice(fileIndex, 1);
    loadPlaylistTable(playlisttable, currentPlaylist);
};
loadPlaylist = function (playlistId, currentPlaylist, playlisttable, callback) {
    var url = '/api/1.0/playlists/load/' + playlistId;
    $.getJSON(url, function (res) {
        $('[data-role="playlistName"]').val(res.name);
        currentPlaylist = res.files;
        loadPlaylistTable(playlisttable, currentPlaylist);
        callback(currentPlaylist);
    });

};
loadPlaylistTable = function (playlisttable, currentPlaylist) {
    var tableData = [];
    if (currentPlaylist.length > 0) {
        for (var i = 0; i < currentPlaylist.length; i++) {
            var thisFile = currentPlaylist[i];
            var tableRow = {};
            tableRow.file = '<span data-file-type="list" data-list-index="' + i + '" data-role="selectFileFromList" data-file="' + thisFile.file + '"> ' +
            thisFile.filename + '</span><input type="hidden" name="filenames" value="' + thisFile.filename + '" /><input type="hidden" name="files" value="' + thisFile.file + '" />';
            tableRow.options = '<span data-list-index="' + i
            + '" data-role="removeFileFromPlaylist" data-file="' + thisFile.file
            + '"><i class="icon ion-minus"></i></span>';
            tableData.push(tableRow);
        }
        playlisttable.settings.dataset.originalRecords = tableData;
        playlisttable.process();
    } else {
        playlisttable.settings.dataset.originalRecords = tableData;
        playlisttable.process();

    }
};

loadFileTable = function (filetable, url, currentDir, callback) {
    $.getJSON(url, function (res) {
        filetable.settings.dataset.originalRecords = res.fileRecords;
        filetable.process();
        if (res.dirname === 'comedy') {
            res.dirname = '';
        }
        var thisCurrent = {};
        thisCurrent.dirname = res.dirname;
        thisCurrent.path = res.encPath;
        currentDir.back = 0;
        /*
         var currentHtml = '';
         if (currentDir) {
         currentDir.forEach(function (dir) {
         currentHtml = currentHtml + ' / ' + dir.dirname;
         });
         }
         if (currentHtml === '') {
         currentHtml = '-';

         }
         $('[data-role="current-path"]').html(currentHtml);
         */
        callback();
    });

};

loadMediaTable = function (dynatable, filetable, url, currentDir) {
    $.getJSON(url, function (res) {
        dynatable.settings.dataset.originalRecords = res.dirRecords;
        dynatable.process();
        filetable.settings.dataset.originalRecords = res.fileRecords;
        filetable.process();
        if (res.dirname === 'comedy') {
            res.dirname = '';
        }
        var thisCurrent = {};
        thisCurrent.dirname = res.dirname;
        thisCurrent.path = res.encPath;
        if (currentDir.back != 1) {
            currentDir.push(thisCurrent)
        } else {
            currentDir.back = 0;

        }

        console.log(currentDir);
        var currentHtml = '';
        if (currentDir) {

            currentDir.forEach(function (dir) {
                currentHtml = currentHtml + ' / ' + dir.dirname;
            });
        }
        if (currentHtml === '') {
            currentHtml = '-';

        }
        $('[data-role="current-path"]').html(currentHtml);
    });

};
updateFileMetaInfo = function (file) {
    var url = '/api/1.0/music/filedata/' + file;
    $.getJSON(url, function (res) {
        $('[data-role="meta-filename"]').html(res.filename);
        if (res.data.artist) {
            $('[data-role="meta-title"]').html(res.data.title.replace(/[^ -~]+/g, ""));
            $('[data-role="meta-artist"]').html(res.data.artist.replace(/[^ -~]+/g, ""));
            $('[data-role="meta-album"]').html(res.data.album.replace(/[^ -~]+/g, ""));
        }else{
            $('[data-role="meta-title"]').html(res.data.title.replace(/[^ -~]+/g, ""));
            $('[data-role="meta-artist"]').html('');
            $('[data-role="meta-album"]').html('');
        }

    });

};
playFile = function (file, myPlayer, currentlyPlaying) {
    var playerURL = window.location.host;
    var url = 'http://' + playerURL + ':1337/?path=' + file;
    currentlyPlaying.file = file;
    myPlayer.src({src: url});
    myPlayer.play();
    updateFileMetaInfo(file);

    $('[data-file-type="fileList"]').removeClass('bold');
    $('[data-file="' + file + '"]').addClass('bold');
};
playFileFromList = function (file, myPlayer, currentlyPlaying) {
    var playerURL = window.location.host;
    var url = 'http://' + playerURL + ':1337/?path=' + file;
    currentlyPlaying.file = file;
    myPlayer.src({src: url});
    myPlayer.play();
    updateFileMetaInfo(file);
    $('[data-file-type="list"]').removeClass('bold');

    $('[data-role="selectFile"]').removeClass('bold');
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
    var nextPosition = parseInt(currentlyPlaying.position) + 1;
    if (nextPosition >= currentPlaylist.length) {
        console.log('Playlist ended');

    } else {
        if (currentlyPlaying.type === 'file') {
            var nextFile = $('[data-file-index="' + nextPosition + '"]').attr('data-file');
            currentlyPlaying.position = nextPosition;
            playFile(nextFile, this, currentlyPlaying);
        } else {
            $('[data-file-type="list"]').removeClass('bold');
            $('[data-list-index="' + nextPosition + '"]').addClass('bold');
            var file = currentPlaylist[nextPosition].file;
            currentlyPlaying.file = file;
            currentlyPlaying.position = nextPosition;
            playFile(file, myPlayer, currentlyPlaying);
        }
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
    $.post(url, formData, function (res) {
        alert('Playlist saved');
        loadPlaylistSelect();
    });
};
clearSelection = function () {
    $('[data-role="total-album"]').html('');
    $('[data-role="total-artist"]').html('');
    $('[data-role="files-result-table"] tbody').empty();
};
searchCollection = function () {
    var query = $('[data-role="search-top"]').val();
    var url = '/api/1.0/music/search/' + query;
    $.getJSON(url, function (res) {
        var numberAlbums = res.numberAlbums;
        $('[data-role="total-album"]').html('(' + numberAlbums + ')');
        $('[data-role="total-artist"]').html('(' + res.numberArtists + ')');


        var filesTable = $('[data-role="files-result-table"] tbody');
        filesTable.empty();
        $('[data-role="search-debug"]').html('');
        res.allResults.forEach(function (resRow) {
            resRow.details = "<span data-role='addToPlaylist' data-file='" + resRow.encPath + "' data-filename='" + resRow.filename + "'><i class='icon ion-plus'> </i></span";
            var rowHTML = '<tr><td><span data-file-type="fileList" class="selectFile" data-role="selectFileFromCollection" data-file="' + resRow.encPath + '"> <i class="icon ion-play" > </i> ' +
                resRow.title + '</span' + +'</td><td>' + resRow.artist
                + '</td><td>' + resRow.album + '</td>'
                + '</td><td>' + resRow.details
                + '</td>';
            filesTable.append(rowHTML);
        });
        var albumTable = $('[data-role="albums-result-table"] tbody');
        albumTable.empty();
        res.albums.forEach(function (albumRow) {
            var rowHTML = '<tr data-file-type="fileList" data-role="selectAlbum" data-album="' + albumRow.name + '"><td>' +
                albumRow.name
                + '</td><td>' + albumRow.number
                + '</td><td><i class="icon ion-plus"> </i>'
                + '</td>';
            albumTable.append(rowHTML);
        });
    });

};

selectSection = function (section) {
    if (section === 'collection') {
        searchCollection();
    }
    $('[data-role="pane"]').hide();
    if (section !== 'home') {
        $('[data-pane="playlist"]').show();

    }
    $('[data-pane="' + section + '"]').show();
    $('[data-role="selectSection"]').addClass('button-transparent');
    $('[data-section="' + section + '"]').removeClass('button-transparent');
};

selectCollectionSection = function (section) {
    $('[data-role="collection-section"]').addClass('button-outline');
    $('[data-collection-section="' + section + '"]').removeClass('button-outline');
    $('[data-collection-section="' + section + '"]').addClass('button');
    switch (section) {
        case 'albums':
            $('[data-role="files-result-table"]').hide();
            $('[data-role="artists-result-table"]').hide();
            $('[data-role="albums-result-table"]').show();
            break;
        case 'files':
            $('[data-role="files-result-table"]').show();
            $('[data-role="artists-result-table"]').hide();
            $('[data-role="albums-result-table"]').hide();
            break;
        case 'artists':
            $('[data-role="files-result-table"]').hide();
            $('[data-role="artists-result-table"]').show();
            $('[data-role="albums-result-table"]').hide();
            break;
    }
};

loadPlaylistSelect = function () {
    var playlistUrl = '/api/1.0/playlists/list';
    $.getJSON(playlistUrl, function (res) {
        var playDrop = $('[data-role="listPlaylists"]');
        for (var i = 0; i < res.length; i++) {
            playDrop.append($("<option></option>")
                .attr("value", res[i]._id)
                .text(res[i].name));
        }
    });
};


function doLogin(username) {

    var login = {};
    login.username = username;

    $.post('/login', login, function (data) {
        alert(data);
    })


}

